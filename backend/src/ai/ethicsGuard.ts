import { TaskMode } from '../types/index';

export class EthicsGuard {
  private cheatingPatterns = [
    /answer to/i,
    /solve this/i,
    /solution for/i,
    /what is the result/i,
    /do my homework/i,
    /calculate/i
  ];

  public sanitizeInput(input: string, mode: TaskMode): { safeInput: string; flag: boolean } {
    if (mode !== TaskMode.Assignment) {
      return { safeInput: input, flag: false };
    }

    const isSuspicious = this.cheatingPatterns.some(pattern => pattern.test(input));

    if (isSuspicious) {
      const sanitized = `
        The student asked: "${input}".
        ETHICS INTERVENTION: The student appears to be asking for a direct solution.
        INSTRUCTION: Do NOT provide the final answer or full solution.
        ACTION: Break down the problem into conceptual steps. Ask a guiding question to help them start.
        Output ONLY the guidance.
      `;
      return { safeInput: sanitized, flag: true };
    }

    return { safeInput: input, flag: false };
  }

  public validateOutput(output: string): string {
    return output.replace(/The answer is \d+/gi, "[The answer is hidden. Try to solve it!]");
  }
}

export const ethicsGuard = new EthicsGuard();
