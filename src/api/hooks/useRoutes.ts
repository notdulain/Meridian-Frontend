import { useCallback, useState } from "react";
import { routeService } from "@/src/api/services/routeService";
import type { RouteOptionDto } from "@/src/api/types/dtos";
import type { ApiError } from "@/src/api/types/common";

export function useRoutes() {
  const [items, setItems] = useState<RouteOptionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadAlternatives = useCallback(async (origin: string, destination: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await routeService.alternatives(origin, destination);
      setItems(response);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, loading, error, loadAlternatives };
}
