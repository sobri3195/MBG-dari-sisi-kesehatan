import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function PersonnelForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    unit: '',
    category: 'PASUKAN',
    phone: '',
    email: '',
    medical_history: '',
    current_medications: '',
    allergies: '',
    hospitalization_history: '',
    chronic_conditions: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        rank: formData.rank,
        unit: formData.unit,
        category: formData.category,
        phone: formData.phone,
        email: formData.email,
        health_profile: {
          medical_history: formData.medical_history,
          current_medications: formData.current_medications,
          allergies: formData.allergies,
          hospitalization_history: formData.hospitalization_history,
          chronic_conditions: formData.chronic_conditions,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
        },
      };

      const personnel = await api.personnel.create({
        name: formData.name,
        rank: formData.rank,
        unit: formData.unit,
        category: formData.category as any,
        phone: formData.phone,
        email: formData.email,
      });
      
      if (payload.health_profile && Object.values(payload.health_profile).some(v => v)) {
        await api.healthProfile.create({
          personnel_id: personnel.id,
          ...payload.health_profile,
        });
      }
      
      navigate('/personnel');
    } catch (error) {
      console.error('Failed to create personnel:', error);
      alert('Gagal menambahkan personel');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button onClick={() => navigate(-1)} className="btn btn-secondary p-2 sm:px-4 sm:py-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Tambah Personel Baru</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Registrasi personel dan profil kesehatan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Data Personel</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nama Lengkap *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Nama lengkap personel"
              />
            </div>
            <div>
              <label className="label">Pangkat</label>
              <input
                type="text"
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                className="input"
                placeholder="Pangkat (opsional)"
              />
            </div>
            <div>
              <label className="label">Satuan</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input"
                placeholder="Satuan (opsional)"
              />
            </div>
            <div>
              <label className="label">Kategori *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="VIP">VIP</option>
                <option value="PASUKAN">Pasukan</option>
                <option value="PANITIA">Panitia</option>
                <option value="VENDOR">Vendor</option>
                <option value="MEDIA">Media</option>
                <option value="TAMU">Tamu</option>
              </select>
            </div>
            <div>
              <label className="label">Nomor Telepon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Profil Kesehatan</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Riwayat Penyakit</label>
              <textarea
                name="medical_history"
                value={formData.medical_history}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Riwayat penyakit yang pernah diderita"
              />
            </div>
            <div>
              <label className="label">Obat Rutin</label>
              <textarea
                name="current_medications"
                value={formData.current_medications}
                onChange={handleChange}
                rows={2}
                className="input"
                placeholder="Obat-obatan yang sedang dikonsumsi rutin"
              />
            </div>
            <div>
              <label className="label">Alergi</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="input"
                placeholder="Alergi obat, makanan, atau lainnya"
              />
            </div>
            <div>
              <label className="label">Riwayat Rawat Inap</label>
              <textarea
                name="hospitalization_history"
                value={formData.hospitalization_history}
                onChange={handleChange}
                rows={2}
                className="input"
                placeholder="Riwayat rawat inap di rumah sakit"
              />
            </div>
            <div>
              <label className="label">Penyakit Kronis</label>
              <input
                type="text"
                name="chronic_conditions"
                value={formData.chronic_conditions}
                onChange={handleChange}
                className="input"
                placeholder="Diabetes, hipertensi, asma, dll"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nama Kontak Darurat</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Nama keluarga yang dapat dihubungi"
                />
              </div>
              <div>
                <label className="label">Nomor Kontak Darurat</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary w-full sm:w-auto"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full sm:w-auto"
          >
            {loading ? 'Menyimpan...' : 'Simpan Personel'}
          </button>
        </div>
      </form>
    </div>
  );
}
