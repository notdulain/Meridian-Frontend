"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const { token, role, isHydrated, setHydrated } = useAuthStore();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        setHydrated();
    }, [setHydrated]);

    useEffect(() => {
        if (!isHydrated) return;

        if (!token) {
            router.push("/login");
            return;
        }

        if (allowedRoles && role && !allowedRoles.includes(role)) {
            if (role === "Admin") router.push("/admin/dashboard");
            else if (role === "Dispatcher") router.push("/dispatcher/dashboard");
            else if (role === "Driver") router.push("/driver/dashboard");
            else router.push("/");
            return;
        }

        setAuthorized(true);
    }, [isHydrated, token, role, allowedRoles, router, pathname]);

    if (!isHydrated || !authorized) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-gradient)", color: "white" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <p>Loading...</p>
                    <style>{`
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
