import { useState, useEffect, useRef } from "react";
import { trackingService, type LocationPayload } from "@/src/api/services/trackingService";

export interface UseLiveGeolocationProps {
  assignmentId?: number | null;
  driverId?: number | null;
  enabled: boolean;
}

export interface GeoPosition {
  lat: number;
  lng: number;
}

export function useLiveGeolocation({ assignmentId, driverId, enabled }: UseLiveGeolocationProps) {
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [position, setPosition] = useState<GeoPosition | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If tracking is disabled, missing assignment, or missing driver, stop tracking
    if (!enabled || !assignmentId || !driverId) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const sendLocation = (pos: GeolocationPosition) => {
      const { latitude, longitude, speed } = pos.coords;
      const now = Date.now();
      // Prevent spamming the API: max 1 update every 5 seconds
      if (now - lastUpdateRef.current < 5000) return;
      lastUpdateRef.current = now;

      // Update the live position state so the driver map can render it
      setPosition({ lat: latitude, lng: longitude });

      const payload: LocationPayload = {
        assignmentId,
        driverId,
        latitude,
        longitude,
        speedKmh: speed !== null ? speed * 3.6 : null,
      };

      trackingService
        .postLocation(payload)
        .then(() => setLastSent(new Date()))
        .catch((err) => {
          console.error("Failed to post location update:", err);
          setError("Failed to send location to server.");
        });
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        lastPositionRef.current = pos;
        sendLocation(pos);
      },
      () => {
        setError("Unable to retrieve your location. Please check your GPS permissions.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Ping the server every 5 seconds with the last known position when stationary
    intervalRef.current = setInterval(() => {
      if (lastPositionRef.current) {
        sendLocation(lastPositionRef.current);
      }
    }, 5000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, assignmentId, driverId]);

  return { error, lastSent, position };
}
