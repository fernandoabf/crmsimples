import React, { useEffect, useState } from 'react';
import { contactsApi } from '../services/api';
import { BarChart, Clock, Globe } from 'lucide-react';

interface Stats {
  totalVisits: number;
  recentVisits: Array<{
    contact_id: number;
    firstName: string;
    lastName: string;
    company: string;
    url: string;
    timestamp: string;
  }>;
  popularUrls: Array<{
    url: string;
    visits: number;
  }>;
}

export function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await contactsApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Virhe tilastojen lataamisessa:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    // Atualiza a cada 10 segundos para maior precisão em tempo real
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return <div>Ei tilastoja saatavilla.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Käynnit yhteensä</h2>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.totalVisits}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Viimeisimmät käynnit</h2>
          </div>
          <ul>
            {stats.recentVisits.map((visit, index) => (
              <li key={index} className="py-2">
                <p className="text-sm font-medium text-gray-900">
                  {visit.firstName} {visit.lastName}
                </p>
                <p className="text-sm text-gray-500">{visit.company}</p>
                <p className="text-sm text-gray-500">
                  {new Date(visit.timestamp).toLocaleString('fi-FI')}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <BarChart className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Suosituimmat linkit</h2>
          </div>
          <ul>
            {stats.popularUrls.map((urlStat, index) => (
              <li key={index} className="py-2">
                <p className="text-sm text-gray-900 truncate">
                  {urlStat.url}
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {urlStat.visits} käyntiä
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}