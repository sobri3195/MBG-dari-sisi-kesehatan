import { Request, Response } from 'express';
import { db } from '../database/schema';
import { DashboardStats } from '../types';

export const getDashboardStats = (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const totalPersonnel = db.prepare('SELECT COUNT(*) as count FROM personnel').get() as any;

    const screenedPersonnel = db.prepare(`
      SELECT COUNT(DISTINCT personnel_id) as count FROM health_screenings
    `).get() as any;

    const activeClearances = db.prepare(`
      SELECT COUNT(*) as count FROM health_clearances 
      WHERE clearance_status = 'VALID' AND DATE(valid_until) >= DATE('now')
    `).get() as any;

    const entryApproved = db.prepare(`
      SELECT COUNT(*) as count FROM entry_checks 
      WHERE DATE(check_time) = DATE(?) AND decision = 'APPROVED'
    `).get(targetDate) as any;

    const entryRejected = db.prepare(`
      SELECT COUNT(*) as count FROM entry_checks 
      WHERE DATE(check_time) = DATE(?) AND decision = 'REJECTED'
    `).get(targetDate) as any;

    const incidentsTotal = db.prepare(`
      SELECT COUNT(*) as count FROM incidents 
      WHERE DATE(incident_time) = DATE(?)
    `).get(targetDate) as any;

    const incidentsSevere = db.prepare(`
      SELECT COUNT(*) as count FROM incidents 
      WHERE DATE(incident_time) = DATE(?) AND severity = 'BERAT'
    `).get(targetDate) as any;

    const activePosts = db.prepare(`
      SELECT COUNT(*) as count FROM medical_posts WHERE status = 'ACTIVE'
    `).get() as any;

    const recentIncidents = db.prepare(`
      SELECT i.*, p.name, p.rank, p.category
      FROM incidents i
      JOIN personnel p ON i.personnel_id = p.id
      WHERE DATE(i.incident_time) = DATE(?)
      ORDER BY i.incident_time DESC
      LIMIT 10
    `).all(targetDate);

    const recentEntryChecks = db.prepare(`
      SELECT e.*, p.name, p.category
      FROM entry_checks e
      JOIN personnel p ON e.personnel_id = p.id
      WHERE DATE(e.check_time) = DATE(?)
      ORDER BY e.check_time DESC
      LIMIT 10
    `).all(targetDate);

    const personnelByCategory = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM personnel
      GROUP BY category
    `).all();

    const fitnessDistribution = db.prepare(`
      SELECT fitness_status, COUNT(*) as count
      FROM health_screenings
      GROUP BY fitness_status
    `).all();

    const stats: DashboardStats = {
      total_personnel: totalPersonnel.count,
      screened_personnel: screenedPersonnel.count,
      active_clearances: activeClearances.count,
      entry_approved: entryApproved.count,
      entry_rejected: entryRejected.count,
      incidents_total: incidentsTotal.count,
      incidents_severe: incidentsSevere.count,
      active_posts: activePosts.count
    };

    res.json({
      stats,
      date: targetDate,
      recent_incidents: recentIncidents,
      recent_entry_checks: recentEntryChecks,
      personnel_by_category: personnelByCategory,
      fitness_distribution: fitnessDistribution
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getRealtimeStatus = (req: Request, res: Response) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    const recentEntries = db.prepare(`
      SELECT COUNT(*) as count FROM entry_checks 
      WHERE check_time >= ?
    `).get(oneHourAgo) as any;

    const recentIncidents = db.prepare(`
      SELECT COUNT(*) as count FROM incidents 
      WHERE incident_time >= ?
    `).get(oneHourAgo) as any;

    const activeIncidents = db.prepare(`
      SELECT i.*, p.name, p.category
      FROM incidents i
      JOIN personnel p ON i.personnel_id = p.id
      WHERE i.outcome IN ('OBSERVASI', 'RUJUK_RS') 
        AND DATE(i.incident_time) = DATE('now')
      ORDER BY i.incident_time DESC
    `).all();

    const criticalPersonnel = db.prepare(`
      SELECT p.*, hp.chronic_conditions, hp.medical_history
      FROM personnel p
      JOIN health_profiles hp ON p.id = hp.personnel_id
      WHERE p.category IN ('VIP', 'PASUKAN')
        AND (hp.chronic_conditions IS NOT NULL OR hp.medical_history LIKE '%jantung%' OR hp.medical_history LIKE '%hipertensi%')
    `).all();

    res.json({
      timestamp: now.toISOString(),
      entries_last_hour: recentEntries.count,
      incidents_last_hour: recentIncidents.count,
      active_incidents: activeIncidents,
      critical_personnel_count: criticalPersonnel.length,
      critical_personnel: criticalPersonnel.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching realtime status:', error);
    res.status(500).json({ error: 'Failed to fetch realtime status' });
  }
};
