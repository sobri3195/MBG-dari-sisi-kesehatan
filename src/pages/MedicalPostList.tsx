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
      const data = await api.medicalPost.getAll();
      setPosts(data);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pos Kesehatan</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Status pos kesehatan dan logistik</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                  post.type === 'UTAMA' ? 'bg-primary-100' :
                  post.type === 'SATELIT' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  <Building2 className={`h-5 w-5 sm:h-6 sm:w-6 ${
                    post.type === 'UTAMA' ? 'text-primary-600' :
                    post.type === 'SATELIT' ? 'text-green-600' : 'text-purple-600'
                  }`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">{post.name}</h3>
                  <span className="text-xs badge badge-blue">{post.type}</span>
                </div>
              </div>
              <span className={`badge text-xs flex-shrink-0 ml-2 ${
                post.status === 'ACTIVE' ? 'badge-green' :
                post.status === 'STANDBY' ? 'badge-yellow' : 'badge-gray'
              }`}>
                {post.status}
              </span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <Package className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{post.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>{post.staff_count} Personel</span>
              </div>
              {post.equipment_list && (
                <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded text-xs sm:text-sm">
                  <p className="font-medium mb-1">Peralatan:</p>
                  <p className="text-gray-600 break-words">{post.equipment_list}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 text-sm">
            Tidak ada data pos kesehatan
          </div>
        )}
      </div>
    </div>
  );
}
