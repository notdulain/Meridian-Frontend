// Dashboard — overview of key metrics across all services
// TODO: Replace static values with real API calls using apiClient

export default function DashboardPage() {
  const stats = [
    { label: "Active Deliveries", value: "—", sub: "Pending + In Transit" },
    { label: "Available Vehicles", value: "—", sub: "Ready for assignment" },
    { label: "Available Drivers", value: "—", sub: "On duty" },
    { label: "Deliveries Today", value: "—", sub: "All statuses" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Fleet management overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value skeleton" style={{ height: 36, width: 60, borderRadius: 4 }} />
            <p className="stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent deliveries */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Deliveries</h2>
          <a href="/deliveries" style={{ fontSize: 13, color: "var(--color-primary)" }}>
            View all →
          </a>
        </div>
        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Pickup</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <p>Connect the API to display recent deliveries.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
