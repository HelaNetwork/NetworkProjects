import React from 'react';
import './StatCard.css';

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  tone = "default",
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-destructive"
          : "text-accent-light";

  return (
    <div className="stat-card glass hover-lift">
      <div className="stat-header">
        <span className="stat-label">
          {label}
        </span>
        {Icon && <Icon className={`stat-icon ${toneClass}`} strokeWidth={2} />}
      </div>
      <div className="stat-body">
        <span className="stat-value">
          {value}
        </span>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  );
}
