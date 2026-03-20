"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navSections = [
    {
        label: "Operations",
        items: [
            {
                href: "/dashboard/dispatcher",
                label: "Dashboard",
                icon: (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="nav-icon">
                        <path d="M2 2h5v5H2V2zm0 7h5v5H2V9zm7-7h5v5H9V2zm0 7h5v5H9V9z" />
                    </svg>
                ),
            },
            {
                href: "/deliveries",
                label: "Deliveries",
                icon: (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="nav-icon">
                        <path d="M1 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2H1V3zm0 3h12v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6zm4 3a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H5z" />
                    </svg>
                ),
            },
            {
                href: "/assignments",
                label: "Assignments",
                icon: (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="nav-icon">
                        <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zm-2 4H4a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1zM4 8a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1H4z" />
                    </svg>
                ),
            },
            {
                href: "/tracking",
                label: "Live Tracking",
                icon: (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="nav-icon">
                        <path d="M8 0a6 6 0 1 0 0 12A6 6 0 0 0 8 0zm0 1a5 5 0 1 1 0 10A5 5 0 0 1 8 1zm0 4.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1zM5.5 8a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z" />
                    </svg>
                ),
            },
            {
                href: "/routes",
                label: "Routes",
                icon: (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="nav-icon">
                        <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A2 2 0 0 1 3 10a2 2 0 0 1 1.732 1H12v-1H1.5a.5.5 0 0 1-.5-.5V10h.294z" />
                    </svg>
                ),
            },
        ],
    },
    {
        label: "Fleet",
        items: [
            {
                href: "/vehicles",
                label: "Vehicles",
                icon: (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="nav-icon">
                        <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7z" />
                    </svg>
                ),
            },
            {
                href: "/drivers",
                label: "Drivers",
                icon: (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="nav-icon">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4z" />
                    </svg>
                ),
            },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-mark">
                    <Image
                        src="/meridian-logo.png"
                        alt="Meridian logo"
                        width={28}
                        height={28}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                </div>
                <span className="sidebar-logo-text">Meridian</span>
            </div>

            {navSections.map((section) => (
                <div key={section.label} className="sidebar-section">
                    <p className="sidebar-section-label">{section.label}</p>
                    {section.items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-nav-item ${pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href))
                                ? "active"
                                : ""
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </div>
            ))}

            <div className="sidebar-footer">
                <Link
                    href="/settings"
                    className={`sidebar-nav-item ${pathname === "/settings" ? "active" : ""}`}
                >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="nav-icon">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z" />
                    </svg>
                    Settings
                </Link>
            </div>
        </aside>
    );
}
