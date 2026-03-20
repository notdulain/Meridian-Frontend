import type { VehicleItem } from "@/src/services/types";

interface VehicleSelectorProps {
  vehicles: VehicleItem[];
  loading: boolean;
  error: string;
  selectedVehicleId: string | null;
  onSelect: (vehicle: VehicleItem) => void;
}

export function VehicleSelector({ vehicles, loading, error, selectedVehicleId, onSelect }: VehicleSelectorProps) {
  return (
    <div className="card">
      <div className="card-header"><h2>Step 2: Select Vehicle</h2></div>
      <div className="card-body">
        {loading && <p>Loading recommended vehicles...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && vehicles.length === 0 && <p>Select a delivery to load recommendations.</p>}
        <div style={{ display: "grid", gap: 10 }}>
          {vehicles.map((vehicle) => {
            const selected = selectedVehicleId === vehicle.id;
            return (
              <button
                key={vehicle.id}
                type="button"
                className={`btn ${selected ? "btn-primary" : "btn-secondary"}`}
                style={{ justifyContent: "space-between" }}
                onClick={() => onSelect(vehicle)}
              >
                <span>{vehicle.licensePlate || `Vehicle #${vehicle.id}`}</span>
                <span style={{ opacity: 0.85 }}>{vehicle.reason || vehicle.type || vehicle.status || "Recommended"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
