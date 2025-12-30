import { ChatRoutes, AssignmentRoutes, ProgressRoutes, DashboardRoutes } from '../services/api.ts';

export const apiClient = {
    chat: ChatRoutes,
    assignment: AssignmentRoutes,
    progress: ProgressRoutes,
    dashboard: DashboardRoutes
};