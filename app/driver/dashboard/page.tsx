"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { assignmentService } from "@/src/services/assignmentService";
import { useLiveGeolocation } from "@/src/hooks/useLiveGeolocation";

export default function DriverDashboardPage() {
    const { user } = useAuthStore();
    
    const [activeAssignment, setActiveAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [trackingEnabled, setTrackingEnabled] = useState(false);

    // Fetch driver's active assignment
    useEffect(() => {
        let isMounted = true;
        
        async function fetchAssignment() {
            if (!user?.id) return;
            try {
                const assignment = await assignmentService.getActiveForDriver(user.id);
                if (isMounted) {
                    setActiveAssignment(assignment);
                    // Automatically enable tracking if an active assignment exists
                    setTrackingEnabled(Boolean(assignment));
                }
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
    }, [user?.id]);

    // Initialize GPS tracking (MER-83)
    const { error: gpsError, lastSent } = useLiveGeolocation({
        assignmentId: activeAssignment?.assignmentId,
        driverId: user?.id,
        enabled: trackingEnabled,
    });

    return (
        <AuthGuard allowedRoles={["Driver"]}>
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Driver Dashboard</h1>
                        <p>Welcome back, {user?.name || user?.email || "Driver"}</p>
                    </div>
                    {activeAssignment && (
                        <div>
                            <button 
                                className={`btn ${trackingEnabled ? 'btn-danger' : 'btn-success'}`}
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
                                        <span className="badge badge-success" style={{ fontSize: "14px", padding: "6px 12px", marginBottom: "8px" }}>In Transit</span>
                                        {lastSent && (
                                            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                                Last GPS sync: {lastSent.toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {gpsError && (
                            <div className="alert alert-error" style={{ marginBottom: "24px" }}>
                                <strong>GPS Error:</strong> {gpsError}
                            </div>
                        )}

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

                        <div className="card" style={{ marginTop: "24px" }}>
                            <div className="card-header">
                                <h2>Route Map Update</h2>
                            </div>
                            <div className="card-body" style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                                <p style={{ color: "var(--color-text-muted)" }}>[Live Map View active during transit]</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthGuard>
    );
}
