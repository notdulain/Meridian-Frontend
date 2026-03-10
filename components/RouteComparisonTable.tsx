import type { RouteOptionDto } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

interface RouteComparisonTableProps {
    routes: RouteOptionDto[];
    selectedRouteId: number | null;
    onSelectRoute: (routeId: number) => void;
    onAssignDriver: () => void;
}

export function RouteComparisonTable({
    routes,
    selectedRouteId,
    onSelectRoute,
    onAssignDriver
}: RouteComparisonTableProps) {
    return (
        <div className="card">
            <div className="card-header">
                <h2>Ranked Routes</h2>
                <button
                    className="btn btn-primary"
                    disabled={!selectedRouteId}
                    onClick={onAssignDriver}
                >
                    Assign Driver
                </button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Summary</th>
                            <th>Distance</th>
                            <th>Duration</th>
                            <th>Fuel Est.</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map((route, index) => {
                            const isSelected = selectedRouteId === route.id;
                            const isRecommended = index === 0; // Simulate first route is recommended

                            return (
                                <tr key={route.id} style={{ background: isSelected ? "rgba(94, 110, 128, 0.2)" : "transparent" }}>
                                    <td style={{ fontWeight: 600 }}>#{index + 1}</td>
                                    <td>{route.summary || `Route Option ${index + 1}`}</td>
                                    <td>{route.distanceKm.toFixed(1)} km</td>
                                    <td>{route.durationMinutes} mins</td>
                                    <td>LKR {route.estimatedFuelCostLkr.toLocaleString()}</td>
                                    <td>
                                        {isRecommended ? (
                                            <span className="badge badge-success" style={{ gap: '4px' }}>
                                                <CheckCircle2 size={12} />
                                                Recommended
                                            </span>
                                        ) : (
                                            <span className="badge badge-inactive">Alternative</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className={`btn ${isSelected ? "btn-primary" : "btn-secondary"}`}
                                            onClick={() => onSelectRoute(route.id)}
                                        >
                                            {isSelected ? "Selected" : "Select"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
