import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/mbg-health.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS personnel (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rank TEXT,
      unit TEXT,
      category TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS health_profiles (
      id TEXT PRIMARY KEY,
      personnel_id TEXT NOT NULL,
      medical_history TEXT,
      current_medications TEXT,
      allergies TEXT,
      hospitalization_history TEXT,
      chronic_conditions TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personnel_id) REFERENCES personnel(id)
    );

    CREATE TABLE IF NOT EXISTS health_screenings (
      id TEXT PRIMARY KEY,
      personnel_id TEXT NOT NULL,
      screening_date TEXT NOT NULL,
      blood_pressure_systolic INTEGER,
      blood_pressure_diastolic INTEGER,
      heart_rate INTEGER,
      temperature REAL,
      bmi REAL,
      oxygen_saturation INTEGER,
      fitness_status TEXT NOT NULL,
      fitness_notes TEXT,
      duty_recommendation TEXT,
      screener_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personnel_id) REFERENCES personnel(id)
    );

    CREATE TABLE IF NOT EXISTS health_clearances (
      id TEXT PRIMARY KEY,
      personnel_id TEXT NOT NULL,
      screening_id TEXT NOT NULL,
      qr_code TEXT NOT NULL UNIQUE,
      clearance_status TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_until TEXT NOT NULL,
      issued_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personnel_id) REFERENCES personnel(id),
      FOREIGN KEY (screening_id) REFERENCES health_screenings(id)
    );

    CREATE TABLE IF NOT EXISTS entry_checks (
      id TEXT PRIMARY KEY,
      personnel_id TEXT NOT NULL,
      clearance_id TEXT,
      checkpoint_location TEXT NOT NULL,
      check_time TEXT DEFAULT CURRENT_TIMESTAMP,
      temperature REAL,
      symptoms TEXT,
      triage_category TEXT NOT NULL,
      decision TEXT NOT NULL,
      notes TEXT,
      checker_name TEXT NOT NULL,
      FOREIGN KEY (personnel_id) REFERENCES personnel(id),
      FOREIGN KEY (clearance_id) REFERENCES health_clearances(id)
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      personnel_id TEXT NOT NULL,
      incident_time TEXT DEFAULT CURRENT_TIMESTAMP,
      location TEXT NOT NULL,
      incident_type TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      severity TEXT NOT NULL,
      vital_signs TEXT,
      actions_taken TEXT NOT NULL,
      outcome TEXT NOT NULL,
      referred_to TEXT,
      responder_name TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (personnel_id) REFERENCES personnel(id)
    );

    CREATE TABLE IF NOT EXISTS medical_posts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      coordinates TEXT,
      staff_count INTEGER DEFAULT 0,
      equipment_list TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medical_inventory (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL,
      minimum_stock INTEGER DEFAULT 0,
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES medical_posts(id)
    );

    CREATE TABLE IF NOT EXISTS event_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      description TEXT NOT NULL,
      user_name TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_personnel_category ON personnel(category);
    CREATE INDEX IF NOT EXISTS idx_health_clearances_qr ON health_clearances(qr_code);
    CREATE INDEX IF NOT EXISTS idx_entry_checks_time ON entry_checks(check_time);
    CREATE INDEX IF NOT EXISTS idx_incidents_time ON incidents(incident_time);
    CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
  `);

  console.log('Database initialized successfully');
}

export function closeDatabase() {
  db.close();
}
