"use client";

import { useState } from "react";
import { Activity, Radio } from "lucide-react";
import { LiveTrackingMap } from "@/components/LiveTrackingMap";

export function TrackingMapCard() {
  const [vehicleCount, setVehicleCount] = useState(0);

  return (
    <section className="lg:col-span-2">
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/80 shadow-lg shadow-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900/80 px-5 py-5 lg:px-6">
          <div>
            <h2 className="text-lg font-medium text-white">Fleet Map</h2>
            <p className="mt-1 text-sm text-slate-400">Live vehicle positions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-sm text-slate-300">
              <Activity className="h-4 w-4 text-cyan-300" />
              <span>{vehicleCount} active vehicles</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              <span>Live</span>
            </div>
          </div>
        </div>

        <div className="relative h-[520px]">
          <LiveTrackingMap onVehicleCountChange={setVehicleCount} />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-700 bg-slate-900/80 px-5 py-5 text-sm text-slate-300 lg:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-slate-200">
            <Radio className="h-4 w-4 text-cyan-300" />
            Live status legend
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200 ring-1 ring-inset ring-emerald-500/20">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Moving
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-amber-200 ring-1 ring-inset ring-amber-500/20">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            Idle
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-500/10 px-3 py-1 text-slate-300 ring-1 ring-inset ring-slate-500/20">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            Offline
          </span>
        </div>
      </div>
    </section>
  );
}
