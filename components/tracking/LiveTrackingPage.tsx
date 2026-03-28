"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertBanner } from "@/components/tracking/AlertBanner";
import { RecommendationPanel } from "@/components/tracking/RecommendationPanel";
import { TrackingMapCard } from "@/components/tracking/TrackingMapCard";
import type { DeliveryDto } from "@/lib/types";
import type { TrackedAssignment } from "@/lib/types/tracking";
import apiClient from "@/src/api/client";

export function LiveTrackingPage() {
  const searchParams = useSearchParams();
  const requestedDeliveryId = searchParams.get("deliveryId");

  const [deliveries, setDeliveries] = useState<DeliveryDto[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(requestedDeliveryId);
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const [activeAssignments, setActiveAssignments] = useState<TrackedAssignment[]>([]);

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
      } catch {
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

    const loadAssignments = async () => {
      try {
        // We fetch active assignments to know which Dispatcher SignalR tracking groups to join
        const res = await apiClient.get<{ success?: boolean; data?: TrackedAssignment[] }>("/assignment/api/assignments?pageSize=100");
        if (!isMounted) return;

        if (res.data?.success && Array.isArray(res.data.data)) {
          const nextAssignments = res.data.data.filter((assignment) => assignment.status === "Active");
          setActiveAssignments(nextAssignments);
        }
      } catch {
        console.warn("Failed to load assignments, map will stay idle until assignments are manually provided or retry successful.");
      }
    };

    void loadDeliveries();
    void loadAssignments();

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
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 font-sans text-slate-400 selection:bg-cyan-500/30 selection:text-white flex flex-col">
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 min-h-0 flex-col px-6 pt-10 pb-6 lg:px-12">
        <header className="shrink-0 mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Operations / Live Tracking</span>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Active Deployments</h1>
            <p className="text-sm text-slate-400">
              Correlating real-time telemetry with predictive dispatch algorithms.
            </p>
          </div>
        </header>

        {deliveryError ? (
          <div className="mb-6 shrink-0 w-full">
            <AlertBanner message={deliveryError} onDismiss={() => setDeliveryError(null)} />
          </div>
        ) : null}

        <div className="grid flex-1 min-h-0 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-full min-h-0">
            <TrackingMapCard assignments={activeAssignments} />
          </div>
          <div className="lg:col-span-1 h-full min-h-0">
            <RecommendationPanel
              deliveryId={selectedDeliveryId}
              deliveryOptions={deliveryOptions}
              deliveryLoading={deliveryLoading}
              onDeliveryChange={setSelectedDeliveryId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
