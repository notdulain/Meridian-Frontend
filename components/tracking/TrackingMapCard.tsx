"use client";

import { useState } from "react";
import { LiveTrackingMap } from "@/components/LiveTrackingMap";
import { PREFERENCE_KEYS, getBooleanPreference } from "@/src/lib/preferences";

export function TrackingMapCard() {
  const [vehicleCount, setVehicleCount] = useState(0);
  const [mapEnabled] = useState(() => getBooleanPreference(PREFERENCE_KEYS.liveTrackingMapEnabled, true));

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800/50 px-5 py-4">
        <div>
          <h2 className="text-white font-semibold">Global Telemetry</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">Live Coordinates</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Active Nodes</span>
            <span className="text-white font-semibold">{vehicleCount}</span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs text-emerald-400 font-semibold tracking-widest uppercase">Live</span>
          </div>
        </div>
      </div>

      {!mapEnabled && (
        <div className="border-b border-amber-500/30 bg-amber-500/20 px-4 py-2 text-center text-xs text-amber-200">
          Tracking temporarily disabled.
        </div>
      )}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
        {mapEnabled && (
          <LiveTrackingMap onVehicleCountChange={setVehicleCount} className="h-full w-full" />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-6 border-t border-slate-700 bg-slate-950/90 px-5 py-3">
        <div className="text-xs text-slate-500 uppercase tracking-widest mr-2">Legend</div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-slate-400">Moving</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="text-sm text-slate-400">Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-600" />
          <span className="text-sm text-slate-400">Offline</span>
        </div>
      </div>
    </section>
  );
}
