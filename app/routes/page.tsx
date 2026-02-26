// Routes page

export default function RoutesPage() {
    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Routes</h1>
                    <p>Route optimization and fuel calculation</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Route Planner</h2>
                </div>
                <div className="card-body">
                    <p className="text-sm text-zinc-500 mb-4">
                        Select a delivery to view or optimize its route using Google Maps.
                    </p>
                    <div className="empty-state" style={{ padding: "40px 20px" }}>
                        <p>Connect to the Route Service API to load route data.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
