"use client";

import { Clock3, Fuel, LocateFixed, Trophy, UserRound } from "lucide-react";
import type { VehicleRecommendation } from "@/lib/types/tracking";

interface RecommendationItemProps {
  recommendation: VehicleRecommendation;
  rank: number;
}

function getReasonClasses(reason: string): string {
  const normalized = reason.toLowerCase();

  if (normalized.includes("fuel") || normalized.includes("cost")) {
    return "border border-emerald-400/20 bg-emerald-500/15 text-emerald-200";
  }

  return "border border-cyan-400/20 bg-cyan-500/15 text-cyan-200";
}

export function RecommendationItem({ recommendation, rank }: RecommendationItemProps) {
  const isTopRecommendation = rank === 1;

  return (
    <article
      className={[
        "rounded-2xl border p-4 transition-all duration-200 hover:border-slate-500 hover:bg-slate-700/60",
        isTopRecommendation
          ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-950/40"
          : "border-slate-700 bg-slate-800/80",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-950 px-2 text-xs font-semibold text-slate-200 ring-1 ring-slate-700">
              #{rank}
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">Vehicle {recommendation.vehicleId}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <UserRound className="h-4 w-4 text-slate-500" />
                <span>{recommendation.driverName}</span>
              </div>
            </div>
          </div>
          <span className={["inline-flex rounded-full px-2.5 py-1 text-xs font-medium", getReasonClasses(recommendation.reason)].join(" ")}>
            {recommendation.reason}
          </span>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-right shadow-inner shadow-black/20">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Score</div>
          <div className="mt-1 flex items-center justify-end gap-1 text-lg font-semibold text-white">
            <Trophy className="h-4 w-4 text-amber-300" />
            <span>{recommendation.score.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            <LocateFixed className="h-3.5 w-3.5" />
            <span>Distance</span>
          </div>
          <div className="mt-2 text-sm font-medium text-slate-100">{recommendation.distanceKm.toFixed(1)} km</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            <span>ETA</span>
          </div>
          <div className="mt-2 text-sm font-medium text-slate-100">{recommendation.etaMinutes} min</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            <Fuel className="h-3.5 w-3.5" />
            <span>Fuel Cost</span>
          </div>
          <div className="mt-2 text-sm font-medium text-slate-100">LKR {recommendation.fuelCost.toFixed(2)}</div>
        </div>
      </div>
    </article>
  );
}
