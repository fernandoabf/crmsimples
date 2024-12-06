import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { contactsApi } from '../services/api';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

export function BulkMessage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  useEffect(() => {
    const loadContacts = async () => {
      const ids = searchParams.get('ids')?.split(',').map(Number) || [];
      if (ids.length > 0) {
        try {
          const response = await contactsApi.getContactsByIds(ids);
          setContacts(response.data);
        } catch (error) {
          setStatusMessage('Virhe yhteystietojen lataamisessa');
        }
      }
    };
    loadContacts();
  }, [searchParams]);

  const generateTrackingUrl = async () => {
    if (contacts.length === 0) return;
    try {
      const url = await contactsApi.getTrackingUrl(contacts[0].id);
      setTrackingUrl(url);
      setMessage(prev => prev + ` [URL]`);
    } catch (error) {
      setStatusMessage('Virhe seurantalinkin luomisessa');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactsApi.sendBulkMessage({
        contactIds: contacts.map(c => c.id),
        subject,
        message
      });
      setStatusMessage('Viesti lähetetty onnistuneesti!');
      setTimeout(() => navigate('/contacts'), 2000);
    } catch (error) {
      setStatusMessage('Virhe viestin lähetyksessä');
    } finally {
      setLoading(false);
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Ei valittuja yhteystietoja
        </h3>
        <div className="mt-6">
          <button
            onClick={() => navigate('/contacts')}
            className="btn-primary"
          >
            <ArrowLeft className="h-5 w-5" />
            Palaa yhteystietoihin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/contacts')}
          className="btn-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
          Takaisin
        </button>
      </div>

      {statusMessage && (
        <div className="animate-fade-in">
          <div className={`p-4 rounded-lg ${
            statusMessage.includes('Virhe') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {statusMessage}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Lähetä viesti ({contacts.length} vastaanottajaa)
        </h2>

        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700">Vastaanottajat:</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {contact.firstName} {contact.lastName}
                </span>
                <span className="text-sm text-gray-500">
                  ({contact.email})
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              Aihe
            </label>
            <input
              type="text"
              id="subject"
              required
              className="input-field"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Viesti
            </label>
            <div className="flex flex-col space-y-2">
              <textarea
                id="message"
                required
                rows={6}
                className="input-field"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kirjoita viestisi tähän..."
              />
              <button
                type="button"
                onClick={generateTrackingUrl}
                className="btn-secondary flex items-center space-x-2 self-end"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Lisää seurantalinkki</span>
              </button>
              {trackingUrl && (
                <div className="text-sm text-gray-500">
                  Seurantalinkki lisätty viestiin. Se korvataan yksilöllisellä linkillä jokaiselle vastaanottajalle.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              <Send className="h-5 w-5" />
              {loading ? 'Lähetetään...' : 'Lähetä viesti'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}