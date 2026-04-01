"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { assignmentService } from "@/src/services/assignmentService";
import { driverService, type DriverProfile } from "@/src/services/driverService";
import { useLiveGeolocation } from "@/src/hooks/useLiveGeolocation";
import { DriverLiveMap } from "@/components/DriverLiveMap";

interface ActiveAssignment {
    assignmentId: number;
    deliveryId: number;
    vehicleId: number;
}

export default function DriverDashboardPage() {
    const { user } = useAuthStore();

    const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
    const [activeAssignment, setActiveAssignment] = useState<ActiveAssignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingEnabled, setTrackingEnabled] = useState(false);

    // Fetch driver's active assignment on mount
    useEffect(() => {
        let isMounted = true;

        async function fetchAssignment() {
            try {
                const profile = await driverService.me();
                if (!isMounted) return;

                setDriverProfile(profile);

                if (!profile?.driverId) {
                    setActiveAssignment(null);
                    setTrackingEnabled(false);
                    return;
                }

                const assignment = await assignmentService.getActiveForDriver(profile.driverId) as ActiveAssignment | null;
                if (!isMounted) return;

                setActiveAssignment(assignment);
                // Automatically enable tracking when an active assignment exists
                setTrackingEnabled(Boolean(assignment));
            } catch (err) {
                console.error("Failed to load active assignment", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        void fetchAssignment();

        return () => {
            isMounted = false;
            setTrackingEnabled(false);
        };
    }, []);

    // GPS tracking hook — now also returns the live position for the map
    const { error: gpsError, lastSent, position } = useLiveGeolocation({
        assignmentId: activeAssignment?.assignmentId,
        driverId: driverProfile?.driverId,
        enabled: trackingEnabled,
    });

    return (
        <AuthGuard allowedRoles={["Driver"]}>
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Driver Dashboard</h1>
                        <p>Welcome back, {driverProfile?.fullName || user?.name || user?.email || "Driver"}</p>
                    </div>
                    {activeAssignment && (
                        <div>
                            <button
                                className={`btn ${trackingEnabled ? "btn-danger" : "btn-success"}`}
                                onClick={() => setTrackingEnabled(!trackingEnabled)}
                            >
                                {trackingEnabled ? "Pause Tracking" : "Resume Tracking"}
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="card"><div className="card-body">Loading your route data...</div></div>
                ) : !activeAssignment ? (
                    <div className="card">
                        <div className="card-body" style={{ textAlign: "center", padding: "40px 20px" }}>
                            <h3>No Active Assignments</h3>
                            <p style={{ color: "var(--color-text-secondary)" }}>
                                You are currently off-duty or have no pending deliveries. Wait for dispatch.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Assignment status card */}
                        <div className="card" style={{ marginBottom: "24px", borderLeft: "4px solid var(--color-success)" }}>
                            <div className="card-body">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>
                                            Current Assignment: #{activeAssignment.assignmentId}
                                        </h2>
                                        <p style={{ color: "var(--color-text-secondary)" }}>
                                            Delivery ID: {activeAssignment.deliveryId}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                        <span className="badge badge-success" style={{ fontSize: "14px", padding: "6px 12px", marginBottom: "8px" }}>
                                            In Transit
                                        </span>
                                        {lastSent && (
                                            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                                Last GPS sync: {lastSent.toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GPS error banner */}
                        {gpsError && (
                            <div className="alert alert-error" style={{ marginBottom: "24px" }}>
                                <strong>GPS Error:</strong> {gpsError}
                            </div>
                        )}

                        {/* Quick-stat cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <p className="stat-label">GPS Tracking</p>
                                <p className="stat-value" style={{ color: trackingEnabled ? "var(--color-success)" : "var(--color-danger)" }}>
                                    {trackingEnabled ? "ACTIVE" : "PAUSED"}
                                </p>
                            </div>
                            <div className="stat-card">
                                <p className="stat-label">Location Sent</p>
                                <p className="stat-value">{lastSent ? "Yes" : "Waiting..."}</p>
                            </div>
                            <div className="stat-card">
                                <p className="stat-label">Vehicle ID</p>
                                <p className="stat-value">#{activeAssignment.vehicleId}</p>
                            </div>
                        </div>

                        {/* Live position map */}
                        <div className="card" style={{ marginTop: "24px" }}>
                            <div className="card-header">
                                <h2>Live Position</h2>
                            </div>
                            <div className="card-body" style={{ padding: 0, height: "360px", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
                                {trackingEnabled || position ? (
                                    <DriverLiveMap position={position} />
                                ) : (
                                    <div style={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "rgba(0,0,0,0.2)",
                                        color: "var(--color-text-muted)",
                                        flexDirection: "column",
                                        gap: "8px",
                                    }}>
                                        <span style={{ fontSize: "24px" }}>📍</span>
                                        <span>GPS tracking is paused. Resume to see live position.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthGuard>
    );
}
