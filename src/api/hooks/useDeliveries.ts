import { useCallback, useEffect, useState } from "react";
import { deliveryService } from "@/src/api/services/deliveryService";
import type { DeliveryDto, DeliveryListQuery } from "@/src/api/types/dtos";
import type { ApiError } from "@/src/api/types/common";

export function useDeliveries(initialQuery?: DeliveryListQuery) {
  const [items, setItems] = useState<DeliveryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const reload = useCallback(async (query: DeliveryListQuery = initialQuery || {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deliveryService.list(query);
      setItems(response);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [initialQuery]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, loading, error, reload };
}
