"use client";

interface MetricCardProps {
  label: string;
  value: number | string;
  subtitle: string;
  loading?: boolean;
}

export function MetricCard({ label, value, subtitle, loading = false }: MetricCardProps) {
  return (
    <article className="stat-card metric-card">
      <div className="stat-label">{label}</div>
      {loading ? (
        <>
          <div className="skeleton metric-card-skeleton-value" />
          <div className="skeleton metric-card-skeleton-subtitle" />
        </>
      ) : (
        <>
          <div className="stat-value">{value}</div>
          <div className="stat-sub">{subtitle}</div>
        </>
      )}
    </article>
  );
}
