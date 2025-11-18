import QRCode from 'qrcode';
import {
  Personnel,
  HealthProfile,
  HealthScreening,
  HealthClearance,
  EntryCheck,
  Incident,
  MedicalPost,
  MedicalInventory,
  EventLog,
  DashboardStats,
} from '../types';
import {
  STORAGE_KEYS,
  getStorageData,
  addStorageItem,
  updateStorageItem,
  deleteStorageItem,
  findStorageItem,
} from './storage';

// Helper function to generate IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to generate QR code
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

// Personnel API
export const personnelApi = {
  getAll: async (): Promise<Personnel[]> => {
    return getStorageData<Personnel>(STORAGE_KEYS.PERSONNEL);
  },

  getById: async (id: string): Promise<Personnel | null> => {
    return findStorageItem<Personnel>(STORAGE_KEYS.PERSONNEL, id);
  },

  create: async (data: Omit<Personnel, 'id' | 'created_at'>): Promise<Personnel> => {
    const personnel: Personnel = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    return addStorageItem(STORAGE_KEYS.PERSONNEL, personnel);
  },

  update: async (id: string, data: Partial<Personnel>): Promise<Personnel | null> => {
    return updateStorageItem(STORAGE_KEYS.PERSONNEL, id, data);
  },

  delete: async (id: string): Promise<boolean> => {
    return deleteStorageItem(STORAGE_KEYS.PERSONNEL, id);
  },
};

// Health Profile API
export const healthProfileApi = {
  getByPersonnelId: async (personnelId: string): Promise<HealthProfile | null> => {
    const profiles = getStorageData<HealthProfile>(STORAGE_KEYS.HEALTH_PROFILES);
    return profiles.find((p) => p.personnel_id === personnelId) || null;
  },

  create: async (data: Omit<HealthProfile, 'id' | 'created_at' | 'updated_at'>): Promise<HealthProfile> => {
    const profile: HealthProfile = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return addStorageItem(STORAGE_KEYS.HEALTH_PROFILES, profile);
  },

  update: async (id: string, data: Partial<HealthProfile>): Promise<HealthProfile | null> => {
    return updateStorageItem(STORAGE_KEYS.HEALTH_PROFILES, id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
  },
};

// Health Screening API
export const healthScreeningApi = {
  getByPersonnelId: async (personnelId: string): Promise<HealthScreening[]> => {
    const screenings = getStorageData<HealthScreening>(STORAGE_KEYS.HEALTH_SCREENINGS);
    return screenings.filter((s) => s.personnel_id === personnelId);
  },

  create: async (data: Omit<HealthScreening, 'id' | 'created_at'>): Promise<HealthScreening> => {
    const screening: HealthScreening = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    return addStorageItem(STORAGE_KEYS.HEALTH_SCREENINGS, screening);
  },
};

// Health Clearance API
export const healthClearanceApi = {
  getByPersonnelId: async (personnelId: string): Promise<HealthClearance | null> => {
    const clearances = getStorageData<HealthClearance>(STORAGE_KEYS.HEALTH_CLEARANCES);
    return clearances.find((c) => c.personnel_id === personnelId && c.clearance_status === 'VALID') || null;
  },

  create: async (
    data: Omit<HealthClearance, 'id' | 'qr_code' | 'issued_at'>
  ): Promise<HealthClearance> => {
    const qrData = JSON.stringify({
      clearance_id: generateId(),
      personnel_id: data.personnel_id,
      valid_until: data.valid_until,
    });
    
    const qr_code = await generateQRCode(qrData);
    
    const clearance: HealthClearance = {
      ...data,
      id: generateId(),
      qr_code,
      issued_at: new Date().toISOString(),
    };
    
    return addStorageItem(STORAGE_KEYS.HEALTH_CLEARANCES, clearance);
  },

  validateQR: async (qrData: string): Promise<HealthClearance | null> => {
    try {
      const parsed = JSON.parse(qrData);
      const clearance = findStorageItem<HealthClearance>(
        STORAGE_KEYS.HEALTH_CLEARANCES,
        parsed.clearance_id
      );
      
      if (!clearance) return null;
      
      const now = new Date();
      const validUntil = new Date(clearance.valid_until);
      
      if (now > validUntil) {
        await updateStorageItem<HealthClearance>(STORAGE_KEYS.HEALTH_CLEARANCES, clearance.id, {
          clearance_status: 'EXPIRED',
        });
        return null;
      }
      
      return clearance;
    } catch (error) {
      return null;
    }
  },
};

// Entry Check API
export const entryCheckApi = {
  getAll: async (): Promise<EntryCheck[]> => {
    return getStorageData<EntryCheck>(STORAGE_KEYS.ENTRY_CHECKS);
  },

  create: async (data: Omit<EntryCheck, 'id'>): Promise<EntryCheck> => {
    const entryCheck: EntryCheck = {
      ...data,
      id: generateId(),
    };
    return addStorageItem(STORAGE_KEYS.ENTRY_CHECKS, entryCheck);
  },
};

// Incident API
export const incidentApi = {
  getAll: async (): Promise<Incident[]> => {
    return getStorageData<Incident>(STORAGE_KEYS.INCIDENTS);
  },

  getById: async (id: string): Promise<Incident | null> => {
    return findStorageItem<Incident>(STORAGE_KEYS.INCIDENTS, id);
  },

  create: async (data: Omit<Incident, 'id'>): Promise<Incident> => {
    const incident: Incident = {
      ...data,
      id: generateId(),
    };
    return addStorageItem(STORAGE_KEYS.INCIDENTS, incident);
  },

  update: async (id: string, data: Partial<Incident>): Promise<Incident | null> => {
    return updateStorageItem(STORAGE_KEYS.INCIDENTS, id, data);
  },
};

// Medical Post API
export const medicalPostApi = {
  getAll: async (): Promise<MedicalPost[]> => {
    return getStorageData<MedicalPost>(STORAGE_KEYS.MEDICAL_POSTS);
  },

  create: async (data: Omit<MedicalPost, 'id' | 'created_at'>): Promise<MedicalPost> => {
    const post: MedicalPost = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    return addStorageItem(STORAGE_KEYS.MEDICAL_POSTS, post);
  },

  update: async (id: string, data: Partial<MedicalPost>): Promise<MedicalPost | null> => {
    return updateStorageItem(STORAGE_KEYS.MEDICAL_POSTS, id, data);
  },
};

// Medical Inventory API
export const medicalInventoryApi = {
  getByPostId: async (postId: string): Promise<MedicalInventory[]> => {
    const inventory = getStorageData<MedicalInventory>(STORAGE_KEYS.MEDICAL_INVENTORY);
    return inventory.filter((i) => i.post_id === postId);
  },

  create: async (data: Omit<MedicalInventory, 'id' | 'last_updated'>): Promise<MedicalInventory> => {
    const item: MedicalInventory = {
      ...data,
      id: generateId(),
      last_updated: new Date().toISOString(),
    };
    return addStorageItem(STORAGE_KEYS.MEDICAL_INVENTORY, item);
  },

  update: async (id: string, data: Partial<MedicalInventory>): Promise<MedicalInventory | null> => {
    return updateStorageItem(STORAGE_KEYS.MEDICAL_INVENTORY, id, {
      ...data,
      last_updated: new Date().toISOString(),
    });
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const personnel = getStorageData<Personnel>(STORAGE_KEYS.PERSONNEL);
    const screenings = getStorageData<HealthScreening>(STORAGE_KEYS.HEALTH_SCREENINGS);
    const clearances = getStorageData<HealthClearance>(STORAGE_KEYS.HEALTH_CLEARANCES);
    const entryChecks = getStorageData<EntryCheck>(STORAGE_KEYS.ENTRY_CHECKS);
    const incidents = getStorageData<Incident>(STORAGE_KEYS.INCIDENTS);
    const posts = getStorageData<MedicalPost>(STORAGE_KEYS.MEDICAL_POSTS);

    const screenedPersonnelIds = new Set(screenings.map((s) => s.personnel_id));
    const activeClearances = clearances.filter((c) => c.clearance_status === 'VALID');
    const approvedEntries = entryChecks.filter((e) => e.decision === 'APPROVED');
    const rejectedEntries = entryChecks.filter((e) => e.decision === 'REJECTED');
    const severeIncidents = incidents.filter((i) => i.severity === 'BERAT');
    const activePosts = posts.filter((p) => p.status === 'ACTIVE');

    return {
      total_personnel: personnel.length,
      screened_personnel: screenedPersonnelIds.size,
      active_clearances: activeClearances.length,
      entry_approved: approvedEntries.length,
      entry_rejected: rejectedEntries.length,
      incidents_total: incidents.length,
      incidents_severe: severeIncidents.length,
      active_posts: activePosts.length,
    };
  },

  getIncidentsByHour: async () => {
    const incidents = getStorageData<Incident>(STORAGE_KEYS.INCIDENTS);
    const hourCounts: Record<string, number> = {};

    incidents.forEach((incident) => {
      const hour = new Date(incident.incident_time).getHours();
      const hourKey = `${hour}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });

    return Object.entries(hourCounts).map(([hour, count]) => ({
      hour,
      count,
    }));
  },

  getIncidentsByType: async () => {
    const incidents = getStorageData<Incident>(STORAGE_KEYS.INCIDENTS);
    const typeCounts: Record<string, number> = {};

    incidents.forEach((incident) => {
      typeCounts[incident.incident_type] = (typeCounts[incident.incident_type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }));
  },

  getIncidentsBySeverity: async () => {
    const incidents = getStorageData<Incident>(STORAGE_KEYS.INCIDENTS);
    const severityCounts: Record<string, number> = {};

    incidents.forEach((incident) => {
      severityCounts[incident.severity] = (severityCounts[incident.severity] || 0) + 1;
    });

    return Object.entries(severityCounts).map(([severity, count]) => ({
      severity,
      count,
    }));
  },
};

// Event Log API (for audit trail)
export const eventLogApi = {
  log: async (
    eventType: string,
    entityType: string,
    entityId: string,
    description: string,
    userName?: string
  ): Promise<void> => {
    const log: EventLog = {
      id: generateId(),
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      description,
      user_name: userName,
      timestamp: new Date().toISOString(),
    };
    addStorageItem(STORAGE_KEYS.EVENT_LOGS, log);
  },
};
