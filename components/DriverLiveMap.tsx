"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { GeoPosition } from "@/src/hooks/useLiveGeolocation";

// We need to import DivIcon type for the icon helper
import type { DivIcon, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

interface DriverLiveMapProps {
  position: GeoPosition | null;
}

function createDriverIcon(): DivIcon | undefined {
  if (typeof window === "undefined") return undefined;
  // Dynamically require leaflet to avoid SSR issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require("leaflet") as typeof import("leaflet");
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:28px;height:28px;">
        <span style="
          position:absolute;inset:0;border-radius:9999px;
          background:#3b82f6;opacity:0.25;
          animation:driver-pulse 1.8s ease-in-out infinite;
        "></span>
        <span style="
          position:absolute;left:6px;top:6px;width:16px;height:16px;
          border:2.5px solid white;border-radius:9999px;
          background:#3b82f6;
          box-shadow:0 4px 14px rgba(59,130,246,0.5);
        "></span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

/** Inner map rendered only on the client. */
function MapInner({ position }: DriverLiveMapProps) {
  const mapRef  = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialise the map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    const defaultCenter: [number, number] = position
      ? [position.lat, position.lng]
      : [7.8731, 80.7718]; // Sri Lanka

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current  = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move / create the driver marker when position changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    const latlng: [number, number] = [position.lat, position.lng];

    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      const icon = createDriverIcon();
      const marker = icon
        ? L.marker(latlng, { icon }).addTo(map)
        : L.marker(latlng).addTo(map);
      marker.bindPopup("<strong>Your position</strong>");
      markerRef.current = marker;
    }

    map.setView(latlng, map.getZoom());
  }, [position]);

  return (
    <>
      {/* Pulse-animation keyframes injected inline — avoids needing a global CSS addition */}
      <style>{`
        @keyframes driver-pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50%       { transform: scale(2); opacity: 0;    }
        }
      `}</style>
      <div ref={containerRef} style={{ height: "100%", width: "100%", borderRadius: "inherit" }} />
    </>
  );
}

// Disable SSR — Leaflet requires the DOM
const DriverLiveMapClient = dynamic(
  () => Promise.resolve(MapInner),
  { ssr: false }
);

export function DriverLiveMap({ position }: DriverLiveMapProps) {
  return <DriverLiveMapClient position={position} />;
}
