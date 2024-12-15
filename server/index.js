import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Database from "better-sqlite3";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { MailtrapTransport } from "mailtrap";

dotenv.config();

const app = express();
const db = new Database("database.sqlite");

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Database initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    company TEXT NOT NULL,
    businessId TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    url TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts (id)
  );

  CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    subject TEXT,  -- Adicionando a coluna 'subject'
    message TEXT,  -- Adicionando a coluna 'message'
    FOREIGN KEY (contact_id) REFERENCES contacts (id)
  );
`);

// Verificar se a coluna 'subject' já existe, caso contrário, adicioná-la
const columns = db.prepare(`PRAGMA table_info(email_logs)`).all();
const hasSubjectColumn = columns.some((column) => column.name === "subject");

if (!hasSubjectColumn) {
  db.exec("ALTER TABLE email_logs ADD COLUMN subject TEXT");
}

// Email configuration
const transporter = nodemailer.createTransport(
  MailtrapTransport({
    token: "f990091a76aa9393f8327947494037df",
  })
);

// Test email configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Erro na configuração do e-mail:", error);
  } else {
    console.log("Servidor de e-mail pronto para enviar mensagens");
  }
});

// Routes
app.post("/api/contacts", (req, res) => {
  const { firstName, lastName, company, businessId, email, phone } = req.body;

  const stmt = db.prepare(`
    INSERT INTO contacts (firstName, lastName, company, businessId, email, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    firstName,
    lastName,
    company,
    businessId,
    email,
    phone
  );
  res.json({ id: result.lastInsertRowid });
});

app.post("/api/contacts/bulk", (req, res) => {
  const contacts = req.body;
  const stmt = db.prepare(`
    INSERT INTO contacts (firstName, lastName, company, businessId, email, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const results = contacts.map((contact) => {
    const { firstName, lastName, company, businessId, email, phone } = contact;
    return stmt.run(firstName, lastName, company, businessId, email, phone);
  });

  res.json({ count: results.length });
});

app.get("/api/contacts", (req, res) => {
  const contacts = db.prepare("SELECT * FROM contacts").all();
  res.json(contacts);
});

app.get("/api/contacts/bulk", (req, res) => {
  const ids = req.query.ids.split(",").map(Number);
  const placeholders = ids.map(() => "?").join(",");

  const contacts = db
    .prepare(
      `
    SELECT * FROM contacts WHERE id IN (${placeholders})
  `
    )
    .all(...ids);

  res.json(contacts);
});

app.get("/api/contacts/:id/tracking-url", (req, res) => {
  const { id } = req.params;
  const contact = db.prepare("SELECT * FROM contacts WHERE id = ?").get(id);

  if (!contact) {
    return res.status(404).json({ error: "Contato não encontrado" });
  }

  const uniqueParam = Buffer.from(`${id}-${Date.now()}`).toString("base64");
  const trackingUrl = `http://localhost:3000/track/${uniqueParam}`;
  res.json({ url: trackingUrl });
});

app.get("/track/:param", (req, res) => {
  const { param } = req.params;
  const decoded = Buffer.from(param, "base64").toString();
  const [contactId] = decoded.split("-");

  // Record visit
  const stmt = db.prepare(`
    INSERT INTO visits (contact_id, url)
    VALUES (?, ?)
  `);
  stmt.run(contactId, req.originalUrl);

  // Redirect to a thank you page or company website
  res.redirect("http://localhost:5173/thank-you");
});

app.post("/api/messages/bulk", async (req, res) => {
  try {
    const { contactIds, subject, message } = req.body;

    // Get contacts
    const placeholders = contactIds.map(() => "?").join(",");
    const contacts = db
      .prepare(
        `
      SELECT * FROM contacts WHERE id IN (${placeholders})
    `
      )
      .all(...contactIds);

    // Send emails
    for (const contact of contacts) {
      const uniqueParam = Buffer.from(`${contact.id}-${Date.now()}`).toString(
        "base64"
      );
      const trackingUrl = `http://localhost:3000/track/${uniqueParam}`;
      const personalizedMessage = message.replace("[URL]", trackingUrl);

      const sender = {
        address: "hello@demomailtrap.com",
        name: "Mailtrap Test",
      };
      await transporter.sendMail({
        from: sender,
        to: contact.email,
        subject: subject,
        html: personalizedMessage,
      });

      // Log email sent
      db.prepare(
        `
        INSERT INTO email_logs (contact_id, subject, message)
        VALUES (?, ?, ?)
      `
      ).run(contact.id, subject, personalizedMessage);
    }

    res.json({
      success: true,
      message: `Mensagens enviadas com sucesso para ${contacts.length} contatos`,
    });
  } catch (error) {
    console.error("Erro ao enviar as mensagens:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao enviar as mensagens",
    });
  }
});

app.post("/api/visits", async (req, res) => {
  const { contactId, url } = req.body;

  // Record visit
  const stmt = db.prepare(`
    INSERT INTO visits (contact_id, url)
    VALUES (?, ?)
  `);
  stmt.run(contactId, url);

  // Check last email sent
  const lastEmail = db
    .prepare(
      `
    SELECT * FROM email_logs
    WHERE contact_id = ?
    AND sent_at > datetime('now', '-24 hours')
    ORDER BY sent_at DESC LIMIT 1
  `
    )
    .get(contactId);

  if (!lastEmail) {
    // Get contact details
    const contact = db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .get(contactId);

    // Get recent visits
    const visits = db
      .prepare(
        `
      SELECT * FROM visits
      WHERE contact_id = ?
      AND timestamp > datetime('now', '-15 minutes')
      ORDER BY timestamp DESC
    `
      )
      .all(contactId);

    // Send email notification
    setTimeout(async () => {
      try {
        const sender = {
          email: "hello@demomailtrap.com",
          name: "Mailtrap Test",
        };
        await transporter.sendMail({
          from: sender,
          to: "h8nbt3ca1k@osxofulk.com",
          subject: `Nova visita - ${contact.firstName} ${contact.lastName}`,
          html: `
            <h2>Detalhes do contato:</h2>
            <p>Nome: ${contact.firstName} ${contact.lastName}</p>
            <p>Empresa: ${contact.company}</p>
            <p>Email: ${contact.email}</p>
            
            <h3>URLs visitados:</h3>
            <ul>
              ${visits
                .map((visit) => `<li>${visit.url} (${visit.timestamp})</li>`)
                .join("")}
            </ul>
          `,
        });

        // Log email sent
        db.prepare(
          `
          INSERT INTO email_logs (contact_id, subject, message)
          VALUES (?, ?, ?)
        `
        ).run(
          contactId,
          "Notificação de visita",
          "Notificação automática de visita"
        );
      } catch (error) {
        console.error("Erro ao enviar o e-mail:", error);
      }
    }, 15 * 60 * 1000); // Delay de 15 minutos
  }

  res.json({ success: true });
});

app.get("/api/stats", (req, res) => {
  const stats = {
    totalVisits: db.prepare("SELECT COUNT(*) as count FROM visits").get().count,
    recentVisits: db
      .prepare(
        `
      SELECT 
        v.contact_id,
        c.firstName,
        c.lastName,
        c.company,
        v.url,
        v.timestamp
      FROM visits v
      JOIN contacts c ON c.id = v.contact_id
      WHERE v.timestamp > datetime('now', '-24 hours')
      ORDER BY v.timestamp DESC
      LIMIT 10
    `
      )
      .all(),
    popularUrls: db
      .prepare(
        `
      SELECT url, COUNT(*) as visits
      FROM visits
      GROUP BY url
      ORDER BY visits DESC
      LIMIT 5
    `
      )
      .all(),
  };

  res.json(stats);
});

app.post("/api/settings/smtp", (req, res) => {
  const { host, port, user, password, from, notificationEmail } = req.body;

  // Update environment variables
  process.env.SMTP_HOST = host;
  process.env.SMTP_PORT = port;
  process.env.SMTP_USER = user;
  process.env.SMTP_PASS = password;
  process.env.SMTP_FROM = from;
  process.env.NOTIFICATION_EMAIL = notificationEmail;

  // Reconfigure transporter
  transporter.set("host", host);
  transporter.set("port", port);
  transporter.set("auth", { user, pass: password });

  res.json({ success: true });
});

app.post("/api/tracking-url", (req, res) => {
  const { contactId, baseUrl } = req.body;

  try {
    const trackingId = Buffer.from(`${contactId}-${Date.now()}`).toString(
      "base64"
    );
    const trackingUrl = `${baseUrl}?ref=${trackingId}`;

    db.prepare("INSERT INTO visits (contact_id, url) VALUES (?, ?)").run(
      contactId,
      trackingUrl
    );

    res.json({ url: trackingUrl });
  } catch (error) {
    console.error("Erro ao criar o URL de rastreamento:", error);
    res.status(500).json({ error: "Erro ao criar o URL" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
