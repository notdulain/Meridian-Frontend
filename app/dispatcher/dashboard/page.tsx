"use client";

import { useState, useEffect } from "react";
import { RouteMap } from "@/components/RouteMap";
import { RouteComparisonTable } from "@/components/RouteComparisonTable";
import { routeService } from "@/services/routeService";
import type { RouteOptionDto } from "@/lib/types";

// Mock coordinates for demonstration
const mockPath1: [number, number][] = [[6.9271, 79.8612], [6.9312, 79.8654], [6.9350, 79.8700]];
const mockPath2: [number, number][] = [[6.9271, 79.8612], [6.9200, 79.8600], [6.9350, 79.8700]];

export default function DispatcherDashboardPage() {
    const [deliveries] = useState([{ id: 101, title: "Delivery #101 - Colombo to Kandy" }]);
    const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);
    const [routes, setRoutes] = useState<RouteOptionDto[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

    const handleSelectDelivery = async (id: number) => {
        setSelectedDelivery(id);
        const data = await routeService.getRankedRoutes(id);

        // Mock fallback if API is not running
        if (!data || data.length === 0) {
            setRoutes([
                { id: 1, deliveryId: id, distanceKm: 115.4, durationMinutes: 180, estimatedFuelCostLkr: 4500, isSelected: false, summary: "Highway A1" },
                { id: 2, deliveryId: id, distanceKm: 122.1, durationMinutes: 210, estimatedFuelCostLkr: 5200, isSelected: false, summary: "Scenic Route B2" }
            ]);
        } else {
            setRoutes(data);
        }
        setSelectedRouteId(null);
    };

    const mapRoutes = routes.map((r, i) => ({
        id: r.id,
        path: i === 0 ? mockPath1 : mockPath2,
        isRecommended: i === 0
    }));

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Dispatcher Dashboard</h1>
                    <p>Assign routes and manage drivers</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: "24px" }}>
                <div className="card-header">
                    <h2>Pending Deliveries</h2>
                </div>
                <div className="card-body">
                    <div style={{ display: "flex", gap: "12px" }}>
                        {deliveries.map(d => (
                            <button
                                key={d.id}
                                className={`btn ${selectedDelivery === d.id ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => handleSelectDelivery(d.id)}
                            >
                                {d.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {selectedDelivery && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <RouteComparisonTable
                            routes={routes}
                            selectedRouteId={selectedRouteId}
                            onSelectRoute={setSelectedRouteId}
                            onAssignDriver={() => alert(`Driver assigned to route ${selectedRouteId}`)}
                        />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <RouteMap
                            mapRoutes={mapRoutes}
                            selectedRouteId={selectedRouteId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
