// Assignments page

export default function AssignmentsPage() {
    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Assignments</h1>
                    <p>Vehicle and driver assignments to deliveries</p>
                </div>
                <button className="btn btn-primary">New Assignment</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Delivery ID</th>
                            <th>Vehicle ID</th>
                            <th>Driver ID</th>
                            <th>Assigned At</th>
                            <th>Assigned By</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={7}>
                                <div className="empty-state">
                                    <p>No assignments found.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
