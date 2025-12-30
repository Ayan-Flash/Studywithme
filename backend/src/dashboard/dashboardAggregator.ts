import { StudentProfile, LogEntry, DepthLevel } from '../types/index';

export interface DashboardMetrics {
  teacher: {
    totalStudents: number;
    avgMastery: number;
    topicsAtRisk: { topic: string; avgScore: number }[];
    activeStudentsLast7Days: number;
  };
  institution: {
    totalInteractions: number;
    avgDepthAlignment: number;
    avgClarity: number;
    ethicsFlagCount: number;
    depthDistribution: Record<DepthLevel, number>;
  };
}

export class DashboardAggregator {

  public aggregate(profiles: StudentProfile[], logs: LogEntry[]): DashboardMetrics {
    return {
      teacher: this.calculateTeacherMetrics(profiles),
      institution: this.calculateInstitutionMetrics(logs)
    };
  }

  private calculateTeacherMetrics(profiles: StudentProfile[]) {
    if (profiles.length === 0) {
      return { totalStudents: 0, avgMastery: 0, topicsAtRisk: [], activeStudentsLast7Days: 0 };
    }

    let totalMastery = 0;
    let topicScores: Record<string, { total: number; count: number }> = {};

    profiles.forEach(p => {
      Object.values(p.topics).forEach(t => {
        totalMastery += t.masteryScore;
        
        if (!topicScores[t.topic]) topicScores[t.topic] = { total: 0, count: 0 };
        topicScores[t.topic].total += t.masteryScore;
        topicScores[t.topic].count += 1;
      });
    });

    const topicList = Object.keys(topicScores).map(topic => ({
      topic,
      avgScore: topicScores[topic].total / topicScores[topic].count
    }));

    const atRisk = topicList.filter(t => t.avgScore < 50).sort((a, b) => a.avgScore - b.avgScore);

    return {
      totalStudents: profiles.length,
      avgMastery: Math.round(totalMastery / (profiles.flatMap(p => Object.values(p.topics)).length || 1)),
      topicsAtRisk: atRisk,
      activeStudentsLast7Days: profiles.length
    };
  }

  private calculateInstitutionMetrics(logs: LogEntry[]) {
    const total = logs.length;
    if (total === 0) {
      return { 
        totalInteractions: 0, 
        avgDepthAlignment: 0, 
        avgClarity: 0, 
        ethicsFlagCount: 0, 
        depthDistribution: { [DepthLevel.Core]: 0, [DepthLevel.Applied]: 0, [DepthLevel.Mastery]: 0 } 
      };
    }

    const depthDist = { [DepthLevel.Core]: 0, [DepthLevel.Applied]: 0, [DepthLevel.Mastery]: 0 };
    let totalAlignment = 0;
    let totalClarity = 0;
    let flags = 0;

    logs.forEach(l => {
      depthDist[l.depth] = (depthDist[l.depth] || 0) + 1;
      totalAlignment += l.depthAlignmentScore;
      totalClarity += l.clarityScore;
      if (l.ethicsFlag) flags++;
    });

    return {
      totalInteractions: total,
      avgDepthAlignment: parseFloat((totalAlignment / total).toFixed(2)),
      avgClarity: parseFloat((totalClarity / total).toFixed(2)),
      ethicsFlagCount: flags,
      depthDistribution: depthDist
    };
  }
}

export const dashboardAggregator = new DashboardAggregator();
