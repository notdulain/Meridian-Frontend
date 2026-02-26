// Deliveries list page
// TODO: Fetch from GET http://localhost:5050/delivery/api/Deliveries
// TODO: Add pagination support

import Link from "next/link";

export default function DeliveriesPage() {
    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Deliveries</h1>
                    <p>Manage and track all delivery requests</p>
                </div>
                <Link href="/deliveries/create" className="btn btn-primary">
                    + New Delivery
                </Link>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5, flexShrink: 0 }}>
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
                    </svg>
                    <input type="text" placeholder="Search deliveries…" />
                </div>
                <select className="form-select" style={{ width: "auto" }}>
                    <option value="">All Statuses</option>
                    <option>Pending</option>
                    <option>Assigned</option>
                    <option>InTransit</option>
                    <option>Delivered</option>
                    <option>Failed</option>
                    <option>Canceled</option>
                </select>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Pickup Address</th>
                            <th>Delivery Address</th>
                            <th>Weight (kg)</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Created By</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* TODO: replace with data.map(delivery => ...) */}
                        <tr>
                            <td colSpan={8}>
                                <div className="empty-state">
                                    <svg viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M1 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2H1V3zm0 3h12v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6zm4 3a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H5z" />
                                    </svg>
                                    <p>No deliveries found.</p>
                                    <Link href="/deliveries/create" className="btn btn-primary">
                                        Create first delivery
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
