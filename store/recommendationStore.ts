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

function normalizeRecommendations(payload: unknown): VehicleRecommendation[] {
  const source = Array.isArray(payload) ? payload : [];

  return source
    .map((item): VehicleRecommendation | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;

      return {
        vehicleId: String(record.vehicleId ?? record.id ?? ""),
        plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : undefined,
        make: typeof record.make === "string" ? record.make : undefined,
        model: typeof record.model === "string" ? record.model : undefined,
        currentLocation: typeof record.currentLocation === "string" ? record.currentLocation : undefined,
        distanceToPickupKm: asNumber(record.distanceToPickupKm),
        reason: String(record.recommendationReason ?? record.reason ?? "Recommendation generated from current route conditions"),
        score: asNumber(record.matchScore ?? record.score),
      };
    })
    .filter((item): item is VehicleRecommendation => Boolean(item?.vehicleId))
    .sort((a, b) => b.score - a.score);
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
        recommendations,
        loading: false,
        error: null,
      });
    } catch {
      console.warn("Failed to load vehicle recommendations");
      set({
        recommendations: [],
        loading: false,
        error: "Failed to load vehicle recommendations.",
      });
    }
  },
  reset: () => set({ recommendations: [], loading: false, error: null }),
}));
