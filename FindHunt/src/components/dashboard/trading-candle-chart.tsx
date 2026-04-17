"use client";

import { motion } from "framer-motion";
import type { Candle } from "@/lib/mock-trading-data";

function CandlestickSvg({ data, height = 220 }: { data: Candle[]; height?: number }) {
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const w = 100; // viewBox width unit
  const innerW = w - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const lows = data.map((d) => d.l);
  const highs = data.map((d) => d.h);
  const minP = Math.min(...lows) - 1;
  const maxP = Math.max(...highs) + 1;
  const span = maxP - minP || 1;
  const y = (p: number) => pad.t + innerH - ((p - minP) / span) * innerH;
  const barW = innerW / data.length;
  const bodyW = Math.max(2, barW * 0.45);

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="h-full w-full min-h-[220px] text-slate-400"
      preserveAspectRatio="none"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const py = pad.t + innerH * (1 - f);
        const val = minP + span * f;
        return (
          <g key={f}>
            <line x1={pad.l} y1={py} x2={w - pad.r} y2={py} stroke="currentColor" strokeOpacity={0.15} />
            <text x={4} y={py + 3} fontSize="7" fill="currentColor" opacity={0.7}>
              {val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const cx = pad.l + barW * i + barW / 2;
        const yH = y(d.h);
        const yL = y(d.l);
        const yO = y(d.o);
        const yC = y(d.c);
        const top = Math.min(yO, yC);
        const bot = Math.max(yO, yC);
        const up = d.c >= d.o;
        const col = up ? "#10b981" : "#ef4444";
        return (
          <g key={d.t}>
            <line x1={cx} y1={yH} x2={cx} y2={yL} stroke={col} strokeWidth={0.9} vectorEffect="non-scaling-stroke" />
            <rect
              x={cx - bodyW / 2}
              y={top}
              width={bodyW}
              height={Math.max(0.8, bot - top)}
              fill={col}
              fillOpacity={up ? 0.9 : 0.85}
              rx={0.4}
            />
          </g>
        );
      })}
      {data.map((d, i) => {
        const cx = pad.l + barW * i + barW / 2;
        return (
          <text key={`l-${d.t}`} x={cx} y={height - 6} fontSize="7" textAnchor="middle" fill="currentColor" opacity={0.75}>
            {d.t}
          </text>
        );
      })}
    </svg>
  );
}

export function TradingCandleChart({ data, title }: { data: Candle[]; title?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-xl border border-emerald-100/60 bg-white/40 p-3 dark:border-white/10 dark:bg-slate-900/30"
    >
      {title && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </p>
      )}
      <div className="aspect-[16/9] min-h-[220px] w-full min-w-0">
        <CandlestickSvg data={data} />
      </div>
    </motion.div>
  );
}
