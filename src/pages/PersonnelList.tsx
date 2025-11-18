import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText } from 'lucide-react';
import api from '@/lib/api';
import { Personnel } from '@/types';

export default function PersonnelList() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchPersonnel();
  }, [categoryFilter]);

  const fetchPersonnel = async () => {
    try {
      let data = await api.personnel.getAll();
      
      if (categoryFilter) {
        data = data.filter(p => p.category === categoryFilter);
      }
      
      setPersonnel(data);
    } catch (error) {
      console.error('Failed to fetch personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonnel = personnel.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.rank?.toLowerCase().includes(search.toLowerCase()) ||
    p.unit?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Personel</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manajemen data personel MBG</p>
        </div>
        <Link to="/personnel/new" className="btn btn-primary flex items-center justify-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Tambah Personel</span>
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, pangkat, atau satuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="">Semua Kategori</option>
            <option value="VIP">VIP</option>
            <option value="PASUKAN">Pasukan</option>
            <option value="PANITIA">Panitia</option>
            <option value="VENDOR">Vendor</option>
            <option value="MEDIA">Media</option>
            <option value="TAMU">Tamu</option>
          </select>
        </div>

        {/* Mobile View - Cards */}
        <div className="block md:hidden space-y-3">
          {filteredPersonnel.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              Tidak ada data personel
            </div>
          ) : (
            filteredPersonnel.map((person) => (
              <div key={person.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.rank || '-'}</p>
                    <p className="text-xs text-gray-500">{person.unit || '-'}</p>
                  </div>
                  <span className="badge badge-blue text-xs ml-2">{person.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    {person.phone || 'Tidak ada kontak'}
                  </div>
                  <Link
                    to={`/personnel/${person.id}/screening`}
                    className="text-primary-600 hover:text-primary-900 flex items-center space-x-1 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Skrining</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto -mx-6 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pangkat
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satuan
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPersonnel.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{person.name}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.rank || '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.unit || '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-blue text-xs">{person.category}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.phone || '-'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/personnel/${person.id}/screening`}
                        className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Skrining</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPersonnel.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">
                Tidak ada data personel
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
