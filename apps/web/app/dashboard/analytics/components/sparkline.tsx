"use client";

interface SparklineProps {
  data: number[];  // exactly 7 values (last 7 days, oldest → newest)
  className?: string;
}

export function Sparkline({ data, className }: SparklineProps) {
  const max = Math.max(...data, 1); // avoid divide-by-zero
  const hasActivity = data.some((v) => v > 0);

  return (
    <div
      className={`flex items-end gap-[2px] h-6 w-16 ${className ?? ""}`}
      aria-hidden
    >
      {data.map((val, i) => {
        const heightPct = Math.round((val / max) * 100);
        const isToday = i === data.length - 1;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${Math.max(heightPct, val > 0 ? 15 : 8)}%`,
              background: !hasActivity
                ? "hsl(var(--muted-foreground)/0.2)"
                : isToday && val > 0
                ? "hsl(var(--primary))"
                : val > 0
                ? "hsl(var(--primary)/0.45)"
                : "hsl(var(--muted-foreground)/0.15)",
            }}
          />
        );
      })}
    </div>
  );
}
