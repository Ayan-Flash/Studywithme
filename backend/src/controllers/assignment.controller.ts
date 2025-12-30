import { assignmentGenerator } from '../assignments/assignmentGenerator';
import { assignmentEvaluator } from '../assignments/assignmentEvaluator';
import { DepthLevel, AssignmentStructure } from '../types/index';

export class AssignmentController {
  
  public initialize(apiKey: string) {
    assignmentGenerator.updateKey(apiKey);
    assignmentEvaluator.updateKey(apiKey);
  }

  public async generate(topic: string, depth: DepthLevel) {
    const result = await assignmentGenerator.generate(topic, depth);
    if (!result) throw new Error("Failed to generate assignment");
    return result;
  }

  public async evaluate(assignment: AssignmentStructure, studentAnswer: string) {
    const result = await assignmentEvaluator.evaluate(assignment, studentAnswer);
    if (!result) throw new Error("Failed to evaluate assignment");
    return result;
  }
}

export const assignmentController = new AssignmentController();
