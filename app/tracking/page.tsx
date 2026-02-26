// Live Tracking page

export default function TrackingPage() {
    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Live Tracking</h1>
                    <p>Real-time fleet tracking via SignalR</p>
                </div>
            </div>

            <div className="card" style={{ height: "calc(100vh - 200px)" }}>
                <div className="card-body" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#eaedf1" }}>
                    <div className="text-center">
                        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#5c6070", marginBottom: "8px" }}>Map Interface Placeholder</h3>
                        <p style={{ color: "#9299a8", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
                            Google Maps component will be rendered here. Needs API key and TrackingService SignalR connection.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
