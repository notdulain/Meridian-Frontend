"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import type { AssignmentDto } from "@/lib/types";

interface AssignmentApiResponse {
    success: boolean;
    data: any[];
    meta: any;
}

function formatDate(iso: string) {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<(AssignmentDto & { status?: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        apiClient
            .get<AssignmentApiResponse>("/assignment/api/assignments")
            .then((res) => {
                if (res.success && res.data) {
                    const mapped = res.data.map((a: any) => ({
                        id: a.id || a.assignmentId,
                        deliveryId: a.deliveryId,
                        vehicleId: a.vehicleId,
                        driverId: a.driverId,
                        assignedAt: a.assignedAt,
                        assignedBy: a.assignedBy,
                        status: a.status || "Active"
                    }));
                    setAssignments(mapped);
                } else if (Array.isArray(res)) {
                    setAssignments(res);
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
                <button className="btn btn-primary">+ New Assignment</button>
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
                                            <button className="btn btn-primary" style={{ marginTop: 12 }}>
                                                Create first assignment
                                            </button>
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
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: "4px 10px", fontSize: 12 }}
                                                onClick={() => alert('View details implies a separate page. ID: ' + assignment.id)}
                                            >
                                                View
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
