import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { Personnel } from '@/types';

export default function IncidentForm() {
  const navigate = useNavigate();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [formData, setFormData] = useState({
    personnel_id: '',
    location: '',
    incident_type: 'PINGSAN',
    symptoms: '',
    severity: 'RINGAN',
    vital_signs: '',
    actions_taken: '',
    outcome: 'KEMBALI_TUGAS',
    referred_to: '',
    responder_name: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await api.get('/personnel');
      setPersonnel(response.data);
    } catch (error) {
      console.error('Failed to fetch personnel:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/incidents', formData);
      navigate('/incidents');
    } catch (error) {
      console.error('Failed to create incident:', error);
      alert('Gagal menyimpan laporan insiden');
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Laporan Insiden</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Pencatatan insiden kesehatan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Informasi Insiden</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Personel Terdampak *</label>
              <select
                name="personnel_id"
                value={formData.personnel_id}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Pilih Personel</option>
                {personnel.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.rank} ({p.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Lokasi Kejadian *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="input"
                placeholder="Lokasi insiden"
              />
            </div>
            <div>
              <label className="label">Jenis Insiden *</label>
              <select
                name="incident_type"
                value={formData.incident_type}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="PINGSAN">Pingsan</option>
                <option value="CEDERA">Cedera</option>
                <option value="KELELAHAN">Kelelahan</option>
                <option value="DEHIDRASI">Dehidrasi</option>
                <option value="SESAK_NAPAS">Sesak Napas</option>
                <option value="NYERI_DADA">Nyeri Dada</option>
                <option value="SERANGAN_JANTUNG">Serangan Jantung</option>
                <option value="DEMAM">Demam</option>
                <option value="LAIN_LAIN">Lain-lain</option>
              </select>
            </div>
            <div>
              <label className="label">Tingkat Keparahan *</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="RINGAN">Ringan</option>
                <option value="SEDANG">Sedang</option>
                <option value="BERAT">Berat</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Gejala/Keluhan *</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                required
                rows={3}
                className="input"
                placeholder="Deskripsi gejala dan keluhan"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Tanda Vital</label>
              <input
                type="text"
                name="vital_signs"
                value={formData.vital_signs}
                onChange={handleChange}
                className="input"
                placeholder="TD: 120/80, Nadi: 80, SpO2: 98%, dll"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Tindakan & Hasil</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Tindakan yang Dilakukan *</label>
              <textarea
                name="actions_taken"
                value={formData.actions_taken}
                onChange={handleChange}
                required
                rows={3}
                className="input"
                placeholder="Tindakan medis yang telah dilakukan"
              />
            </div>
            <div>
              <label className="label">Hasil/Outcome *</label>
              <select
                name="outcome"
                value={formData.outcome}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="KEMBALI_TUGAS">Kembali Tugas</option>
                <option value="ISTIRAHAT">Istirahat</option>
                <option value="OBSERVASI">Observasi</option>
                <option value="RUJUK_RS">Rujuk RS</option>
                <option value="EVAKUASI">Evakuasi</option>
              </select>
            </div>
            <div>
              <label className="label">Dirujuk ke</label>
              <input
                type="text"
                name="referred_to"
                value={formData.referred_to}
                onChange={handleChange}
                className="input"
                placeholder="Nama RS jika dirujuk"
              />
            </div>
            <div>
              <label className="label">Nama Penanggap *</label>
              <input
                type="text"
                name="responder_name"
                value={formData.responder_name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Nama petugas medis"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Catatan Tambahan</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="input"
                placeholder="Catatan tambahan"
              />
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
            {loading ? 'Menyimpan...' : 'Simpan Laporan Insiden'}
          </button>
        </div>
      </form>
    </div>
  );
}
