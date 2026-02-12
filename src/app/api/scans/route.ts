import { NextRequest, NextResponse } from "next/server";
import { redis, SCANS_KEY, SCAN_COUNT_KEY, SCAN_DATA_PREFIX, StoredScan } from "@/lib/redis";

// GET - Fetch scan history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Check if Redis is configured
    if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
      // Return mock data if Redis is not configured
      return NextResponse.json({
        success: true,
        data: {
          scans: [],
          total: 0,
          hasMore: false,
        },
      });
    }

    // Get total count
    const total = (await redis.get<number>(SCAN_COUNT_KEY)) || 0;

    // Get scan IDs from sorted set (most recent first)
    const scanIds = await redis.zrange(SCANS_KEY, offset, offset + limit - 1, {
      rev: true,
    });

    if (!scanIds || scanIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          scans: [],
          total,
          hasMore: false,
        },
      });
    }

    // Fetch scan data for each ID
    const scans: StoredScan[] = [];
    for (const id of scanIds) {
      const scanData = await redis.get<StoredScan>(`${SCAN_DATA_PREFIX}${id}`);
      if (scanData) {
        scans.push(scanData);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        scans,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching scans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch scans" },
      { status: 500 }
    );
  }
}

// POST - Save a new scan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scan } = body as { scan: Omit<StoredScan, "id" | "scannedAt"> };

    if (!scan) {
      return NextResponse.json(
        { success: false, error: "Missing scan data" },
        { status: 400 }
      );
    }

    // Check if Redis is configured
    if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
      // Just return success if Redis is not configured (for local dev)
      return NextResponse.json({
        success: true,
        data: { message: "Scan recorded (Redis not configured)" },
      });
    }

    // Generate unique ID
    const id = `${scan.owner}-${scan.repoName}-${Date.now()}`;
    const timestamp = Date.now();
    const scannedAt = new Date().toISOString();

    const storedScan: StoredScan = {
      ...scan,
      id,
      scannedAt,
    };

    // Store scan data
    await redis.set(`${SCAN_DATA_PREFIX}${id}`, storedScan);

    // Add to sorted set with timestamp as score
    await redis.zadd(SCANS_KEY, { score: timestamp, member: id });

    // Increment total count
    await redis.incr(SCAN_COUNT_KEY);

    // Keep only last 1000 scans to prevent unbounded growth
    const count = await redis.zcard(SCANS_KEY);
    if (count > 1000) {
      // Remove oldest entries
      const toRemove = await redis.zrange(SCANS_KEY, 0, count - 1001);
      if (toRemove && toRemove.length > 0) {
        for (const id of toRemove) {
          await redis.del(`${SCAN_DATA_PREFIX}${id}`);
        }
        await redis.zremrangebyrank(SCANS_KEY, 0, count - 1001);
      }
    }

    return NextResponse.json({
      success: true,
      data: { id, scannedAt },
    });
  } catch (error) {
    console.error("Error saving scan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save scan" },
      { status: 500 }
    );
  }
}
