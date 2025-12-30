import { DepthLevel } from './depth.types.ts';

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