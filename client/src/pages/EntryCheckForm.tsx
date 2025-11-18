import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scan } from 'lucide-react';
import api from '@/lib/api';

export default function EntryCheckForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'scan' | 'check'>('scan');
  const [clearance, setClearance] = useState<any>(null);
  const [qrInput, setQrInput] = useState('');
  const [formData, setFormData] = useState({
    checkpoint_location: '',
    temperature: '',
    symptoms: '',
    triage_category: 'HIJAU',
    decision: 'APPROVED',
    notes: '',
    checker_name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleScanQR = async () => {
    if (!qrInput) return;
    
    setLoading(true);
    try {
      const qrCode = qrInput.replace('MBG-HC-', '');
      const response = await api.get(`/screenings/clearance/qr/${qrCode}`);
      setClearance(response.data);
      setStep('check');
    } catch (error) {
      alert('QR Code tidak valid atau clearance tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        personnel_id: clearance.personnel_id,
        clearance_id: clearance.id,
        ...formData,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      };

      await api.post('/entries', payload);
      navigate('/entry-check');
    } catch (error) {
      console.error('Failed to create entry check:', error);
      alert('Gagal menyimpan entry check');
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Entry Check</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Pemeriksaan kesehatan di pintu masuk</p>
        </div>
      </div>

      {step === 'scan' ? (
        <div className="max-w-2xl mx-auto card">
          <div className="text-center mb-6">
            <Scan className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-primary-600 mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold">Scan QR Code Health Clearance</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Masukkan kode QR atau ID clearance</p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="MBG-HC-xxxxxxxx"
                className="input text-center text-base sm:text-lg"
                autoFocus
              />
            </div>
            <button
              onClick={handleScanQR}
              disabled={loading || !qrInput}
              className="btn btn-primary w-full"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi QR Code'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card bg-primary-50 border-2 border-primary-200">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Data Personel:</h3>
            <p className="text-base sm:text-lg font-bold">{clearance.name}</p>
            <p className="text-xs sm:text-sm text-gray-600">{clearance.rank} - {clearance.unit}</p>
            <p className="text-xs sm:text-sm mt-2">
              Status: <span className={`badge text-xs ${clearance.clearance_status === 'VALID' ? 'badge-green' : 'badge-red'}`}>
                {clearance.clearance_status}
              </span>
            </p>
            <p className="text-xs sm:text-sm">
              Kebugaran: <span className="badge badge-blue text-xs">{clearance.fitness_status}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="card">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Pemeriksaan Cepat</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Lokasi Checkpoint *</label>
                  <input
                    type="text"
                    name="checkpoint_location"
                    value={formData.checkpoint_location}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Gate A, Pos 1, dll"
                  />
                </div>
                <div>
                  <label className="label">Suhu Tubuh</label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="input"
                    placeholder="°C"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Gejala/Keluhan</label>
                  <input
                    type="text"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    className="input"
                    placeholder="Batuk, demam, lemas, dll"
                  />
                </div>
                <div>
                  <label className="label">Kategori Triage *</label>
                  <select
                    name="triage_category"
                    value={formData.triage_category}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="HIJAU">Hijau - Sehat</option>
                    <option value="KUNING">Kuning - Perlu Perhatian</option>
                    <option value="MERAH">Merah - Tidak Boleh Masuk</option>
                  </select>
                </div>
                <div>
                  <label className="label">Keputusan *</label>
                  <select
                    name="decision"
                    value={formData.decision}
                    onChange={handleChange}
                    required
                    className="input"
                  >
                    <option value="APPROVED">Disetujui Masuk</option>
                    <option value="OBSERVATION">Perlu Observasi</option>
                    <option value="REJECTED">Ditolak/Rujuk</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Catatan</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="input"
                    placeholder="Catatan tambahan"
                  />
                </div>
                <div>
                  <label className="label">Nama Pemeriksa *</label>
                  <input
                    type="text"
                    name="checker_name"
                    value={formData.checker_name}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Nama petugas"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('scan')}
                className="btn btn-secondary w-full sm:w-auto"
              >
                Scan Ulang
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full sm:w-auto"
              >
                {loading ? 'Menyimpan...' : 'Simpan Entry Check'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
