import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ContactForm } from './components/ContactForm';
import { ContactList } from './components/ContactList';
import { BulkMessage } from './components/BulkMessage';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { UserCircle2, Mail, BarChart2, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-indigo-600">CRM Simple</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="nav-link"
                  >
                    <UserCircle2 className="h-5 w-5 mr-2" />
                    Yhteystiedot
                  </Link>
                  <Link
                    to="/bulk-message"
                    className="nav-link"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Viestit
                  </Link>
                  <Link
                    to="/stats"
                    className="nav-link"
                  >
                    <BarChart2 className="h-5 w-5 mr-2" />
                    Tilastot
                  </Link>
                  <Link
                    to="/settings"
                    className="nav-link"
                  >
                    <SettingsIcon className="h-5 w-5 mr-2" />
                    Asetukset
                  </Link>
                  <a
                    href="https://levelup.fi/palvelut/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                  >
                    LevelUp Palvelut
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<ContactList />} />
              <Route path="/contacts/new" element={<ContactForm />} />
              <Route path="/bulk-message" element={<BulkMessage />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;