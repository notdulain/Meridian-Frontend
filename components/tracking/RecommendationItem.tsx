"use client";

import { UserRound } from "lucide-react";
import type { VehicleRecommendation } from "@/lib/types/tracking";

interface RecommendationItemProps {
  recommendation: VehicleRecommendation;
  rank: number;
}

function getReasonClasses(reason: string): string {
  const normalized = reason.toLowerCase();
  if (normalized.includes("fuel") || normalized.includes("cost")) {
    return "text-emerald-400 bg-emerald-400/10 border-emerald-500/20";
  }
  return "text-cyan-400 bg-cyan-400/10 border-cyan-500/20";
}

export function RecommendationItem({ recommendation, rank }: RecommendationItemProps) {
  const isTopRecommendation = rank === 1;
  const vehicleLabel = recommendation.plateNumber?.trim() || recommendation.vehicleId;
  const vehicleType = [recommendation.make, recommendation.model].filter(Boolean).join(" ");
  const distanceText =
    typeof recommendation.distanceToPickupKm === "number" && recommendation.distanceToPickupKm > 0
      ? `${recommendation.distanceToPickupKm.toFixed(1)} km`
      : "—";
  const locationText = recommendation.currentLocation?.trim() || "Unavailable";

  return (
    <article
      className={[
        "rounded-lg border border-slate-700 bg-slate-800/30 p-4 transition-colors hover:bg-slate-800/50",
        isTopRecommendation ? "ring-1 ring-cyan-500/40" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={[
              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
              isTopRecommendation ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700 text-slate-300",
            ].join(" ")}
          >
            {rank}
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">{vehicleLabel}</h3>
            <span className="text-sm text-slate-400">Score {recommendation.score.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-1 flex items-center gap-2 text-sm text-slate-400 pl-9">
        <UserRound className="h-3.5 w-3.5" />
        <span>{vehicleType || `Vehicle #${recommendation.vehicleId}`}</span>
      </div>

      <div className="mt-3 pl-9">
        <span
          className={[
            "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest",
            getReasonClasses(recommendation.reason),
          ].join(" ")}
        >
          {recommendation.reason}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-md bg-slate-950 px-3 py-2 shadow-inner">
          <div className={["text-xs uppercase tracking-widest", isTopRecommendation ? "text-cyan-400/60" : "text-slate-500"].join(" ")}>
            Pickup Distance
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{distanceText}</div>
        </div>
        <div className="rounded-md bg-slate-950 px-3 py-2 shadow-inner">
          <div className={["text-xs uppercase tracking-widest", isTopRecommendation ? "text-cyan-400/60" : "text-slate-500"].join(" ")}>
            Current Area
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{locationText}</div>
        </div>
        <div className="rounded-md bg-slate-950 px-3 py-2 shadow-inner">
          <div className={["text-xs uppercase tracking-widest", isTopRecommendation ? "text-cyan-400/60" : "text-slate-500"].join(" ")}>
            Vehicle ID
          </div>
          <div className="mt-1 text-sm font-semibold text-white">#{recommendation.vehicleId}</div>
        </div>
      </div>
    </article>
  );
}
