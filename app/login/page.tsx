"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LoginRequest, AuthResponse } from "@/lib/types";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
    const router = useRouter();
    const { login, isHydrated, token } = useAuthStore();
    const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isHydrated && token) {
            router.push("/");
        }
    }, [isHydrated, token, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError("Email and password are required.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const data = await authService.login(form);

            // Decode role manually if backend doesn't send it, otherwise use provided role
            // Since this is a mock frontend for the system, we can extract role or decode JWT
            // Assuming `role` comes as part of `data`
            const userRole = data.role || (form.email.includes("admin") ? "Admin" : form.email.includes("driver") ? "Driver" : "Dispatcher");

            login(data.accessToken, userRole, { id: 1, email: form.email });

            if (userRole === "Admin") router.push("/admin/dashboard");
            else if (userRole === "Dispatcher") router.push("/dispatcher/dashboard");
            else if (userRole === "Driver") router.push("/driver/dashboard");
            else router.push("/");

        } catch (err: any) {
            if (err.response?.status === 401) {
                setError("Invalid email or password.");
            } else {
                setError("Unable to reach the auth service. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-bg-gradient)",
        }}>
            <div style={{ width: "100%", maxWidth: 400, padding: "0 16px" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        width: 40, height: 40,
                        background: "var(--color-primary)",
                        borderRadius: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16, fontWeight: 700, color: "#fff",
                        marginBottom: 12,
                    }}>M</div>
                    <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)" }}>
                        Sign in to Meridian
                    </h1>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
                        Fleet management &amp; route optimization
                    </p>
                </div>

                <div className="card">
                    <div className="card-body">
                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: 16 }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label">
                                    Email <span className="required">*</span>
                                </label>
                                <input
                                    className="form-input"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Password <span className="required">*</span>
                                </label>
                                <input
                                    className="form-input"
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                                disabled={loading}
                            >
                                {loading ? "Signing in…" : "Sign in"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
