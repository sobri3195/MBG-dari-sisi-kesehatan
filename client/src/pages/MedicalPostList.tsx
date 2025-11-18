import { useEffect, useState } from 'react';
import { Building2, Users, Package } from 'lucide-react';
import api from '@/lib/api';
import { MedicalPost } from '@/types';

export default function MedicalPostList() {
  const [posts, setPosts] = useState<MedicalPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/medical-posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch medical posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pos Kesehatan</h1>
        <p className="text-gray-500 mt-1">Status pos kesehatan dan logistik</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${
                  post.type === 'UTAMA' ? 'bg-primary-100' :
                  post.type === 'SATELIT' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  <Building2 className={`h-6 w-6 ${
                    post.type === 'UTAMA' ? 'text-primary-600' :
                    post.type === 'SATELIT' ? 'text-green-600' : 'text-purple-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{post.name}</h3>
                  <span className="text-xs badge badge-blue">{post.type}</span>
                </div>
              </div>
              <span className={`badge ${
                post.status === 'ACTIVE' ? 'badge-green' :
                post.status === 'STANDBY' ? 'badge-yellow' : 'badge-gray'
              }`}>
                {post.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>{post.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{post.staff_count} Personel</span>
              </div>
              {post.equipment_list && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                  <p className="font-medium mb-1">Peralatan:</p>
                  <p className="text-gray-600">{post.equipment_list}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            Tidak ada data pos kesehatan
          </div>
        )}
      </div>
    </div>
  );
}
