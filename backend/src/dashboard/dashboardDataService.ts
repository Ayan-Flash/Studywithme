import { progressStore } from '../progress/progressStore';
import { logger } from '../utils/logger';
import { StudentProfile, LogEntry } from '../types/index';

export class DashboardDataService {
  public async getAllStudentProfiles(): Promise<StudentProfile[]> {
    const demoProfile = await progressStore.getProfile('student-123');
    return demoProfile ? [demoProfile] : [];
  }

  public getSystemLogs(): LogEntry[] {
    return logger.getLogs();
  }
}

export const dashboardDataService = new DashboardDataService();
