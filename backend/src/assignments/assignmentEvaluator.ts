import { GoogleGenAI, Type } from "@google/genai";
import { AssignmentStructure, AssignmentFeedback } from '../types/index';

class AssignmentEvaluator {
  private ai: GoogleGenAI | null = null;

  public updateKey(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  public async evaluate(
    assignment: AssignmentStructure,
    studentAnswer: string
  ): Promise<AssignmentFeedback | null> {
    if (!this.ai) return null;
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `
            You are a teacher grading an assignment.
            Evaluate the student's reasoning. DO NOT just check if the answer is right.
            Focus on concepts.
            Assignment Question: ${assignment.questions[0]}
            Output JSON only.
          `,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conceptualScore: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              nextSteps: { type: Type.STRING }
            },
            required: ["conceptualScore", "feedback", "misconceptions", "nextSteps"]
          }
        },
        contents: `Student Answer: ${studentAnswer}`
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text) as AssignmentFeedback;
    } catch (error) {
      console.error("Eval Error:", error);
      return null;
    }
  }
}

export const assignmentEvaluator = new AssignmentEvaluator();
