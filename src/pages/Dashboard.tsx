import { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { DashboardData } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const stats = await api.dashboard.getStats();
      const personnel = await api.personnel.getAll();
      const incidents = await api.incident.getAll();
      const entryChecks = await api.entryCheck.getAll();
      
      // Get personnel by category
      const categoryCount: Record<string, number> = {};
      personnel.forEach((p) => {
        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
      });
      const personnel_by_category = Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
      }));
      
      // Get fitness distribution (from latest screening per personnel)
      const screeningsMap = new Map();
      const allScreenings = await Promise.all(
        personnel.map(p => api.healthScreening.getByPersonnelId(p.id))
      );
      allScreenings.forEach((screenings, idx) => {
        if (screenings.length > 0) {
          const latest = screenings[screenings.length - 1];
          screeningsMap.set(personnel[idx].id, latest);
        }
      });
      const fitnessCount: Record<string, number> = {};
      screeningsMap.forEach((screening) => {
        fitnessCount[screening.fitness_status] = (fitnessCount[screening.fitness_status] || 0) + 1;
      });
      const fitness_distribution = Object.entries(fitnessCount).map(([fitness_status, count]) => ({
        fitness_status,
        count,
      }));
      
      // Get recent incidents with personnel info
      const recent_incidents = await Promise.all(
        incidents
          .sort((a, b) => new Date(b.incident_time).getTime() - new Date(a.incident_time).getTime())
          .slice(0, 5)
          .map(async (incident) => {
            const person = await api.personnel.getById(incident.personnel_id);
            return {
              ...incident,
              name: person?.name,
              rank: person?.rank,
              category: person?.category,
            };
          })
      );
      
      // Get recent entry checks with personnel info
      const recent_entry_checks = await Promise.all(
        entryChecks
          .sort((a, b) => new Date(b.check_time).getTime() - new Date(a.check_time).getTime())
          .slice(0, 5)
          .map(async (check) => {
            const person = await api.personnel.getById(check.personnel_id);
            return {
              ...check,
              name: person?.name,
              rank: person?.rank,
              category: person?.category,
            };
          })
      );
      
      setData({
        stats,
        date: new Date().toISOString(),
        recent_incidents,
        recent_entry_checks,
        personnel_by_category,
        fitness_distribution,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-12">
        Gagal memuat data dashboard
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Personel',
      value: data.stats.total_personnel,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Terskrining',
      value: data.stats.screened_personnel,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Masuk Hari Ini',
      value: data.stats.entry_approved,
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
    {
      name: 'Ditolak',
      value: data.stats.entry_rejected,
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      name: 'Insiden Hari Ini',
      value: data.stats.incidents_total,
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
    {
      name: 'Insiden Berat',
      value: data.stats.incidents_severe,
      icon: AlertTriangle,
      color: 'bg-red-600',
    },
    {
      name: 'Pos Aktif',
      value: data.stats.active_posts,
      icon: Activity,
      color: 'bg-purple-500',
    },
    {
      name: 'Clearance Aktif',
      value: data.stats.active_clearances,
      icon: CheckCircle,
      color: 'bg-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Pengamanan Kesehatan</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Monitoring real-time kegiatan MBG</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          Tanggal: {new Date(data.date).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Personel per Kategori</h2>
          <ResponsiveContainer width="100%" height={250} className="text-xs sm:text-sm">
            <PieChart>
              <Pie
                data={data.personnel_by_category}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.count > 0 ? entry.count : ''}
              >
                {data.personnel_by_category.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Status Kebugaran</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.fitness_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fitness_status" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Insiden Terbaru</h2>
          <div className="space-y-3">
            {data.recent_incidents.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">Tidak ada insiden hari ini</p>
            ) : (
              data.recent_incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 ${
                    incident.severity === 'BERAT' ? 'text-red-600' :
                    incident.severity === 'SEDANG' ? 'text-orange-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{incident.name || 'Unknown'}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{incident.incident_type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(incident.incident_time)}</p>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${
                    incident.severity === 'BERAT' ? 'badge-red' :
                    incident.severity === 'SEDANG' ? 'badge-yellow' : 'badge-green'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Entry Check Terbaru</h2>
          <div className="space-y-3">
            {data.recent_entry_checks.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">Tidak ada entry check hari ini</p>
            ) : (
              data.recent_entry_checks.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 ${
                    entry.decision === 'APPROVED' ? 'text-green-600' :
                    entry.decision === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{entry.name || 'Unknown'}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{entry.checkpoint_location}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(entry.check_time)}</p>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${
                    entry.decision === 'APPROVED' ? 'badge-green' :
                    entry.decision === 'REJECTED' ? 'badge-red' : 'badge-yellow'
                  }`}>
                    {entry.decision}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
