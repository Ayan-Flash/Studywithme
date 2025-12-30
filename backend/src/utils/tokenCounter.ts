export const countTokens = (text: string): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

export const estimateCost = (inputTokens: number, outputTokens: number): number => {
  const inputCost = (inputTokens / 1000000) * 0.50;
  const outputCost = (outputTokens / 1000000) * 1.50;
  return parseFloat((inputCost + outputCost).toFixed(6));
};
