import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, QrCode } from 'lucide-react';
import api from '@/lib/api';
import { Personnel } from '@/types';

export default function ScreeningForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [formData, setFormData] = useState({
    screening_date: new Date().toISOString().split('T')[0],
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    temperature: '',
    bmi: '',
    oxygen_saturation: '',
    fitness_status: 'FIT',
    fitness_notes: '',
    duty_recommendation: 'MODERATE',
    screener_name: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPersonnel();
  }, [id]);

  const fetchPersonnel = async () => {
    try {
      const data = await api.personnel.getById(id!);
      setPersonnel(data);
    } catch (error) {
      console.error('Failed to fetch personnel:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        personnel_id: id,
        ...formData,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : undefined,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        bmi: formData.bmi ? parseFloat(formData.bmi) : undefined,
        oxygen_saturation: formData.oxygen_saturation ? parseInt(formData.oxygen_saturation) : undefined,
      };

      const screening = await api.healthScreening.create(payload as any);
      
      // Create health clearance if fitness status is FIT or FIT_WITH_NOTES
      if (formData.fitness_status === 'FIT' || formData.fitness_status === 'FIT_WITH_NOTES') {
        const validFrom = new Date();
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days
        
        const clearance = await api.healthClearance.create({
          personnel_id: id!,
          screening_id: screening.id,
          clearance_status: 'VALID',
          valid_from: validFrom.toISOString(),
          valid_until: validUntil.toISOString(),
        });
        
        setQrCode(clearance.qr_code);
      } else {
        navigate('/personnel');
      }
    } catch (error) {
      console.error('Failed to create screening:', error);
      alert('Gagal menyimpan data skrining');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!personnel) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (qrCode) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <QrCode className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-green-600 mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-green-600">Skrining Berhasil!</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Health Clearance Pass telah diterbitkan</p>
          </div>

          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6">
            <div className="flex justify-center mb-4">
              <img 
                src={qrCode} 
                alt="QR Code" 
                className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">QR Code Health Clearance</p>
            <p className="font-semibold text-sm sm:text-base break-words">{personnel.name}</p>
            <p className="text-xs sm:text-sm text-gray-600 break-words">{personnel.rank} - {personnel.unit}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="btn btn-secondary w-full sm:w-auto"
            >
              Cetak QR Code
            </button>
            <button
              onClick={() => navigate('/personnel')}
              className="btn btn-primary w-full sm:w-auto"
            >
              Kembali ke Daftar Personel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button onClick={() => navigate(-1)} className="btn btn-secondary p-2 sm:px-4 sm:py-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Skrining Kesehatan</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base truncate">
            Personel: <span className="font-semibold">{personnel.name}</span>
            {personnel.rank && ` - ${personnel.rank}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Pemeriksaan Tanda Vital</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Tanggal Skrining *</label>
              <input
                type="date"
                name="screening_date"
                value={formData.screening_date}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Tekanan Darah Sistolik</label>
              <input
                type="number"
                name="blood_pressure_systolic"
                value={formData.blood_pressure_systolic}
                onChange={handleChange}
                className="input"
                placeholder="mmHg"
              />
            </div>
            <div>
              <label className="label">Tekanan Darah Diastolik</label>
              <input
                type="number"
                name="blood_pressure_diastolic"
                value={formData.blood_pressure_diastolic}
                onChange={handleChange}
                className="input"
                placeholder="mmHg"
              />
            </div>
            <div>
              <label className="label">Denyut Nadi</label>
              <input
                type="number"
                name="heart_rate"
                value={formData.heart_rate}
                onChange={handleChange}
                className="input"
                placeholder="bpm"
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
            <div>
              <label className="label">BMI</label>
              <input
                type="number"
                step="0.1"
                name="bmi"
                value={formData.bmi}
                onChange={handleChange}
                className="input"
                placeholder="kg/m²"
              />
            </div>
            <div>
              <label className="label">Saturasi Oksigen</label>
              <input
                type="number"
                name="oxygen_saturation"
                value={formData.oxygen_saturation}
                onChange={handleChange}
                className="input"
                placeholder="%"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Hasil Penilaian</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Status Kebugaran *</label>
              <select
                name="fitness_status"
                value={formData.fitness_status}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="FIT">Fit</option>
                <option value="FIT_WITH_NOTES">Fit dengan Catatan</option>
                <option value="NOT_FIT">Tidak Fit</option>
              </select>
            </div>
            <div>
              <label className="label">Rekomendasi Tugas</label>
              <select
                name="duty_recommendation"
                value={formData.duty_recommendation}
                onChange={handleChange}
                className="input"
              >
                <option value="HEAVY">Berat</option>
                <option value="MODERATE">Sedang</option>
                <option value="LIGHT">Ringan</option>
                <option value="NO_DUTY">Tidak Bertugas</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Catatan Pemeriksaan</label>
              <textarea
                name="fitness_notes"
                value={formData.fitness_notes}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Catatan khusus dari hasil pemeriksaan"
              />
            </div>
            <div>
              <label className="label">Nama Pemeriksa *</label>
              <input
                type="text"
                name="screener_name"
                value={formData.screener_name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Nama dokter/perawat pemeriksa"
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
            {loading ? 'Menyimpan...' : 'Simpan & Generate QR Code'}
          </button>
        </div>
      </form>
    </div>
  );
}
