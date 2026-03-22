import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const breadcrumbMap: Record<string, string[]> = {
    "/": ["Dashboard"],
    "/dashboard/dispatcher": ["Dispatcher", "Dashboard"],
    "/admin/dashboard": ["Admin", "Dashboard"],
    "/driver/dashboard": ["Driver", "Dashboard"],
    "/deliveries": ["Operations", "Deliveries"],
    "/assignments": ["Operations", "Assignments"],
    "/tracking": ["Operations", "Live Tracking"],
    "/routes": ["Operations", "Routes"],
    "/vehicles": ["Fleet", "Vehicles"],
    "/drivers": ["Fleet", "Drivers"],
    "/settings": ["Settings"],
    "/profile": ["Profile"],
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
    const { role, user, logout } = useAuthStore();
    const crumbs = getBreadcrumb(pathname);

    const initials = user?.name
        ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
        : role ? role.slice(0, 2).toUpperCase() : "US";

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

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

                <button
                    type="button"
                    className="user-avatar"
                    title={user?.name || role || "User"}
                    onClick={() => router.push("/profile")}
                    style={{
                        backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        color: user?.avatarUrl ? "transparent" : undefined,
                    }}
                >
                    {initials}
                </button>

                <div className="topbar-divider" />

                <button className="topbar-icon-btn" title="Sign out" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
