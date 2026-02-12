"use client";

import { useState, useEffect } from "react";

export default function StatsCounter() {
  const [totalScans, setTotalScans] = useState<number | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      if (data.success) {
        setTotalScans(data.data.totalScans);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  if (totalScans === null || totalScans === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full">
      <div className="w-2 h-2 bg-[#22d3ee] rounded-full animate-pulse" />
      <span className="text-sm text-zinc-400">
        <span className="font-semibold text-white">{totalScans.toLocaleString()}</span>
        {" "}agents scanned
      </span>
    </div>
  );
}
