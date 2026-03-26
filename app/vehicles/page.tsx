"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/src/api/client";

interface VehicleRecord {
  vehicleId: number;
  plateNumber: string;
  make: string;
  model: string;
  currentLocation: string;
  year: number;
  capacityKg: number;
  capacityM3: number;
  fuelEfficiencyKmPerLitre: number;
  status: string;
}

const INITIAL_FORM = {
  plateNumber: "",
  make: "",
  model: "",
  currentLocation: "",
  year: new Date().getFullYear(),
  capacityKg: 0,
  capacityM3: 0,
  fuelEfficiencyKmPerLitre: 0,
  status: "Available",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  async function loadVehicles() {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get<{ data?: VehicleRecord[] }>("/vehicle/api/vehicles", {
        params: { page: 1, pageSize: 50 },
      });
      setVehicles(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (loadError) {
      console.warn("Failed to load vehicles");
      setError("Unable to load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
  }, []);

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const matchesSearch =
          search === "" ||
          vehicle.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
          vehicle.make.toLowerCase().includes(search.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "" || vehicle.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [search, statusFilter, vehicles],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await apiClient.post<{ data?: VehicleRecord }>("/vehicle/api/vehicles", form);
      const created = response.data?.data;
      setVehicles((current) => (created ? [created, ...current] : current));
      setForm(INITIAL_FORM);
    } catch (saveError) {
      console.warn("Failed to create vehicle");
      setError("Unable to create vehicle.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Vehicles</h1>
          <p>Manage fleet vehicles and availability</p>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div>
          <div className="toolbar">
            <div className="search-bar">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vehicles" />
            </div>
            <select className="form-select" style={{ width: "auto" }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="OnTrip">OnTrip</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plate</th>
                  <th>Vehicle</th>
                  <th>Capacity</th>
                  <th>Fuel</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>Loading vehicles...</td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No vehicles found.</td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.vehicleId}>
                      <td>#{vehicle.vehicleId}</td>
                      <td>{vehicle.plateNumber}</td>
                      <td>{vehicle.make} {vehicle.model}</td>
                      <td>{vehicle.capacityKg} kg / {vehicle.capacityM3} m3</td>
                      <td>{vehicle.fuelEfficiencyKmPerLitre} km/L</td>
                      <td>{vehicle.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Add Vehicle</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Plate Number</label>
                <input className="form-input" value={form.plateNumber} onChange={(event) => setForm((current) => ({ ...current, plateNumber: event.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Make</label>
                  <input className="form-input" value={form.make} onChange={(event) => setForm((current) => ({ ...current, make: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input className="form-input" value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input className="form-input" type="number" value={form.year} onChange={(event) => setForm((current) => ({ ...current, year: Number(event.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="Available">Available</option>
                    <option value="OnTrip">OnTrip</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Capacity Kg</label>
                  <input className="form-input" type="number" step="0.01" value={form.capacityKg || ""} onChange={(event) => setForm((current) => ({ ...current, capacityKg: Number(event.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity M3</label>
                  <input className="form-input" type="number" step="0.01" value={form.capacityM3 || ""} onChange={(event) => setForm((current) => ({ ...current, capacityM3: Number(event.target.value) }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fuel Efficiency</label>
                  <input className="form-input" type="number" step="0.01" value={form.fuelEfficiencyKmPerLitre || ""} onChange={(event) => setForm((current) => ({ ...current, fuelEfficiencyKmPerLitre: Number(event.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Location</label>
                  <input className="form-input" value={form.currentLocation} onChange={(event) => setForm((current) => ({ ...current, currentLocation: event.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Add Vehicle"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
