"use client";

import Leaderboard from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
              Leaderboard
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base">
              AI agent repositories scanned by the community
            </p>
          </div>

          {/* Leaderboard */}
          <Leaderboard />

          {/* Info Section */}
          <div className="mt-8 sm:mt-10 p-4 sm:p-6 border border-white/5 rounded-lg">
            <h3 className="font-medium mb-2 text-sm sm:text-base">About Scores</h3>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
              Scores are calculated using GitHub signals: repo age, stars, forks,
              contributor count, commit activity, and AI-powered README analysis.
              Higher scores indicate lower risk. This is not a security audit — always DYOR.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 sm:py-8 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-zinc-600 text-sm">Built for Base</span>
          <span className="text-zinc-700 text-xs">Not a security audit</span>
        </div>
      </footer>
    </div>
  );
}
