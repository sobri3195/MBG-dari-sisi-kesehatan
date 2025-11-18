import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Incident } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, [severityFilter]);

  const fetchIncidents = async () => {
    try {
      let data = await api.incident.getAll();
      
      if (severityFilter) {
        data = data.filter(i => i.severity === severityFilter);
      }
      
      // Enrich with personnel data
      const enrichedData = await Promise.all(
        data.map(async (incident) => {
          const personnel = await api.personnel.getById(incident.personnel_id);
          return {
            ...incident,
            name: personnel?.name,
            rank: personnel?.rank,
            category: personnel?.category,
          };
        })
      );
      
      setIncidents(enrichedData);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Insiden Kesehatan</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Riwayat insiden dan penanganan</p>
        </div>
        <Link to="/incidents/new" className="btn btn-primary flex items-center justify-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Lapor Insiden</span>
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Semua Tingkat</option>
            <option value="RINGAN">Ringan</option>
            <option value="SEDANG">Sedang</option>
            <option value="BERAT">Berat</option>
          </select>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                incident.severity === 'BERAT' ? 'border-red-500 bg-red-50' :
                incident.severity === 'SEDANG' ? 'border-orange-500 bg-orange-50' :
                'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                      incident.severity === 'BERAT' ? 'text-red-600' :
                      incident.severity === 'SEDANG' ? 'text-orange-600' : 'text-yellow-600'
                    }`} />
                    <h3 className="font-semibold text-base sm:text-lg truncate">{incident.name}</h3>
                    <span className={`badge text-xs ${
                      incident.severity === 'BERAT' ? 'badge-red' :
                      incident.severity === 'SEDANG' ? 'badge-yellow' : 'badge-green'
                    }`}>
                      {incident.severity}
                    </span>
                    <span className="badge badge-blue text-xs">{incident.incident_type.replace('_', ' ')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-600">Waktu</p>
                      <p className="font-medium break-words">{formatDateTime(incident.incident_time)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Lokasi</p>
                      <p className="font-medium break-words">{incident.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Gejala</p>
                      <p className="font-medium break-words">{incident.symptoms}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Hasil</p>
                      <p className="font-medium break-words">{incident.outcome.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs sm:text-sm">
                    <p className="text-gray-600">Tindakan: <span className="text-gray-900">{incident.actions_taken}</span></p>
                    {incident.referred_to && (
                      <p className="text-gray-600 mt-1">Rujukan: <span className="text-gray-900">{incident.referred_to}</span></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">Tidak ada data insiden</div>
          )}
        </div>
      </div>
    </div>
  );
}
