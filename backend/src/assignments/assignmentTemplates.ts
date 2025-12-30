import { DepthLevel } from '../types/index';

export const AssignmentTemplates = {
  [DepthLevel.Core]: {
    structure: "Concept Definition & Basic Identification",
    instruction: "Focus on 'What' and 'Why'. Ask the student to define the concept in their own words or identify examples.",
    exampleQuestion: "Define [Concept] and give one simple example."
  },
  [DepthLevel.Applied]: {
    structure: "Scenario Analysis & Problem Solving",
    instruction: "Focus on 'How' and 'When'. Present a real-world situation where this concept is used.",
    exampleQuestion: "A user reports [Problem]. How would you use [Concept] to fix it?"
  },
  [DepthLevel.Mastery]: {
    structure: "Critical Evaluation & Edge Case Analysis",
    instruction: "Focus on limitations, trade-offs, and deep theory. Ask for a critique or complex synthesis.",
    exampleQuestion: "Compare [Concept A] vs [Concept B] in high-scale systems. What are the trade-offs?"
  }
};
