import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.moltlaunch.com/api/agents", {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch agents from Moltlaunch" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Transform the data to include only what we need
    const agents = data.agents?.map((agent: MoltlaunchAgent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      symbol: agent.symbol,
      image: agent.image,
      marketCapUSD: agent.marketCapUSD,
      volume24hUSD: agent.volume24hUSD,
      priceChange24h: agent.priceChange24h,
      holders: agent.holders,
      reputation: agent.reputation,
      twitter: agent.twitter,
      skills: agent.skills,
      flaunchUrl: agent.flaunchUrl,
      lastActiveAt: agent.lastActiveAt,
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        agents,
        total: data.total || agents.length,
      },
    });
  } catch (error) {
    console.error("Error fetching Moltlaunch agents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

interface MoltlaunchAgent {
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
}
