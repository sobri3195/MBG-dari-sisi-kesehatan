import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { db } from '../database/schema';
import { HealthScreening, HealthClearance } from '../types';

export const createScreening = async (req: Request, res: Response) => {
  try {
    const {
      personnel_id,
      screening_date,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      temperature,
      bmi,
      oxygen_saturation,
      fitness_status,
      fitness_notes,
      duty_recommendation,
      screener_name
    } = req.body;

    if (!personnel_id || !screening_date || !fitness_status || !screener_name) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const personnel = db.prepare('SELECT * FROM personnel WHERE id = ?').get(personnel_id);
    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    const screeningId = uuidv4();
    const created_at = new Date().toISOString();

    const insertScreening = db.prepare(`
      INSERT INTO health_screenings (
        id, personnel_id, screening_date, blood_pressure_systolic,
        blood_pressure_diastolic, heart_rate, temperature, bmi,
        oxygen_saturation, fitness_status, fitness_notes,
        duty_recommendation, screener_name, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertScreening.run(
      screeningId,
      personnel_id,
      screening_date,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      temperature,
      bmi,
      oxygen_saturation,
      fitness_status,
      fitness_notes,
      duty_recommendation,
      screener_name,
      created_at
    );

    if (fitness_status === 'FIT' || fitness_status === 'FIT_WITH_NOTES') {
      const clearanceId = uuidv4();
      const qrCodeData = `MBG-HC-${clearanceId}`;
      const qrCodeString = await QRCode.toDataURL(qrCodeData);

      const validFrom = new Date(screening_date);
      const validUntil = new Date(validFrom);
      validUntil.setDate(validUntil.getDate() + 7);

      const insertClearance = db.prepare(`
        INSERT INTO health_clearances (
          id, personnel_id, screening_id, qr_code, clearance_status,
          valid_from, valid_until, issued_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertClearance.run(
        clearanceId,
        personnel_id,
        screeningId,
        qrCodeString,
        'VALID',
        validFrom.toISOString(),
        validUntil.toISOString(),
        created_at
      );
    }

    const screening = db.prepare('SELECT * FROM health_screenings WHERE id = ?').get(screeningId);
    const clearance = db.prepare('SELECT * FROM health_clearances WHERE screening_id = ?').get(screeningId);

    res.status(201).json({ screening, clearance });
  } catch (error) {
    console.error('Error creating screening:', error);
    res.status(500).json({ error: 'Failed to create screening' });
  }
};

export const getScreeningsByPersonnel = (req: Request, res: Response) => {
  try {
    const { personnelId } = req.params;

    const screenings = db.prepare(`
      SELECT * FROM health_screenings 
      WHERE personnel_id = ? 
      ORDER BY screening_date DESC
    `).all(personnelId);

    res.json(screenings);
  } catch (error) {
    console.error('Error fetching screenings:', error);
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
};

export const getScreeningById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const screening = db.prepare('SELECT * FROM health_screenings WHERE id = ?').get(id);
    if (!screening) {
      return res.status(404).json({ error: 'Screening not found' });
    }

    const personnel = db.prepare('SELECT * FROM personnel WHERE id = ?').get(
      (screening as any).personnel_id
    );
    const clearance = db.prepare('SELECT * FROM health_clearances WHERE screening_id = ?').get(id);

    res.json({
      ...screening,
      personnel,
      clearance
    });
  } catch (error) {
    console.error('Error fetching screening:', error);
    res.status(500).json({ error: 'Failed to fetch screening' });
  }
};

export const getClearanceByQR = (req: Request, res: Response) => {
  try {
    const { qrCode } = req.params;

    const clearance: any = db.prepare(`
      SELECT c.*, p.name, p.rank, p.unit, p.category, s.fitness_status, s.duty_recommendation
      FROM health_clearances c
      JOIN personnel p ON c.personnel_id = p.id
      JOIN health_screenings s ON c.screening_id = s.id
      WHERE c.qr_code LIKE ?
    `).get(`%${qrCode}%`);

    if (!clearance) {
      return res.status(404).json({ error: 'Clearance not found' });
    }

    const now = new Date();
    const validUntil = new Date(clearance.valid_until);

    if (clearance.clearance_status === 'VALID' && now > validUntil) {
      db.prepare('UPDATE health_clearances SET clearance_status = ? WHERE id = ?')
        .run('EXPIRED', clearance.id);
      clearance.clearance_status = 'EXPIRED';
    }

    res.json(clearance);
  } catch (error) {
    console.error('Error fetching clearance:', error);
    res.status(500).json({ error: 'Failed to fetch clearance' });
  }
};

export const revokeClearance = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const clearance = db.prepare('SELECT * FROM health_clearances WHERE id = ?').get(id);
    if (!clearance) {
      return res.status(404).json({ error: 'Clearance not found' });
    }

    db.prepare('UPDATE health_clearances SET clearance_status = ? WHERE id = ?')
      .run('REVOKED', id);

    const updated = db.prepare('SELECT * FROM health_clearances WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error revoking clearance:', error);
    res.status(500).json({ error: 'Failed to revoke clearance' });
  }
};
