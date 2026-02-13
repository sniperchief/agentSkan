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

interface DexScreenerPair {
  chainId: string;
  baseToken: {
    address: string;
    symbol: string;
  };
  marketCap?: number;
  priceUsd?: string;
  volume?: {
    h24?: number;
  };
  liquidity?: {
    usd?: number;
  };
  fdv?: number;
}

interface DexScreenerResponse {
  pairs: DexScreenerPair[] | null;
}

async function fetchDexScreenerData(addresses: string[]): Promise<Map<string, {
  marketCapUSD: number;
  priceUSD: number;
  volume24hUSD: number;
  liquidity: number;
}>> {
  const marketData = new Map();

  if (addresses.length === 0) return marketData;

  // DexScreener allows up to 30 addresses per request
  const batchSize = 30;
  const batches: string[][] = [];

  for (let i = 0; i < addresses.length; i += batchSize) {
    batches.push(addresses.slice(i, i + batchSize));
  }

  try {
    const results = await Promise.all(
      batches.map(async (batch) => {
        const addressList = batch.join(",");
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${addressList}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
          }
        );

        if (!response.ok) return null;
        return response.json() as Promise<DexScreenerResponse>;
      })
    );

    // Process all results
    for (const result of results) {
      if (!result?.pairs) continue;

      for (const pair of result.pairs) {
        // Only process Base chain pairs
        if (pair.chainId !== "base") continue;

        const address = pair.baseToken.address.toLowerCase();
        const existing = marketData.get(address);

        // Use the pair with highest liquidity for this token
        const liquidity = pair.liquidity?.usd || 0;
        if (!existing || liquidity > existing.liquidity) {
          marketData.set(address, {
            marketCapUSD: pair.marketCap || pair.fdv || 0,
            priceUSD: parseFloat(pair.priceUsd || "0"),
            volume24hUSD: pair.volume?.h24 || 0,
            liquidity: liquidity,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching DexScreener data:", error);
  }

  return marketData;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch tokens from Clawnch
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
    const clawnchTokens: ClawnchApiToken[] = data.tokens || data || [];

    // Extract addresses for DexScreener lookup
    const addresses = clawnchTokens.map((t) => t.address);

    // Fetch market data from DexScreener
    const marketData = await fetchDexScreenerData(addresses);

    // Transform and merge the data
    const tokens = clawnchTokens.map((token: ClawnchApiToken) => {
      const market = marketData.get(token.address.toLowerCase());
      return {
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        source: token.source,
        launchedAt: token.launchedAt,
        clankerUrl: token.clanker_url,
        explorerUrl: token.explorer_url,
        sourceUrl: token.source_url,
        marketCapUSD: market?.marketCapUSD || 0,
        priceUSD: market?.priceUSD || 0,
        volume24hUSD: market?.volume24hUSD || 0,
        liquidity: market?.liquidity || 0,
      };
    });

    // Sort by market cap descending (highest first)
    tokens.sort((a, b) => b.marketCapUSD - a.marketCapUSD);

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
