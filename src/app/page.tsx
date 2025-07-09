'use client';

import { use, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { alerts } from '../../data/alerts';
import PieCard from '@/components/PieCard';
import type { Alert } from '@/types/alerts';

const WorldMap = dynamic(() => import('@/components/WorldMap'), { ssr: false });

function countByField(alerts: Alert[], field: keyof Alert['tags']) {
  const map: Record<string, number> = {};
  alerts.forEach(({ tags }) => {
    const key = tags[field];
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export default function Home() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const platforms = useMemo(() => {
    const set = new Set(alerts.map(a => a.tags.device));
    return Array.from(set);
  }, []);

  const filteredAlerts = useMemo(() => {
    return selectedPlatform ? alerts.filter(a => a.tags.device === selectedPlatform) : alerts;
  }, [selectedPlatform]);

  const domainData = useMemo(() => countByField(filteredAlerts, 'domain'), [filteredAlerts]);
  const severityData = useMemo(() => countByField(filteredAlerts, 'severity'), [filteredAlerts]);

  const impactData = useMemo(() => {
    const map: Record<string, number> = {};
    alerts.forEach(({ tags }) => {
      map[tags.country] = (map[tags.country] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, []);

  const severityColors = {
    Fatal: '#ff4d4f',     
    Critical: '#ffa94d',  
    Warning: '#ffe5b4',   
  };

  return (
    <main className="min-h-screen bg-blue-100 p-8 space-y-10 text-gray-800">
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="platform">Filter by Platform:</label>
        <select
          id="platform"
          value={selectedPlatform || ''}
          onChange={e => setSelectedPlatform(e.target.value || null)}
          className="p-2 border rounded"
        >
          <option value="">All</option>
          {platforms.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PieCard title="Domain Summary" data={domainData} />
        <PieCard title="Severity Summary" data={severityData} colorMap={severityColors} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto">
        <WorldMap alerts={filteredAlerts} />
      </div>
      <div className="bg-white p-6 rounded-xl shadow max-w-5xl mx-auto overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Alert List</h2>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Timestamp</th>
              <th className="px-4 py-2 border">Country</th>
              <th className="px-4 py-2 border">Device</th>
              <th className="px-4 py-2 border">Domain</th>
              <th className="px-4 py-2 border">Severity</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alert, index) => (
              <tr key={index} className="text-sm text-gray-800 odd:bg-white even:bg-gray-50">
                <td className="px-4 py-2 border">{alert.name}</td>
                <td className="px-4 py-2 border">{new Date(alert.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2 border">{alert.tags.country}</td>
                <td className="px-4 py-2 border">{alert.tags.device}</td>
                <td className="px-4 py-2 border">{alert.tags.domain}</td>
                <td className="px-4 py-2 border">{alert.tags.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
