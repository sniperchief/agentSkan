"use client";

import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import StatsCounter from "@/components/StatsCounter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-tight mb-4 sm:mb-6">
            <span className="text-white">Scan AI repos</span>
            <br />
            <span className="text-[#22d3ee]">before they scan you</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mb-8 sm:mb-10">
            GitHub-based risk signals for AI agent projects.
            Built for Base degens, traders, and onchain builders.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/scanner"
              className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg text-sm font-semibold bg-[#22d3ee] text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Start Scanning</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3 sm:py-3.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors border border-white/10 hover:border-white/20 text-center"
            >
              View Leaderboard
            </Link>
          </div>

          {/* Stats Counter */}
          <div className="mt-8">
            <StatsCounter />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Feature 1 */}
            <div className="p-4 sm:p-6">
              <div className="text-[#22d3ee] text-xl sm:text-2xl mb-3 sm:mb-4">01</div>
              <h3 className="text-base sm:text-lg font-medium mb-2">Instant Analysis</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Paste a GitHub URL and get a risk score in seconds. No signup required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-4 sm:p-6">
              <div className="text-[#22d3ee] text-xl sm:text-2xl mb-3 sm:mb-4">02</div>
              <h3 className="text-base sm:text-lg font-medium mb-2">GitHub Signals</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Repo age, stars, forks, contributors, commit activity, and README content.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 sm:p-6">
              <div className="text-[#22d3ee] text-xl sm:text-2xl mb-3 sm:mb-4">03</div>
              <h3 className="text-base sm:text-lg font-medium mb-2">AI Red Flags</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Detects unrealistic promises, missing documentation, and common scam patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <Leaderboard limit={5} showViewAll={true} />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 sm:py-8 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-lg sm:text-xl font-semibold tracking-tight">
              <span className="text-white">agent</span>
              <span className="text-[#22d3ee]">Skan</span>
            </span>
            <span className="text-zinc-600 text-xs sm:text-sm">
              Built for Base
            </span>
          </div>
          <p className="text-zinc-600 text-xs">
            Not a security audit. GitHub signals only.
          </p>
        </div>
      </footer>
    </div>
  );
}
