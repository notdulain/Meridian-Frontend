"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { CreateDeliveryRequest, DeliveryDto } from "@/lib/types";

interface FormErrors {
    pickupAddress?: string;
    deliveryAddress?: string;
    packageWeightKg?: string;
    packageVolumeM3?: string;
    deadline?: string;
    createdBy?: string;
}

function validate(form: CreateDeliveryRequest): FormErrors {
    const errors: FormErrors = {};

    if (!form.pickupAddress.trim())
        errors.pickupAddress = "Pickup address is required.";

    if (!form.deliveryAddress.trim())
        errors.deliveryAddress = "Delivery address is required.";
    else if (form.deliveryAddress.trim() === form.pickupAddress.trim())
        errors.deliveryAddress = "Delivery address must differ from pickup address.";

    if (!form.packageWeightKg || form.packageWeightKg <= 0)
        errors.packageWeightKg = "Weight must be greater than 0.";

    if (!form.packageVolumeM3 || form.packageVolumeM3 <= 0)
        errors.packageVolumeM3 = "Volume must be greater than 0.";

    if (!form.deadline)
        errors.deadline = "Deadline is required.";
    else if (new Date(form.deadline) <= new Date())
        errors.deadline = "Deadline must be in the future.";

    if (!form.createdBy.trim())
        errors.createdBy = "Dispatcher name is required.";

    return errors;
}

export default function CreateDeliveryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [success, setSuccess] = useState<DeliveryDto | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

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
            [name]: type === "number" ? parseFloat(value) || 0 : value,
        }));
        // Clear field error on change
        if (fieldErrors[name as keyof FormErrors]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");

        const errors = validate(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        try {
            // Convert datetime-local (local time) to ISO 8601 UTC string for the API
            const payload: CreateDeliveryRequest = {
                ...form,
                deadline: new Date(form.deadline).toISOString(),
            };

            const created = await apiClient.post<DeliveryDto>("/delivery/api/deliveries", payload);
            setSuccess(created);

            // Redirect to deliveries list after a short delay so user sees confirmation
            setTimeout(() => router.push("/deliveries"), 1800);
        } catch (err: unknown) {
            setApiError(err instanceof Error ? err.message : "Failed to create delivery. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>New Delivery Request</h1>
                        <p>As a dispatcher, create a new logistics delivery request</p>
                    </div>
                </div>
                <div className="alert alert-success" style={{ maxWidth: 680 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                        <strong>Delivery #{success.id} created successfully.</strong>
                        <br />
                        <span style={{ fontSize: 12 }}>Redirecting to deliveries list…</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>New Delivery Request</h1>
                    <p>As a dispatcher, create a new logistics delivery request</p>
                </div>
            </div>

            {apiError && (
                <div className="alert alert-error" style={{ maxWidth: 680 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {apiError}
                </div>
            )}

            <div className="card" style={{ maxWidth: 680 }}>
                <div className="card-header">
                    <h2>Delivery Details</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit} noValidate>

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
                            />
                            {fieldErrors.pickupAddress && (
                                <p className="form-error">{fieldErrors.pickupAddress}</p>
                            )}
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
                            />
                            {fieldErrors.deliveryAddress && (
                                <p className="form-error">{fieldErrors.deliveryAddress}</p>
                            )}
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
                                />
                                {fieldErrors.packageWeightKg && (
                                    <p className="form-error">{fieldErrors.packageWeightKg}</p>
                                )}
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
                                />
                                {fieldErrors.packageVolumeM3 && (
                                    <p className="form-error">{fieldErrors.packageVolumeM3}</p>
                                )}
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
                                />
                                {fieldErrors.deadline && (
                                    <p className="form-error">{fieldErrors.deadline}</p>
                                )}
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
                                />
                                {fieldErrors.createdBy ? (
                                    <p className="form-error">{fieldErrors.createdBy}</p>
                                ) : (
                                    <p className="form-hint">Will be populated from auth session in production.</p>
                                )}
                            </div>
                        </div>

                        <div className="divider" />

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => router.back()}
                                disabled={loading}
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
