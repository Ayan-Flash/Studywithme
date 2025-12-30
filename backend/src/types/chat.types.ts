import { DepthLevel, TaskMode } from './depth.types';
import { AssignmentStructure, AssignmentFeedback } from './assignment.types';

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
