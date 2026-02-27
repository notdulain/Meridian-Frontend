"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { DeliveryDto } from "@/lib/types";

export default function DeliveryDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [delivery, setDelivery] = useState<DeliveryDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiClient
            .get<DeliveryDto>(`/delivery/api/Deliveries/${id}`)
            .then(setDelivery)
            .catch((err: unknown) =>
                setError(err instanceof Error ? err.message : "Failed to load delivery.")
            )
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <div className="skeleton" style={{ height: 24, width: 180 }} />
                        <div className="skeleton" style={{ height: 14, width: 120, marginTop: 6 }} />
                    </div>
                </div>
                <div className="card" style={{ maxWidth: 720 }}>
                    <div className="card-body">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: 16, marginBottom: 14 }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !delivery) {
        return (
            <div className="page-container">
                <div className="alert alert-error" style={{ maxWidth: 720 }}>
                    {error || "Delivery not found."}
                </div>
                <button className="btn btn-secondary" onClick={() => router.back()}>
                    ← Back
                </button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Delivery #{delivery.id}</h1>
                    <p>Viewing delivery request details</p>
                </div>
                <button className="btn btn-secondary" onClick={() => router.back()}>
                    ← Back
                </button>
            </div>

            {/* Details will be added in next steps */}
            <p style={{ color: "var(--color-text-muted)" }}>Delivery loaded — details coming next.</p>
        </div>
    );
}
