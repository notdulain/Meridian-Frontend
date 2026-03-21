"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AuthRole, LoginRequest, RegisterRequest } from "@/lib/types";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

const ROLE_OPTIONS: AuthRole[] = ["Driver", "Dispatcher", "Admin"];

export default function LoginPage() {
    const router = useRouter();
    const { login, role, token, isHydrated, setHydrated } = useAuthStore();

    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [signinForm, setSigninForm] = useState<LoginRequest>({ email: "", password: "" });
    const [signupForm, setSignupForm] = useState<RegisterRequest>({
        fullName: "",
        email: "",
        password: "",
        role: "Dispatcher",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        setHydrated();
    }, [setHydrated]);

    const redirectByRole = useCallback((userRole: AuthRole) => {
        if (userRole === "Admin") router.push("/admin/dashboard");
        else if (userRole === "Driver") router.push("/driver/dashboard");
        else router.push("/dashboard/dispatcher");
    }, [router]);

    useEffect(() => {
        if (!isHydrated || !token) return;
        redirectByRole((role || "Dispatcher") as AuthRole);
    }, [isHydrated, token, role, redirectByRole]);

    const resolveRole = (rawRole: string | undefined, email: string): AuthRole => {
        if (rawRole === "Admin" || rawRole === "Dispatcher" || rawRole === "Driver") return rawRole;
        if (email.includes("admin")) return "Admin";
        if (email.includes("driver")) return "Driver";
        return "Dispatcher";
    };

    const getRoleFromToken = (token: string): AuthRole | undefined => {
        try {
            const [, payload] = token.split(".");
            if (!payload) return undefined;

            const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
            const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
            const decoded = JSON.parse(atob(padded)) as Record<string, unknown>;

            const rawRole =
                decoded.role
                ?? decoded["roles"]
                ?? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

            const firstRole = Array.isArray(rawRole) ? rawRole[0] : rawRole;
            if (firstRole === "Admin" || firstRole === "Dispatcher" || firstRole === "Driver") {
                return firstRole;
            }
        } catch {
            return undefined;
        }

        return undefined;
    };

    const getErrorStatus = (err: unknown): number | undefined => {
        if (typeof err === "object" && err !== null && "response" in err) {
            const response = (err as { response?: { status?: number } }).response;
            return response?.status;
        }
        return undefined;
    };

    const getBackendErrorMessage = (err: unknown): string | undefined => {
        if (typeof err !== "object" || err === null || !("response" in err)) return undefined;
        const response = (err as { response?: { data?: unknown } }).response;
        const data = response?.data;
        if (typeof data === "string") return data;
        if (typeof data === "object" && data !== null) {
            const maybeMessage = (data as { message?: unknown; error?: unknown }).message
                ?? (data as { message?: unknown; error?: unknown }).error;
            if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) return maybeMessage;
        }
        return undefined;
    };

    const onSigninChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSigninForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
        setSuccess("");
    };

    const onSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
        setSuccess("");
    };

    const handleSignInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signinForm.email || !signinForm.password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const data = await authService.login(signinForm);
            const userRole = getRoleFromToken(data.accessToken) ?? resolveRole(undefined, signinForm.email);
            login(data.accessToken, userRole, { id: 1, email: signinForm.email });
            redirectByRole(userRole);
        } catch (err: unknown) {
            if (getErrorStatus(err) === 401) {
                setError("Invalid email or password.");
            } else {
                setError(getBackendErrorMessage(err) ?? "Unable to sign in. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signupForm.fullName || !signupForm.email || !signupForm.password || !signupForm.role) {
            setError("Role, full name, email and password are required.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const data = await authService.register(signupForm);

            if (data?.accessToken) {
                const userRole = getRoleFromToken(data.accessToken) ?? signupForm.role;
                login(data.accessToken, userRole, { id: 1, email: signupForm.email, name: signupForm.fullName });
                redirectByRole(userRole);
                return;
            }

            setSuccess("Account created. Please sign in with your credentials.");
            setMode("signin");
            setSigninForm({ email: signupForm.email, password: "" });
            setSignupForm({ fullName: "", email: "", password: "", role: "Dispatcher" });
        } catch (err: unknown) {
            setError(getBackendErrorMessage(err) ?? "Unable to create account. Please try again.");
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
            <div style={{ width: "100%", maxWidth: 420, padding: "0 16px" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        background: "var(--color-primary)",
                        borderRadius: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: 12,
                    }}>M</div>
                    <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)" }}>
                        {mode === "signin" ? "Sign in to Meridian" : "Create Meridian account"}
                    </h1>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
                        Select role and continue
                    </p>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                            <button
                                type="button"
                                className={`btn ${mode === "signin" ? "btn-primary" : "btn-secondary"}`}
                                style={{ flex: 1, justifyContent: "center" }}
                                onClick={() => {
                                    setMode("signin");
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                Sign in
                            </button>
                            <button
                                type="button"
                                className={`btn ${mode === "signup" ? "btn-primary" : "btn-secondary"}`}
                                style={{ flex: 1, justifyContent: "center" }}
                                onClick={() => {
                                    setMode("signup");
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                Sign up
                            </button>
                        </div>

                        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
                        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

                        {mode === "signin" ? (
                            <form onSubmit={handleSignInSubmit} noValidate>
                                <div className="form-group">
                                    <label className="form-label">Email <span className="required">*</span></label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        name="email"
                                        value={signinForm.email}
                                        onChange={onSigninChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password <span className="required">*</span></label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        name="password"
                                        value={signinForm.password}
                                        onChange={onSigninChange}
                                        placeholder="********"
                                        autoComplete="current-password"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
                                    {loading ? "Signing in..." : "Sign in"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignUpSubmit} noValidate>
                                <div className="form-group">
                                    <label className="form-label">Role <span className="required">*</span></label>
                                    <select className="form-select" name="role" value={signupForm.role} onChange={onSignupChange}>
                                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Full name <span className="required">*</span></label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        name="fullName"
                                        value={signupForm.fullName}
                                        onChange={onSignupChange}
                                        placeholder="John Doe"
                                        autoComplete="name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email <span className="required">*</span></label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        name="email"
                                        value={signupForm.email}
                                        onChange={onSignupChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password <span className="required">*</span></label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        name="password"
                                        value={signupForm.password}
                                        onChange={onSignupChange}
                                        placeholder="Set password"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
                                    {loading ? "Creating account..." : "Create account"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
