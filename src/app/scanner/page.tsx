"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScanResult, RedFlag } from "@/types";

function ScoreRing({ score, riskLevel }: { score: number; riskLevel: string }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (riskLevel === "Low") return "#22d3ee";
    if (riskLevel === "Medium") return "#fbbf24";
    return "#f87171";
  };

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="72"
          cy="72"
          r="54"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="72"
          cy="72"
          r="54"
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold font-mono">{score}</span>
        <span className="text-xs text-zinc-500">/ 100</span>
      </div>
    </div>
  );
}

function FlagCard({ flag }: { flag: RedFlag }) {
  return (
    <div className="p-4 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3">
        <span className={`severity-${flag.severity.toLowerCase()} px-2 py-0.5 rounded text-xs font-medium uppercase`}>
          {flag.severity}
        </span>
        <div className="flex-1">
          <div className="text-sm font-medium text-zinc-300">{flag.category}</div>
          <div className="text-sm text-zinc-500 mt-1">{flag.message}</div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}

function validateGitHubUrl(url: string): boolean {
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  return githubRegex.test(url.trim());
}

function ScannerContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [agentName, setAgentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    const agentParam = searchParams.get("agent");
    if (urlParam) {
      setUrl(urlParam);
    }
    if (agentParam) {
      setAgentName(agentParam);
    }
  }, [searchParams]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!validateGitHubUrl(url)) {
      setError("Invalid GitHub URL. Use format: https://github.com/owner/repo");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Scan failed. Please try again.");
        return;
      }

      setResult(data.data);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
              Scanner
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base">
              {agentName
                ? <>Scanning repository for <span className="text-[#22d3ee]">{agentName}</span></>
                : "Enter a GitHub repository URL to analyze"
              }
            </p>
          </div>

          {/* Scan Form */}
          <form onSubmit={handleScan} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg outline-none text-white placeholder-zinc-600 focus:border-[#22d3ee]/50 transition-colors font-mono text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="group relative px-8 py-3 rounded-lg text-sm font-semibold bg-[#22d3ee] text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-[130px]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Scanning</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Scan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="animate-fadeIn">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Left Column - Score */}
                <div className="card p-6 flex flex-col items-center justify-center">
                  <ScoreRing score={result.score} riskLevel={result.riskLevel} />
                  <div className={`mt-5 px-3 py-1.5 rounded text-xs font-medium risk-${result.riskLevel.toLowerCase()}`}>
                    {result.riskLevel} Risk
                  </div>
                  <p className="mt-3 text-zinc-500 text-sm text-center">
                    {result.riskLevel === "Low" && "This repo shows positive signals. Appears relatively safe."}
                    {result.riskLevel === "Medium" && "Some concerning signals detected. DYOR."}
                    {result.riskLevel === "High" && "Multiple red flags detected. Exercise caution."}
                  </p>
                </div>

                {/* Right Column - Stats */}
                <div className="card p-5">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-[#22d3ee] uppercase tracking-wider mb-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Repository Stats
                  </h2>
                  <StatRow label="Repository" value={`${result.repo.owner}/${result.repo.name}`} />
                  <StatRow label="Stars" value={result.repo.stars.toLocaleString()} />
                  <StatRow label="Forks" value={result.repo.forks.toLocaleString()} />
                  <StatRow label="Age" value={`${result.repo.ageInDays} days`} />
                  <StatRow label="Last Push" value={`${result.repo.lastPushDaysAgo} days ago`} />
                  <StatRow label="Contributors" value={result.repo.contributorsCount} />
                  <StatRow label="README" value={result.repo.hasReadme ? "Yes" : "No"} />
                </div>
              </div>

              {/* Full Width - Red Flags */}
              {result.flags.length > 0 && (
                <div className="card">
                  <div className="px-5 py-4 border-b border-white/5">
                    <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                      Red Flags ({result.flags.length})
                    </h2>
                  </div>
                  {result.flags.map((flag, index) => (
                    <FlagCard key={index} flag={flag} />
                  ))}
                </div>
              )}

              {/* No Flags */}
              {result.flags.length === 0 && (
                <div className="card p-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-[#22d3ee]/10">
                    <svg className="w-5 h-5 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-medium mb-1">No Red Flags</h2>
                  <p className="text-zinc-500 text-sm">
                    No concerning patterns found in analysis.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!result && !error && !loading && (
            <div className="text-center text-zinc-600 text-sm py-12">
              Paste a GitHub URL to get started
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-zinc-600 text-sm">Built for Base</span>
          <span className="text-zinc-700 text-xs">Not a security audit</span>
        </div>
      </footer>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#22d3ee]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <ScannerContent />
    </Suspense>
  );
}
