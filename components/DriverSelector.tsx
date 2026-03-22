import type { DriverItem } from "@/src/services/types";

interface DriverSelectorProps {
  drivers: DriverItem[];
  loading: boolean;
  error: string;
  selectedDriverId: string | null;
  onSelect: (driver: DriverItem) => void;
}

export function DriverSelector({ drivers, loading, error, selectedDriverId, onSelect }: DriverSelectorProps) {
  return (
    <div className="card">
      <div className="card-header"><h2>Step 3: Select Driver</h2></div>
      <div className="card-body">
        {loading && <p>Loading available drivers...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && drivers.length === 0 && <p>No available drivers found.</p>}
        <div style={{ display: "grid", gap: 10 }}>
          {drivers.map((driver) => {
            const selected = selectedDriverId === driver.id;
            return (
              <button
                key={driver.id}
                type="button"
                className={`btn ${selected ? "btn-primary" : "btn-secondary"}`}
                style={{ justifyContent: "space-between" }}
                onClick={() => onSelect(driver)}
              >
                <span>{driver.fullName || `Driver #${driver.id}`}</span>
                <span style={{ opacity: 0.85 }}>{driver.availability || driver.status || "Available"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
