export interface AdaptiveSignal {
  topic: string;
  signalType: 'INCREASE_DEPTH' | 'REDUCE_COMPLEXITY' | 'PRACTICE_NEEDED' | 'MASTERY_READY' | 'MAINTAIN';
  reason: string;
}