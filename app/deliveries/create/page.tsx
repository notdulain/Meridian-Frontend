"use client";

// Create delivery form — connects to POST /delivery/api/Deliveries via the API gateway
// TODO: Get `createdBy` from auth context (WSO2 token sub claim)
// TODO: Add success redirect to /deliveries after create

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { CreateDeliveryRequest } from "@/lib/types";

export default function CreateDeliveryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState<CreateDeliveryRequest>({
        pickupAddress: "",
        deliveryAddress: "",
        packageWeightKg: 0,
        packageVolumeM3: 0,
        deadline: "",
        createdBy: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await apiClient.post("/delivery/api/Deliveries", form);
            router.push("/deliveries");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create delivery.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>New Delivery Request</h1>
                    <p>As a dispatcher, create a new logistics delivery request</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card" style={{ maxWidth: 680 }}>
                <div className="card-header">
                    <h2>Delivery Details</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                Pickup Address <span className="required">*</span>
                            </label>
                            <input
                                className="form-input"
                                name="pickupAddress"
                                value={form.pickupAddress}
                                onChange={handleChange}
                                placeholder="e.g. 42 Main Street, Colombo 03"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Delivery Address <span className="required">*</span>
                            </label>
                            <input
                                className="form-input"
                                name="deliveryAddress"
                                value={form.deliveryAddress}
                                onChange={handleChange}
                                placeholder="e.g. 18 Galle Road, Moratuwa"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Package Weight (kg) <span className="required">*</span>
                                </label>
                                <input
                                    className="form-input"
                                    type="number"
                                    name="packageWeightKg"
                                    min="0.01"
                                    step="0.01"
                                    value={form.packageWeightKg || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Package Volume (m³) <span className="required">*</span>
                                </label>
                                <input
                                    className="form-input"
                                    type="number"
                                    name="packageVolumeM3"
                                    min="0.01"
                                    step="0.01"
                                    value={form.packageVolumeM3 || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Deadline <span className="required">*</span>
                                </label>
                                <input
                                    className="form-input"
                                    type="datetime-local"
                                    name="deadline"
                                    value={form.deadline}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Created By <span className="required">*</span>
                                </label>
                                <input
                                    className="form-input"
                                    name="createdBy"
                                    value={form.createdBy}
                                    onChange={handleChange}
                                    placeholder="Dispatcher name"
                                    required
                                />
                                <p className="form-hint">Will be populated from auth session in production.</p>
                            </div>
                        </div>

                        <div className="divider" />

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? "Creating…" : "Create Delivery"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
