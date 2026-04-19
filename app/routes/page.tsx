"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/src/api/client";
import { assignmentService } from "@/src/api/services/assignmentService";
import { reportService } from "@/src/api/services/reportService";
import { routeService } from "@/src/api/services/routeService";
import { downloadBlobFile } from "@/src/lib/download";
import type { AssignmentHistoryRowDto, FuelCostReportQuery, FuelCostReportRowDto, RouteOptionDto } from "@/src/api/types/dtos";

interface VehicleRecord {
    vehicleId: number;
}

const routeExamples = [
    "Bandaranaike International Airport, Katunayake",
    "Dutch Hospital Shopping Precinct, Colombo Fort",
    "Kandy City Centre, Sri Dalada Veediya, Kandy",
    "University of Peradeniya, Peradeniya",
    "Galle International Cricket Stadium, Galle",
    "Matara Railway Station, Matara",
    "Peliyagoda Fish Market Complex, Peliyagoda",
    "Homagama Base Hospital, Homagama",
];

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
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [routeVehicleId, setRouteVehicleId] = useState("");
    const [routeDriverId, setRouteDriverId] = useState("");
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeSelectLoading, setRouteSelectLoading] = useState(false);
    const [routeError, setRouteError] = useState("");
    const [routeSuccess, setRouteSuccess] = useState("");
    const [calculatedRoute, setCalculatedRoute] = useState<RouteOptionDto | null>(null);
    const [suggestedRoutes, setSuggestedRoutes] = useState<RouteOptionDto[]>([]);
    const [historyRoutes, setHistoryRoutes] = useState<RouteOptionDto[]>([]);
    const [comparisonRoutes, setComparisonRoutes] = useState<RouteOptionDto[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState("");

    function toDateKey(value: string): string {
        return new Date(value).toISOString().slice(0, 10);
    }

    function getRouteId(route: RouteOptionDto, fallback: string): string {
        return String(route.routeId ?? route.id ?? fallback);
    }

    function formatDistance(route: RouteOptionDto): string {
        if (typeof route.distanceKm === "number") return `${route.distanceKm.toFixed(1)} km`;
        if (typeof route.distance === "string" && route.distance.trim()) return route.distance;
        if (typeof route.distanceValue === "number") return `${(route.distanceValue / 1000).toFixed(1)} km`;
        return "Not available";
    }

    function formatDuration(route: RouteOptionDto): string {
        if (typeof route.durationMinutes === "number") return `${route.durationMinutes} min`;
        if (typeof route.duration === "string" && route.duration.trim()) return route.duration;
        if (typeof route.durationValue === "number") return `${Math.round(route.durationValue / 60)} min`;
        return "Not available";
    }

    function getFuelCost(route: RouteOptionDto): number | undefined {
        if (typeof route.fuelCostLkr === "number") return route.fuelCostLkr;
        if (typeof route.estimatedFuelCostLkr === "number") return route.estimatedFuelCostLkr;
        if (typeof route.fuelCost === "number") return route.fuelCost;
        return undefined;
    }

    function formatFuelCost(route: RouteOptionDto): string {
        const fuelCost = getFuelCost(route);
        return typeof fuelCost === "number"
            ? `LKR ${fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "Not available";
    }

    function getApiErrorMessage(error: unknown, fallback: string): string {
        if (typeof error === "object" && error !== null && "message" in error) {
            const message = (error as { message?: unknown }).message;
            if (typeof message === "string" && message.trim().length > 0) return message;
        }

        return fallback;
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

    const selectableRoutes = useMemo(() => {
        const routes: RouteOptionDto[] = [];
        const seen = new Set<string>();

        const addRoute = (route: RouteOptionDto | null, fallback: string) => {
            if (!route) return;
            const id = getRouteId(route, fallback);
            if (seen.has(id)) return;
            seen.add(id);
            routes.push({ ...route, id, routeId: id });
        };

        addRoute(calculatedRoute, "calculated-route");
        suggestedRoutes.forEach((route, index) => addRoute(route, `suggested-${index + 1}`));
        historyRoutes.forEach((route, index) => addRoute(route, `history-${index + 1}`));
        comparisonRoutes.forEach((route, index) => addRoute(route, `comparison-${index + 1}`));

        return routes;
    }, [calculatedRoute, comparisonRoutes, historyRoutes, suggestedRoutes]);

    const selectedRoute = useMemo(
        () => selectableRoutes.find((route) => getRouteId(route, "route") === selectedRouteId) ?? null,
        [selectableRoutes, selectedRouteId],
    );

    const mapPreviewUrl = useMemo(() => {
        if (!origin.trim() || !destination.trim()) return "";
        return `https://maps.google.com/maps?q=${encodeURIComponent(`${origin.trim()} to ${destination.trim()}`)}&output=embed`;
    }, [destination, origin]);

    async function calculateAndCompareRoutes() {
        const trimmedOrigin = origin.trim();
        const trimmedDestination = destination.trim();

        if (!trimmedOrigin || !trimmedDestination) {
            setRouteError("Origin and destination are required.");
            return;
        }

        if (trimmedOrigin.toLowerCase() === trimmedDestination.toLowerCase()) {
            setRouteError("Destination must differ from origin.");
            return;
        }

        setRouteLoading(true);
        setRouteError("");
        setRouteSuccess("");
        setSelectedRouteId("");
        setCalculatedRoute(null);
        setSuggestedRoutes([]);
        setHistoryRoutes([]);
        setComparisonRoutes([]);

        const [calculatedResult, comparisonResult] = await Promise.allSettled([
            routeService.calculate(trimmedOrigin, trimmedDestination),
            routeService.compare(trimmedOrigin, trimmedDestination),
        ]);

        if (calculatedResult.status === "fulfilled") {
            setCalculatedRoute({
                ...calculatedResult.value,
                id: getRouteId(calculatedResult.value, "calculated-route"),
                routeId: getRouteId(calculatedResult.value, "calculated-route"),
                summary: calculatedResult.value.summary ?? "Calculated route",
            });
        }

        if (comparisonResult.status === "fulfilled") {
            setSuggestedRoutes(comparisonResult.value.suggestedRoutes);
            setHistoryRoutes(comparisonResult.value.historyRoutes);
            setComparisonRoutes(comparisonResult.value.comparison);

            const bestRoute =
                comparisonResult.value.comparison[0]
                ?? comparisonResult.value.suggestedRoutes[0]
                ?? comparisonResult.value.historyRoutes[0];

            if (bestRoute) {
                setSelectedRouteId(getRouteId(bestRoute, "best-route"));
            }
        }

        if (calculatedResult.status === "fulfilled" && !selectedRouteId) {
            setSelectedRouteId(getRouteId(calculatedResult.value, "calculated-route"));
        }

        if (calculatedResult.status === "rejected" && comparisonResult.status === "rejected") {
            setRouteError(getApiErrorMessage(calculatedResult.reason, "Unable to calculate routes for those locations."));
        } else if (calculatedResult.status === "rejected") {
            setRouteError("Live route calculation is unavailable. Saved route history and comparison data are shown when available.");
        } else if (comparisonResult.status === "rejected") {
            setRouteError("Route comparison is unavailable. The calculated route is shown when available.");
        }

        setRouteLoading(false);
    }

    function buildSelectRoutePayload(route: RouteOptionDto) {
        const distanceKm = typeof route.distanceKm === "number"
            ? route.distanceKm
            : typeof route.distanceValue === "number"
                ? route.distanceValue / 1000
                : 0;
        const durationMinutes = typeof route.durationMinutes === "number"
            ? route.durationMinutes
            : typeof route.durationValue === "number"
                ? Math.round(route.durationValue / 60)
                : 0;
        const fuelCost = getFuelCost(route) ?? 0;
        const routeId = getRouteId(route, "selected-route");

        return {
            origin: origin.trim(),
            destination: destination.trim(),
            vehicleId: routeVehicleId ? Number(routeVehicleId) : undefined,
            driverId: routeDriverId ? Number(routeDriverId) : undefined,
            route: {
                routeId,
                summary: route.summary ?? `Route ${routeId}`,
                distance: route.distance ?? `${distanceKm.toFixed(1)} km`,
                distanceValue: route.distanceValue ?? Math.round(distanceKm * 1000),
                duration: route.duration ?? `${durationMinutes} min`,
                durationValue: route.durationValue ?? durationMinutes * 60,
                fuelCost,
                polylinePoints: route.polylinePoints ?? route.polyline ?? "",
            },
        };
    }

    async function saveSelectedRoute() {
        if (!selectedRoute) {
            setRouteError("Select a route before saving.");
            return;
        }

        setRouteSelectLoading(true);
        setRouteError("");
        setRouteSuccess("");

        try {
            const saved = await routeService.select(buildSelectRoutePayload(selectedRoute));
            setRouteSuccess(`Selected route saved. Route ID: ${getRouteId(saved, getRouteId(selectedRoute, "route"))}`);
            const refreshed = await routeService.compare(origin.trim(), destination.trim());
            setHistoryRoutes(refreshed.historyRoutes);
            setSuggestedRoutes(refreshed.suggestedRoutes);
            setComparisonRoutes(refreshed.comparison);
        } catch (error) {
            setRouteError(getApiErrorMessage(error, "Unable to save the selected route."));
        } finally {
            setRouteSelectLoading(false);
        }
    }

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
                <div className="card-body" style={{ display: "grid", gap: 16 }}>
                    {routeError ? <div className="alert alert-warning">{routeError}</div> : null}
                    {routeSuccess ? <div className="alert alert-success">{routeSuccess}</div> : null}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Origin <span className="required">*</span></label>
                            <input
                                className="form-input"
                                value={origin}
                                onChange={(event) => setOrigin(event.target.value)}
                                list="route-origin-examples"
                                placeholder="Pickup address"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Destination <span className="required">*</span></label>
                            <input
                                className="form-input"
                                value={destination}
                                onChange={(event) => setDestination(event.target.value)}
                                list="route-destination-examples"
                                placeholder="Delivery address"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Vehicle ID</label>
                            <input
                                className="form-input"
                                type="number"
                                min="1"
                                value={routeVehicleId}
                                onChange={(event) => setRouteVehicleId(event.target.value)}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Driver ID</label>
                            <input
                                className="form-input"
                                type="number"
                                min="1"
                                value={routeDriverId}
                                onChange={(event) => setRouteDriverId(event.target.value)}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <datalist id="route-origin-examples">
                        {routeExamples.map((example) => <option key={example} value={example} />)}
                    </datalist>
                    <datalist id="route-destination-examples">
                        {routeExamples.map((example) => <option key={example} value={example} />)}
                    </datalist>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" className="btn btn-primary" onClick={() => void calculateAndCompareRoutes()} disabled={routeLoading}>
                            {routeLoading ? "Calculating..." : "Calculate and Compare Routes"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => void saveSelectedRoute()}
                            disabled={!selectedRoute || routeSelectLoading}
                        >
                            {routeSelectLoading ? "Saving..." : "Select Best Route"}
                        </button>
                    </div>

                    {mapPreviewUrl ? (
                        <div className="table-container" style={{ overflow: "hidden" }}>
                            <iframe
                                title="Route map preview"
                                src={mapPreviewUrl}
                                style={{ width: "100%", height: 320, border: 0, display: "block" }}
                                loading="lazy"
                            />
                        </div>
                    ) : null}

                    <div className="stats-grid">
                        <div className="stat-card">
                            <p className="stat-label">Calculated Route</p>
                            <p className="stat-value">{calculatedRoute ? formatDistance(calculatedRoute) : "--"}</p>
                            <p className="stat-sub">{calculatedRoute ? formatDuration(calculatedRoute) : "Enter route details to calculate"}</p>
                        </div>
                        <div className="stat-card">
                            <p className="stat-label">Route Options</p>
                            <p className="stat-value">{selectableRoutes.length}</p>
                            <p className="stat-sub">{suggestedRoutes.length} live, {historyRoutes.length} saved</p>
                        </div>
                        <div className="stat-card">
                            <p className="stat-label">Best Estimate</p>
                            <p className="stat-value">{selectedRoute ? formatFuelCost(selectedRoute) : "--"}</p>
                            <p className="stat-sub">{selectedRoute ? selectedRoute.summary ?? "Selected route" : "No route selected"}</p>
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Route</th>
                                    <th>Source</th>
                                    <th>Distance</th>
                                    <th>Duration</th>
                                    <th>Fuel Cost</th>
                                    <th>Rank Score</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {routeLoading ? (
                                    <tr>
                                        <td colSpan={7}>Calculating route options...</td>
                                    </tr>
                                ) : selectableRoutes.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>No route options calculated yet.</td>
                                    </tr>
                                ) : (
                                    selectableRoutes.map((route, index) => {
                                        const routeId = getRouteId(route, `route-${index + 1}`);
                                        const isSelected = selectedRouteId === routeId;
                                        const source = route.isHistorical === true
                                            ? "Historical"
                                            : historyRoutes.some((item) => getRouteId(item, "history") === routeId)
                                                ? "Historical"
                                                : suggestedRoutes.some((item) => getRouteId(item, "suggested") === routeId)
                                                    ? "Suggested"
                                                    : calculatedRoute && getRouteId(calculatedRoute, "calculated") === routeId
                                                        ? "Calculated"
                                                        : "Comparison";

                                        return (
                                            <tr key={`${routeId}-${index}`}>
                                                <td>
                                                    <strong>{route.summary ?? `Route ${index + 1}`}</strong>
                                                    <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>#{routeId}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${source === "Historical" ? "badge-assigned" : source === "Suggested" ? "badge-active" : "badge-inuse"}`}>
                                                        {source}
                                                    </span>
                                                </td>
                                                <td>{formatDistance(route)}</td>
                                                <td>{formatDuration(route)}</td>
                                                <td>{formatFuelCost(route)}</td>
                                                <td>{typeof route.rankScore === "number" ? route.rankScore.toFixed(2) : "--"}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={`btn ${isSelected ? "btn-primary" : "btn-secondary"}`}
                                                        onClick={() => setSelectedRouteId(routeId)}
                                                    >
                                                        {isSelected ? "Selected" : "Select"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
