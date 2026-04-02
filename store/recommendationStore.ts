import { create } from "zustand";
import apiClient from "@/src/api/client";
import type { VehicleRecommendation } from "@/lib/types/tracking";

interface RecommendationState {
  recommendations: VehicleRecommendation[];
  loading: boolean;
  error: string | null;
  fetchRecommendations: (deliveryId: string) => Promise<void>;
  reset: () => void;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const numeric = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  return 0;
}

function normalizeRecommendationSource(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.recommendations)) return record.recommendations;
  if (Array.isArray(record.routes)) return record.routes;
  if (Array.isArray(record.data)) return record.data;

  return [];
}

function normalizeRecommendations(payload: unknown): VehicleRecommendation[] {
  return normalizeRecommendationSource(payload)
    .map((item): VehicleRecommendation | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;

      return {
        vehicleId: String(record.vehicleId ?? record.id ?? ""),
        driverName: String(record.driverName ?? record.driver ?? "Unassigned"),
        distanceKm: asNumber(record.distanceKm ?? record.distance ?? record.distanceValue),
        etaMinutes: asNumber(record.etaMinutes ?? record.durationMinutes ?? record.eta ?? record.duration),
        fuelCost: asNumber(
          record.fuelCost
          ?? record.fuelCostLkr
          ?? record.estimatedFuelCost
          ?? record.estimatedFuelCostLkr,
        ),
        reason: String(record.reason ?? "Recommendation generated from current route conditions"),
        score: asNumber(record.score),
      };
    })
    .filter((item): item is VehicleRecommendation => Boolean(item?.vehicleId))
    .sort((a, b) => b.score - a.score);
}

function buildMockRecommendations(deliveryId: string): VehicleRecommendation[] {
  return [
    {
      vehicleId: "V001",
      driverName: "John Perera",
      distanceKm: 6.2,
      etaMinutes: 14,
      fuelCost: 1250,
      reason: `Top match for delivery ${deliveryId}`,
      score: 9.4,
    },
    {
      vehicleId: "V002",
      driverName: "Alex Fernando",
      distanceKm: 8.1,
      etaMinutes: 18,
      fuelCost: 1410,
      reason: "Lower fuel cost option",
      score: 8.7,
    },
  ];
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  recommendations: [],
  loading: false,
  error: null,
  fetchRecommendations: async (deliveryId: string) => {
    set({ loading: true, error: null });

    try {
      console.info("[recommendations] loading", deliveryId);
      const response = await apiClient.get<unknown>(`/delivery/api/deliveries/${deliveryId}/recommend-vehicles`);
      const recommendations = normalizeRecommendations(response.data);

      set({
        recommendations: recommendations.length > 0 ? recommendations : buildMockRecommendations(deliveryId),
        loading: false,
        error: null,
      });
    } catch (_error) {
      console.warn("Failed to load vehicle recommendations");
      set({
        recommendations: buildMockRecommendations(deliveryId),
        loading: false,
        error: "Showing fallback recommendations.",
      });
    }
  },
  reset: () => set({ recommendations: [], loading: false, error: null }),
}));
