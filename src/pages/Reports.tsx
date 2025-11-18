import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryStats, setEntryStats] = useState<any>(null);
  const [incidentStats, setIncidentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [date]);

  const fetchStats = async () => {
    try {
      const entries = await api.entryCheck.getAll();
      const incidents = await api.incident.getAll();
      
      // Filter by date
      const selectedDate = new Date(date);
      const filteredEntries = entries.filter(e => {
        const entryDate = new Date(e.check_time);
        return entryDate.toDateString() === selectedDate.toDateString();
      });
      const filteredIncidents = incidents.filter(i => {
        const incidentDate = new Date(i.incident_time);
        return incidentDate.toDateString() === selectedDate.toDateString();
      });
      
      // Calculate entry stats
      const entryStats = {
        total: filteredEntries.length,
        approved: filteredEntries.filter(e => e.decision === 'APPROVED').length,
        observation: filteredEntries.filter(e => e.decision === 'OBSERVATION').length,
        rejected: filteredEntries.filter(e => e.decision === 'REJECTED').length,
        by_triage: [
          { category: 'HIJAU', count: filteredEntries.filter(e => e.triage_category === 'HIJAU').length },
          { category: 'KUNING', count: filteredEntries.filter(e => e.triage_category === 'KUNING').length },
          { category: 'MERAH', count: filteredEntries.filter(e => e.triage_category === 'MERAH').length },
        ],
      };
      
      // Calculate incident stats
      const incidentStats = {
        total: filteredIncidents.length,
        ringan: filteredIncidents.filter(i => i.severity === 'RINGAN').length,
        sedang: filteredIncidents.filter(i => i.severity === 'SEDANG').length,
        berat: filteredIncidents.filter(i => i.severity === 'BERAT').length,
        by_type: Object.entries(
          filteredIncidents.reduce((acc: any, i) => {
            acc[i.incident_type] = (acc[i.incident_type] || 0) + 1;
            return acc;
          }, {})
        ).map(([type, count]) => ({ type, count })),
      };
      
      setEntryStats(entryStats);
      setIncidentStats(incidentStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Analisis dan statistik pengamanan kesehatan</p>
        </div>
        <button className="btn btn-primary flex items-center justify-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
          <h2 className="text-lg sm:text-xl font-semibold">Pilih Tanggal Laporan</h2>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input w-full sm:w-64"
        />
      </div>

      {entryStats && (
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Statistik Entry Check</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Total Check</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{entryStats.total}</p>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Disetujui</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{entryStats.approved}</p>
            </div>
            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Observasi</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{entryStats.observation}</p>
            </div>
            <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Ditolak</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{entryStats.rejected}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-3">Per Checkpoint</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={entryStats.by_checkpoint}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="checkpoint_location" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-3">Per Kategori Triage</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={entryStats.by_triage}
                    dataKey="count"
                    nameKey="triage_category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {entryStats.by_triage.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.triage_category === 'HIJAU' ? '#22c55e' :
                        entry.triage_category === 'KUNING' ? '#f59e0b' : '#ef4444'
                      } />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {incidentStats && (
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Statistik Insiden</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Total Insiden</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{incidentStats.total}</p>
            </div>
            {incidentStats.by_severity.map((item: any) => (
              <div
                key={item.severity}
                className={`p-3 sm:p-4 rounded-lg ${
                  item.severity === 'BERAT' ? 'bg-red-50' :
                  item.severity === 'SEDANG' ? 'bg-yellow-50' : 'bg-green-50'
                }`}
              >
                <p className="text-xs sm:text-sm text-gray-600">{item.severity}</p>
                <p className={`text-xl sm:text-2xl font-bold ${
                  item.severity === 'BERAT' ? 'text-red-600' :
                  item.severity === 'SEDANG' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {item.count}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-3">Jenis Insiden</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={incidentStats.by_type} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="incident_type" width={80} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-3">Insiden per Jam</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={incidentStats.by_hour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {incidentStats.by_location && incidentStats.by_location.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm sm:text-base font-semibold mb-3">Lokasi Rawan Insiden</h3>
              <div className="space-y-2">
                {incidentStats.by_location.map((loc: any) => (
                  <div key={loc.location} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded">
                    <span className="font-medium text-sm sm:text-base truncate pr-2">{loc.location}</span>
                    <span className="badge badge-red text-xs flex-shrink-0">{loc.count} insiden</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
