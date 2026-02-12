import { RedFlag, RepoMetadata, RiskLevel } from "@/types";

interface ScoringFactors {
  ageScore: number;
  starsScore: number;
  forksScore: number;
  activityScore: number;
  contributorScore: number;
  readmeScore: number;
  aiPenalty: number;
}

export function calculateScore(
  metadata: RepoMetadata,
  aiFlags: RedFlag[]
): { score: number; factors: ScoringFactors } {
  // Start with a base score of 100 (safest)
  // Deduct points based on risk factors

  let score = 100;
  const factors: ScoringFactors = {
    ageScore: 0,
    starsScore: 0,
    forksScore: 0,
    activityScore: 0,
    contributorScore: 0,
    readmeScore: 0,
    aiPenalty: 0,
  };

  // Age score (newer repos are riskier)
  // <7 days: -25, <30 days: -15, <90 days: -10, <180 days: -5
  if (metadata.ageInDays < 7) {
    factors.ageScore = -25;
  } else if (metadata.ageInDays < 30) {
    factors.ageScore = -15;
  } else if (metadata.ageInDays < 90) {
    factors.ageScore = -10;
  } else if (metadata.ageInDays < 180) {
    factors.ageScore = -5;
  }

  // Stars score (low stars = riskier)
  // 0 stars: -15, <10: -10, <50: -5, <100: -3
  if (metadata.stars === 0) {
    factors.starsScore = -15;
  } else if (metadata.stars < 10) {
    factors.starsScore = -10;
  } else if (metadata.stars < 50) {
    factors.starsScore = -5;
  } else if (metadata.stars < 100) {
    factors.starsScore = -3;
  }

  // Forks score (no forks = less community validation)
  if (metadata.forks === 0) {
    factors.forksScore = -10;
  } else if (metadata.forks < 5) {
    factors.forksScore = -5;
  }

  // Activity score (inactive repos are riskier)
  // No commits in 30 days: -15, >60 days since push: -10, >30 days: -5
  if (metadata.recentCommitCount === 0) {
    factors.activityScore = -15;
  }
  if (metadata.lastPushDaysAgo > 60) {
    factors.activityScore = Math.min(factors.activityScore, -10);
  } else if (metadata.lastPushDaysAgo > 30) {
    factors.activityScore = Math.min(factors.activityScore, -5);
  }

  // Contributor score (solo projects = higher risk)
  if (metadata.contributorsCount <= 1) {
    factors.contributorScore = -15;
  } else if (metadata.contributorsCount < 3) {
    factors.contributorScore = -10;
  } else if (metadata.contributorsCount < 5) {
    factors.contributorScore = -5;
  }

  // README score
  if (!metadata.hasReadme) {
    factors.readmeScore = -10;
  }

  // AI analysis penalty
  for (const flag of aiFlags) {
    switch (flag.severity) {
      case "high":
        factors.aiPenalty -= 15;
        break;
      case "medium":
        factors.aiPenalty -= 8;
        break;
      case "low":
        factors.aiPenalty -= 3;
        break;
    }
  }
  // Cap AI penalty at -50
  factors.aiPenalty = Math.max(factors.aiPenalty, -50);

  // Calculate final score
  score += factors.ageScore;
  score += factors.starsScore;
  score += factors.forksScore;
  score += factors.activityScore;
  score += factors.contributorScore;
  score += factors.readmeScore;
  score += factors.aiPenalty;

  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return { score, factors };
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) {
    return "Low";
  } else if (score >= 40) {
    return "Medium";
  } else {
    return "High";
  }
}
