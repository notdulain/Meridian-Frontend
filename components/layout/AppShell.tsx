"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const NO_SHELL_ROUTES = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isShellHidden = NO_SHELL_ROUTES.includes(pathname);

    if (isShellHidden) {
        return <>{children}</>;
    }

    return (
        <div className="app-shell">
            <Sidebar />
            <div className="main-content">
                <Topbar />
                {children}
            </div>
        </div>
    );
}
