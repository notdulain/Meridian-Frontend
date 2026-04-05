"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/src/api/client";
import { assignmentService } from "@/src/api/services/assignmentService";
import { reportService } from "@/src/api/services/reportService";
import { downloadBlobFile } from "@/src/lib/download";
import type { AssignmentHistoryRowDto, FuelCostReportQuery, FuelCostReportRowDto } from "@/src/api/types/dtos";

interface VehicleRecord {
    vehicleId: number;
}

export default function RoutesPage() {
    const [rows, setRows] = useState<FuelCostReportRowDto[]>([]);
    const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reportVehicleFilter, setReportVehicleFilter] = useState("");
    const [reportStartDate, setReportStartDate] = useState("");
    const [reportEndDate, setReportEndDate] = useState("");
    const [assignmentHistoryRows, setAssignmentHistoryRows] = useState<AssignmentHistoryRowDto[]>([]);
    const [crossRefLoading, setCrossRefLoading] = useState(false);
    const [crossRefError, setCrossRefError] = useState("");
    const [exportLoading, setExportLoading] = useState(false);

    function toDateKey(value: string): string {
        return new Date(value).toISOString().slice(0, 10);
    }

    const loadAssignmentCrossReference = useCallback(async (fuelRows: FuelCostReportRowDto[], query?: FuelCostReportQuery) => {
        if (fuelRows.length === 0) {
            setAssignmentHistoryRows([]);
            setCrossRefError("");
            return;
        }

        setCrossRefLoading(true);
        setCrossRefError("");

        try {
            const timestamps = fuelRows.map((row) => new Date(row.periodStartUtc).getTime());
            const minTimestamp = Math.min(...timestamps);
            const maxTimestamp = Math.max(...timestamps);

            const minDate = new Date(minTimestamp);
            const maxDate = new Date(maxTimestamp);
            const maxDateExclusive = new Date(Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth(), maxDate.getUTCDate() + 1));

            const historyRows = await assignmentService.history({
                fromDate: query?.startDateUtc ?? minDate.toISOString(),
                toDate: query?.endDateUtc ?? maxDateExclusive.toISOString(),
                page: 1,
                pageSize: 1000,
            });

            setAssignmentHistoryRows(Array.isArray(historyRows) ? historyRows : []);
        } catch {
            setAssignmentHistoryRows([]);
            setCrossRefError("Unable to cross-reference assignment data.");
        } finally {
            setCrossRefLoading(false);
        }
    }, []);

    const loadFuelCostReport = useCallback(async (query?: FuelCostReportQuery) => {
        setLoading(true);
        setError("");

        try {
            const response = await reportService.fuelCost(query);
            const fuelRows = Array.isArray(response) ? response : [];
            setRows(fuelRows);
            await loadAssignmentCrossReference(fuelRows, query);
        } catch {
            setError("Unable to load fuel cost report.");
            setAssignmentHistoryRows([]);
        } finally {
            setLoading(false);
        }
    }, [loadAssignmentCrossReference]);

    const loadVehicles = useCallback(async () => {
        try {
            const response = await apiClient.get<{ data?: VehicleRecord[] }>("/vehicle/api/vehicles", {
                params: { page: 1, pageSize: 100 },
            });

            setVehicles(Array.isArray(response.data?.data) ? response.data.data : []);
        } catch {
            setVehicles([]);
        }
    }, []);

    useEffect(() => {
        void loadVehicles();
        void loadFuelCostReport();
    }, [loadFuelCostReport, loadVehicles]);

    const vehicleOptions = useMemo(() => {
        const seen = new Set<number>();

        for (const vehicle of vehicles) {
            if (typeof vehicle.vehicleId === "number") {
                seen.add(vehicle.vehicleId);
            }
        }

        for (const row of rows) {
            if (typeof row.vehicleId === "number") {
                seen.add(row.vehicleId);
            }
        }

        const selectedVehicleId = Number(reportVehicleFilter);
        if (reportVehicleFilter !== "" && !Number.isNaN(selectedVehicleId)) {
            seen.add(selectedVehicleId);
        }

        return Array.from(seen).sort((a, b) => a - b);
    }, [rows, reportVehicleFilter, vehicles]);

    function buildFuelCostQuery(): FuelCostReportQuery | null {
        if (reportStartDate && reportEndDate && reportEndDate < reportStartDate) {
            setError("End date must be greater than or equal to start date.");
            return null;
        }

        const query: FuelCostReportQuery = {};

        if (reportVehicleFilter !== "") {
            query.vehicleId = Number(reportVehicleFilter);
        }

        if (reportStartDate) {
            query.startDateUtc = new Date(`${reportStartDate}T00:00:00.000Z`).toISOString();
        }

        if (reportEndDate) {
            const endExclusive = new Date(`${reportEndDate}T00:00:00.000Z`);
            endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
            query.endDateUtc = endExclusive.toISOString();
        }

        return query;
    }

    async function applyFilters() {
        const query = buildFuelCostQuery();
        if (query === null) {
            return;
        }

        await loadFuelCostReport(query);
    }

    async function clearFilters() {
        setReportVehicleFilter("");
        setReportStartDate("");
        setReportEndDate("");
        await loadFuelCostReport();
    }

    async function exportFuelCostReportCsv() {
        const query = buildFuelCostQuery();
        if (query === null) {
            return;
        }

        setExportLoading(true);
        setError("");

        try {
            const payload = Object.keys(query).length === 0 ? undefined : query;
            const file = await reportService.fuelCostCsv(payload);
            downloadBlobFile(file, "fuel-cost-report.csv");
        } catch {
            setError("Unable to export fuel cost report.");
        } finally {
            setExportLoading(false);
        }
    }

    const totalFuelCost = useMemo(
        () => rows.reduce((sum, row) => sum + row.totalFuelCostLkr, 0),
        [rows],
    );

    const assignmentMatchCountByKey = useMemo(() => {
        const keyToAssignments = new Map<string, Set<number>>();

        for (const row of assignmentHistoryRows) {
            const vehicleId = row.vehicleId;
            const driverId = row.driverId;
            const timestamp = row.changedAt ?? row.assignedAt ?? row.createdAt;
            const action = row.action?.toLowerCase();

            if (typeof vehicleId !== "number" || typeof driverId !== "number" || !timestamp) {
                continue;
            }

            if (action && action !== "created") {
                continue;
            }

            const dateKey = toDateKey(timestamp);
            const key = `${vehicleId}-${driverId}-${dateKey}`;
            const assignmentIdentity = typeof row.assignmentId === "number"
                ? row.assignmentId
                : Number(`${vehicleId}${driverId}${new Date(timestamp).getTime()}`);

            if (!keyToAssignments.has(key)) {
                keyToAssignments.set(key, new Set<number>());
            }

            keyToAssignments.get(key)?.add(assignmentIdentity);
        }

        return new Map<string, number>(
            Array.from(keyToAssignments.entries()).map(([key, ids]) => [key, ids.size]),
        );
    }, [assignmentHistoryRows]);

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
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => void exportFuelCostReportCsv()}
                            disabled={loading || exportLoading}
                        >
                            {exportLoading ? "Exporting..." : "Export CSV"}
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {error ? <div className="alert alert-warning">{error}</div> : null}

                    <div className="form-row mb-4">
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input
                                className="form-input"
                                type="date"
                                value={reportStartDate}
                                onChange={(event) => setReportStartDate(event.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input
                                className="form-input"
                                type="date"
                                value={reportEndDate}
                                onChange={(event) => setReportEndDate(event.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Vehicle</label>
                            <select
                                className="form-select"
                                value={reportVehicleFilter}
                                onChange={(event) => setReportVehicleFilter(event.target.value)}
                            >
                                <option value="">All Vehicles</option>
                                {vehicleOptions.map((vehicleId) => (
                                    <option key={vehicleId} value={String(vehicleId)}>
                                        #{vehicleId}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row mb-4">
                        <button type="button" className="btn btn-primary" onClick={() => void applyFilters()} disabled={loading}>
                            {loading ? "Applying..." : "Apply Filters"}
                        </button>
                        <button type="button" className="btn" onClick={() => void clearFilters()} disabled={loading}>
                            Clear Filters
                        </button>
                    </div>

                    {crossRefError ? <div className="alert alert-warning">{crossRefError}</div> : null}

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
                                    <th>Assignments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8}>Loading fuel cost data...</td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={8}>No fuel cost data available.</td>
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
                                            <td>
                                                {crossRefLoading
                                                    ? "..."
                                                    : (assignmentMatchCountByKey.get(`${row.vehicleId}-${row.driverId}-${toDateKey(row.periodStartUtc)}`) ?? 0)}
                                            </td>
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
