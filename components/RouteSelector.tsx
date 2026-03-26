import type { RouteItem } from "@/src/services/types";

interface RouteSelectorProps {
  alternatives: RouteItem[];
  history: RouteItem[];
  loading: boolean;
  error: string;
  selectedRouteId: string | null;
  onSelect: (route: RouteItem) => void;
}

function renderRoute(route: RouteItem) {
  return `${route.summary || `Route #${route.id}`} | ${route.distanceKm ?? "-"} km | ${route.durationMinutes ?? "-"} min | LKR ${route.estimatedFuelCostLkr ?? "-"}`;
}

export function RouteSelector({ alternatives, history, loading, error, selectedRouteId, onSelect }: RouteSelectorProps) {
  return (
    <div className="card">
      <div className="card-header"><h2>Step 4: Select Route</h2></div>
      <div className="card-body" style={{ display: "grid", gap: 12 }}>
        {loading && <p>Loading route alternatives and history...</p>}
        {error && <div className="alert alert-error">{error}</div>}

        <div>
          <p style={{ marginBottom: 8, fontWeight: 600 }}>Current Alternatives</p>
          {alternatives.length === 0 ? <p>No alternatives available.</p> : (
            <div style={{ display: "grid", gap: 8 }}>
              {alternatives.map((route) => {
                const selected = selectedRouteId === route.id;
                return (
                  <button
                    key={route.id}
                    type="button"
                    className={`btn ${selected ? "btn-primary" : "btn-secondary"}`}
                    style={{ justifyContent: "flex-start" }}
                    onClick={() => onSelect(route)}
                  >
                    {renderRoute(route)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="divider" />

        <div>
          <p style={{ marginBottom: 8, fontWeight: 600 }}>Route History (Comparison)</p>
          {history.length === 0 ? <p>No history available for this origin/destination.</p> : (
            <div style={{ display: "grid", gap: 8 }}>
              {history.map((route) => (
                <div key={route.id} className="btn btn-secondary" style={{ justifyContent: "flex-start", cursor: "default" }}>
                  {renderRoute(route)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
