"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertBanner } from "@/components/tracking/AlertBanner";
import { RecommendationPanel } from "@/components/tracking/RecommendationPanel";
import { TrackingMapCard } from "@/components/tracking/TrackingMapCard";
import type { DeliveryDto } from "@/lib/types";
import apiClient from "@/src/api/client";

export function LiveTrackingPage() {
  const searchParams = useSearchParams();
  const requestedDeliveryId = searchParams.get("deliveryId");

  const [deliveries, setDeliveries] = useState<DeliveryDto[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(requestedDeliveryId);
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDeliveries = async () => {
      setDeliveryLoading(true);
      setDeliveryError(null);

      try {
        const response = await apiClient.get<DeliveryDto[]>("/delivery/api/deliveries");
        if (!isMounted) return;

        const nextDeliveries = Array.isArray(response.data) ? response.data : [];
        setDeliveries(nextDeliveries);

        const matchedDelivery = requestedDeliveryId
          ? nextDeliveries.find((delivery) => String(delivery.id) === requestedDeliveryId)
          : null;

        setSelectedDeliveryId(matchedDelivery ? String(matchedDelivery.id) : String(nextDeliveries[0]?.id ?? ""));
      } catch (error) {
        console.warn("Failed to load deliveries for tracking");
        if (!isMounted) return;

        setDeliveries([]);
        setSelectedDeliveryId(requestedDeliveryId ?? null);
        setDeliveryError("Delivery data is temporarily unavailable. Live map updates will continue.");
      } finally {
        if (isMounted) {
          setDeliveryLoading(false);
        }
      }
    };

    void loadDeliveries();

    return () => {
      isMounted = false;
    };
  }, [requestedDeliveryId]);

  const deliveryOptions = useMemo(
    () =>
      deliveries.map((delivery) => ({
        id: String(delivery.id),
        label: `#${delivery.id} ${delivery.pickupAddress} to ${delivery.deliveryAddress}`,
      })),
    [deliveries],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="page-container max-w-[1440px] space-y-8 py-8">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">Operations</p>
          <h1 className="mt-3 text-xl font-semibold text-white">Live Tracking</h1>
          <p className="mt-2 text-sm text-slate-400">
            Real-time fleet visibility and smart recommendations
          </p>
        </header>

        {deliveryError ? <AlertBanner message={deliveryError} onDismiss={() => setDeliveryError(null)} /> : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <TrackingMapCard />
          <RecommendationPanel
            deliveryId={selectedDeliveryId}
            deliveryOptions={deliveryOptions}
            deliveryLoading={deliveryLoading}
            onDeliveryChange={setSelectedDeliveryId}
          />
        </div>
      </div>
    </div>
  );
}
