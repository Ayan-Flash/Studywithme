import { dashboardDataService } from '../dashboard/dashboardDataService';
import { dashboardAggregator, DashboardMetrics } from '../dashboard/dashboardAggregator';

export class DashboardController {
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    const profiles = await dashboardDataService.getAllStudentProfiles();
    const logs = dashboardDataService.getSystemLogs();
    
    return dashboardAggregator.aggregate(profiles, logs);
  }
}

export const dashboardController = new DashboardController();
