import { DepthLevel, TaskMode, LogEntry } from '../types/index';

/**
 * Simulates Weights & Biases (W&B) logging for the frontend demo.
 */
class EvaluationLogger {
  private project = "studywithme-eval";
  private logs: LogEntry[] = [];

  public logInteraction(
    promptText: string,
    responseText: string,
    depth: DepthLevel,
    mode: TaskMode,
    ethicsFlag: boolean
  ): void {
    const metrics = this.calculateMetrics(promptText, responseText, depth);
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      depth,
      mode,
      promptTokens: this.estimateTokens(promptText),
      responseTokens: this.estimateTokens(responseText),
      depthAlignmentScore: metrics.depthAlignment,
      clarityScore: metrics.clarity,
      ethicsFlag
    };

    this.logs.push(logEntry);

    console.groupCollapsed(`📊 [Evaluation] Logged Interaction: ${logEntry.timestamp}`);
    console.log("Project:", this.project);
    console.log("Metrics:", logEntry);
    console.groupEnd();
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  private calculateMetrics(prompt: string, response: string, depth: DepthLevel) {
    const wordCount = response.split(' ').length;
    let depthAlignment = 0.5;
    let clarity = 0.5;

    if (depth === DepthLevel.Core) {
      depthAlignment = wordCount >= 50 && wordCount <= 150 ? 1.0 : 0.6;
      clarity = this.measureComplexity(response) < 8 ? 0.9 : 0.5;
    } else if (depth === DepthLevel.Applied) {
      depthAlignment = wordCount >= 100 && wordCount <= 250 ? 1.0 : 0.7;
      clarity = 0.8; 
    } else if (depth === DepthLevel.Mastery) {
      depthAlignment = wordCount > 200 ? 1.0 : 0.5;
      clarity = this.measureComplexity(response) > 10 ? 0.9 : 0.6;
    }

    return { depthAlignment, clarity };
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private measureComplexity(text: string): number {
    const words = text.split(/\s+/);
    const totalLength = words.reduce((acc, w) => acc + w.length, 0);
    return totalLength / (words.length || 1);
  }
}

export const logger = new EvaluationLogger();
