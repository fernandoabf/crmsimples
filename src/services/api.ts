import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

interface Contact {
  id?: number;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
}

interface BulkMessagePayload {
  contactIds: number[];
  subject: string;
  message: string;
}

export const contactsApi = {
  // Listar todos os contatos
  list: async () => {
    const response = await api.get<Contact[]>('/contacts');
    return response.data;
  },

  // Criar um novo contato
  create: async (contact: Contact) => {
    const response = await api.post<Contact>('/contacts', contact);
    return response.data;
  },

  // Importar múltiplos contatos
  bulkCreate: async (contacts: Contact[]) => {
    const response = await api.post<Contact[]>('/contacts/bulk', contacts);
    return response.data;
  },

  // Obter contatos por IDs
  getContactsByIds: async (ids: number[]) => {
    const response = await api.get<Contact[]>(`/contacts/bulk?ids=${ids.join(',')}`);
    return response;
  },

  // Gerar URL de rastreamento
  getTrackingUrl: async (contactId: number) => {
    const response = await api.post<{ url: string }>('/tracking-url', { 
      contactId,
      baseUrl: 'https://levelup.fi/palvelut/',
    });
    return response.data.url;
  },

  // Registrar visita
  recordVisit: async (contactId: number, url: string) => {
    await api.post(`/visits`, { contactId, url });
  },

  // Obter estatísticas
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Enviar mensagem em massa
  sendBulkMessage: async (payload: BulkMessagePayload) => {
    const response = await api.post('/messages/bulk', payload);
    return response.data;
  },

  // Atualizar configurações SMTP
  updateSmtpConfig: async (config: any) => {
    const response = await api.post('/settings/smtp', config);
    return response.data;
  }
};