"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { dashboardService } from "@/src/api/services/dashboardService";
import type { DashboardSummaryDto } from "@/src/api/types/dtos";

export default function AdminDashboardPage() {
    const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);

    useEffect(() => {
        dashboardService.summary()
            .then(setSummary)
            .catch((err) => console.error("Failed to load dashboard summary", err));
    }, []);

    return (
        <AuthGuard allowedRoles={["Admin"]}>
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Admin Dashboard</h1>
                        <p>System overview and fleet management analytics</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <p className="stat-label">Total Vehicles</p>
                        <p className="stat-value">{summary ? (summary.availableVehicles || 0) + (summary.vehiclesOnTrip || 0) : "..."}</p>
                        <p className="stat-sub">{summary ? `${summary.availableVehicles || 0} currently available` : "Loading..."}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Active Drivers</p>
                        <p className="stat-value">{summary ? (summary.availableDrivers || 0) + (summary.activeAssignments || 0) : "..."}</p>
                        <p className="stat-sub">{summary ? `${summary.availableDrivers || 0} ready for new trips` : "Loading..."}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Pending Deliveries</p>
                        <p className="stat-value">{summary ? (summary.pendingDeliveries || 0) : "..."}</p>
                        <p className="stat-sub">{summary ? `Active in transit: ${summary.activeDeliveries || 0}` : "Loading..."}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">System Health</p>
                        <p className="stat-value" style={{ color: "var(--color-success)" }}>100%</p>
                        <p className="stat-sub">All services operational</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Recent System Activity</h2>
                    </div>
                    <div className="card-body">
                        <p style={{ color: "var(--color-text-muted)" }}>No recent critical events.</p>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
