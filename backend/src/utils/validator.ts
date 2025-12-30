import { DepthLevel, TaskMode } from '../types/index';

export const isValidDepth = (depth: any): boolean => {
  return Object.values(DepthLevel).includes(depth);
};

export const isValidMode = (mode: any): boolean => {
  return Object.values(TaskMode).includes(mode);
};

export const validateTopic = (topic: string): string | null => {
  if (!topic || topic.length < 2) return "Topic is too short.";
  if (topic.length > 50) return "Topic is too long.";
  return null;
};
