import { assignmentController } from '../controllers/assignment.controller';
import { DepthLevel, AssignmentStructure } from '../types/index';

export const AssignmentRoutes = {
  
  initialize: (apiKey: string) => {
    assignmentController.initialize(apiKey);
  },

  generate: async (topic: string, depth: DepthLevel) => {
    try {
      const data = await assignmentController.generate(topic, depth);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: "Generation failed" };
    }
  },

  evaluate: async (assignment: AssignmentStructure, answer: string) => {
    try {
      const data = await assignmentController.evaluate(assignment, answer);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: "Evaluation failed" };
    }
  }
};
