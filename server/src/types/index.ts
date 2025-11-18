export type PersonnelCategory = 'VIP' | 'PASUKAN' | 'PANITIA' | 'VENDOR' | 'MEDIA' | 'TAMU';

export type FitnessStatus = 'FIT' | 'FIT_WITH_NOTES' | 'NOT_FIT';

export type DutyRecommendation = 'HEAVY' | 'MODERATE' | 'LIGHT' | 'NO_DUTY';

export type TriageCategory = 'HIJAU' | 'KUNING' | 'MERAH';

export type EntryDecision = 'APPROVED' | 'OBSERVATION' | 'REJECTED';

export type IncidentType = 
  | 'PINGSAN' 
  | 'CEDERA' 
  | 'KELELAHAN' 
  | 'DEHIDRASI' 
  | 'SESAK_NAPAS' 
  | 'NYERI_DADA' 
  | 'SERANGAN_JANTUNG'
  | 'DEMAM'
  | 'LAIN_LAIN';

export type IncidentSeverity = 'RINGAN' | 'SEDANG' | 'BERAT';

export type IncidentOutcome = 
  | 'KEMBALI_TUGAS' 
  | 'ISTIRAHAT' 
  | 'OBSERVASI' 
  | 'RUJUK_RS' 
  | 'EVAKUASI';

export type PostType = 'UTAMA' | 'SATELIT' | 'MOBILE';

export type PostStatus = 'ACTIVE' | 'INACTIVE' | 'STANDBY';

export type InventoryCategory = 
  | 'OBAT_EMERGENSI'
  | 'CAIRAN_INFUS'
  | 'APD'
  | 'ALAT_MEDIS'
  | 'CONSUMABLE';

export interface Personnel {
  id: string;
  name: string;
  rank?: string;
  unit?: string;
  category: PersonnelCategory;
  phone?: string;
  email?: string;
  created_at: string;
}

export interface HealthProfile {
  id: string;
  personnel_id: string;
  medical_history?: string;
  current_medications?: string;
  allergies?: string;
  hospitalization_history?: string;
  chronic_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthScreening {
  id: string;
  personnel_id: string;
  screening_date: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  bmi?: number;
  oxygen_saturation?: number;
  fitness_status: FitnessStatus;
  fitness_notes?: string;
  duty_recommendation?: DutyRecommendation;
  screener_name: string;
  created_at: string;
}

export interface HealthClearance {
  id: string;
  personnel_id: string;
  screening_id: string;
  qr_code: string;
  clearance_status: 'VALID' | 'EXPIRED' | 'REVOKED';
  valid_from: string;
  valid_until: string;
  issued_at: string;
}

export interface EntryCheck {
  id: string;
  personnel_id: string;
  clearance_id?: string;
  checkpoint_location: string;
  check_time: string;
  temperature?: number;
  symptoms?: string;
  triage_category: TriageCategory;
  decision: EntryDecision;
  notes?: string;
  checker_name: string;
}

export interface Incident {
  id: string;
  personnel_id: string;
  incident_time: string;
  location: string;
  incident_type: IncidentType;
  symptoms: string;
  severity: IncidentSeverity;
  vital_signs?: string;
  actions_taken: string;
  outcome: IncidentOutcome;
  referred_to?: string;
  responder_name: string;
  notes?: string;
}

export interface MedicalPost {
  id: string;
  name: string;
  type: PostType;
  location: string;
  coordinates?: string;
  staff_count: number;
  equipment_list?: string;
  status: PostStatus;
  created_at: string;
}

export interface MedicalInventory {
  id: string;
  post_id: string;
  item_name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minimum_stock: number;
  last_updated: string;
}

export interface EventLog {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  description: string;
  user_name?: string;
  timestamp: string;
}

export interface DashboardStats {
  total_personnel: number;
  screened_personnel: number;
  active_clearances: number;
  entry_approved: number;
  entry_rejected: number;
  incidents_total: number;
  incidents_severe: number;
  active_posts: number;
}

export interface IncidentsByHour {
  hour: string;
  count: number;
}

export interface IncidentsByType {
  type: string;
  count: number;
}

export interface IncidentsBySeverity {
  severity: string;
  count: number;
}
