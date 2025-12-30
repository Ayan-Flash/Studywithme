import { GoogleGenAI, Type } from "@google/genai";
import { DepthLevel, AssignmentStructure } from '../types/index';
import { AssignmentTemplates } from './assignmentTemplates';

class AssignmentGenerator {
  private ai: GoogleGenAI | null = null;

  public updateKey(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  public async generate(topic: string, depth: DepthLevel): Promise<AssignmentStructure | null> {
    if (!this.ai) return null;
    
    const template = AssignmentTemplates[depth];

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `
            You are a curriculum designer. Create a structured assignment for a student.
            Topic: ${topic}
            Depth: ${depth}
            
            TEMPLATE STRUCTURE: ${template.structure}
            INSTRUCTION GUIDE: ${template.instruction}
            
            RULES:
            - Create exactly one main question.
            - Provide 2-3 structured hints that guide the student without giving the answer.
            - Output strictly JSON.
          `,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              objective: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              questions: { type: Type.ARRAY, items: { type: Type.STRING } },
              hints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "objective", "difficulty", "questions", "hints"]
          }
        },
        contents: `Generate a ${depth} level assignment about ${topic}`
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text) as AssignmentStructure;
    } catch (error) {
      console.error("Assignment Gen Error:", error);
      return null;
    }
  }
}

export const assignmentGenerator = new AssignmentGenerator();
