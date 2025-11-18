import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/schema';
import { Incident } from '../types';

export const createIncident = (req: Request, res: Response) => {
  try {
    const {
      personnel_id,
      location,
      incident_type,
      symptoms,
      severity,
      vital_signs,
      actions_taken,
      outcome,
      referred_to,
      responder_name,
      notes
    } = req.body;

    if (!personnel_id || !location || !incident_type || !symptoms || !severity || !actions_taken || !outcome || !responder_name) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const personnel = db.prepare('SELECT * FROM personnel WHERE id = ?').get(personnel_id);
    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    const id = uuidv4();
    const incident_time = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO incidents (
        id, personnel_id, incident_time, location, incident_type, symptoms,
        severity, vital_signs, actions_taken, outcome, referred_to,
        responder_name, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      personnel_id,
      incident_time,
      location,
      incident_type,
      symptoms,
      severity,
      vital_signs,
      actions_taken,
      outcome,
      referred_to,
      responder_name,
      notes
    );

    const incident = db.prepare(`
      SELECT i.*, p.name, p.rank, p.unit, p.category
      FROM incidents i
      JOIN personnel p ON i.personnel_id = p.id
      WHERE i.id = ?
    `).get(id);

    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
};

export const getIncidents = (req: Request, res: Response) => {
  try {
    const { severity, type, date, location } = req.query;

    let query = `
      SELECT i.*, p.name, p.rank, p.category
      FROM incidents i
      JOIN personnel p ON i.personnel_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (severity) {
      query += ' AND i.severity = ?';
      params.push(severity);
    }

    if (type) {
      query += ' AND i.incident_type = ?';
      params.push(type);
    }

    if (location) {
      query += ' AND i.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (date) {
      query += ' AND DATE(i.incident_time) = DATE(?)';
      params.push(date);
    }

    query += ' ORDER BY i.incident_time DESC';

    const incidents = db.prepare(query).all(...params);
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
};

export const getIncidentById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = db.prepare(`
      SELECT i.*, p.name, p.rank, p.unit, p.category, p.phone,
             hp.medical_history, hp.allergies, hp.emergency_contact_name, hp.emergency_contact_phone
      FROM incidents i
      JOIN personnel p ON i.personnel_id = p.id
      LEFT JOIN health_profiles hp ON p.id = hp.personnel_id
      WHERE i.id = ?
    `).get(id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
};

export const updateIncident = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      vital_signs,
      actions_taken,
      outcome,
      referred_to,
      notes
    } = req.body;

    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const update = db.prepare(`
      UPDATE incidents
      SET vital_signs = ?, actions_taken = ?, outcome = ?, referred_to = ?, notes = ?
      WHERE id = ?
    `);

    update.run(vital_signs, actions_taken, outcome, referred_to, notes, id);

    const updated = db.prepare(`
      SELECT i.*, p.name, p.rank, p.category
      FROM incidents i
      JOIN personnel p ON i.personnel_id = p.id
      WHERE i.id = ?
    `).get(id);

    res.json(updated);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
};

export const getIncidentStats = (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM incidents 
      WHERE DATE(incident_time) = DATE(?)
    `).get(targetDate) as any;

    const bySeverity = db.prepare(`
      SELECT severity, COUNT(*) as count
      FROM incidents
      WHERE DATE(incident_time) = DATE(?)
      GROUP BY severity
    `).all(targetDate);

    const byType = db.prepare(`
      SELECT incident_type, COUNT(*) as count
      FROM incidents
      WHERE DATE(incident_time) = DATE(?)
      GROUP BY incident_type
      ORDER BY count DESC
    `).all(targetDate);

    const byOutcome = db.prepare(`
      SELECT outcome, COUNT(*) as count
      FROM incidents
      WHERE DATE(incident_time) = DATE(?)
      GROUP BY outcome
    `).all(targetDate);

    const byHour = db.prepare(`
      SELECT strftime('%H:00', incident_time) as hour, COUNT(*) as count
      FROM incidents
      WHERE DATE(incident_time) = DATE(?)
      GROUP BY hour
      ORDER BY hour
    `).all(targetDate);

    const byLocation = db.prepare(`
      SELECT location, COUNT(*) as count
      FROM incidents
      WHERE DATE(incident_time) = DATE(?)
      GROUP BY location
      ORDER BY count DESC
      LIMIT 10
    `).all(targetDate);

    res.json({
      date: targetDate,
      total: total.count,
      by_severity: bySeverity,
      by_type: byType,
      by_outcome: byOutcome,
      by_hour: byHour,
      by_location: byLocation
    });
  } catch (error) {
    console.error('Error fetching incident stats:', error);
    res.status(500).json({ error: 'Failed to fetch incident stats' });
  }
};
