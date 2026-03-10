"use client";

import { useAuthStore } from "@/store/authStore";

export default function DriverDashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Driver Dashboard</h1>
                    <p>Welcome back, {user?.email || "Driver"}</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: "24px", borderLeft: "4px solid var(--color-success)" }}>
                <div className="card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>Current Assignment: Delivery #101</h2>
                            <p style={{ color: "var(--color-text-secondary)" }}>Colombo to Kandy via Highway A1</p>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: "14px", padding: "6px 12px" }}>In Transit</span>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <p className="stat-label">Distance Remaining</p>
                    <p className="stat-value">45.2 km</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">ETA</p>
                    <p className="stat-value">1h 15m</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Est. Fuel Usage</p>
                    <p className="stat-value">5.2 L</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Route Map Update</h2>
                </div>
                <div className="card-body" style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                    <p style={{ color: "var(--color-text-muted)" }}>[Live Map View active during transit]</p>
                </div>
            </div>
        </div>
    );
}
