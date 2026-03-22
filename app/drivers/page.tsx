// Drivers list page

export default function DriversPage() {
    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Drivers</h1>
                    <p>Register and manage fleet drivers and working hours</p>
                </div>
                <button className="btn btn-primary">+ Add Driver</button>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5, flexShrink: 0 }}>
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
                    </svg>
                    <input type="text" placeholder="Search by name or license…" />
                </div>
                <select className="form-select" style={{ width: "auto" }}>
                    <option value="">All Statuses</option>
                    <option>Available</option>
                    <option>OnDuty</option>
                    <option>OffDuty</option>
                    <option>OnLeave</option>
                </select>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Phone Number</th>
                            <th>License Number</th>
                            <th>Max Hours/Day</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={7}>
                                <div className="empty-state">
                                    <p>No drivers registered yet.</p>
                                    <button className="btn btn-primary">Add first driver</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
