import { DepthLevel, TaskMode } from './depth.types.ts';
import { AssignmentStructure, AssignmentFeedback } from './assignment.types.ts';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  image?: {
    data: string; // Base64
    mimeType: string;
  };
  metadata?: {
    depth?: DepthLevel;
    mode?: TaskMode;
    isAssignment?: boolean;
    assignmentData?: AssignmentStructure;
    feedbackData?: AssignmentFeedback;
  };
}