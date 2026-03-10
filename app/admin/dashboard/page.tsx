"use client";

export default function AdminDashboardPage() {
    return (
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
                    <p className="stat-value">124</p>
                    <p className="stat-sub">+3 this month</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Active Drivers</p>
                    <p className="stat-value">86</p>
                    <p className="stat-sub">12 currently on duty</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Pending Deliveries</p>
                    <p className="stat-value">42</p>
                    <p className="stat-sub">Requires assigning</p>
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
    );
}
