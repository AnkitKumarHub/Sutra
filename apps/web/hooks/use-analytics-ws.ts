"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

export interface AnalyticsDelta {
  type: "response_delta";
  formId: string;
  delta: {
    totalResponses: number;
    newSubmission: {
      id: string;
      submittedAt: string;
      values: Array<{ fieldId: string; value: unknown }>;
    };
  };
  timestamp: string;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;

/**
 * Connects to the analytics WebSocket channel for a specific form.
 * Automatically reconnects with exponential backoff on disconnect.
 * Returns the latest delta event and the connection status.
 */
export function useAnalyticsWs(formId: string) {
  const [delta, setDelta] = useState<AnalyticsDelta | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const isReconnect = reconnectAttemptsRef.current > 0;
    setStatus(isReconnect ? "reconnecting" : "connecting");

    const wsBase =
      (typeof window !== "undefined" &&
        (window as { _ENV_WS_URL?: string })._ENV_WS_URL) ||
      process.env.NEXT_PUBLIC_WS_URL ||
      "ws://localhost:8000";

    const wsUrl = `${wsBase}/ws?channel=analytics:${formId}`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      // WebSocket not available (SSR) — silently skip
      return;
    }

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return; }
      setStatus("connected");
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const msg = JSON.parse(event.data as string) as AnalyticsDelta;
        if (msg.type === "response_delta") {
          setDelta(msg);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setStatus("disconnected");

      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay =
          BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current);
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [formId]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { delta, status };
}
