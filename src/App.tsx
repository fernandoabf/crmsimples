import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ContactForm } from './components/ContactForm';
import { ContactList } from './components/ContactList';
import { BulkMessage } from './components/BulkMessage';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { UserCircle2, BarChart2, Settings as SettingsIcon, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out sm:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-center px-4 py-4 bg-indigo-600">
              <h1 className="text-xl font-bold text-white">CRM Simple</h1>
            </div>

            {/* Divider */}
            <div className="w-full h-0.5 bg-gray-300" />

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-4">
              {/* Contact Link */}
              <Link
                to="/"
                className="flex items-center px-4 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition"
              >
                <UserCircle2 className="h-5 w-5 mr-2 text-indigo-600" />
                Yhteystiedot
              </Link>

              {/* Stats Link */}
              <Link
                to="/stats"
                className="flex items-center px-4 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition"
              >
                <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
                Tilastot
              </Link>

              {/* Settings Link */}
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition"
              >
                <SettingsIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Asetukset
              </Link>

              {/* External Link */}
              <a
                href="https://levelup.fi/palvelut/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition"
              >
                LevelUp Palvelut
              </a>
            </nav>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-25 sm:hidden"
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-0 sm:ml-64">
          {/* Mobile Menu Button */}
          <div className="sm:hidden p-4 bg-white shadow-md">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Routes and Main Content */}
          <main className="flex-1 p-6 sm:p-8">
            <Routes>
              <Route path="/" element={<ContactList />} />
              <Route path="/contacts/new" element={<ContactForm />} />
              <Route path="/bulk-message" element={<BulkMessage />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;