"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ScanEntry {
  id: string;
  repoUrl: string;
  repoName: string;
  owner: string;
  score: number;
  riskLevel: "Low" | "Medium" | "High";
  stars: number;
  scannedAt: string;
}

function getRiskColor(riskLevel: string) {
  if (riskLevel === "Low") return "text-[#22d3ee]";
  if (riskLevel === "Medium") return "text-amber-400";
  return "text-red-400";
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return "Just now";
}

interface LeaderboardProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function Leaderboard({ limit = 20, showViewAll = false }: LeaderboardProps) {
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScans();
  }, [limit]);

  const fetchScans = async () => {
    try {
      const response = await fetch(`/api/scans?limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setScans(data.data.scans);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch scans:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-medium">Recent Scans</h2>
        </div>
        <div className="card p-8 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-[#22d3ee]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-medium">Recent Scans</h2>
        </div>
        <div className="card p-8 text-center">
          <p className="text-zinc-500">No scans yet. Be the first to scan an agent!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-medium">Recent Scans</h2>
          {total > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[#22d3ee]/10 text-[#22d3ee] rounded">
              {total} total
            </span>
          )}
        </div>
        {showViewAll && scans.length > 0 && (
          <Link
            href="/leaderboard"
            className="text-sm text-zinc-500 hover:text-[#22d3ee] transition-colors"
          >
            View all →
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-3 sm:px-5 py-3 sm:py-4">
                Repository
              </th>
              <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-2 sm:px-5 py-3 sm:py-4">
                Score
              </th>
              <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-2 sm:px-5 py-3 sm:py-4">
                Risk
              </th>
              <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-3 sm:px-5 py-3 sm:py-4 hidden sm:table-cell">
                Stars
              </th>
              <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-3 sm:px-5 py-3 sm:py-4 hidden md:table-cell">
                Scanned
              </th>
            </tr>
          </thead>
          <tbody>
            {scans.map((entry, index) => (
              <tr
                key={entry.id}
                className={`hover:bg-white/[0.02] transition-colors ${
                  index !== scans.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <td className="px-3 sm:px-5 py-3 sm:py-4">
                  <a
                    href={entry.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 sm:gap-3 hover:text-[#22d3ee] transition-colors"
                  >
                    <svg className="w-4 h-4 text-zinc-600 flex-shrink-0 hidden sm:block" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                      {entry.owner}/{entry.repoName}
                    </span>
                  </a>
                </td>
                <td className="px-2 sm:px-5 py-3 sm:py-4 text-center">
                  <span className={`font-mono font-medium text-sm sm:text-base ${getRiskColor(entry.riskLevel)}`}>
                    {entry.score}
                  </span>
                </td>
                <td className="px-2 sm:px-5 py-3 sm:py-4 text-center">
                  <span className={`inline-flex px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-medium risk-${entry.riskLevel.toLowerCase()}`}>
                    {entry.riskLevel}
                  </span>
                </td>
                <td className="px-3 sm:px-5 py-3 sm:py-4 text-right text-zinc-500 hidden sm:table-cell">
                  {entry.stars.toLocaleString()}
                </td>
                <td className="px-3 sm:px-5 py-3 sm:py-4 text-right text-zinc-600 text-sm hidden md:table-cell">
                  {formatTimeAgo(entry.scannedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
