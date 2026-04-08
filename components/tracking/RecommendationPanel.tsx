"use client";

import { useEffect } from "react";
import { ChevronDown, MapPinned, Sparkles } from "lucide-react";
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
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="flex animate-pulse items-center gap-3">
        <div className="h-6 w-6 rounded-full bg-slate-700/50" />
        <div className="h-5 w-24 rounded bg-slate-700/50" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="h-12 rounded-md bg-slate-700/50" />
        <div className="h-12 rounded-md bg-slate-700/50" />
        <div className="h-12 rounded-md bg-slate-700/50" />
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
    <aside className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
      <div className="shrink-0 bg-slate-800/50 p-6">
        <label htmlFor="delivery-select" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Active Delivery
        </label>
        <div className="relative">
          <select
            id="delivery-select"
            className="w-full appearance-none rounded-md border border-slate-700 bg-slate-900 px-4 py-3 pr-10 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Select a route to generate logistics parameters.</p>

        <div className="mt-5 border-t border-slate-700/50 pt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Vehicle Recommendations</h2>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/15 px-2.5 py-1 text-xs text-cyan-300 font-medium">
              <Sparkles className="h-3 w-3" />
              Smart Ranking
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
        {!deliveryId && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-md ring-1 ring-slate-700 bg-slate-900 p-4">
              <MapPinned className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mt-4 font-medium text-slate-300">No Delivery Selected</h3>
            <p className="mt-1 text-sm text-slate-400">Please choose an active route above.</p>
          </div>
        )}

        {deliveryId && loading && (
          <div className="flex flex-col gap-4">
             {['skel-1', 'skel-2', 'skel-3'].map((id) => (
               <RecommendationSkeleton key={id} />
             ))}
          </div>
        )}

        {deliveryId && !loading && error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
            {error}
          </div>
        )}

        {deliveryId && !loading && !error && recommendations.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
             <p className="text-sm text-slate-400">No predictive matches available for this route.</p>
          </div>
        )}

        {deliveryId && !loading && !error && recommendations.length > 0 && (
          <div className="flex flex-col gap-4">
            {recommendations.map((recommendation, index) => (
              <RecommendationItem
                key={`${recommendation.vehicleId}-${index}`}
                recommendation={recommendation}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
