"use client";

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import type { LocationUpdateEvent } from "@/lib/types/tracking";
import { getStoredAccessToken } from "@/src/lib/auth/session";

export interface TrackingConnection {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  subscribeToVehicleLocations: (handler: (payload: LocationUpdateEvent) => void) => void;
  unsubscribeFromVehicleLocations: () => void;
  joinAssignmentGroup: (assignmentId: number) => Promise<void>;
  leaveAssignmentGroup: (assignmentId: number) => Promise<void>;
}

function getTrackingHubUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;

  if (normalizedBase.endsWith("/hubs/tracking") || normalizedBase.endsWith("/trackingHub")) {
    return normalizedBase;
  }

  return `${normalizedBase}/hubs/tracking`;
}

export function createTrackingConnection(): TrackingConnection {
  let locationHandler: ((payload: LocationUpdateEvent) => void) | null = null;
  let startPromise: Promise<void> | null = null;
  const joinedGroups = new Set<number>();

  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(getTrackingHubUrl(), {
      transport: HttpTransportType.WebSockets,
      skipNegotiation: true,
      accessTokenFactory: () => getStoredAccessToken() || "",
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.None)
    .build();

  connection.onreconnected(() => {
    // MER-247: gracefully handle reconnection by re-joining known groups
    console.info("[tracking] reconnected, rejoining active assignment groups...");
    joinedGroups.forEach((id) => {
      connection.invoke("JoinAssignmentGroup", id).catch(err => {
        console.error(`[tracking] failed to rejoin group ${id}`, err);
      });
    });
  });

  return {
    start: async () => {
      if (connection.state === HubConnectionState.Connected || connection.state === HubConnectionState.Connecting) {
        return;
      }

      if (!getStoredAccessToken()) {
        return;
      }

      if (!startPromise) {
        console.info("[tracking] starting connection", getTrackingHubUrl());
        startPromise = connection.start()
          .then(() => {
            console.info("[tracking] connected");
            // Also join any groups that the developer requested before it was strictly connected
            joinedGroups.forEach((id) => {
              connection.invoke("JoinAssignmentGroup", id).catch(err => {
                console.error(`[tracking] failed to join group ${id}`, err);
              });
            });
          })
          .catch((error) => Promise.reject(error))
          .finally(() => {
            startPromise = null;
          });
      }

      await startPromise;
    },
    stop: async () => {
      if (connection.state === HubConnectionState.Disconnected) {
        return;
      }

      console.info("[tracking] stopping connection");
      await connection.stop();
    },
    subscribeToVehicleLocations: (handler: (location: LocationUpdateEvent) => void) => {
      locationHandler = handler;
      connection.on("ReceiveLocationUpdate", handler);
    },
    unsubscribeFromVehicleLocations: () => {
      if (!locationHandler) return;
      connection.off("ReceiveLocationUpdate", locationHandler);
      locationHandler = null;
    },
    joinAssignmentGroup: async (assignmentId: number) => {
      joinedGroups.add(assignmentId);
      if (connection.state === HubConnectionState.Connected) {
        try {
          await connection.invoke("JoinAssignmentGroup", assignmentId);
          console.info(`[tracking] joined group ${assignmentId}`);
        } catch (e) {
          console.error(`[tracking] failed to join group ${assignmentId}`, e);
        }
      }
    },
    leaveAssignmentGroup: async (assignmentId: number) => {
      joinedGroups.delete(assignmentId);
      if (connection.state === HubConnectionState.Connected) {
        try {
          await connection.invoke("LeaveAssignmentGroup", assignmentId);
          console.info(`[tracking] left group ${assignmentId}`);
        } catch (e) {
          console.error(`[tracking] failed to leave group ${assignmentId}`, e);
        }
      }
    },
  };
}
