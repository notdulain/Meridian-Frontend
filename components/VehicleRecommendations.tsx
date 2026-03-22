"use client";

import { useEffect } from "react";
import { useRecommendationStore } from "@/store/recommendationStore";

interface VehicleRecommendationsProps {
  deliveryId: string | null;
}

function getReasonBadges(reason: string): string[] {
  const normalized = reason.toLowerCase();
  const badges = new Set<string>();

  if (normalized.includes("closest") || normalized.includes("distance")) badges.add("Distance");
  if (normalized.includes("fuel") || normalized.includes("cost")) badges.add("Cost");
  if (normalized.includes("performance") || normalized.includes("best")) badges.add("Performance");
  if (normalized.includes("heading") || normalized.includes("destination")) badges.add("Route");

  if (badges.size === 0) badges.add("Dispatch");
  return Array.from(badges);
}

function RecommendationSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-12 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

export function VehicleRecommendations({ deliveryId }: VehicleRecommendationsProps) {
  const { recommendations, loading, error, fetchRecommendations, reset } = useRecommendationStore();

  useEffect(() => {
    if (!deliveryId) {
      reset();
      return;
    }

    void fetchRecommendations(deliveryId);
  }, [deliveryId, fetchRecommendations, reset]);

  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Vehicle Recommendations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ranked options based on distance, cost, and route fit.
          </p>
        </div>
        {deliveryId ? (
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            Delivery #{deliveryId}
          </span>
        ) : null}
      </div>

      {!deliveryId ? (
        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Select a delivery to load recommendations.
        </div>
      ) : null}

      {deliveryId && loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <RecommendationSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {deliveryId && !loading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {deliveryId && !loading && !error && recommendations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No recommendations are available for this delivery yet.
        </div>
      ) : null}

      {deliveryId && !loading && !error && recommendations.length > 0 ? (
        <div className="grid gap-4 overflow-y-auto pr-1">
          {recommendations.map((recommendation, index) => {
            const badges = getReasonBadges(recommendation.reason);
            const isTopRecommendation = index === 0;

            return (
              <article
                key={`${recommendation.vehicleId}-${recommendation.driverName}`}
                className={[
                  "rounded-2xl border bg-white p-4 shadow-sm transition-colors",
                  isTopRecommendation
                    ? "border-emerald-300 ring-2 ring-emerald-100"
                    : "border-slate-200",
                ].join(" ")}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        Vehicle {recommendation.vehicleId}
                      </h3>
                      {isTopRecommendation ? (
                        <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                          Rank 1
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{recommendation.driverName}</p>
                  </div>

                  <div className="rounded-xl bg-slate-900 px-3 py-2 text-right text-white">
                    <div className="text-[11px] uppercase tracking-wide text-slate-300">Score</div>
                    <div className="text-lg font-semibold">{recommendation.score.toFixed(1)}</div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Distance</div>
                    <div className="mt-1 text-sm font-medium text-slate-800">
                      {recommendation.distanceKm.toFixed(1)} km to pickup
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">ETA</div>
                    <div className="mt-1 text-sm font-medium text-slate-800">
                      {recommendation.etaMinutes} min arrival
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Fuel Cost</div>
                    <div className="mt-1 text-sm font-medium text-slate-800">
                      LKR {recommendation.fuelCost.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Reason</div>
                    <div className="mt-1 text-sm font-medium text-slate-800">
                      {recommendation.reason}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

