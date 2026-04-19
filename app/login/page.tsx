"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import type { AuthRole, LoginRequest, RegisterRequest } from "@/lib/types";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

const ROLE_OPTIONS: AuthRole[] = ["Dispatcher", "Admin"];

type FeedbackMessage = {
    title: string;
    message: string;
};

type SigninField = keyof LoginRequest;

function AuthFeedback({
    id,
    title,
    message,
}: FeedbackMessage & { id?: string }) {
    return (
        <div id={id} className="auth-feedback auth-feedback-success" role="status" aria-live="polite">
            <span className="auth-feedback-icon" aria-hidden="true">
                <CheckCircle2 size={18} strokeWidth={2.3} />
            </span>
            <div className="auth-feedback-copy">
                <p className="auth-feedback-title">{title}</p>
                <p className="auth-feedback-message">{message}</p>
            </div>
        </div>
    );
}

function AuthErrorModal({
    title,
    message,
    onClose,
}: FeedbackMessage & { onClose: () => void }) {
    return (
        <div className="auth-modal-backdrop" role="presentation" onMouseDown={onClose}>
            <div
                id="auth-error"
                className="auth-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="auth-error-title"
                aria-describedby="auth-error-message"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <button type="button" className="auth-modal-close" aria-label="Close error message" onClick={onClose}>
                    <X size={16} strokeWidth={2.3} />
                </button>
                <span className="auth-modal-icon" aria-hidden="true">
                    <AlertCircle size={22} strokeWidth={2.3} />
                </span>
                <div className="auth-modal-copy">
                    <p id="auth-error-title" className="auth-modal-title">{title}</p>
                    <p id="auth-error-message" className="auth-modal-message">{message}</p>
                </div>
                <button type="button" className="btn btn-primary auth-modal-action" onClick={onClose}>
                    Try again
                </button>
            </div>
        </div>
    );
}

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
    const [error, setError] = useState<FeedbackMessage | null>(null);
    const [success, setSuccess] = useState<FeedbackMessage | null>(null);
    const [signinErrorFields, setSigninErrorFields] = useState<SigninField[]>([]);

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

    const decodeTokenPayload = (token: string): Record<string, unknown> | undefined => {
        try {
            const [, payload] = token.split(".");
            if (!payload) return undefined;

            const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
            const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
            return JSON.parse(atob(padded)) as Record<string, unknown>;
        } catch {
            return undefined;
        }
    };

    const getRoleFromToken = (token: string): AuthRole | undefined => {
        const decoded = decodeTokenPayload(token);
        if (!decoded) return undefined;

        const rawRole =
            decoded.role
            ?? decoded["roles"]
            ?? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        const firstRole = Array.isArray(rawRole) ? rawRole[0] : rawRole;
        if (firstRole === "Admin" || firstRole === "Dispatcher" || firstRole === "Driver") {
            return firstRole;
        }

        return undefined;
    };

    const getUserIdFromToken = (token: string): number | undefined => {
        const decoded = decodeTokenPayload(token);
        if (!decoded) return undefined;

        const rawSub = decoded.sub ?? decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const sub = Array.isArray(rawSub) ? rawSub[0] : rawSub;
        if (typeof sub !== "string") return undefined;

        const parsed = Number(sub);
        return Number.isFinite(parsed) ? parsed : undefined;
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
        if (typeof data === "string") return getSafeErrorMessage(data);
        if (typeof data === "object" && data !== null) {
            const maybeMessage = (data as { message?: unknown; error?: unknown }).message
                ?? (data as { message?: unknown; error?: unknown }).error;
            if (typeof maybeMessage === "string") return getSafeErrorMessage(maybeMessage);
        }
        return undefined;
    };

    const getSafeErrorMessage = (message: string): string | undefined => {
        const trimmed = message.replace(/\s+/g, " ").trim();
        if (trimmed.length === 0 || trimmed.length > 180) return undefined;
        if (/[{}<>]/.test(trimmed)) return undefined;
        if (/exception|stack trace|axioserror|doctype|<html|^\s*at\s/i.test(trimmed)) return undefined;
        return trimmed;
    };

    const clearFeedback = () => {
        setError(null);
        setSuccess(null);
        setSigninErrorFields([]);
    };

    const showError = (title: string, message: string, fields: SigninField[] = []) => {
        setError({ title, message });
        setSuccess(null);
        setSigninErrorFields(fields);
    };

    const closeError = useCallback(() => {
        setError(null);
    }, []);

    useEffect(() => {
        if (!error) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeError();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [error, closeError]);

    const onSigninChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSigninForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        clearFeedback();
    };

    const onSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        clearFeedback();
    };

    const handleSignInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signinForm.email || !signinForm.password) {
            const missingFields: SigninField[] = [];
            if (!signinForm.email) missingFields.push("email");
            if (!signinForm.password) missingFields.push("password");
            showError("Email and password are required", "Enter both details to continue.", missingFields);
            return;
        }

        setLoading(true);
        clearFeedback();
        try {
            const data = await authService.login(signinForm);
            const userRole = getRoleFromToken(data.accessToken) ?? resolveRole(undefined, signinForm.email);
            const userId = getUserIdFromToken(data.accessToken) ?? 0;
            login(data.accessToken, userRole, { id: userId, email: signinForm.email });
            redirectByRole(userRole);
        } catch (err: unknown) {
            if (getErrorStatus(err) === 401) {
                showError(
                    "Incorrect email or password",
                    "The credentials do not match a Meridian account. Check your email and password, then try again.",
                    ["email", "password"],
                );
            } else {
                showError("Sign in failed", "We could not reach Meridian right now. Check the service connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signupForm.fullName || !signupForm.email || !signupForm.password || !signupForm.role) {
            showError("Registration needs attention", "Role, full name, email and password are required.");
            return;
        }

        setLoading(true);
        clearFeedback();
        try {
            const data = await authService.register(signupForm);

            if (data?.accessToken) {
                const userRole = getRoleFromToken(data.accessToken) ?? signupForm.role;
                const userId = getUserIdFromToken(data.accessToken) ?? 0;
                login(data.accessToken, userRole, { id: userId, email: signupForm.email, name: signupForm.fullName });
                redirectByRole(userRole);
                return;
            }

            setSuccess({ title: "Account created", message: "Please sign in with your credentials." });
            setMode("signin");
            setSigninForm({ email: signupForm.email, password: "" });
            setSignupForm({ fullName: "", email: "", password: "", role: "Dispatcher" });
        } catch (err: unknown) {
            showError("Account could not be created", getBackendErrorMessage(err) ?? "Unable to create account. Please try again.");
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
                        {mode === "signin" ? "Use your Meridian credentials to continue" : "Create an admin or dispatcher account"}
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
                                    clearFeedback();
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
                                    clearFeedback();
                                }}
                            >
                                Sign up
                            </button>
                        </div>

                        {error && <AuthErrorModal title={error.title} message={error.message} onClose={closeError} />}
                        {success && <AuthFeedback title={success.title} message={success.message} />}

                        {mode === "signin" ? (
                            <form onSubmit={handleSignInSubmit} noValidate>
                                <div className="form-group">
                                    <label className="form-label">Email <span className="required">*</span></label>
                                    <input
                                        className={`form-input ${signinErrorFields.includes("email") ? "form-input-error" : ""}`}
                                        type="email"
                                        name="email"
                                        value={signinForm.email}
                                        onChange={onSigninChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        aria-invalid={signinErrorFields.includes("email")}
                                        aria-describedby={error ? "auth-error" : undefined}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password <span className="required">*</span></label>
                                    <input
                                        className={`form-input ${signinErrorFields.includes("password") ? "form-input-error" : ""}`}
                                        type="password"
                                        name="password"
                                        value={signinForm.password}
                                        onChange={onSigninChange}
                                        placeholder="********"
                                        autoComplete="current-password"
                                        aria-invalid={signinErrorFields.includes("password")}
                                        aria-describedby={error ? "auth-error" : undefined}
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
