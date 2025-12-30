export class MetricsCalculator {
  public calculateBasicMetrics(text: string) {
    return { 
        tokenCount: Math.ceil(text.length / 4),
        wordCount: text.split(/\s+/).length
    };
  }
}
export const metricsCalculator = new MetricsCalculator();
