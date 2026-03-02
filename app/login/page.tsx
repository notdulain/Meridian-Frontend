"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LoginRequest, AuthResponse } from "@/lib/types";

const AUTH_BASE_URL =
    process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:6007";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            const res = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.status === 401) {
                setError("Invalid email or password.");
                return;
            }
            if (!res.ok) {
                setError("Login failed. Please try again.");
                return;
            }

            const data: AuthResponse = await res.json();
            localStorage.setItem("meridian_token", data.accessToken);
            router.push("/");
        } catch {
            setError("Unable to reach the auth service. Please try again.");
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
            background: "var(--color-bg)",
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
