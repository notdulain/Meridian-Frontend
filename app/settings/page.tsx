// Settings page

export default function SettingsPage() {
    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Settings</h1>
                    <p>System configuration and preferences</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 680 }}>
                <div className="card-header">
                    <h2>API Connections</h2>
                </div>
                <div className="card-body indent">
                    <div className="form-group">
                        <label className="form-label">Gateway URL</label>
                        <input
                            type="text"
                            className="form-input"
                            value={process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:5050"}
                            disabled
                        />
                        <p className="form-hint">Configured via NEXT_PUBLIC_GATEWAY_URL</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
