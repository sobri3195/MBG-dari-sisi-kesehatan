// API wrapper using local data service
import {
  personnelApi,
  healthProfileApi,
  healthScreeningApi,
  healthClearanceApi,
  entryCheckApi,
  incidentApi,
  medicalPostApi,
  medicalInventoryApi,
  dashboardApi,
  eventLogApi,
} from './dataService';

// Re-export all API methods
export const api = {
  personnel: personnelApi,
  healthProfile: healthProfileApi,
  healthScreening: healthScreeningApi,
  healthClearance: healthClearanceApi,
  entryCheck: entryCheckApi,
  incident: incidentApi,
  medicalPost: medicalPostApi,
  medicalInventory: medicalInventoryApi,
  dashboard: dashboardApi,
  eventLog: eventLogApi,
};

export default api;
