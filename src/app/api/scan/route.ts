import { NextRequest, NextResponse } from "next/server";
import { parseGitHubUrl, fetchRepoMetadata } from "@/lib/github";
import { analyzeReadme } from "@/lib/openai";
import { calculateScore, getRiskLevel } from "@/lib/scoring";
import { ScanResponse, RedFlag } from "@/types";
import { redis, SCANS_KEY, SCAN_COUNT_KEY, SCAN_DATA_PREFIX, StoredScan } from "@/lib/redis";

export async function POST(request: NextRequest): Promise<NextResponse<ScanResponse>> {
  try {
    const body = await request.json();
    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Repository URL is required" },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Invalid GitHub URL. Please provide a valid GitHub repository URL." },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    // Fetch repository metadata
    let metadata;
    try {
      metadata = await fetchRepoMetadata(owner, repo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch repository";
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
      );
    }

    // Analyze README with OpenAI
    let aiFlags: RedFlag[] = [];
    if (metadata.readmeContent) {
      try {
        aiFlags = await analyzeReadme(metadata.readmeContent);
      } catch (error) {
        console.error("OpenAI analysis failed:", error);
        // Continue without AI analysis
      }
    } else if (!metadata.hasReadme) {
      aiFlags.push({
        category: "Poor Documentation",
        message: "Repository has no README file",
        severity: "medium",
      });
    }

    // Calculate score
    const { score } = calculateScore(metadata, aiFlags);
    const riskLevel = getRiskLevel(score);

    // Save scan to Redis (non-blocking, don't fail if Redis is unavailable)
    try {
      if (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) {
        const id = `${owner}-${repo}-${Date.now()}`;
        const timestamp = Date.now();

        const storedScan: StoredScan = {
          id,
          repoUrl,
          repoName: metadata.name,
          owner: metadata.owner,
          score,
          riskLevel,
          stars: metadata.stars,
          forks: metadata.forks,
          ageInDays: metadata.ageInDays,
          contributors: metadata.contributorsCount,
          flagsCount: aiFlags.length,
          scannedAt: new Date().toISOString(),
        };

        // Store scan data
        await redis.set(`${SCAN_DATA_PREFIX}${id}`, storedScan);
        // Add to sorted set
        await redis.zadd(SCANS_KEY, { score: timestamp, member: id });
        // Increment count
        await redis.incr(SCAN_COUNT_KEY);
      }
    } catch (redisError) {
      console.error("Failed to save scan to Redis:", redisError);
      // Continue - don't fail the scan if Redis is unavailable
    }

    return NextResponse.json({
      success: true,
      data: {
        score,
        riskLevel,
        flags: aiFlags,
        repo: {
          name: metadata.name,
          owner: metadata.owner,
          stars: metadata.stars,
          forks: metadata.forks,
          ageInDays: metadata.ageInDays,
          lastPushDaysAgo: metadata.lastPushDaysAgo,
          contributorsCount: metadata.contributorsCount,
          hasReadme: metadata.hasReadme,
        },
      },
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
