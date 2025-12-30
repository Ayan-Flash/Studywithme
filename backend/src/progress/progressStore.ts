import { StudentProfile, TopicMetrics, DepthLevel } from '../types/index';

class ProgressStore {
  private store: Map<string, StudentProfile> = new Map();

  constructor() {
    this.initDemoStudent('student-123');
  }

  private initDemoStudent(studentId: string) {
    if (!this.store.has(studentId)) {
      this.store.set(studentId, {
        studentId,
        topics: {},
        overallStats: {
          totalSessions: 0,
          highestDepthReached: DepthLevel.Core,
          averageReasoningScore: 0
        }
      });
    }
  }

  public async getProfile(studentId: string): Promise<StudentProfile | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.store.get(studentId) || null;
  }

  public async updateProfile(studentId: string, updates: Partial<StudentProfile>): Promise<void> {
    const profile = this.store.get(studentId);
    if (profile) {
      this.store.set(studentId, { ...profile, ...updates });
    } else {
      this.store.set(studentId, {
        studentId,
        topics: {},
        overallStats: {
          totalSessions: 0,
          highestDepthReached: DepthLevel.Core,
          averageReasoningScore: 0
        },
        ...updates
      });
    }
  }

  public async saveTopicMetrics(studentId: string, topic: string, metrics: TopicMetrics): Promise<void> {
    const profile = await this.getProfile(studentId);
    if (profile) {
      profile.topics[topic] = metrics;
      this.store.set(studentId, profile);
    }
  }
}

export const progressStore = new ProgressStore();
