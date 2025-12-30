import { DepthLevel } from '../types/index';

export interface DepthConfig {
  systemInstructionAddon: string;
  maxTokens: number;
  complexityLevel: 'low' | 'medium' | 'high';
  allowedExamples: number;
}

export class DepthEngine {
  public getConfig(depth: DepthLevel): DepthConfig {
    switch (depth) {
      case DepthLevel.Core:
        return {
          systemInstructionAddon: `
            ROLE: Fundamental Concept Teacher.
            STYLE: Simple, clear, analogy-heavy.
            CONSTRAINT: Max 1 real-world example. Focus on "What" and basic "Why".
            AVOID: Technical jargon, edge cases, complex derivations.
            TONE: Encouraging, patient, foundational.
          `,
          maxTokens: 250,
          complexityLevel: 'low',
          allowedExamples: 1
        };
      
      case DepthLevel.Applied:
        return {
          systemInstructionAddon: `
            ROLE: Practical Application Coach.
            STYLE: Context-driven, problem-solving oriented.
            CONSTRAINT: Use exactly 2 distinct real-world scenarios. Focus on "How" and "When".
            AVOID: Pure theory without practice, over-simplification.
            TONE: Professional, pragmatic, bridge-building.
          `,
          maxTokens: 500,
          complexityLevel: 'medium',
          allowedExamples: 2
        };

      case DepthLevel.Mastery:
        return {
          systemInstructionAddon: `
            ROLE: Subject Matter Expert / Professor.
            STYLE: Rigorous, comprehensive, analytical.
            CONSTRAINT: Explore edge cases, historical context, and theoretical limits.
            AVOID: Metaphors that lose precision.
            TONE: Academic, challenging, deep.
          `,
          maxTokens: 1000,
          complexityLevel: 'high',
          allowedExamples: 3
        };
      
      default:
        return this.getConfig(DepthLevel.Core);
    }
  }
}

export const depthEngine = new DepthEngine();
