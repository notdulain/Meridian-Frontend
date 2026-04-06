"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { AssignmentDto } from "@/lib/types";
import Link from "next/link";

interface AssigmentApiResponse {
    success: boolean;
    data: any;
    message?: string;
}

export default function AssignmentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [assignment, setAssignment] = useState<(AssignmentDto & { status?: string, notes?: string, createdAt?: string, updatedAt?: string }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        apiClient
            .get<AssigmentApiResponse>(`/assignment/api/assignments/${id}`)
            .then((res) => {
                if (res.success && res.data) {
                    const a = res.data;
                    setAssignment({
                        id: a.id || a.assignmentId,
                        deliveryId: a.deliveryId,
                        vehicleId: a.vehicleId,
                        driverId: a.driverId,
                        assignedAt: a.assignedAt,
                        assignedBy: a.assignedBy,
                        status: a.status || "Active",
                        notes: a.notes,
                        createdAt: a.createdAt,
                        updatedAt: a.updatedAt
                    });
                } else {
                    setError(res.message || "Failed to load assignment.");
                }
            })
            .catch((err: unknown) =>
                setError(err instanceof Error ? err.message : "Failed to load assignment.")
            )
            .finally(() => setLoading(false));
    }, [id]);

    async function handleDelete() {
        if (!confirm(`Are you sure you want to delete assignment #${id}?`)) return;
        setDeleting(true);
        try {
            const res = await apiClient.put<{ success: boolean; message: string }>(`/assignment/api/assignments/${id}/cancel`, {});
            if (res.success) {
                router.push(`/assignments?deleted=${id}`);
            } else {
                setError(res.message || "Failed to delete assignment.");
                setDeleting(false);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to delete assignment.");
            setDeleting(false);
        }
    }

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

    if (error || !assignment) {
        return (
            <div className="page-container">
                <div className="alert alert-error" style={{ maxWidth: 720 }}>
                    {error || "Assignment not found."}
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
                        <h1>Assignment #{assignment.id}</h1>
                        <span className={`badge ${assignment.status === 'Active' ? 'badge-intransit' : assignment.status === 'Completed' ? 'badge-delivered' : 'badge-canceled'}`}>
                            {assignment.status || "Active"}
                        </span>
                    </div>
                    <p>Viewing assignment details</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? "Deleting…" : "Delete Assignment"}
                    </button>
                    <button className="btn btn-secondary" onClick={() => router.back()}>
                        ← Back
                    </button>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 720, marginBottom: 20 }}>
                <div className="card-header">
                    <h2>Assignment Details</h2>
                </div>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Delivery</label>
                            <p>
                                <Link href={`/deliveries/${assignment.deliveryId}`} style={{ color: "var(--color-primary)" }}>
                                    Delivery #{assignment.deliveryId}
                                </Link>
                            </p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Vehicle</label>
                            <p>Vehicle #{assignment.vehicleId}</p>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Driver</label>
                            <p>Driver #{assignment.driverId}</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Assigned By</label>
                            <p>{assignment.assignedBy}</p>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Assigned At</label>
                            <p>{new Date(assignment.assignedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Updated</label>
                            <p>{assignment.updatedAt ? new Date(assignment.updatedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</p>
                        </div>
                    </div>
                    {assignment.notes && (
                        <div className="form-row">
                            <div className="form-group" style={{ flex: '1 1 100%' }}>
                                <label className="form-label">Notes</label>
                                <p style={{ whiteSpace: "pre-wrap" }}>{assignment.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
