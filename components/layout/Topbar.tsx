import { usePathname, useRouter } from "next/navigation";

const breadcrumbMap: Record<string, string[]> = {
    "/": ["Dashboard"],
    "/dashboard/dispatcher": ["Dispatcher", "Dashboard"],
    "/deliveries": ["Operations", "Deliveries"],
    "/assignments": ["Operations", "Assignments"],
    "/tracking": ["Operations", "Live Tracking"],
    "/routes": ["Operations", "Routes"],
    "/vehicles": ["Fleet", "Vehicles"],
    "/drivers": ["Fleet", "Drivers"],
    "/settings": ["Settings"],
};

function getBreadcrumb(pathname: string): string[] {
    if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
    const base = "/" + pathname.split("/")[1];
    if (breadcrumbMap[base]) {
        const sub = pathname.split("/").slice(2).join("/");
        return [...breadcrumbMap[base], sub.charAt(0).toUpperCase() + sub.slice(1)];
    }
    return ["Meridian"];
}

export function Topbar() {
    const pathname = usePathname();
    const router = useRouter();
    const crumbs = getBreadcrumb(pathname);

    return (
        <header className="topbar">
            <div className="topbar-breadcrumb">
                {crumbs.map((crumb, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {i > 0 && (
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.4 }}>
                                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                        <span className={i === crumbs.length - 1 ? "breadcrumb-current" : ""}>
                            {crumb}
                        </span>
                    </span>
                ))}
            </div>

            <div className="topbar-actions">
                <button className="topbar-icon-btn" title="Notifications">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917z" />
                    </svg>
                </button>

                <div className="topbar-divider" />

                <div className="user-avatar" title="Dispatcher">
                    DP
                </div>

                <div className="topbar-divider" />

                <button className="topbar-icon-btn" title="Dispatcher Dashboard" onClick={() => router.push("/dashboard/dispatcher")}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0L0 4v2h16V4L8 0zm7 7H1v8h5V9h4v6h5V7z" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
