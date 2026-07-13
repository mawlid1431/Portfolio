"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

export type ActivityPoint = {
  label: string;
  messages: number;
  projects: number;
};

type SeriesKey = "messages" | "projects";

const SERIES: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: "messages", label: "Messages", color: "#3dd68c" },
  { key: "projects", label: "Projects", color: "#c4a574" },
];

type OverviewActivityChartProps = {
  activity: ActivityPoint[];
};

export default function OverviewActivityChart({
  activity,
}: OverviewActivityChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const width = 640;
  const height = 200;
  const pad = { top: 16, right: 12, bottom: 32, left: 28 };

  const layout = useMemo(() => {
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const max = Math.max(
      1,
      ...activity.flatMap((point) => [point.messages, point.projects]),
    );

    const toPoints = (key: SeriesKey) =>
      activity.map((point, index) => ({
        x:
          pad.left +
          (activity.length <= 1
            ? innerW / 2
            : (index / (activity.length - 1)) * innerW),
        y: pad.top + innerH - (point[key] / max) * innerH,
        value: point[key],
      }));

    return {
      max,
      seriesPoints: {
        messages: toPoints("messages"),
        projects: toPoints("projects"),
      },
      baselineY: pad.top + innerH,
    };
  }, [activity, pad.bottom, pad.left, pad.right, pad.top]);

  if (activity.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-cream-dim">
        Not enough activity yet to chart.
      </div>
    );
  }

  const hover = hoveredIndex !== null ? activity[hoveredIndex] : null;

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap gap-3">
        {SERIES.map((series) => (
          <span
            key={series.key}
            className="inline-flex items-center gap-1.5 text-[11px] text-cream-dim"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {[0, 0.5, 1].map((tick) => {
          const y = pad.top + (1 - tick) * (height - pad.top - pad.bottom);
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="rgba(244,238,225,0.08)"
              />
              <text
                x={pad.left - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-cream-dim"
                style={{ fontSize: 9 }}
              >
                {Math.round(layout.max * tick)}
              </text>
            </g>
          );
        })}

        {SERIES.map((series) => {
          const points = layout.seriesPoints[series.key];
          const line = points
            .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
            .join(" ");
          const area = `${line} L ${points.at(-1)?.x ?? pad.left} ${layout.baselineY} L ${points[0]?.x ?? pad.left} ${layout.baselineY} Z`;
          const gradientId = `trend-${series.key}`;

          return (
            <g key={series.key}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={series.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={series.color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill={`url(#${gradientId})`} />
              <path
                d={line}
                fill="none"
                stroke={series.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}

        {activity.map((point, index) => {
          const x =
            pad.left +
            (activity.length <= 1
              ? (width - pad.left - pad.right) / 2
              : (index / (activity.length - 1)) * (width - pad.left - pad.right));
          return (
            <g key={point.label}>
              <text
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="fill-cream-dim"
                style={{ fontSize: 9 }}
              >
                {point.label}
              </text>
              <rect
                x={x - 16}
                y={pad.top}
                width={32}
                height={height - pad.top - pad.bottom}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(index)}
              />
            </g>
          );
        })}

        {hoveredIndex !== null ? (
          <line
            x1={layout.seriesPoints.messages[hoveredIndex]?.x ?? 0}
            x2={layout.seriesPoints.messages[hoveredIndex]?.x ?? 0}
            y1={pad.top}
            y2={layout.baselineY}
            stroke="rgba(61,214,140,0.35)"
            strokeDasharray="3 3"
          />
        ) : null}
      </svg>

      {hover ? (
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-10 z-10 min-w-[140px] -translate-x-1/2 rounded-lg border border-cream/15 bg-ink px-2.5 py-2 shadow-xl",
          )}
        >
          <p className="text-[10px] font-medium text-cream-dim">{hover.label}</p>
          <ul className="mt-1.5 space-y-1 border-t border-cream/10 pt-1.5">
            {SERIES.map((series) => (
              <li
                key={series.key}
                className="flex items-center justify-between gap-3 text-[10px]"
              >
                <span className="flex items-center gap-1.5 text-cream-dim">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: series.color }}
                  />
                  {series.label}
                </span>
                <span className="tabular-nums text-cream">{hover[series.key]}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
