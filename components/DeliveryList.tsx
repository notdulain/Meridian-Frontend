import type { DeliveryItem } from "@/src/services/types";

interface DeliveryListProps {
  deliveries: DeliveryItem[];
  loading: boolean;
  error: string;
  selectedDeliveryId: string | null;
  onSelect: (delivery: DeliveryItem) => void;
}

export function DeliveryList({ deliveries, loading, error, selectedDeliveryId, onSelect }: DeliveryListProps) {
  return (
    <div className="card">
      <div className="card-header"><h2>Step 1: Select Delivery</h2></div>
      <div className="card-body">
        {loading && <p>Loading deliveries...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && deliveries.length === 0 && <p>No deliveries found.</p>}
        <div style={{ display: "grid", gap: 10 }}>
          {deliveries.map((delivery) => {
            const selected = selectedDeliveryId === delivery.id;
            return (
              <button
                key={delivery.id}
                type="button"
                className={`btn ${selected ? "btn-primary" : "btn-secondary"}`}
                style={{ justifyContent: "space-between" }}
                onClick={() => onSelect(delivery)}
              >
                <span>{delivery.orderNumber || `Order #${delivery.id}`}</span>
                <span style={{ opacity: 0.85 }}>{delivery.destination || delivery.deliveryAddress || "N/A"} - {delivery.status || "Unknown"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
