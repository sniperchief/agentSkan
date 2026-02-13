import { NextRequest, NextResponse } from "next/server";

interface ClawnchApiToken {
  symbol: string;
  name: string;
  address: string;
  source: "4claw" | "moltx";
  launchedAt: string;
  clanker_url: string;
  explorer_url: string;
  source_url: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const response = await fetch(
      `https://clawn.ch/api/tokens?limit=${limit}&offset=${offset}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch tokens from Clawnch" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Transform the data to match our type (camelCase)
    const tokens = (data.tokens || data || []).map((token: ClawnchApiToken) => ({
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      source: token.source,
      launchedAt: token.launchedAt,
      clankerUrl: token.clanker_url,
      explorerUrl: token.explorer_url,
      sourceUrl: token.source_url,
    }));

    return NextResponse.json({
      success: true,
      data: {
        tokens,
        total: data.pagination?.total || data.count || tokens.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error fetching Clawnch tokens:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
