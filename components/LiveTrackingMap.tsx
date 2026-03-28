"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { divIcon, type DivIcon, type Marker as LeafletMarker } from "leaflet";
import { createTrackingConnection, type TrackingConnection } from "@/lib/signalr/trackingConnection";
import type { LiveVehiclePosition, LocationUpdateEvent, TrackedAssignment } from "@/lib/types/tracking";
import { trackingService } from "@/src/api/services/trackingService";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const DEFAULT_CENTER: [number, number] = [7.8731, 80.7718];

interface LiveTrackingMapProps {
  className?: string;
  onVehicleCountChange?: (count: number) => void;
  assignments?: TrackedAssignment[];
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
          <div className="text-sm font-semibold text-slate-900">Driver #{vehicle.driverId}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{vehicle.status}</div>
          <div className="mt-2 text-xs text-slate-600">Assignment #{vehicle.assignmentId}</div>
          <div className="mt-1 text-xs text-slate-600">Vehicle #{vehicle.vehicleId}</div>
          <div className="mt-2 text-xs text-slate-600">
            {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

function toIsoString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function buildVehiclePosition(
  assignment: TrackedAssignment,
  payload: {
    assignmentId?: unknown;
    driverId?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    timestamp?: unknown;
  },
  previous?: LiveVehiclePosition,
): LiveVehiclePosition | null {
  const latitude = toNumber(payload.latitude);
  const longitude = toNumber(payload.longitude);
  if (latitude === null || longitude === null) return null;

  const timestamp = toIsoString(payload.timestamp);
  const status =
    previous && previous.lat === latitude && previous.lng === longitude
      ? "Idle"
      : "Moving";

  return {
    assignmentId: String(payload.assignmentId ?? assignment.assignmentId),
    driverId: String(payload.driverId ?? assignment.driverId),
    vehicleId: String(assignment.vehicleId),
    lat: latitude,
    lng: longitude,
    status,
    timestamp,
  };
}

export function LiveTrackingMap({ className, onVehicleCountChange, assignments = [] }: LiveTrackingMapProps) {
  const [vehicles, setVehicles] = useState<Record<string, LiveVehiclePosition>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [activeConnection, setActiveConnection] = useState<TrackingConnection | null>(null);
  const assignmentsRef = useRef<TrackedAssignment[]>(assignments);

  useEffect(() => {
    assignmentsRef.current = assignments;
  }, [assignments]);

  // 1. Manage the core SignalR connection
  useEffect(() => {
    const connection = createTrackingConnection();

    const handleLocation = (payload: LocationUpdateEvent) => {
      const assignment =
        assignmentsRef.current.find((item) => item.assignmentId === payload.assignmentId)
        ?? assignmentsRef.current.find((item) => item.driverId === payload.driverId);

      if (!assignment) {
        return;
      }

      setConnectionError(null);
      setVehicles((current) => {
        const vehicleKey = String(assignment.driverId);
        const previous = current[vehicleKey];
        const nextVehicle = buildVehiclePosition(assignment, payload, previous);
        if (!nextVehicle) return current;

        return {
          ...current,
          [vehicleKey]: nextVehicle,
        };
      });
    };

    connection.subscribeToVehicleLocations(handleLocation);

    connection.start()
      .then(() => setActiveConnection(connection))
      .catch(() => {
        setConnectionError("Live tracking is temporarily unavailable.");
      });

    return () => {
      connection.unsubscribeFromVehicleLocations();
      void connection.stop().catch(() => undefined);
    };
  }, []);

  // 2. React to prop changes (MER-244: Subscribe to dispatcher client groups)
  const previousIdsRef = useRef<number[]>([]);
  useEffect(() => {
    if (!activeConnection) return;

    const assignmentIds = assignments.map((assignment) => assignment.assignmentId);
    const toJoin = assignmentIds.filter((id) => !previousIdsRef.current.includes(id));
    const toLeave = previousIdsRef.current.filter((id) => !assignmentIds.includes(id));

    toJoin.forEach((id) => void activeConnection.joinAssignmentGroup(id));
    toLeave.forEach((id) => void activeConnection.leaveAssignmentGroup(id));

    previousIdsRef.current = assignmentIds;
  }, [activeConnection, assignments]);

  // 3. Seed the map with persisted tracking so the dispatcher does not wait for a fresh live ping.
  useEffect(() => {
    let cancelled = false;

    async function seedTrackedVehicles() {
      if (assignments.length === 0) {
        setVehicles({});
        return;
      }

      const seeded = await Promise.all(
        assignments.map(async (assignment) => {
          try {
            const history = await trackingService.assignmentHistory(String(assignment.assignmentId));
            const latestHistory = Array.isArray(history) ? history[history.length - 1] : null;
            if (latestHistory) {
              return buildVehiclePosition(assignment, latestHistory);
            }
          } catch {
            // Ignore and fall back to last-known lookup.
          }

          try {
            const lastKnown = await trackingService.driverLastKnown(String(assignment.driverId));
            if (lastKnown) {
              return buildVehiclePosition(assignment, lastKnown);
            }
          } catch {
            // No persisted telemetry yet for this driver.
          }

          return null;
        }),
      );

      if (cancelled) return;

      setVehicles((current) => {
        const next = { ...current };

        seeded.forEach((vehicle) => {
          if (!vehicle) return;
          const existing = current[vehicle.driverId];
          const existingTime = existing?.timestamp ? Date.parse(existing.timestamp) : Number.NaN;
          const vehicleTime = vehicle.timestamp ? Date.parse(vehicle.timestamp) : Number.NaN;

          if (existing && Number.isFinite(existingTime) && Number.isFinite(vehicleTime) && existingTime > vehicleTime) {
            return;
          }

          next[vehicle.driverId] = existing
            ? { ...vehicle, status: existing.status }
            : vehicle;
        });

        return next;
      });
    }

    void seedTrackedVehicles();

    return () => {
      cancelled = true;
    };
  }, [assignments]);

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
