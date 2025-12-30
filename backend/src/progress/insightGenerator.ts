import { StudentProfile, LearningInsight } from '../types/index';

export class InsightGenerator {
  public generateInsights(profile: StudentProfile): LearningInsight[] {
    const insights: LearningInsight[] = [];
    const topics = Object.values(profile.topics);

    if (topics.length === 0) return insights;

    const strengths = topics.filter(t => t.masteryScore > 80);
    strengths.forEach(t => {
      insights.push({
        type: 'STRENGTH',
        topic: t.topic,
        message: `You've demonstrated high proficiency in ${t.topic}. You're ready for Mastery challenges.`
      });
    });

    const weaknesses = topics.filter(t => t.masteryScore < 40 && t.attempts > 2);
    weaknesses.forEach(t => {
      insights.push({
        type: 'WEAKNESS',
        topic: t.topic,
        message: `It seems ${t.topic} is challenging. Let's revisit the Core concepts.`
      });
    });

    const stuck = topics.filter(t => t.masteryScore >= 50 && t.masteryScore <= 70 && t.attempts > 5);
    stuck.forEach(t => {
      insights.push({
        type: 'RECOMMENDATION',
        topic: t.topic,
        message: `You're consistent in ${t.topic}, but growth has slowed. Try a practical assignment to breakthrough.`
      });
    });

    return insights;
  }
}

export const insightGenerator = new InsightGenerator();
