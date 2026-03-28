"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/src/api/client";
import { driverService } from "@/src/api/services/driverService";
import { userService } from "@/src/api/services/userService";

interface DriverRecord {
  driverId: number;
  userId: string;
  fullName: string;
  licenseNumber: string;
  licenseExpiry: string;
  phoneNumber: string;
  maxWorkingHoursPerDay: number;
  currentWorkingHoursToday: number;
  isActive: boolean;
}

interface DriverPerformanceRecord {
  driverId: number;
  deliveriesCompleted: number;
  averageDeliveryTimeMinutes: number;
  onTimeRatePercent: number;
}

const INITIAL_FORM = {
  fullName: "",
  email: "",
  password: "",
  licenseNumber: "",
  licenseExpiry: "",
  phoneNumber: "",
  maxWorkingHoursPerDay: 8,
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [reportRows, setReportRows] = useState<DriverPerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null) {
      if ("message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message.trim().length > 0) {
          return message;
        }
      }

      if ("details" in error) {
        const details = (error as { details?: { message?: unknown; errors?: unknown } }).details;
        if (typeof details?.message === "string" && details.message.trim().length > 0) {
          return details.message;
        }

        if (details?.errors && typeof details.errors === "object") {
          const firstEntry = Object.values(details.errors)[0];
          if (Array.isArray(firstEntry) && typeof firstEntry[0] === "string" && firstEntry[0].trim().length > 0) {
            return firstEntry[0];
          }

          if (typeof firstEntry === "string" && firstEntry.trim().length > 0) {
            return firstEntry;
          }
        }
      }
    }

    return fallback;
  }

  async function loadDrivers() {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get<{ data?: DriverRecord[] }>("/driver/api/drivers", {
        params: { page: 1, pageSize: 50 },
      });
      setDrivers(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch {
      console.warn("Failed to load drivers");
      setError("Unable to load drivers.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDriverPerformanceReport(query?: { startDateUtc?: string; endDateUtc?: string }) {
    setReportLoading(true);
    setReportError("");

    try {
      const rows = await driverService.performanceReport(query);
      setReportRows(Array.isArray(rows) ? (rows as DriverPerformanceRecord[]) : []);
    } catch {
      console.warn("Failed to load driver performance report");
      setReportError("Unable to load driver performance report.");
    } finally {
      setReportLoading(false);
    }
  }

  useEffect(() => {
    void loadDrivers();
    void loadDriverPerformanceReport();
  }, []);

  function buildReportDateQuery(): { startDateUtc?: string; endDateUtc?: string } {
    const query: { startDateUtc?: string; endDateUtc?: string } = {};

    if (reportStartDate) {
      query.startDateUtc = new Date(`${reportStartDate}T00:00:00.000Z`).toISOString();
    }

    if (reportEndDate) {
      const endExclusive = new Date(`${reportEndDate}T00:00:00.000Z`);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
      query.endDateUtc = endExclusive.toISOString();
    }

    return query;
  }

  async function applyReportDateFilter() {
    if (reportStartDate && reportEndDate && reportEndDate < reportStartDate) {
      setReportError("End date must be greater than or equal to start date.");
      return;
    }

    await loadDriverPerformanceReport(buildReportDateQuery());
  }

  async function clearReportDateFilter() {
    setReportStartDate("");
    setReportEndDate("");
    await loadDriverPerformanceReport();
  }

  const filteredDrivers = useMemo(
    () =>
      drivers.filter((driver) => {
        const matchesSearch =
          search === "" ||
          driver.fullName.toLowerCase().includes(search.toLowerCase()) ||
          driver.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
          driver.phoneNumber.toLowerCase().includes(search.toLowerCase());

        const matchesActive =
          activeFilter === "" ||
          (activeFilter === "active" ? driver.isActive : !driver.isActive);

        return matchesSearch && matchesActive;
      }),
    [activeFilter, drivers, search],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const created = await userService.createDriverAccount(form);
      const driver = created.driver;
      const createdRecord: DriverRecord = {
        driverId: driver.driverId,
        userId: driver.userId,
        fullName: driver.fullName,
        licenseNumber: driver.licenseNumber,
        licenseExpiry: driver.licenseExpiry,
        phoneNumber: driver.phoneNumber,
        maxWorkingHoursPerDay: driver.maxWorkingHoursPerDay,
        currentWorkingHoursToday: driver.currentWorkingHoursToday,
        isActive: driver.isActive,
      };

      setDrivers((current) => [createdRecord, ...current]);
      setForm(INITIAL_FORM);
    } catch (saveError: unknown) {
      console.warn("Failed to create driver");
      setError(getErrorMessage(saveError, "Unable to create driver account."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Drivers</h1>
          <p>Register and manage fleet drivers</p>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div>
          <div className="toolbar">
            <div className="search-bar">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search drivers" />
            </div>
            <select className="form-select" style={{ width: "auto" }} value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
              <option value="">All Drivers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>License</th>
                  <th>Phone</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>Loading drivers...</td>
                  </tr>
                ) : filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No drivers found.</td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.driverId}>
                      <td>#{driver.driverId}</td>
                      <td>{driver.fullName}</td>
                      <td>{driver.licenseNumber}</td>
                      <td>{driver.phoneNumber}</td>
                      <td>{driver.currentWorkingHoursToday}/{driver.maxWorkingHoursPerDay}</td>
                      <td>{driver.isActive ? "Active" : "Inactive"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="card mt-6">
            <div className="card-header">
              <h2>Driver Performance Report</h2>
            </div>
            <div className="card-body">
              <div className="form-row mb-4">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={reportStartDate}
                    onChange={(event) => setReportStartDate(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={reportEndDate}
                    onChange={(event) => setReportEndDate(event.target.value)}
                  />
                </div>
              </div>
              <div className="form-row mb-4">
                <button type="button" className="btn btn-primary" onClick={() => void applyReportDateFilter()} disabled={reportLoading}>
                  Apply Date Filter
                </button>
                <button type="button" className="btn" onClick={() => void clearReportDateFilter()} disabled={reportLoading}>
                  Clear Filter
                </button>
              </div>
              {reportError ? <div className="alert alert-error">{reportError}</div> : null}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Driver ID</th>
                      <th>Deliveries Completed</th>
                      <th>Avg Delivery Time (min)</th>
                      <th>On-Time Rate (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportLoading ? (
                      <tr>
                        <td colSpan={4}>Loading report...</td>
                      </tr>
                    ) : reportRows.length === 0 ? (
                      <tr>
                        <td colSpan={4}>No report data available.</td>
                      </tr>
                    ) : (
                      reportRows.map((row) => (
                        <tr key={row.driverId}>
                          <td>#{row.driverId}</td>
                          <td>{row.deliveriesCompleted}</td>
                          <td>{row.averageDeliveryTimeMinutes.toFixed(2)}</td>
                          <td>{row.onTimeRatePercent.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Create Driver Account</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Temporary Password</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      className="form-input"
                      style={{ flex: 1 }}
                      type={isPasswordVisible ? "text" : "password"}
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    />
                    <button
                      type="button"
                      className="btn"
                      aria-label={isPasswordVisible ? "Hide temporary password" : "Show temporary password"}
                      onClick={() => setIsPasswordVisible((current) => !current)}
                    >
                      {isPasswordVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input className="form-input" value={form.licenseNumber} onChange={(event) => setForm((current) => ({ ...current, licenseNumber: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">License Expiry</label>
                  <input className="form-input" type="date" value={form.licenseExpiry} onChange={(event) => setForm((current) => ({ ...current, licenseExpiry: event.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.phoneNumber} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Hours / Day</label>
                  <input className="form-input" type="number" step="0.5" value={form.maxWorkingHoursPerDay} onChange={(event) => setForm((current) => ({ ...current, maxWorkingHoursPerDay: Number(event.target.value) }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Creating..." : "Create Driver Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
