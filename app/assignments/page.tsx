"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import type { AssignmentDto } from "@/lib/types";

const CREATE_ASSIGNMENT_HREF = "/assignments/create";

type AssignmentListItem = AssignmentDto & { status?: string };

interface AssignmentApiItem {
    id?: number;
    assignmentId?: number;
    deliveryId?: number;
    vehicleId?: number;
    driverId?: number;
    assignedAt?: string;
    assignedBy?: string;
    status?: string;
}

interface AssignmentApiResponse {
    success: boolean;
    data?: AssignmentApiItem[];
    meta?: unknown;
}

function formatDate(iso: string) {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);

    async function handleDelete(id: number) {
        if (!confirm(`Are you sure you want to delete assignment #${id}?`)) return;
        setDeletingId(id);
        try {
            // Backend maps "cancel" logic which terminates the assignment and cleans up associations
            const res = await apiClient.put<{ success: boolean; message: string }>(`/assignment/api/assignments/${id}/cancel`, {});
            if (res.success) {
                setAssignments((prev) => prev.filter((a) => a.id !== id));
            } else {
                setError(res.message || "Failed to delete assignment.");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to delete assignment.");
        } finally {
            setDeletingId(null);
        }
    }

    useEffect(() => {
        apiClient
            .get<AssignmentApiResponse | AssignmentApiItem[]>("/assignment/api/assignments")
            .then((res) => {
                const source = Array.isArray(res) ? res : res.success ? res.data ?? [] : [];
                const mapped = source
                    .map((a) => ({
                        id: a.id ?? a.assignmentId ?? 0,
                        deliveryId: a.deliveryId ?? 0,
                        vehicleId: a.vehicleId ?? 0,
                        driverId: a.driverId ?? 0,
                        assignedAt: a.assignedAt ?? "",
                        assignedBy: a.assignedBy ?? "Unassigned",
                        status: a.status || "Active",
                    }))
                    .filter((assignment) => assignment.id > 0);

                setAssignments(mapped);
                if (!Array.isArray(res) && !res.success) {
                    setError("Failed to load assignments.");
                }
            })
            .catch((err: unknown) =>
                setError(err instanceof Error ? err.message : "Failed to load assignments.")
            )
            .finally(() => setLoading(false));
    }, []);

    const filtered = assignments.filter((a) => {
        const matchesSearch =
            search === "" ||
            a.assignedBy?.toLowerCase().includes(search.toLowerCase()) ||
            a.id?.toString().includes(search) ||
            a.deliveryId?.toString().includes(search);

        return matchesSearch;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Assignments</h1>
                    <p>Vehicle and driver assignments to deliveries</p>
                </div>
                <Link href={CREATE_ASSIGNMENT_HREF} className="btn btn-primary">
                    + New Assignment
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

            <div className="toolbar">
                <div className="search-bar">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5, flexShrink: 0 }}>
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by dispatcher or ID…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Delivery ID</th>
                            <th>Vehicle ID</th>
                            <th>Driver ID</th>
                            <th>Status</th>
                            <th>Assigned At</th>
                            <th>Assigned By</th>
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
                                            {search
                                                ? "No assignments match your search."
                                                : "No assignments found."}
                                        </p>
                                        {!search && (
                                            <Link href={CREATE_ASSIGNMENT_HREF} className="btn btn-primary" style={{ marginTop: 12 }}>
                                                Create first assignment
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((assignment) => (
                                <tr key={assignment.id}>
                                    <td style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>
                                        #{assignment.id}
                                    </td>
                                    <td>
                                        <Link href={`/deliveries/${assignment.deliveryId}`} style={{ color: "var(--color-primary)" }}>
                                            #{assignment.deliveryId}
                                        </Link>
                                    </td>
                                    <td>#{assignment.vehicleId}</td>
                                    <td>#{assignment.driverId}</td>
                                    <td>
                                        <span className={`badge ${assignment.status === 'Active' ? 'badge-intransit' : assignment.status === 'Completed' ? 'badge-delivered' : 'badge-canceled'}`}>
                                            {assignment.status || "Active"}
                                        </span>
                                    </td>
                                    <td>{formatDate(assignment.assignedAt)}</td>
                                    <td>{assignment.assignedBy}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <Link
                                                href={`/assignments/${assignment.id}`}
                                                className="btn btn-secondary"
                                                style={{ padding: "4px 10px", fontSize: 12 }}
                                            >
                                                View
                                            </Link>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: "4px 10px", fontSize: 12 }}
                                                onClick={() => handleDelete(assignment.id)}
                                                disabled={deletingId === assignment.id}
                                            >
                                                {deletingId === assignment.id ? "Deleting…" : "Delete"}
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
                    Showing {filtered.length} of {assignments.length} assignments
                </p>
            )}
        </div>
    );
}
