import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Copy, Mail } from 'lucide-react';
import { contactsApi } from '../services/api';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
}

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await contactsApi.list();
        setContacts(data);
      } catch (error) {
        setMessage('Virhe yhteystietojen lataamisessa');
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleCopyUrl = async (contact: Contact) => {
    try {
      const url = await contactsApi.getTrackingUrl(contact.id);
      await navigator.clipboard.writeText(url);
      setMessage('URL kopioitu leikepöydälle!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Virhe URL:n kopioinnissa');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Hae yhteystietoja..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link to="/contacts/new" className="btn-primary w-full sm:w-auto">
          + Uusi yhteystieto
        </Link>
      </div>

      {message && (
        <div className="animate-fade-in fixed top-4 right-4 max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg ${
            message.includes('Virhe') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nimi</th>
              <th>Yritys</th>
              <th>Sähköposti</th>
              <th>Puhelin</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.id}</td>
                <td className="font-medium text-gray-900">
                  {contact.firstName} {contact.lastName}
                </td>
                <td>{contact.company}</td>
                <td>
                  <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:text-indigo-900">
                    {contact.email}
                  </a>
                </td>
                <td>{contact.phone}</td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopyUrl(contact)}
                      className="icon-button"
                      title="Kopioi seurantalinkki"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <Link
                      to={`/bulk-message?ids=${contact.id}`}
                      className="icon-button"
                      title="Lähetä viesti"
                    >
                      <Mail className="h-5 w-5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}