import {
  Personnel,
  HealthProfile,
  HealthScreening,
  HealthClearance,
  MedicalPost,
} from '../types';
import { STORAGE_KEYS, setStorageData } from './storage';
import QRCode from 'qrcode';

async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

export async function initializeSampleData() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Sample Personnel
  const personnel: Personnel[] = [
    {
      id: '1',
      name: 'Mayor Bambang Sutrisno',
      rank: 'Mayor',
      unit: 'Batalyon 101',
      category: 'PASUKAN',
      phone: '081234567890',
      email: 'bambang@mil.id',
      created_at: now.toISOString(),
    },
    {
      id: '2',
      name: 'Dr. Siti Rahayu',
      rank: 'Kolonel',
      unit: 'Dinas Kesehatan TNI',
      category: 'PANITIA',
      phone: '081234567891',
      email: 'siti@mil.id',
      created_at: now.toISOString(),
    },
    {
      id: '3',
      name: 'Jenderal Ahmad Yani',
      rank: 'Jenderal',
      unit: 'Kodam V',
      category: 'VIP',
      phone: '081234567892',
      email: 'ahmad@mil.id',
      created_at: now.toISOString(),
    },
    {
      id: '4',
      name: 'Budi Santoso',
      rank: '-',
      unit: 'PT Catering Nusantara',
      category: 'VENDOR',
      phone: '081234567893',
      email: 'budi@vendor.com',
      created_at: now.toISOString(),
    },
    {
      id: '5',
      name: 'Andi Pratama',
      rank: 'Sersan',
      unit: 'Batalyon 202',
      category: 'PASUKAN',
      phone: '081234567894',
      email: 'andi@mil.id',
      created_at: now.toISOString(),
    },
  ];

  // Sample Health Profiles
  const healthProfiles: HealthProfile[] = [
    {
      id: 'hp1',
      personnel_id: '1',
      medical_history: 'Sehat, tidak ada riwayat penyakit serius',
      current_medications: 'Tidak ada',
      allergies: 'Tidak ada',
      hospitalization_history: 'Tidak pernah',
      chronic_conditions: 'Tidak ada',
      emergency_contact_name: 'Dewi Sutrisno',
      emergency_contact_phone: '081234567800',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'hp2',
      personnel_id: '3',
      medical_history: 'Hipertensi terkontrol',
      current_medications: 'Amlodipine 5mg',
      allergies: 'Penisilin',
      hospitalization_history: 'Operasi appendix 2015',
      chronic_conditions: 'Hipertensi',
      emergency_contact_name: 'Siti Yani',
      emergency_contact_phone: '081234567802',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  // Sample Health Screenings
  const screenings: HealthScreening[] = [
    {
      id: 'scr1',
      personnel_id: '1',
      screening_date: now.toISOString().split('T')[0],
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
      heart_rate: 72,
      temperature: 36.5,
      bmi: 23.5,
      oxygen_saturation: 98,
      fitness_status: 'FIT',
      fitness_notes: 'Kondisi sehat, tidak ada keluhan',
      duty_recommendation: 'HEAVY',
      screener_name: 'Dr. Siti Rahayu',
      created_at: now.toISOString(),
    },
    {
      id: 'scr2',
      personnel_id: '3',
      screening_date: now.toISOString().split('T')[0],
      blood_pressure_systolic: 140,
      blood_pressure_diastolic: 90,
      heart_rate: 80,
      temperature: 36.8,
      bmi: 25.5,
      oxygen_saturation: 97,
      fitness_status: 'FIT_WITH_NOTES',
      fitness_notes: 'Tekanan darah sedikit tinggi, perlu monitoring',
      duty_recommendation: 'MODERATE',
      screener_name: 'Dr. Siti Rahayu',
      created_at: now.toISOString(),
    },
    {
      id: 'scr3',
      personnel_id: '5',
      screening_date: now.toISOString().split('T')[0],
      blood_pressure_systolic: 115,
      blood_pressure_diastolic: 75,
      heart_rate: 68,
      temperature: 36.6,
      bmi: 22.0,
      oxygen_saturation: 99,
      fitness_status: 'FIT',
      fitness_notes: 'Kondisi prima',
      duty_recommendation: 'HEAVY',
      screener_name: 'Dr. Siti Rahayu',
      created_at: now.toISOString(),
    },
  ];

  // Sample Health Clearances with QR codes
  const clearances: HealthClearance[] = [];
  for (let i = 0; i < 3; i++) {
    const personnelId = personnel[i].id;
    const clearanceId = `clr${i + 1}`;
    const qrData = JSON.stringify({
      clearance_id: clearanceId,
      personnel_id: personnelId,
      valid_until: sevenDaysFromNow.toISOString(),
    });
    const qrCode = await generateQRCode(qrData);

    clearances.push({
      id: clearanceId,
      personnel_id: personnelId,
      screening_id: `scr${i + 1}`,
      qr_code: qrCode,
      clearance_status: 'VALID',
      valid_from: now.toISOString(),
      valid_until: sevenDaysFromNow.toISOString(),
      issued_at: now.toISOString(),
    });
  }

  // Sample Medical Posts
  const medicalPosts: MedicalPost[] = [
    {
      id: 'mp1',
      name: 'Pos Kesehatan Utama',
      type: 'UTAMA',
      location: 'Lapangan Upacara Utama',
      coordinates: '-6.2088, 106.8456',
      staff_count: 8,
      equipment_list: 'Ambulans, Defibrilator, Oxygen Tank, Medical Kit Lengkap',
      status: 'ACTIVE',
      created_at: now.toISOString(),
    },
    {
      id: 'mp2',
      name: 'Pos Kesehatan Satelit A',
      type: 'SATELIT',
      location: 'Gate A - Pintu Masuk Utara',
      coordinates: '-6.2090, 106.8460',
      staff_count: 4,
      equipment_list: 'Thermometer, Oximeter, P3K, Tandu',
      status: 'ACTIVE',
      created_at: now.toISOString(),
    },
    {
      id: 'mp3',
      name: 'Pos Kesehatan Satelit B',
      type: 'SATELIT',
      location: 'Gate B - Pintu Masuk Selatan',
      coordinates: '-6.2086, 106.8450',
      staff_count: 4,
      equipment_list: 'Thermometer, Oximeter, P3K, Tandu',
      status: 'ACTIVE',
      created_at: now.toISOString(),
    },
    {
      id: 'mp4',
      name: 'Unit Mobile Medis 1',
      type: 'MOBILE',
      location: 'Patrol Area',
      coordinates: 'Mobile',
      staff_count: 3,
      equipment_list: 'Tas P3K, Oximeter, Tandu Portable',
      status: 'STANDBY',
      created_at: now.toISOString(),
    },
  ];

  // Save all sample data
  setStorageData(STORAGE_KEYS.PERSONNEL, personnel);
  setStorageData(STORAGE_KEYS.HEALTH_PROFILES, healthProfiles);
  setStorageData(STORAGE_KEYS.HEALTH_SCREENINGS, screenings);
  setStorageData(STORAGE_KEYS.HEALTH_CLEARANCES, clearances);
  setStorageData(STORAGE_KEYS.MEDICAL_POSTS, medicalPosts);
  setStorageData(STORAGE_KEYS.ENTRY_CHECKS, []);
  setStorageData(STORAGE_KEYS.INCIDENTS, []);
  setStorageData(STORAGE_KEYS.MEDICAL_INVENTORY, []);
  setStorageData(STORAGE_KEYS.EVENT_LOGS, []);

  console.log('Sample data initialized successfully!');
}

export function clearAllData() {
  localStorage.clear();
  console.log('All data cleared!');
}
