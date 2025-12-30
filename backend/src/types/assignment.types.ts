import { DepthLevel } from './depth.types';

export interface AssignmentStructure {
  title: string;
  objective: string;
  difficulty: DepthLevel;
  questions: string[];
  hints: string[];
}

export interface AssignmentFeedback {
  conceptualScore: number;
  feedback: string;
  misconceptions: string[];
  nextSteps: string;
}
