"use client";

export function DonutChart({ data, size = 180, thickness = 30, title }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d) => {
    const pct = total > 0 ? d.value / total : 0;
    const dashLength = pct * circumference;
    const dashOffset = -offset;
    offset += dashLength;
    return { ...d, pct, dashLength, dashOffset };
  });

  return (
    <div className="flex flex-col items-center">
      {title && (
        <div
          className="text-xs font-semibold mb-3 uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </div>
      )}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={thickness}
          />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
              strokeDashoffset={seg.dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{
                transition:
                  "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease",
              }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {total.toFixed(total < 100 ? 1 : 0)}
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Total
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: seg.color }}
            ></span>
            <span style={{ color: "var(--text-secondary)" }}>{seg.label}</span>
            <span
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {(seg.pct * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ data, height = 200, title, showValues = true }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.min(40, Math.max(20, 300 / data.length));

  return (
    <div>
      {title && (
        <div
          className="text-xs font-semibold mb-3 uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </div>
      )}
      <div className="flex items-end justify-center gap-3" style={{ height }}>
        {data.map((d, i) => {
          const barHeight = Math.max(4, (d.value / maxValue) * (height - 40));
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1"
              style={{ width: barWidth }}
            >
              {showValues && (
                <div
                  className="text-[10px] font-semibold"
                  style={{ color: d.color || "var(--accent)" }}
                >
                  {d.value < 1 ? d.value.toFixed(4) : d.value.toFixed(1)}
                </div>
              )}
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: barHeight,
                  background: d.color || "var(--accent)",
                  opacity: 0.85,
                }}
              ></div>
              <div
                className="text-[9px] text-center truncate w-full"
                style={{ color: "var(--text-muted)" }}
              >
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HBarChart({ data, title, maxWidth = "100%" }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ maxWidth }}>
      {title && (
        <div
          className="text-xs font-semibold mb-3 uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </div>
      )}
      <div className="space-y-3">
        {data.map((d, i) => {
          const pct = (d.value / maxValue) * 100;
          return (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span
                  className="truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {d.label}
                </span>
                <span
                  className="font-semibold ml-2"
                  style={{ color: d.color || "var(--accent)" }}
                >
                  {d.displayValue || d.value.toFixed(2)}
                </span>
              </div>
              <div
                className="w-full h-3 rounded-full overflow-hidden"
                style={{ background: "var(--bg-secondary)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: d.color || "var(--accent)",
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GaugeChart({ value, max, label, color, size = 150 }) {
  const pct = Math.min(value / (max || 1), 1);
  const radius = (size - 20) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const startAngle = -180;
  const sweepAngle = 180;
  const endAngle = startAngle + sweepAngle * pct;

  const polarToCartesian = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const bgStart = polarToCartesian(startAngle);
  const bgEnd = polarToCartesian(startAngle + sweepAngle);
  const arcEnd = polarToCartesian(endAngle);
  const largeArcBg = sweepAngle > 180 ? 1 : 0;
  const largeArc = sweepAngle * pct > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 20}
        viewBox={`0 0 ${size} ${size / 2 + 20}`}
      >
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${largeArcBg} 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none"
          stroke="var(--border)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {pct > 0 && (
          <path
            d={`M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`}
            fill="none"
            stroke={color || "var(--accent)"}
            strokeWidth="12"
            strokeLinecap="round"
            style={{ transition: "d 0.6s ease" }}
          />
        )}
      </svg>
      <div className="text-center -mt-4">
        <div
          className="text-xl font-bold"
          style={{ color: color || "var(--accent)" }}
        >
          {(pct * 100).toFixed(1)}%
        </div>
        {label && (
          <div
            className="text-[10px] mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

export function Sparkline({ data, width = 120, height = 40, color }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map(
      (v, i) =>
        `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`,
    )
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color || "var(--accent)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
