"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { deliveryService } from "@/src/api/services/deliveryService";
import type { DeliveryTrendPointDto, TrendRange } from "@/src/api/types/dtos";

export default function DeliveryTrendsPage() {
  const [range, setRange] = useState<TrendRange>("daily");
  const [data, setData] = useState<DeliveryTrendPointDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrends(range);
  }, [range]);

  const fetchTrends = async (selectedRange: TrendRange) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deliveryService.trends({ range: selectedRange });
      // Depending on the apiRequest wrapper, the data might be nested inside `.data` 
      // API returns: { success: true, data: [...], meta: {...} }
      // The `apiRequest` utility usually unwraps this, but we'll handle safely
      const trendsData = (response as { data?: DeliveryTrendPointDto[] }).data || response;
      setData(Array.isArray(trendsData) ? trendsData : []);
    } catch (err: unknown) {
      console.error("Failed to fetch trends:", err);
      setError(err instanceof Error ? err.message : "Failed to load delivery trends.");
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltips to show all stats nicely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as DeliveryTrendPointDto;
      return (
        <div style={{
          backgroundColor: "var(--color-bg-primary, #ffffff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <p style={{ fontWeight: 600, marginBottom: "8px" }}>Period: {label}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
            <p style={{ color: "var(--color-primary, #3b82f6)" }}><b>Total:</b> {point.total}</p>
            <p style={{ color: "var(--color-warning, #f59e0b)" }}><b>In Transit:</b> {point.inTransit}</p>
            <p style={{ color: "var(--color-success, #10b981)" }}><b>Delivered:</b> {point.delivered}</p>
            <p style={{ color: "var(--color-danger, #ef4444)" }}><b>Failed:</b> {point.failed}</p>
            <p style={{ color: "var(--color-text-secondary, #64748b)" }}>Pending: {point.pending}</p>
            <p style={{ color: "var(--color-text-secondary, #64748b)" }}>Assigned: {point.assigned}</p>
            <p style={{ color: "var(--color-text-secondary, #64748b)" }}>Canceled: {point.canceled}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div className="page-header-left">
          <Link href="/deliveries" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", marginBottom: "8px", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} /> Back to Deliveries
          </Link>
          <h1>Delivery Trends</h1>
          <p>Analyze delivery patterns over time</p>
        </div>
        
        <div style={{ display: "flex", gap: "8px", backgroundColor: "var(--color-bg-secondary)", padding: "4px", borderRadius: "8px" }}>
          {(["daily", "weekly", "monthly"] as TrendRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "6px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: range === r ? "var(--color-bg-primary)" : "transparent",
                color: range === r ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                fontWeight: range === r ? 600 : 400,
                boxShadow: range === r ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s"
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="alert alert-error" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={18} />
          {error}
          <button onClick={() => fetchTrends(range)} style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : null}

      <div className="card" style={{ padding: "24px", minHeight: "500px", position: "relative" }}>
        <h3 style={{ marginBottom: "24px", fontWeight: 600 }}>Delivery Volume & Status</h3>
        
        {loading ? (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.7)", zIndex: 10 }}>
            <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : null}

        {!loading && data.length === 0 && !error ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", color: "var(--color-text-secondary)" }}>
            <p>No trend data available for the selected range.</p>
          </div>
        ) : null}

        {data.length > 0 && (
          <div style={{ height: "400px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #e2e8f0)" />
                <XAxis 
                  dataKey="period" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "var(--color-text-secondary, #64748b)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "var(--color-text-secondary, #64748b)", fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                
                {/* Total volume area in background */}
                <Area 
                  type="monotone" 
                  name="Total Deliveries"
                  dataKey="total" 
                  fill="url(#colorTotal)" 
                  stroke="var(--color-primary, #3b82f6)" 
                  strokeWidth={2}
                />
                
                {/* Stacked bars for delivered/failed to show success patterns */}
                <Bar name="Delivered" dataKey="delivered" stackId="a" fill="var(--color-success, #10b981)" barSize={20} radius={[0, 0, 0, 0]} />
                <Bar name="Failed" dataKey="failed" stackId="a" fill="var(--color-danger, #ef4444)" barSize={20} radius={[4, 4, 0, 0]} />
                
                {/* Line for in-transit momentum */}
                <Line
                  name="In Transit"
                  type="monotone" 
                  dataKey="inTransit" 
                  stroke="var(--color-warning, #f59e0b)" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
