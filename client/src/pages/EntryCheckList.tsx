import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { EntryCheck } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function EntryCheckList() {
  const [entries, setEntries] = useState<EntryCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionFilter, setDecisionFilter] = useState('');

  useEffect(() => {
    fetchEntries();
  }, [decisionFilter]);

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams();
      if (decisionFilter) params.append('decision', decisionFilter);
      
      const response = await api.get(`/entries?${params.toString()}`);
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entry Check</h1>
          <p className="text-gray-500 mt-1">Riwayat pemeriksaan di pintu masuk</p>
        </div>
        <Link to="/entry-check/new" className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Entry Check Baru</span>
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="input w-48"
          >
            <option value="">Semua Keputusan</option>
            <option value="APPROVED">Disetujui</option>
            <option value="OBSERVATION">Observasi</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checkpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Triage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keputusan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suhu</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateTime(entry.check_time)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{entry.name}</div>
                    <div className="text-xs text-gray-500">{entry.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.checkpoint_location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      entry.triage_category === 'HIJAU' ? 'badge-green' :
                      entry.triage_category === 'KUNING' ? 'badge-yellow' : 'badge-red'
                    }`}>
                      {entry.triage_category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      entry.decision === 'APPROVED' ? 'badge-green' :
                      entry.decision === 'REJECTED' ? 'badge-red' : 'badge-yellow'
                    }`}>
                      {entry.decision}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.temperature ? `${entry.temperature}°C` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-500">Tidak ada data entry check</div>
          )}
        </div>
      </div>
    </div>
  );
}
