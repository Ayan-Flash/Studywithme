import { LearningEvent, TopicMetrics, DepthLevel, StudentProfile } from '../types/index';
import { progressStore } from './progressStore';

export class ProgressTracker {
  
  public async processEvent(event: LearningEvent): Promise<TopicMetrics> {
    const profile = await progressStore.getProfile(event.studentId);
    if (!profile) throw new Error("Student not found");

    let metrics = profile.topics[event.topic] || this.initializeTopic(event.topic);

    metrics.lastInteraction = event.timestamp;
    metrics.lastDepth = event.depth;
    metrics.attempts += 1;
    metrics.masteryScore = this.calculateNewMastery(metrics, event);
    metrics.confidenceLevel = this.determineConfidence(metrics.masteryScore);

    if (event.mistakes && event.mistakes.length > 0) {
      const combined = [...metrics.commonMistakes, ...event.mistakes];
      metrics.commonMistakes = [...new Set(combined)].slice(0, 10);
    }

    await progressStore.saveTopicMetrics(event.studentId, event.topic, metrics);
    await this.updateGlobalStats(profile, event);

    return metrics;
  }

  private initializeTopic(topic: string): TopicMetrics {
    return {
      topic,
      masteryScore: 0,
      confidenceLevel: 'Low',
      attempts: 0,
      lastDepth: DepthLevel.Core,
      lastInteraction: new Date().toISOString(),
      commonMistakes: []
    };
  }

  private calculateNewMastery(current: TopicMetrics, event: LearningEvent): number {
    let scoreChange = 0;
    const depthWeight = this.getDepthWeight(event.depth);

    if (event.eventType === 'EXPLANATION') {
      scoreChange = 5 * depthWeight;
    } else if (event.eventType === 'ASSIGNMENT_COMPLETE' && event.score !== undefined) {
      const performanceFactor = (event.score - 50) / 10;
      scoreChange = performanceFactor * depthWeight * 2;
    }

    const daysSinceLast = (new Date().getTime() - new Date(current.lastInteraction).getTime()) / (1000 * 3600 * 24);
    if (daysSinceLast > 7) {
      scoreChange -= Math.min(daysSinceLast, 10);
    }

    return Math.max(0, Math.min(100, current.masteryScore + scoreChange));
  }

  private determineConfidence(score: number): 'Low' | 'Medium' | 'High' {
    if (score >= 80) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  }

  private getDepthWeight(depth: DepthLevel): number {
    switch (depth) {
      case DepthLevel.Core: return 1.0;
      case DepthLevel.Applied: return 1.5;
      case DepthLevel.Mastery: return 2.0;
      default: return 1.0;
    }
  }

  private async updateGlobalStats(profile: StudentProfile, event: LearningEvent) {
    const stats = profile.overallStats;
    stats.totalSessions += 1;
    
    const depthValue = { [DepthLevel.Core]: 1, [DepthLevel.Applied]: 2, [DepthLevel.Mastery]: 3 };
    if (depthValue[event.depth] > depthValue[stats.highestDepthReached]) {
      stats.highestDepthReached = event.depth;
    }

    if (event.score) {
      const n = stats.totalSessions;
      stats.averageReasoningScore = ((stats.averageReasoningScore * (n - 1)) + event.score) / n;
    }

    await progressStore.updateProfile(profile.studentId, { overallStats: stats });
  }
}

export const progressTracker = new ProgressTracker();
