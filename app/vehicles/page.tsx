// Vehicles list page
// TODO: Fetch from GET http://localhost:5050/vehicle/api/Vehicles

import Link from "next/link";

export default function VehiclesPage() {
    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Vehicles</h1>
                    <p>Manage fleet vehicles, capacity, and availability</p>
                </div>
                <button className="btn btn-primary">+ Add Vehicle</button>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5, flexShrink: 0 }}>
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
                    </svg>
                    <input type="text" placeholder="Search by plate or type…" />
                </div>
                <select className="form-select" style={{ width: "auto" }}>
                    <option value="">All Statuses</option>
                    <option>Available</option>
                    <option>InUse</option>
                    <option>Maintenance</option>
                    <option>OutOfService</option>
                </select>
                <select className="form-select" style={{ width: "auto" }}>
                    <option value="">All Types</option>
                    <option>Motorcycle</option>
                    <option>Van</option>
                    <option>Truck</option>
                    <option>LargeTruck</option>
                </select>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>License Plate</th>
                            <th>Type</th>
                            <th>Capacity (kg)</th>
                            <th>Volume (m³)</th>
                            <th>Fuel Efficiency</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* TODO: replace with data.map(vehicle => ...) */}
                        <tr>
                            <td colSpan={8}>
                                <div className="empty-state">
                                    <p>No vehicles registered yet.</p>
                                    <button className="btn btn-primary">Add first vehicle</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
