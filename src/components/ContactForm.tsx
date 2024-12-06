import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { contactsApi } from '../services/api';
import Papa from 'papaparse';

interface Contact {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
}

export function ContactForm() {
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact>({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactsApi.createContact(contact);
      setMessage('Yhteystieto lisätty onnistuneesti!');
      setTimeout(() => navigate('/contacts'), 2000);
    } catch (error) {
      setMessage('Virhe yhteystiedon lisäämisessä');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            await contactsApi.importContacts(results.data);
            setMessage('Yhteystiedot tuotu onnistuneesti!');
            setTimeout(() => navigate('/contacts'), 2000);
          } catch (error) {
            setMessage('Virhe yhteystietojen tuonnissa');
          }
        },
        error: () => {
          setMessage('Virhe CSV-tiedoston käsittelyssä');
        }
      });
    }
  };

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
        
        <div className="relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="btn-secondary cursor-pointer"
          >
            Tuo CSV
          </label>
        </div>
      </div>

      {message && (
        <div className="animate-fade-in">
          <div className={`p-4 rounded-lg ${
            message.includes('Virhe') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Uusi yhteystieto</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              Etunimi
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="input-field"
              value={contact.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Sukunimi
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              className="input-field"
              value={contact.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="company" className="form-label">
            Yritys
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            className="input-field"
            value={contact.company}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Sähköposti
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="input-field"
            value={contact.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Puhelin
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="input-field"
            value={contact.phone}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Tallennetaan...' : 'Tallenna'}
          </button>
        </div>
      </form>
    </div>
  );
}