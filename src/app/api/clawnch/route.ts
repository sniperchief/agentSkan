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

interface TokenWithMarketData {
  symbol: string;
  name: string;
  address: string;
  source: "4claw" | "moltx";
  launchedAt: string;
  clankerUrl: string;
  explorerUrl: string;
  sourceUrl: string;
  marketCapUSD: number;
  priceUSD: number;
  volume24hUSD: number;
  liquidity: number;
}

// Cache for tokens with market data
let cachedTokens: TokenWithMarketData[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    // Process batches with slight delay to avoid rate limiting
    for (const batch of batches) {
      const addressList = batch.join(",");
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${addressList}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) continue;

        const result = await response.json() as DexScreenerResponse;

        if (!result?.pairs) continue;

        for (const pair of result.pairs) {
          // Only process Base chain pairs
          if (pair.chainId !== "base") continue;

          const address = pair.baseToken.address.toLowerCase();
          const existing = marketData.get(address);

          // Use the pair with highest liquidity for this token
          const liquidity = pair.liquidity?.usd || 0;
          const marketCap = pair.marketCap || pair.fdv || 0;

          if (marketCap > 0 && (!existing || liquidity > existing.liquidity)) {
            marketData.set(address, {
              marketCapUSD: marketCap,
              priceUSD: parseFloat(pair.priceUsd || "0"),
              volume24hUSD: pair.volume?.h24 || 0,
              liquidity: liquidity,
            });
          }
        }
      } catch (e) {
        console.error("Error fetching batch from DexScreener:", e);
      }
    }
  } catch (error) {
    console.error("Error fetching DexScreener data:", error);
  }

  return marketData;
}

async function fetchAndFilterTokens(): Promise<TokenWithMarketData[]> {
  const tokensWithMarketData: TokenWithMarketData[] = [];
  const seenAddresses = new Set<string>();

  // Fetch tokens in batches until we have enough with market data
  // or we've checked a reasonable amount
  const BATCH_SIZE = 500;
  const MAX_OFFSET = 10000; // Check up to 10k tokens
  const TARGET_TOKENS = 200; // Aim for at least 200 tokens with market data

  let offset = 0;

  while (offset < MAX_OFFSET && tokensWithMarketData.length < TARGET_TOKENS) {
    try {
      // Fetch batch from Clawnch
      const response = await fetch(
        `https://clawn.ch/api/tokens?limit=${BATCH_SIZE}&offset=${offset}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) break;

      const data = await response.json();
      const clawnchTokens: ClawnchApiToken[] = data.tokens || [];

      if (clawnchTokens.length === 0) break;

      // Filter out already seen addresses
      const newTokens = clawnchTokens.filter(t => {
        const addr = t.address.toLowerCase();
        if (seenAddresses.has(addr)) return false;
        seenAddresses.add(addr);
        return true;
      });

      // Get addresses for DexScreener lookup
      const addresses = newTokens.map(t => t.address);

      // Fetch market data
      const marketData = await fetchDexScreenerData(addresses);

      // Add tokens that have market data
      for (const token of newTokens) {
        const market = marketData.get(token.address.toLowerCase());
        if (market && market.marketCapUSD > 0) {
          tokensWithMarketData.push({
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            source: token.source,
            launchedAt: token.launchedAt,
            clankerUrl: token.clanker_url,
            explorerUrl: token.explorer_url,
            sourceUrl: token.source_url,
            marketCapUSD: market.marketCapUSD,
            priceUSD: market.priceUSD,
            volume24hUSD: market.volume24hUSD,
            liquidity: market.liquidity,
          });
        }
      }

      offset += BATCH_SIZE;

      // Small delay to be nice to APIs
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error("Error fetching tokens:", error);
      break;
    }
  }

  // Sort by market cap descending
  tokensWithMarketData.sort((a, b) => b.marketCapUSD - a.marketCapUSD);

  return tokensWithMarketData;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const refresh = searchParams.get("refresh") === "true";

    // Check cache
    const now = Date.now();
    if (!refresh && cachedTokens.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
      // Return paginated cached data
      const paginatedTokens = cachedTokens.slice(offset, offset + limit);
      return NextResponse.json({
        success: true,
        data: {
          tokens: paginatedTokens,
          total: cachedTokens.length,
          limit,
          offset,
          cached: true,
        },
      });
    }

    // Fetch and filter tokens
    console.log("Fetching fresh token data with market caps...");
    const tokensWithMarketData = await fetchAndFilterTokens();

    // Update cache
    cachedTokens = tokensWithMarketData;
    cacheTimestamp = now;

    // Return paginated data
    const paginatedTokens = tokensWithMarketData.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        tokens: paginatedTokens,
        total: tokensWithMarketData.length,
        limit,
        offset,
        cached: false,
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
