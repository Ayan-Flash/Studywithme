import { progressController } from '../controllers/progress.controller';
import { LearningEvent } from '../types/index';

export const ProgressRoutes = {

  updateProgress: async (event: LearningEvent) => {
    try {
      return await progressController.trackProgress(event);
    } catch (e) {
      console.error("[API Error]", e);
      return { success: false, error: "Failed to update progress" };
    }
  },

  getSummary: async (studentId: string) => {
    try {
      const data = await progressController.getProgressSummary(studentId);
      return { success: true, data };
    } catch (e) {
      console.error("[API Error]", e);
      return { success: false, error: "Failed to fetch summary" };
    }
  }
};
