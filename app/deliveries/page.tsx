"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { DeliveryDto, DeliveryStatus } from "@/lib/types";

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "">("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(() => {
        const deleted = searchParams.get("deleted");
        return deleted ? `Delivery #${deleted} was successfully deleted.` : "";
    });

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
        apiClient
            .get<DeliveryDto[]>("/delivery/api/deliveries")
            .then(setDeliveries)
            .catch((err: unknown) =>
                setError(err instanceof Error ? err.message : "Failed to load deliveries.")
            )
            .finally(() => setLoading(false));
    }, []);

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
