"use client";

import { useState, useEffect } from "react";
import { MoltlaunchAgent } from "@/types";
import Link from "next/link";

function formatMarketCap(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatPriceChange(value: number): string {
  const formatted = value.toFixed(2);
  return value >= 0 ? `+${formatted}%` : `${formatted}%`;
}

function AgentCard({ agent, onScan }: { agent: MoltlaunchAgent; onScan: (agent: MoltlaunchAgent) => void }) {
  return (
    <div className="card p-4 sm:p-5 hover:bg-white/[0.03] transition-colors">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Agent Image */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
          {agent.image ? (
            <img
              src={agent.image}
              alt={agent.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
          )}
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate text-sm sm:text-base">{agent.name}</h3>
            <span className="text-xs text-zinc-500 font-mono">${agent.symbol}</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 line-clamp-2 mb-2 sm:mb-3">
            {agent.description || "No description available"}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div>
              <span className="text-zinc-500">MCap</span>
              <span className="ml-1 sm:ml-1.5 font-medium">{formatMarketCap(agent.marketCapUSD)}</span>
            </div>
            <div>
              <span className="text-zinc-500">24h</span>
              <span className={`ml-1 sm:ml-1.5 font-medium ${agent.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPriceChange(agent.priceChange24h)}
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-zinc-500">Holders</span>
              <span className="ml-1.5 font-medium">{agent.holders.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onScan(agent)}
            className="px-3 py-1.5 text-xs font-medium bg-[#22d3ee] text-white rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
          >
            Scan
          </button>
          {agent.twitter && (
            <a
              href={`https://twitter.com/${agent.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 border border-white/10 rounded-lg hover:border-white/20 hover:text-white transition-all text-center hidden sm:block"
            >
              Twitter
            </a>
          )}
        </div>
      </div>

      {/* Skills Tags */}
      {agent.skills && agent.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
          {agent.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs bg-white/5 text-zinc-400 rounded"
            >
              {skill}
            </span>
          ))}
          {agent.skills.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-zinc-500">
              +{agent.skills.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ScanModal({
  agent,
  onClose,
  onScan,
}: {
  agent: MoltlaunchAgent;
  onClose: () => void;
  onScan: (githubUrl: string) => void;
}) {
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(githubUrl.trim())) {
      setError("Invalid GitHub URL. Use format: https://github.com/owner/repo");
      return;
    }
    onScan(githubUrl.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border-t sm:border border-white/10 rounded-t-xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
            {agent.image ? (
              <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium">{agent.name}</h3>
            <p className="text-xs text-zinc-500">${agent.symbol}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-zinc-400 mb-2">
            Link GitHub Repository
          </label>
          <input
            type="text"
            value={githubUrl}
            onChange={(e) => {
              setGithubUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://github.com/owner/repo"
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg outline-none text-white placeholder-zinc-600 focus:border-[#22d3ee]/50 transition-colors font-mono text-sm mb-3"
          />
          {error && (
            <p className="text-red-400 text-sm mb-3">{error}</p>
          )}
          <button
            type="submit"
            disabled={!githubUrl.trim()}
            className="w-full py-3 bg-[#22d3ee] text-white font-medium rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Scan Repository
          </button>
        </form>

        <p className="text-xs text-zinc-600 mt-4 text-center">
          Enter the GitHub repo URL for this agent to run a risk scan
        </p>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<MoltlaunchAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<MoltlaunchAgent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      const data = await response.json();
      if (data.success) {
        setAgents(data.data.agents);
      } else {
        setError(data.error || "Failed to fetch agents");
      }
    } catch {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (agent: MoltlaunchAgent) => {
    setSelectedAgent(agent);
  };

  const handleScanSubmit = (githubUrl: string) => {
    // Navigate to scanner with pre-filled URL and agent context
    window.location.href = `/scanner?url=${encodeURIComponent(githubUrl)}&agent=${encodeURIComponent(selectedAgent?.name || "")}`;
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by market cap descending
  const sortedAgents = [...filteredAgents].sort((a, b) => b.marketCapUSD - a.marketCapUSD);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Agents</h1>
              <span className="px-2 py-0.5 text-xs font-medium bg-[#22d3ee]/10 text-[#22d3ee] rounded">
                Moltlaunch
              </span>
            </div>
            <p className="text-zinc-500 text-sm sm:text-base">
              Browse AI agents from Moltlaunch and scan their GitHub repositories
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents..."
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg outline-none text-white placeholder-zinc-600 focus:border-[#22d3ee]/50 transition-colors text-sm"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-[#22d3ee]" viewBox="0 0 24 24">
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
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Agents Grid */}
          {!loading && !error && (
            <>
              <div className="text-sm text-zinc-500 mb-4">
                {sortedAgents.length} agent{sortedAgents.length !== 1 ? "s" : ""} found
              </div>
              <div className="space-y-3">
                {sortedAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onScan={handleScan} />
                ))}
              </div>
              {sortedAgents.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                  No agents found matching your search
                </div>
              )}
            </>
          )}

          {/* Info */}
          <div className="mt-10 p-5 border border-white/5 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#22d3ee]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">How it works</h3>
                <p className="text-zinc-500 text-sm">
                  Moltlaunch agents don't include GitHub links by default. Click "Scan" on any agent
                  to link their GitHub repository and run a risk analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 sm:py-8 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-zinc-600 text-sm">Built for Base</span>
          <span className="text-zinc-700 text-xs">Data from Moltlaunch</span>
        </div>
      </footer>

      {/* Scan Modal */}
      {selectedAgent && (
        <ScanModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onScan={handleScanSubmit}
        />
      )}
    </div>
  );
}
