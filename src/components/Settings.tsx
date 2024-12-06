import React, { useState } from 'react';
import { contactsApi } from '../services/api';

export function Settings() {
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '',
    user: '',
    password: '',
    from: '',
    notificationEmail: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactsApi.updateSmtpConfig(smtpConfig);
      setMessage('Asetukset päivitetty onnistuneesti!');
    } catch (error) {
      setMessage('Virhe asetusten päivityksessä. Yritä uudelleen.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSmtpConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Sähköpostiasetukset</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="host" className="block text-sm font-medium text-gray-700">
            SMTP-palvelin
          </label>
          <input
            type="text"
            name="host"
            id="host"
            value={smtpConfig.host}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="smtp.example.com"
          />
        </div>

        <div>
          <label htmlFor="port" className="block text-sm font-medium text-gray-700">
            Portti
          </label>
          <input
            type="text"
            name="port"
            id="port"
            value={smtpConfig.port}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="587"
          />
        </div>

        <div>
          <label htmlFor="user" className="block text-sm font-medium text-gray-700">
            Käyttäjätunnus
          </label>
          <input
            type="text"
            name="user"
            id="user"
            value={smtpConfig.user}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Salasana
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={smtpConfig.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="from" className="block text-sm font-medium text-gray-700">
            Lähettäjän osoite
          </label>
          <input
            type="email"
            name="from"
            id="from"
            value={smtpConfig.from}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="noreply@example.com"
          />
        </div>

        <div>
          <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700">
            Ilmoitussähköposti
          </label>
          <input
            type="email"
            name="notificationEmail"
            id="notificationEmail"
            value={smtpConfig.notificationEmail}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="notifications@example.com"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.includes('Virhe') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Tallennetaan...' : 'Tallenna asetukset'}
          </button>
        </div>
      </form>
    </div>
  );
}
