import { dashboardController } from '../controllers/dashboard.controller';

export const DashboardRoutes = {
  getMetrics: async () => {
    console.log(`[API] GET /api/dashboard/metrics`);
    try {
      const data = await dashboardController.getDashboardMetrics();
      return { success: true, data };
    } catch (e) {
      console.error("[API Error]", e);
      return { success: false, error: "Failed to fetch dashboard metrics" };
    }
  }
};
