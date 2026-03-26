"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { divIcon, type DivIcon, type Marker as LeafletMarker } from "leaflet";
import { createTrackingConnection } from "@/lib/signalr/trackingConnection";
import type { LiveVehiclePosition, VehicleLocationEvent } from "@/lib/types/tracking";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const DEFAULT_CENTER: [number, number] = [7.8731, 80.7718];

interface LiveTrackingMapProps {
  className?: string;
  onVehicleCountChange?: (count: number) => void;
}

function createStatusIcon(color: string): DivIcon {
  return divIcon({
    className: "",
    html: `
      <div style="position:relative;width:22px;height:22px;">
        <span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:0.22;"></span>
        <span style="position:absolute;left:5px;top:5px;width:12px;height:12px;border:2px solid white;border-radius:9999px;background:${color};box-shadow:0 4px 10px rgba(15,23,42,0.28);"></span>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "moving":
    case "intransit":
    case "active":
      return "#16a34a";
    case "idle":
    case "waiting":
      return "#eab308";
    default:
      return "#64748b";
  }
}

const VehicleMarker = memo(function VehicleMarker({ vehicle }: { vehicle: LiveVehiclePosition }) {
  const markerRef = useRef<LeafletMarker | null>(null);

  const icon = useMemo(() => createStatusIcon(getStatusColor(vehicle.status)), [vehicle.status]);

  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setLatLng([vehicle.lat, vehicle.lng]);
  }, [vehicle.lat, vehicle.lng]);

  return (
    <Marker
      ref={markerRef}
      position={[vehicle.lat, vehicle.lng]}
      icon={icon}
      keyboard={false}
    >
      <Popup>
        <div className="min-w-32">
          <div className="text-sm font-semibold text-slate-900">Vehicle {vehicle.vehicleId}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{vehicle.status}</div>
          <div className="mt-2 text-xs text-slate-600">
            {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

export function LiveTrackingMap({ className, onVehicleCountChange }: LiveTrackingMapProps) {
  const [vehicles, setVehicles] = useState<Record<string, LiveVehiclePosition>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const connection = createTrackingConnection();

    const handleLocation = (payload: VehicleLocationEvent) => {
      setVehicles((current) => {
        const nextVehicle: LiveVehiclePosition = {
          vehicleId: payload.vehicleId,
          lat: payload.latitude,
          lng: payload.longitude,
          status: payload.status,
        };

        const previous = current[payload.vehicleId];
        if (
          previous &&
          previous.lat === nextVehicle.lat &&
          previous.lng === nextVehicle.lng &&
          previous.status === nextVehicle.status
        ) {
          return current;
        }

        return {
          ...current,
          [payload.vehicleId]: nextVehicle,
        };
      });
    };

    connection.subscribeToVehicleLocations(handleLocation);

    void connection.start().catch(() => {
      setConnectionError("Live tracking is temporarily unavailable.");
    });

    return () => {
      connection.unsubscribeFromVehicleLocations();
      void connection.stop().catch(() => undefined);
    };
  }, []);

  const vehicleList = useMemo(() => Object.values(vehicles), [vehicles]);

  useEffect(() => {
    onVehicleCountChange?.(vehicleList.length);
  }, [onVehicleCountChange, vehicleList.length]);

  return (
    <div className={["tracking-map relative h-full min-h-[420px] overflow-hidden", className].filter(Boolean).join(" ")}>
      {connectionError ? (
        <div className="absolute left-4 right-4 top-4 z-[500] rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 shadow-lg shadow-black/30 backdrop-blur">
          {connectionError}
        </div>
      ) : null}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={8}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {vehicleList.map((vehicle) => (
          <VehicleMarker key={vehicle.vehicleId} vehicle={vehicle} />
        ))}
      </MapContainer>
    </div>
  );
}
