import { progressTracker } from '../progress/progressTracker';
import { insightGenerator } from '../progress/insightGenerator';
import { depthAdjustmentEngine } from '../adaptive/depthAdjustmentEngine';
import { progressStore } from '../progress/progressStore';
import { LearningEvent } from '../types/index';

export class ProgressController {

  public async trackProgress(event: LearningEvent) {
    if (!event.studentId || !event.topic) {
      throw new Error("Invalid event data");
    }

    const updatedMetrics = await progressTracker.processEvent(event);

    const signal = depthAdjustmentEngine.getSignalForTopic(updatedMetrics);

    return { success: true, updatedMetrics, adaptiveSignal: signal };
  }

  public async getProgressSummary(studentId: string) {
    const profile = await progressStore.getProfile(studentId);
    if (!profile) return null;

    const insights = insightGenerator.generateInsights(profile);

    return {
      profile,
      insights
    };
  }
}

export const progressController = new ProgressController();
