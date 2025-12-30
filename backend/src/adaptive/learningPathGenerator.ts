import { DepthLevel } from '../types/index';

export class LearningPathGenerator {
  public generatePath(studentId: string, currentDepth: DepthLevel) { 
      return {
          studentId,
          recommendedDepth: currentDepth,
          nextTopics: []
      }; 
  }
}
export const learningPathGenerator = new LearningPathGenerator();
