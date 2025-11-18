import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/schema';
import { EntryCheck } from '../types';

export const createEntryCheck = (req: Request, res: Response) => {
  try {
    const {
      personnel_id,
      clearance_id,
      checkpoint_location,
      temperature,
      symptoms,
      triage_category,
      decision,
      notes,
      checker_name
    } = req.body;

    if (!personnel_id || !checkpoint_location || !triage_category || !decision || !checker_name) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const personnel = db.prepare('SELECT * FROM personnel WHERE id = ?').get(personnel_id);
    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found' });
    }

    const id = uuidv4();
    const check_time = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO entry_checks (
        id, personnel_id, clearance_id, checkpoint_location, check_time,
        temperature, symptoms, triage_category, decision, notes, checker_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      personnel_id,
      clearance_id,
      checkpoint_location,
      check_time,
      temperature,
      symptoms,
      triage_category,
      decision,
      notes,
      checker_name
    );

    const entryCheck = db.prepare(`
      SELECT e.*, p.name, p.rank, p.category
      FROM entry_checks e
      JOIN personnel p ON e.personnel_id = p.id
      WHERE e.id = ?
    `).get(id);

    res.status(201).json(entryCheck);
  } catch (error) {
    console.error('Error creating entry check:', error);
    res.status(500).json({ error: 'Failed to create entry check' });
  }
};

export const getEntryChecks = (req: Request, res: Response) => {
  try {
    const { checkpoint, decision, date } = req.query;

    let query = `
      SELECT e.*, p.name, p.rank, p.category
      FROM entry_checks e
      JOIN personnel p ON e.personnel_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (checkpoint) {
      query += ' AND e.checkpoint_location = ?';
      params.push(checkpoint);
    }

    if (decision) {
      query += ' AND e.decision = ?';
      params.push(decision);
    }

    if (date) {
      query += ' AND DATE(e.check_time) = DATE(?)';
      params.push(date);
    }

    query += ' ORDER BY e.check_time DESC';

    const checks = db.prepare(query).all(...params);
    res.json(checks);
  } catch (error) {
    console.error('Error fetching entry checks:', error);
    res.status(500).json({ error: 'Failed to fetch entry checks' });
  }
};

export const getEntryCheckById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entryCheck = db.prepare(`
      SELECT e.*, p.name, p.rank, p.unit, p.category, p.phone
      FROM entry_checks e
      JOIN personnel p ON e.personnel_id = p.id
      WHERE e.id = ?
    `).get(id);

    if (!entryCheck) {
      return res.status(404).json({ error: 'Entry check not found' });
    }

    res.json(entryCheck);
  } catch (error) {
    console.error('Error fetching entry check:', error);
    res.status(500).json({ error: 'Failed to fetch entry check' });
  }
};

export const getEntryStats = (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM entry_checks 
      WHERE DATE(check_time) = DATE(?)
    `).get(targetDate) as any;

    const approved = db.prepare(`
      SELECT COUNT(*) as count FROM entry_checks 
      WHERE DATE(check_time) = DATE(?) AND decision = 'APPROVED'
    `).get(targetDate) as any;

    const rejected = db.prepare(`
      SELECT COUNT(*) as count FROM entry_checks 
      WHERE DATE(check_time) = DATE(?) AND decision = 'REJECTED'
    `).get(targetDate) as any;

    const observation = db.prepare(`
      SELECT COUNT(*) as count FROM entry_checks 
      WHERE DATE(check_time) = DATE(?) AND decision = 'OBSERVATION'
    `).get(targetDate) as any;

    const byCheckpoint = db.prepare(`
      SELECT checkpoint_location, COUNT(*) as count
      FROM entry_checks
      WHERE DATE(check_time) = DATE(?)
      GROUP BY checkpoint_location
    `).all(targetDate);

    const byTriage = db.prepare(`
      SELECT triage_category, COUNT(*) as count
      FROM entry_checks
      WHERE DATE(check_time) = DATE(?)
      GROUP BY triage_category
    `).all(targetDate);

    res.json({
      date: targetDate,
      total: total.count,
      approved: approved.count,
      rejected: rejected.count,
      observation: observation.count,
      by_checkpoint: byCheckpoint,
      by_triage: byTriage
    });
  } catch (error) {
    console.error('Error fetching entry stats:', error);
    res.status(500).json({ error: 'Failed to fetch entry stats' });
  }
};
