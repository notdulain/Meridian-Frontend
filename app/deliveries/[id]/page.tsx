"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function DeliveryDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [delivery, setDelivery] = useState<DeliveryDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiClient
            .get<DeliveryDto>(`/delivery/api/Deliveries/${id}`)
            .then(setDelivery)
            .catch((err: unknown) =>
                setError(err instanceof Error ? err.message : "Failed to load delivery.")
            )
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <div className="skeleton" style={{ height: 24, width: 180 }} />
                        <div className="skeleton" style={{ height: 14, width: 120, marginTop: 6 }} />
                    </div>
                </div>
                <div className="card" style={{ maxWidth: 720 }}>
                    <div className="card-body">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: 16, marginBottom: 14 }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !delivery) {
        return (
            <div className="page-container">
                <div className="alert alert-error" style={{ maxWidth: 720 }}>
                    {error || "Delivery not found."}
                </div>
                <button className="btn btn-secondary" onClick={() => router.back()}>
                    ← Back
                </button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <h1>Delivery #{delivery.id}</h1>
                        <span className={STATUS_BADGE[delivery.status]}>{delivery.status}</span>
                    </div>
                    <p>Viewing delivery request details</p>
                </div>
                <button className="btn btn-secondary" onClick={() => router.back()}>
                    ← Back
                </button>
            </div>

            <div className="card" style={{ maxWidth: 720, marginBottom: 20 }}>
                <div className="card-header">
                    <h2>Status History</h2>
                </div>
                <div className="card-body">
                    {delivery.statusHistory.length === 0 ? (
                        <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>No status changes recorded.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Changed By</th>
                                    <th>Date</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {delivery.statusHistory.map((h) => (
                                    <tr key={h.id}>
                                        <td><span className={STATUS_BADGE[h.previousStatus]}>{h.previousStatus}</span></td>
                                        <td><span className={STATUS_BADGE[h.newStatus]}>{h.newStatus}</span></td>
                                        <td>{h.changedBy}</td>
                                        <td>{new Date(h.changedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                        <td>{h.notes ?? "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="card" style={{ maxWidth: 720, marginBottom: 20 }}>
                <div className="card-header">
                    <h2>Delivery Details</h2>
                </div>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Pickup Address</label>
                            <p>{delivery.pickupAddress}</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Delivery Address</label>
                            <p>{delivery.deliveryAddress}</p>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Package Weight</label>
                            <p>{delivery.packageWeightKg} kg</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Package Volume</label>
                            <p>{delivery.packageVolumeM3} m³</p>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Deadline</label>
                            <p>{new Date(delivery.deadline).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Created By</label>
                            <p>{delivery.createdBy}</p>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Created At</label>
                            <p>{new Date(delivery.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Updated</label>
                            <p>{new Date(delivery.updatedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 720, marginBottom: 20 }}>
                <div className="card-header">
                    <h2>Assignment</h2>
                </div>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Assigned Vehicle</label>
                            <p>{delivery.assignedVehicleId ?? <span style={{ color: "var(--color-text-muted)" }}>Not assigned</span>}</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Assigned Driver</label>
                            <p>{delivery.assignedDriverId ?? <span style={{ color: "var(--color-text-muted)" }}>Not assigned</span>}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
