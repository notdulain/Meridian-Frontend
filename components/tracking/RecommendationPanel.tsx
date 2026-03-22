"use client";

import { useEffect } from "react";
import { LoaderCircle, MapPinned, Sparkles } from "lucide-react";
import { RecommendationItem } from "@/components/tracking/RecommendationItem";
import { useRecommendationStore } from "@/store/recommendationStore";

interface DeliveryOption {
  id: string;
  label: string;
}

interface RecommendationPanelProps {
  deliveryId: string | null;
  deliveryOptions: DeliveryOption[];
  deliveryLoading: boolean;
  onDeliveryChange: (deliveryId: string | null) => void;
}

function RecommendationSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-700" />
        <div className="h-8 w-14 animate-pulse rounded-xl bg-slate-700" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="h-16 animate-pulse rounded-xl bg-slate-700/70" />
        <div className="h-16 animate-pulse rounded-xl bg-slate-700/70" />
        <div className="h-16 animate-pulse rounded-xl bg-slate-700/70" />
      </div>
    </div>
  );
}

export function RecommendationPanel({
  deliveryId,
  deliveryOptions,
  deliveryLoading,
  onDeliveryChange,
}: RecommendationPanelProps) {
  const { recommendations, loading, error, fetchRecommendations, reset } = useRecommendationStore();

  useEffect(() => {
    if (!deliveryId) {
      reset();
      return;
    }

    void fetchRecommendations(deliveryId);
  }, [deliveryId, fetchRecommendations, reset]);

  return (
    <aside className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg shadow-black/20 backdrop-blur-sm lg:col-span-1 lg:p-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <label className="block text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Active Delivery
        </label>
        <select
          className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          value={deliveryId ?? ""}
          onChange={(event) => onDeliveryChange(event.target.value || null)}
          disabled={deliveryLoading || deliveryOptions.length === 0}
        >
          {deliveryLoading ? <option>Loading deliveries...</option> : null}
          {!deliveryLoading && deliveryOptions.length === 0 ? <option value="">No deliveries available</option> : null}
          {deliveryOptions.map((delivery) => (
            <option key={delivery.id} value={delivery.id}>
              {delivery.label}
            </option>
          ))}
        </select>
        <p className="mt-4 text-center text-sm text-slate-400">Route fit and ETA</p>
      </div>

      <div className="mt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium text-white">Vehicle Recommendations</h2>
            <p className="mt-1 text-sm text-slate-400">Ranked by ETA and cost</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            Smart Ranking
          </span>
        </div>

        {!deliveryId ? (
          <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-700 bg-slate-950/80">
              <MapPinned className="h-6 w-6 text-cyan-300" />
            </div>
            <h3 className="mt-4 text-base font-medium text-white">No delivery selected</h3>
            <p className="mt-2 max-w-xs text-sm text-slate-400">Select delivery for recommendations</p>
          </div>
        ) : null}

        {deliveryId && loading ? (
          <div className="mt-6 space-y-5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />
              <span>Loading vehicle recommendations...</span>
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
              <RecommendationSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {deliveryId && !loading && error ? (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {deliveryId && !loading && !error && recommendations.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-sm text-slate-400">
            No recommendations are available for this delivery yet.
          </div>
        ) : null}

        {deliveryId && !loading && !error && recommendations.length > 0 ? (
          <div className="mt-6 space-y-5">
            {recommendations.map((recommendation, index) => (
              <RecommendationItem
                key={`${recommendation.vehicleId}-${recommendation.driverName}-${index}`}
                recommendation={recommendation}
                rank={index + 1}
              />
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
