"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

const PASSWORD_STORAGE_KEY = "meridian_profile_password";

export default function ProfilePage() {
    const { user, role, updateUser } = useAuthStore();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setName(user?.name || "");
        setEmail(user?.email || "");
        setAvatarUrl(user?.avatarUrl || "");
    }, [user]);

    const handleProfileSave = (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        updateUser({
            name: name.trim(),
            email: email.trim(),
            avatarUrl: avatarUrl.trim() || undefined,
        });

        setMessage("Profile updated successfully.");
    };

    const handlePasswordSave = (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setMessage("");

        const storedPassword = typeof window !== "undefined" ? localStorage.getItem(PASSWORD_STORAGE_KEY) || "" : "";

        if (storedPassword && currentPassword !== storedPassword) {
            setError("Current password is incorrect.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage("Password updated successfully.");
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            setAvatarUrl(result);
        };
        reader.readAsDataURL(file);
    };

    const initials = name
        ? name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
        : role ? role.slice(0, 2).toUpperCase() : "US";

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Profile</h1>
                    <p>Manage your account details</p>
                </div>
            </div>

            {error ? <div className="alert alert-error">{error}</div> : null}
            {message ? <div className="alert alert-success">{message}</div> : null}

            <div className="grid gap-6 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
                <div className="card">
                    <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                        <div
                            style={{
                                width: 108,
                                height: 108,
                                borderRadius: "50%",
                                background: avatarUrl ? `url(${avatarUrl}) center/cover no-repeat` : "var(--color-primary-subtle)",
                                border: "1px solid var(--color-border-strong)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 28,
                                fontWeight: 700,
                                color: avatarUrl ? "transparent" : "var(--color-text-primary)",
                            }}
                        >
                            {initials}
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600 }}>{name || "User"}</h2>
                            <p style={{ color: "var(--color-text-secondary)", marginTop: 4 }}>{email || "No email set"}</p>
                            <p style={{ color: "var(--color-text-muted)", marginTop: 8, fontSize: 12 }}>{role || "Member"}</p>
                        </div>
                        <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
                            Upload Picture
                            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                        </label>
                    </div>
                </div>

                <div style={{ display: "grid", gap: 24 }}>
                    <div className="card">
                        <div className="card-header">
                            <h2>Profile Details</h2>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleProfileSave}>
                                <div className="form-group">
                                    <label className="form-label">User Name</label>
                                    <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Profile Picture URL</label>
                                    <input className="form-input" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="Paste an image URL or upload a picture" />
                                </div>
                                <button type="submit" className="btn btn-primary">Save Profile</button>
                            </form>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2>Change Password</h2>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handlePasswordSave}>
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input className="form-input" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input className="form-input" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm Password</label>
                                        <input className="form-input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary">Update Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
