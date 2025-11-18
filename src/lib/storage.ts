// LocalStorage wrapper for data persistence
const STORAGE_KEYS = {
  PERSONNEL: 'mbg_personnel',
  HEALTH_PROFILES: 'mbg_health_profiles',
  HEALTH_SCREENINGS: 'mbg_health_screenings',
  HEALTH_CLEARANCES: 'mbg_health_clearances',
  ENTRY_CHECKS: 'mbg_entry_checks',
  INCIDENTS: 'mbg_incidents',
  MEDICAL_POSTS: 'mbg_medical_posts',
  MEDICAL_INVENTORY: 'mbg_medical_inventory',
  EVENT_LOGS: 'mbg_event_logs',
} as const;

export function getStorageData<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
}

export function setStorageData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

export function addStorageItem<T extends { id: string }>(key: string, item: T): T {
  const data = getStorageData<T>(key);
  data.push(item);
  setStorageData(key, data);
  return item;
}

export function updateStorageItem<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): T | null {
  const data = getStorageData<T>(key);
  const index = data.findIndex((item) => item.id === id);
  
  if (index === -1) return null;
  
  data[index] = { ...data[index], ...updates };
  setStorageData(key, data);
  return data[index];
}

export function deleteStorageItem(key: string, id: string): boolean {
  const data = getStorageData(key);
  const filtered = data.filter((item: any) => item.id !== id);
  
  if (filtered.length === data.length) return false;
  
  setStorageData(key, filtered);
  return true;
}

export function findStorageItem<T extends { id: string }>(
  key: string,
  id: string
): T | null {
  const data = getStorageData<T>(key);
  return data.find((item) => item.id === id) || null;
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

export { STORAGE_KEYS };
