import { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { DashboardData } from '@/types';
import { formatDateTime } from '@/lib/utils';

const COLORS = {
  HIJAU: '#22c55e',
  KUNING: '#f59e0b',
  MERAH: '#ef4444',
  RINGAN: '#86efac',
  SEDANG: '#fbbf24',
  BERAT: '#f87171',
};

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
      const response = await api.get('/dashboard/stats');
      setData(response.data);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Pengamanan Kesehatan</h1>
          <p className="text-gray-500 mt-1">Monitoring real-time kegiatan MBG</p>
        </div>
        <div className="text-sm text-gray-500">
          Tanggal: {new Date(data.date).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Personel per Kategori</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.personnel_by_category}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.personnel_by_category.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Status Kebugaran</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.fitness_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fitness_status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Insiden Terbaru</h2>
          <div className="space-y-3">
            {data.recent_incidents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada insiden hari ini</p>
            ) : (
              data.recent_incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    incident.severity === 'BERAT' ? 'text-red-600' :
                    incident.severity === 'SEDANG' ? 'text-orange-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">{incident.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{incident.incident_type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(incident.incident_time)}</p>
                  </div>
                  <span className={`badge ${
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
          <h2 className="text-lg font-semibold mb-4">Entry Check Terbaru</h2>
          <div className="space-y-3">
            {data.recent_entry_checks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada entry check hari ini</p>
            ) : (
              data.recent_entry_checks.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`h-5 w-5 mt-0.5 ${
                    entry.decision === 'APPROVED' ? 'text-green-600' :
                    entry.decision === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">{entry.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{entry.checkpoint_location}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(entry.check_time)}</p>
                  </div>
                  <span className={`badge ${
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
