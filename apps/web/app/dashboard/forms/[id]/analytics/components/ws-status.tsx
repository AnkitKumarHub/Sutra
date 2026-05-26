"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ConnectionStatus } from "~/hooks/use-analytics-ws";

interface WsStatusProps {
  status: ConnectionStatus;
}

const STATUS_CONFIG: Record<ConnectionStatus, { color: string; label: string }> = {
  connected: { color: "bg-emerald-500", label: "Live" },
  connecting: { color: "bg-amber-400", label: "Connecting…" },
  reconnecting: { color: "bg-amber-400", label: "Reconnecting…" },
  disconnected: { color: "bg-muted-foreground/40", label: "Offline" },
};

export function WsStatus({ status }: WsStatusProps) {
  const { color, label } = STATUS_CONFIG[status];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5 text-xs text-muted-foreground select-none"
      >
        <span className={`size-2 rounded-full ${color} ${status === "connected" ? "" : "animate-pulse"}`} />
        {label}
      </motion.div>
    </AnimatePresence>
  );
}
