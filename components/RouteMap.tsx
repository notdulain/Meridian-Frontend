"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import Map component to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

// Sri Lanka Coordinates
const defaultCenter: [number, number] = [6.9271, 79.8612];

interface RouteMapProps {
    mapRoutes: {
        id: number;
        path: [number, number][];
        isRecommended: boolean;
    }[];
    selectedRouteId: number | null;
}

export function RouteMap({ mapRoutes, selectedRouteId }: RouteMapProps) {
    return (
        <div className="card" style={{ overflow: "hidden" }}>
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: "400px", width: "100%", zIndex: 0 }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {mapRoutes.map((route) => {
                    let color = "#5c6070";
                    let weight = 4;
                    let opacity = 0.5;

                    if (route.isRecommended) {
                        color = "#17a050"; // success green
                        opacity = 0.7;
                    }

                    if (selectedRouteId === route.id) {
                        color = "#0070f3"; // primary blue
                        weight = 6;
                        opacity = 1;
                    }

                    return (
                        <Polyline
                            key={route.id}
                            positions={route.path}
                            pathOptions={{ color, weight, opacity }}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
}
