/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { PREFERENCE_KEYS, getBooleanPreference, setBooleanPreference } from "@/src/lib/preferences";

function SettingToggle({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="card" style={{ maxWidth: 860 }}>
            <div className="card-body" style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center" }}>
                <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</h2>
                    <p style={{ marginTop: 4, color: "var(--color-text-secondary)", fontSize: 13 }}>{description}</p>
                </div>
                <button
                    type="button"
                    onClick={() => onChange(!checked)}
                    aria-pressed={checked}
                    className="btn"
                    style={{
                        minWidth: 84,
                        justifyContent: "center",
                        background: checked ? "var(--color-primary)" : "rgba(255,255,255,0.08)",
                        color: "#fff",
                        borderColor: checked ? "var(--color-primary)" : "var(--color-border-strong)",
                    }}
                >
                    {checked ? "On" : "Off"}
                </button>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [liveTrackingMapEnabled, setLiveTrackingMapEnabled] = useState(true);
    const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = useState(true);
    const [compactTablesEnabled, setCompactTablesEnabled] = useState(false);
    const [darkModeEnabled, setDarkModeEnabled] = useState(true);

    useEffect(() => {
        setLiveTrackingMapEnabled(getBooleanPreference(PREFERENCE_KEYS.liveTrackingMapEnabled, true));
        setDesktopNotificationsEnabled(getBooleanPreference(PREFERENCE_KEYS.desktopNotifications, true));
        setCompactTablesEnabled(getBooleanPreference(PREFERENCE_KEYS.compactTables, false));
        setDarkModeEnabled(getBooleanPreference(PREFERENCE_KEYS.darkMode, true));
    }, []);

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Settings</h1>
                    <p>Manage your app preferences</p>
                </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
                <SettingToggle
                    title="Live Tracking Map"
                    description="Show or hide the live map view."
                    checked={liveTrackingMapEnabled}
                    onChange={(next) => {
                        setLiveTrackingMapEnabled(next);
                        setBooleanPreference(PREFERENCE_KEYS.liveTrackingMapEnabled, next);
                    }}
                />
                <SettingToggle
                    title="Desktop Notifications"
                    description="Enable delivery and assignment alerts."
                    checked={desktopNotificationsEnabled}
                    onChange={(next) => {
                        setDesktopNotificationsEnabled(next);
                        setBooleanPreference(PREFERENCE_KEYS.desktopNotifications, next);
                    }}
                />
                <SettingToggle
                    title="Compact Tables"
                    description="Use denser table rows across lists."
                    checked={compactTablesEnabled}
                    onChange={(next) => {
                        setCompactTablesEnabled(next);
                        setBooleanPreference(PREFERENCE_KEYS.compactTables, next);
                    }}
                />
                <SettingToggle
                    title="Dark Mode"
                    description="Keep the dashboard in dark theme."
                    checked={darkModeEnabled}
                    onChange={(next) => {
                        setDarkModeEnabled(next);
                        setBooleanPreference(PREFERENCE_KEYS.darkMode, next);
                    }}
                />
            </div>
        </div>
    );
}
