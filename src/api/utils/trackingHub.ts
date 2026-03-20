import { parseEndpoint } from "@/src/api/utils/endpoint";

export interface TrackingHubConnection {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  on: <TPayload = unknown>(event: string, handler: (payload: TPayload) => void) => void;
  off: (event: string) => void;
  invoke: (method: string, ...args: unknown[]) => Promise<unknown>;
}

interface SignalRModule {
  HubConnectionBuilder: new () => {
    withUrl: (url: string) => unknown;
    withAutomaticReconnect: () => unknown;
    build: () => {
      start: () => Promise<void>;
      stop: () => Promise<void>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      off: (event: string) => void;
      invoke: (method: string, ...args: unknown[]) => Promise<unknown>;
    };
  };
}

function toAbsoluteUrl(path: string): string {
  if (/^wss?:\/\//i.test(path) || /^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedBase.startsWith("https://")) {
    return `wss://${normalizedBase.slice("https://".length)}${normalizedPath}`;
  }

  if (normalizedBase.startsWith("http://")) {
    return `ws://${normalizedBase.slice("http://".length)}${normalizedPath}`;
  }

  return `${normalizedBase}${normalizedPath}`;
}

async function tryLoadSignalR(): Promise<SignalRModule | null> {
  try {
    const importRuntime = new Function("m", "return import(m);") as (moduleName: string) => Promise<unknown>;
    const imported = (await importRuntime("@microsoft/signalr")) as { default?: unknown } & Record<string, unknown>;

    if ("HubConnectionBuilder" in imported) {
      return imported as unknown as SignalRModule;
    }
    if (imported.default && typeof imported.default === "object" && "HubConnectionBuilder" in imported.default) {
      return imported.default as SignalRModule;
    }

    return null;
  } catch {
    return null;
  }
}

function createWebSocketFallback(url: string): TrackingHubConnection {
  let socket: WebSocket | null = null;
  const handlers = new Map<string, (payload: unknown) => void>();

  return {
    start: async () => {
      if (socket?.readyState === WebSocket.OPEN) return;

      await new Promise<void>((resolve, reject) => {
        socket = new WebSocket(url);
        socket.onopen = () => resolve();
        socket.onerror = () => reject(new Error("WebSocket connection failed"));
        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data) as { event?: string; payload?: unknown };
            if (parsed.event && handlers.has(parsed.event)) {
              const handler = handlers.get(parsed.event);
              if (handler) handler(parsed.payload);
            }
          } catch {
            // Ignore malformed frames from upstream.
          }
        };
      });
    },
    stop: async () => {
      socket?.close();
      socket = null;
    },
    on: (event, handler) => {
      handlers.set(event, handler as (payload: unknown) => void);
    },
    off: (event) => {
      handlers.delete(event);
    },
    invoke: async (method, ...args) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not connected");
      }
      socket.send(JSON.stringify({ method, args }));
      return null;
    },
  };
}

export async function createTrackingHubConnection(endpointDefinition: string): Promise<TrackingHubConnection> {
  const parsed = parseEndpoint(endpointDefinition);
  if (parsed.method !== "WS") {
    throw new Error(`Tracking hub endpoint must use WS method: ${endpointDefinition}`);
  }

  const hubUrl = toAbsoluteUrl(parsed.path);
  const signalR = await tryLoadSignalR();

  if (signalR?.HubConnectionBuilder) {
    const signalRConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl.replace(/^ws/, "http"))
      .withAutomaticReconnect()
      .build();

    return {
      start: () => signalRConnection.start(),
      stop: () => signalRConnection.stop(),
      on: (event, handler) => signalRConnection.on(event, handler as (...args: unknown[]) => void),
      off: (event) => signalRConnection.off(event),
      invoke: (method, ...args) => signalRConnection.invoke(method, ...args),
    };
  }

  return createWebSocketFallback(hubUrl);
}
