import { TopicMetrics, AdaptiveSignal, DepthLevel } from '../types/index';

export class DepthAdjustmentEngine {
  public getSignalForTopic(topicData: TopicMetrics): AdaptiveSignal {
    const { masteryScore, attempts, lastDepth, commonMistakes } = topicData;

    if (commonMistakes.length >= 3 && lastDepth !== DepthLevel.Core) {
      return {
        topic: topicData.topic,
        signalType: 'REDUCE_COMPLEXITY',
        reason: 'Multiple misconceptions detected. Stepping back to Core principles.'
      };
    }

    if (masteryScore > 85 && lastDepth !== DepthLevel.Mastery) {
      return {
        topic: topicData.topic,
        signalType: 'INCREASE_DEPTH',
        reason: 'Mastery score indicates readiness for deeper analysis.'
      };
    }

    if (masteryScore < 50 && attempts > 3) {
      return {
        topic: topicData.topic,
        signalType: 'PRACTICE_NEEDED',
        reason: 'Concept understanding is not yet solid. More practice examples needed.'
      };
    }

    if (masteryScore > 75 && lastDepth === DepthLevel.Applied) {
      return {
        topic: topicData.topic,
        signalType: 'MASTERY_READY',
        reason: 'Strong performance in Applied tasks.'
      };
    }

    return {
      topic: topicData.topic,
      signalType: 'MAINTAIN',
      reason: 'Current learning pace is optimal.'
    };
  }
}

export const depthAdjustmentEngine = new DepthAdjustmentEngine();
