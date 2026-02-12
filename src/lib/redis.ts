import { Redis } from "@upstash/redis";

// Initialize Redis client
// In production, these env vars are automatically set by Vercel when you add Upstash integration
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Keys
export const SCANS_KEY = "scans"; // Sorted set of scans by timestamp
export const SCAN_COUNT_KEY = "scan_count"; // Total scan count
export const SCAN_DATA_PREFIX = "scan:"; // Individual scan data

export interface StoredScan {
  id: string;
  repoUrl: string;
  repoName: string;
  owner: string;
  score: number;
  riskLevel: "Low" | "Medium" | "High";
  stars: number;
  forks: number;
  ageInDays: number;
  contributors: number;
  flagsCount: number;
  scannedAt: string;
  agentName?: string;
}
