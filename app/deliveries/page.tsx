"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { DeliveryDto, DeliveryStatus } from "@/lib/types";
import { reportService } from "@/src/api/services/reportService";
import type { DeliverySuccessReportDto, DeliverySuccessReportQuery } from "@/src/api/types/dtos";

type ReportTimePeriod = "all" | "today" | "last7Days" | "last30Days" | "last90Days" | "custom";

const REPORT_TIME_PERIOD_LABEL: Record<ReportTimePeriod, string> = {
    all: "All Time",
    today: "Today",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days",
    custom: "Custom Range",
};

const STATUS_BADGE: Record<DeliveryStatus, string> = {
    Pending:   "badge badge-pending",
    Assigned:  "badge badge-assigned",
    InTransit: "badge badge-intransit",
    Delivered: "badge badge-delivered",
    Failed:    "badge badge-failed",
    Canceled:  "badge badge-canceled",
};

function formatDeadline(iso: string) {
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function DeliveriesPage() {
    const searchParams = useSearchParams();
    const [deliveries, setDeliveries] = useState<DeliveryDto[]>([]);
    const [deliverySuccessReport, setDeliverySuccessReport] = useState<DeliverySuccessReportDto | null>(null);
    const [reportPeriod, setReportPeriod] = useState<ReportTimePeriod>("all");
    const [customReportStartDate, setCustomReportStartDate] = useState("");
    const [customReportEndDate, setCustomReportEndDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(true);
    const [error, setError] = useState("");
    const [reportError, setReportError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "">("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(() => {
        const deleted = searchParams.get("deleted");
        return deleted ? `Delivery #${deleted} was successfully deleted.` : "";
    });

    async function loadDeliverySuccessReport(query?: DeliverySuccessReportQuery) {
        setReportLoading(true);
        setReportError("");

        try {
            const report = await reportService.deliverySuccess(query);
            setDeliverySuccessReport(report);
        } catch {
            setReportError("Failed to load delivery success summary.");
        } finally {
            setReportLoading(false);
        }
    }

    function toUtcDayBounds(dateInput: string) {
        const start = new Date(`${dateInput}T00:00:00.000Z`);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        return { start, end };
    }

    function buildReportQueryByPeriod(): DeliverySuccessReportQuery | null {
        if (reportPeriod === "all") {
            return {};
        }

        if (reportPeriod === "custom") {
            if (customReportStartDate && customReportEndDate && customReportEndDate < customReportStartDate) {
                setReportError("End date must be greater than or equal to start date.");
                return null;
            }

            const query: DeliverySuccessReportQuery = {};

            if (customReportStartDate) {
                const start = toUtcDayBounds(customReportStartDate);
                query.startDateUtc = start.start.toISOString();
            }

            if (customReportEndDate) {
                const end = toUtcDayBounds(customReportEndDate);
                query.endDateUtc = end.end.toISOString();
            }

            return query;
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const start = new Date(today);
        const end = new Date(today);
        end.setUTCDate(end.getUTCDate() + 1);

        if (reportPeriod === "last7Days") {
            start.setUTCDate(start.getUTCDate() - 6);
        } else if (reportPeriod === "last30Days") {
            start.setUTCDate(start.getUTCDate() - 29);
        } else if (reportPeriod === "last90Days") {
            start.setUTCDate(start.getUTCDate() - 89);
        }

        return {
            startDateUtc: start.toISOString(),
            endDateUtc: end.toISOString(),
        };
    }

    async function applyReportPeriodFilter() {
        const query = buildReportQueryByPeriod();
        if (query === null) return;

        if (Object.keys(query).length === 0) {
            await loadDeliverySuccessReport();
            return;
        }

        await loadDeliverySuccessReport(query);
    }

    async function clearReportPeriodFilter() {
        setReportPeriod("all");
        setCustomReportStartDate("");
        setCustomReportEndDate("");
        await loadDeliverySuccessReport();
    }

    async function handleDelete(id: number) {
        if (!confirm(`Are you sure you want to delete delivery #${id}? This action cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await apiClient.delete(`/delivery/api/deliveries/${id}`);
            setDeliveries((prev) => prev.filter((d) => d.id !== id));
            setDeleteSuccess(`Delivery #${id} was successfully deleted.`);
            setTimeout(() => setDeleteSuccess(""), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to delete delivery.");
        } finally {
            setDeletingId(null);
        }
    }

    useEffect(() => {
        void loadDeliverySuccessReport();
        apiClient
            .get<DeliveryDto[]>("/delivery/api/deliveries")
            .then(setDeliveries)
            .catch((err: unknown) =>
                setError(err instanceof Error ? err.message : "Failed to load deliveries.")
            )
            .finally(() => setLoading(false));
    }, []);

            const deliveredCount = deliverySuccessReport?.deliveredCount ?? 0;
            const failedCount = deliverySuccessReport?.failedCount ?? 0;
            const cancelledCount = deliverySuccessReport?.cancelledCount ?? 0;
            const terminalCount = deliverySuccessReport?.terminalCount ?? 0;
            const deliveredShare = terminalCount > 0 ? (deliveredCount / terminalCount) * 100 : 0;
            const failedShare = terminalCount > 0 ? (failedCount / terminalCount) * 100 : 0;
            const cancelledShare = terminalCount > 0 ? (cancelledCount / terminalCount) * 100 : 0;
            const hasCustomDates = customReportStartDate !== "" || customReportEndDate !== "";

    const filtered = deliveries.filter((d) => {
        const matchesSearch =
            search === "" ||
            d.pickupAddress.toLowerCase().includes(search.toLowerCase()) ||
            d.deliveryAddress.toLowerCase().includes(search.toLowerCase()) ||
            d.createdBy.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "" || d.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Deliveries</h1>
                    <p>Manage and track all delivery requests</p>
                </div>
                <Link href="/deliveries/create" className="btn btn-primary">
                    + New Delivery
                </Link>
            </div>

            {error && (
                <div className="alert alert-error">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {error}
                </div>
            )}

            {deleteSuccess && (
                <div className="alert alert-success">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {deleteSuccess}
                </div>
            )}

            <div className="toolbar">
                <div className="search-bar">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5, flexShrink: 0 }}>
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by address or dispatcher…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="form-select"
                    style={{ width: "auto" }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus | "")}
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="InTransit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed">Failed</option>
                    <option value="Canceled">Canceled</option>
                </select>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header metric-summary-header">
                    <div>
                        <h2>Delivery Success Summary</h2>
                        <p className="metric-summary-caption">Delivered vs Failed vs Cancelled | {REPORT_TIME_PERIOD_LABEL[reportPeriod]}</p>
                    </div>
                    <div className="metric-summary-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => void loadDeliverySuccessReport()} disabled={reportLoading}>
                            {reportLoading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="delivery-success-filter">
                        <div className="delivery-success-filter-row">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Time Period</label>
                                <select
                                    className="form-select"
                                    value={reportPeriod}
                                    onChange={(event) => {
                                        setReportPeriod(event.target.value as ReportTimePeriod);
                                        setReportError("");
                                    }}
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="last7Days">Last 7 Days</option>
                                    <option value="last30Days">Last 30 Days</option>
                                    <option value="last90Days">Last 90 Days</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {reportPeriod === "custom" ? (
                                <>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Start Date</label>
                                        <input
                                            className="form-input"
                                            type="date"
                                            value={customReportStartDate}
                                            onChange={(event) => setCustomReportStartDate(event.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">End Date</label>
                                        <input
                                            className="form-input"
                                            type="date"
                                            value={customReportEndDate}
                                            onChange={(event) => setCustomReportEndDate(event.target.value)}
                                        />
                                    </div>
                                </>
                            ) : null}
                        </div>

                        <div className="delivery-success-filter-actions">
                            <button type="button" className="btn btn-primary" onClick={() => void applyReportPeriodFilter()} disabled={reportLoading}>
                                {reportLoading ? "Applying..." : "Apply"}
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={() => void clearReportPeriodFilter()}
                                disabled={reportLoading || (reportPeriod === "all" && !hasCustomDates)}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {reportError ? <div className="alert alert-warning">{reportError}</div> : null}

                    <div className="stats-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card">
                            <p className="stat-label">Success Rate</p>
                            <p className="stat-value">
                                {reportLoading && !deliverySuccessReport
                                    ? "--"
                                    : `${(deliverySuccessReport?.successRatePercentage ?? 0).toFixed(2)}%`}
                            </p>
                            <p className="stat-sub">Delivered / Terminal Deliveries</p>
                        </div>
                        <div className="stat-card">
                            <p className="stat-label">Terminal Deliveries</p>
                            <p className="stat-value">{reportLoading && !deliverySuccessReport ? "--" : terminalCount}</p>
                            <p className="stat-sub">Delivered + Failed + Cancelled</p>
                        </div>
                    </div>

                    <div className="delivery-success-breakdown">
                        <div className="delivery-success-row">
                            <div className="delivery-success-label">Delivered</div>
                            <div className="delivery-success-value">
                                {reportLoading && !deliverySuccessReport
                                    ? "--"
                                    : `${deliveredCount} (${deliveredShare.toFixed(1)}%)`}
                            </div>
                        </div>
                        <div className="delivery-success-track">
                            <div className="delivery-success-fill delivery-success-fill-delivered" style={{ width: `${deliveredShare}%` }} />
                        </div>

                        <div className="delivery-success-row">
                            <div className="delivery-success-label">Failed</div>
                            <div className="delivery-success-value">
                                {reportLoading && !deliverySuccessReport
                                    ? "--"
                                    : `${failedCount} (${failedShare.toFixed(1)}%)`}
                            </div>
                        </div>
                        <div className="delivery-success-track">
                            <div className="delivery-success-fill delivery-success-fill-failed" style={{ width: `${failedShare}%` }} />
                        </div>

                        <div className="delivery-success-row">
                            <div className="delivery-success-label">Cancelled</div>
                            <div className="delivery-success-value">
                                {reportLoading && !deliverySuccessReport
                                    ? "--"
                                    : `${cancelledCount} (${cancelledShare.toFixed(1)}%)`}
                            </div>
                        </div>
                        <div className="delivery-success-track">
                            <div className="delivery-success-fill delivery-success-fill-cancelled" style={{ width: `${cancelledShare}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Pickup Address</th>
                            <th>Delivery Address</th>
                            <th>Weight (kg)</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Created By</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 8 }).map((__, j) => (
                                        <td key={j}>
                                            <div className="skeleton" style={{ height: 16, borderRadius: 4 }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8}>
                                    <div className="empty-state">
                                        <svg viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M1 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2H1V3zm0 3h12v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6zm4 3a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H5z" />
                                        </svg>
                                        <p>
                                            {search || statusFilter
                                                ? "No deliveries match your filters."
                                                : "No deliveries found."}
                                        </p>
                                        {!search && !statusFilter && (
                                            <Link href="/deliveries/create" className="btn btn-primary">
                                                Create first delivery
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((delivery) => (
                                <tr key={delivery.id}>
                                    <td style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>
                                        #{delivery.id}
                                    </td>
                                    <td>{delivery.pickupAddress}</td>
                                    <td>{delivery.deliveryAddress}</td>
                                    <td>{delivery.packageWeightKg} kg</td>
                                    <td>{formatDeadline(delivery.deadline)}</td>
                                    <td>
                                        <span className={STATUS_BADGE[delivery.status]}>
                                            {delivery.status}
                                        </span>
                                    </td>
                                    <td>{delivery.createdBy}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <Link
                                                href={`/deliveries/${delivery.id}`}
                                                className="btn btn-secondary"
                                                style={{ padding: "4px 10px", fontSize: 12 }}
                                            >
                                                View
                                            </Link>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: "4px 10px", fontSize: 12 }}
                                                onClick={() => handleDelete(delivery.id)}
                                                disabled={deletingId === delivery.id}
                                            >
                                                {deletingId === delivery.id ? "Deleting…" : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && filtered.length > 0 && (
                <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 12 }}>
                    Showing {filtered.length} of {deliveries.length} deliveries
                </p>
            )}
        </div>
    );
}
