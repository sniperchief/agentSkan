export interface ScanRequest {
  repoUrl: string;
}

export interface RedFlag {
  category: string;
  message: string;
  severity: "low" | "medium" | "high";
}

export interface RepoMetadata {
  name: string;
  owner: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  createdAt: string;
  pushedAt: string;
  defaultBranch: string;
  ageInDays: number;
  lastPushDaysAgo: number;
  contributorsCount: number;
  recentCommitCount: number;
  hasReadme: boolean;
  readmeContent: string | null;
}

export type RiskLevel = "Low" | "Medium" | "High";

export interface ScanResult {
  score: number;
  riskLevel: RiskLevel;
  flags: RedFlag[];
  repo: {
    name: string;
    owner: string;
    stars: number;
    forks: number;
    ageInDays: number;
    lastPushDaysAgo: number;
    contributorsCount: number;
    hasReadme: boolean;
  };
}

export interface ScanResponse {
  success: boolean;
  data?: ScanResult;
  error?: string;
}

export interface LeaderboardEntry {
  id: string;
  repoUrl: string;
  repoName: string;
  owner: string;
  score: number;
  riskLevel: RiskLevel;
  stars: number;
  scannedAt: string;
}

export interface MoltlaunchAgent {
  id: string;
  name: string;
  description: string;
  symbol: string;
  image: string;
  marketCapUSD: number;
  volume24hUSD: number;
  priceChange24h: number;
  holders: number;
  reputation: {
    count: number;
    summaryValue: number;
    summaryValueDecimals: number;
  };
  twitter?: string;
  skills: string[];
  flaunchUrl: string;
  lastActiveAt: number;
  githubUrl?: string; // User-linked GitHub repo
}

export interface ClawnchToken {
  symbol: string;
  name: string;
  address: string;
  source: "4claw" | "moltx";
  launchedAt: string;
  clankerUrl: string;
  explorerUrl: string;
  sourceUrl: string;
}
