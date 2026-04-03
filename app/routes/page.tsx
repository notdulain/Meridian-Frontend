"use client";

import { useEffect, useMemo, useState } from "react";
import { reportService } from "@/src/api/services/reportService";
import type { FuelCostReportRowDto } from "@/src/api/types/dtos";

export default function RoutesPage() {
    const [rows, setRows] = useState<FuelCostReportRowDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadFuelCostReport() {
        setLoading(true);
        setError("");

        try {
            const response = await reportService.fuelCost();
            setRows(Array.isArray(response) ? response : []);
        } catch {
            setError("Unable to load fuel cost report.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadFuelCostReport();
    }, []);

    const totalFuelCost = useMemo(
        () => rows.reduce((sum, row) => sum + row.totalFuelCostLkr, 0),
        [rows],
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Routes</h1>
                    <p>Route optimization and fuel calculation</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header metric-summary-header">
                    <div>
                        <h2>Fuel Cost Analysis</h2>
                        <p className="metric-summary-caption">Cost breakdown by vehicle, driver, and period</p>
                    </div>
                    <div className="metric-summary-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => void loadFuelCostReport()} disabled={loading}>
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {error ? <div className="alert alert-warning">{error}</div> : null}

                    <div className="stats-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card">
                            <p className="stat-label">Total Fuel Cost</p>
                            <p className="stat-value">
                                {loading ? "--" : `LKR ${totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            </p>
                            <p className="stat-sub">Sum of all rows in current breakdown</p>
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Period</th>
                                    <th>Vehicle ID</th>
                                    <th>Driver ID</th>
                                    <th>Trips</th>
                                    <th>Distance (km)</th>
                                    <th>Fuel (L)</th>
                                    <th>Total Cost (LKR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7}>Loading fuel cost data...</td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>No fuel cost data available.</td>
                                    </tr>
                                ) : (
                                    rows.map((row, index) => (
                                        <tr key={`${row.vehicleId}-${row.driverId}-${row.periodStartUtc}-${index}`}>
                                            <td>{new Date(row.periodStartUtc).toLocaleDateString()}</td>
                                            <td>#{row.vehicleId}</td>
                                            <td>#{row.driverId}</td>
                                            <td>{row.tripCount}</td>
                                            <td>{row.totalDistanceKm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>{row.totalFuelConsumptionLitres.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>LKR {row.totalFuelCostLkr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Route Planner</h2>
                </div>
                <div className="card-body">
                    <p className="text-sm text-zinc-500 mb-4">
                        Select a delivery to view or optimize its route using Google Maps.
                    </p>
                    <div className="empty-state" style={{ padding: "40px 20px" }}>
                        <p>Connect to the Route Service API to load route data.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
