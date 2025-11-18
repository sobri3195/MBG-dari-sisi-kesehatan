import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/schema';
import { Personnel, HealthProfile } from '../types';

export const createPersonnel = (req: Request, res: Response) => {
  try {
    const { name, rank, unit, category, phone, email, health_profile } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const id = uuidv4();
    const created_at = new Date().toISOString();

    const insertPersonnel = db.prepare(`
      INSERT INTO personnel (id, name, rank, unit, category, phone, email, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPersonnel.run(id, name, rank, unit, category, phone, email, created_at);

    if (health_profile) {
      const profileId = uuidv4();
      const insertProfile = db.prepare(`
        INSERT INTO health_profiles (
          id, personnel_id, medical_history, current_medications, allergies,
          hospitalization_history, chronic_conditions, emergency_contact_name,
          emergency_contact_phone, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertProfile.run(
        profileId,
        id,
        health_profile.medical_history,
        health_profile.current_medications,
        health_profile.allergies,
        health_profile.hospitalization_history,
        health_profile.chronic_conditions,
        health_profile.emergency_contact_name,
        health_profile.emergency_contact_phone,
        created_at,
        created_at
      );
    }

    const personnel = db.prepare('SELECT * FROM personnel WHERE id = ?').get(id);
    const profile = db.prepare('SELECT * FROM health_profiles WHERE personnel_id = ?').get(id);

    res.status(201).json({ personnel, health_profile: profile });
  } catch (error) {
    console.error('Error creating personnel:', error);
    res.status(500).json({ error: 'Failed to create personnel' });
  }
};

export const getAllPersonnel = (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM personnel WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR rank LIKE ? OR unit LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const personnel = db.prepare(query).all(...params);
    res.json(personnel);
  } catch (error) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({ error: 'Failed to fetch personnel' });
  }
};

export const getPersonnelById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const personnel = db.prepare('SELECT * FROM personnel WHERE id = ?').get(id);
    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    const profile = db.prepare('SELECT * FROM health_profiles WHERE personnel_id = ?').get(id);
    const screenings = db.prepare('SELECT * FROM health_screenings WHERE personnel_id = ? ORDER BY screening_date DESC').all(id);
    const clearances = db.prepare('SELECT * FROM health_clearances WHERE personnel_id = ? ORDER BY issued_at DESC').all(id);

    res.json({
      ...personnel,
      health_profile: profile,
      screenings,
      clearances
    });
  } catch (error) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({ error: 'Failed to fetch personnel' });
  }
};

export const updatePersonnel = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, rank, unit, category, phone, email } = req.body;

    const personnel = db.prepare('SELECT * FROM personnel WHERE id = ?').get(id);
    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    const update = db.prepare(`
      UPDATE personnel 
      SET name = ?, rank = ?, unit = ?, category = ?, phone = ?, email = ?
      WHERE id = ?
    `);

    update.run(name, rank, unit, category, phone, email, id);

    const updated = db.prepare('SELECT * FROM personnel WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating personnel:', error);
    res.status(500).json({ error: 'Failed to update personnel' });
  }
};

export const updateHealthProfile = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      medical_history,
      current_medications,
      allergies,
      hospitalization_history,
      chronic_conditions,
      emergency_contact_name,
      emergency_contact_phone
    } = req.body;

    const personnel = db.prepare('SELECT * FROM personnel WHERE id = ?').get(id);
    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    const existingProfile = db.prepare('SELECT * FROM health_profiles WHERE personnel_id = ?').get(id);
    const updated_at = new Date().toISOString();

    if (existingProfile) {
      const update = db.prepare(`
        UPDATE health_profiles
        SET medical_history = ?, current_medications = ?, allergies = ?,
            hospitalization_history = ?, chronic_conditions = ?,
            emergency_contact_name = ?, emergency_contact_phone = ?, updated_at = ?
        WHERE personnel_id = ?
      `);

      update.run(
        medical_history,
        current_medications,
        allergies,
        hospitalization_history,
        chronic_conditions,
        emergency_contact_name,
        emergency_contact_phone,
        updated_at,
        id
      );
    } else {
      const profileId = uuidv4();
      const insert = db.prepare(`
        INSERT INTO health_profiles (
          id, personnel_id, medical_history, current_medications, allergies,
          hospitalization_history, chronic_conditions, emergency_contact_name,
          emergency_contact_phone, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        profileId,
        id,
        medical_history,
        current_medications,
        allergies,
        hospitalization_history,
        chronic_conditions,
        emergency_contact_name,
        emergency_contact_phone,
        updated_at,
        updated_at
      );
    }

    const profile = db.prepare('SELECT * FROM health_profiles WHERE personnel_id = ?').get(id);
    res.json(profile);
  } catch (error) {
    console.error('Error updating health profile:', error);
    res.status(500).json({ error: 'Failed to update health profile' });
  }
};
