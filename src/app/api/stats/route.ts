import { NextResponse } from "next/server";
import { redis, SCAN_COUNT_KEY } from "@/lib/redis";

export async function GET() {
  try {
    // Check if Redis is configured
    if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
      return NextResponse.json({
        success: true,
        data: {
          totalScans: 0,
        },
      });
    }

    const totalScans = (await redis.get<number>(SCAN_COUNT_KEY)) || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalScans,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
