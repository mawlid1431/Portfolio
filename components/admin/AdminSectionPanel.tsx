"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AdminSectionPanelProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminSectionPanel({
  title,
  description,
  actions,
  children,
  className,
}: AdminSectionPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "overflow-hidden rounded-2xl border border-cream/10 bg-ink-soft/70",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-cream/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-wide text-cream sm:text-base">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs text-cream-dim">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </motion.section>
  );
}

function MetricSparkline({ values, color }: { values: number[]; color: string }) {
  const width = 88;
  const height = 28;
  const padX = 2;
  const padY = 4;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? (width - padX * 2) / (values.length - 1) : 0;

  const points = values.map((value, index) => ({
    x: padX + index * step,
    y: padY + (height - padY * 2) - (value / max) * (height - padY * 2),
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? padX} ${height - padY} L ${points[0]?.x ?? padX} ${height - padY} Z`;
  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-2.5 h-6 w-full opacity-80"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  accentColor?: string;
  sparkline?: number[];
  onClick?: () => void;
};

export function AdminStatCard({
  label,
  value,
  hint,
  accentColor,
  sparkline,
  onClick,
}: AdminStatCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="h-full"
    >
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-cream/10 bg-ink/50 p-4 text-left transition-colors",
          onClick && "cursor-pointer hover:border-emerald-glow/35",
        )}
      >
        {accentColor ? (
          <span
            className="absolute inset-y-0 left-0 w-0.5 rounded-r-full"
            style={{ backgroundColor: accentColor }}
            aria-hidden
          />
        ) : null}
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-cream-dim">
          {label}
        </p>
        <p className="mt-1.5 font-display text-[1.75rem] leading-none tracking-wide text-cream">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-[11px] leading-snug text-cream-dim">{hint}</p>
        ) : null}
        {sparkline && accentColor ? (
          <MetricSparkline values={sparkline} color={accentColor} />
        ) : null}
      </Wrapper>
    </motion.div>
  );
}
