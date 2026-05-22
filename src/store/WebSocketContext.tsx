import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Bill, Draft } from '../types';

interface WsEvent {
  type: 'BILL_CREATED' | 'BILL_UPDATED' | 'DRAFT_CREATED' | 'DRAFT_UPDATED' | 'INVENTORY_UPDATED';
  payload: any;
}

interface WebSocketContextType {
  lastEvent: WsEvent | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { business_id } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);
  const shouldReconnect = useRef(true);

  const stopPing = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
  };

  const startPing = (socket: WebSocket) => {
    stopPing();
    // Send a ping every 30s to keep Render from closing the idle connection
    pingInterval.current = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'PING' }));
      }
    }, 30000);
  };

  const connect = () => {
    if (!business_id) return;
    if (!shouldReconnect.current) return;

    // Clean up any existing socket
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      ws.current.close();
    }

    const wsUrl = `wss://syncommerce.onrender.com/ws/${business_id}`;
    console.log(`[WS] Connecting to ${wsUrl} (attempt ${retryCount.current + 1})`);

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log('[WS] Connected to business:', business_id);
      setIsConnected(true);
      retryCount.current = 0; // Reset backoff on success
      startPing(socket);
    };

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // Ignore PONG responses from server
        if (data.type === 'PONG') return;
        console.log('[WS] Event received:', data.type);
        setLastEvent(data as WsEvent);
      } catch (error) {
        console.error('[WS] Failed to parse message', error);
      }
    };

    socket.onclose = (event) => {
      console.log('[WS] Disconnected. Code:', event.code);
      setIsConnected(false);
      stopPing();

      if (!shouldReconnect.current) return;

      // Exponential backoff: 3s, 6s, 12s, 24s, max 30s
      const delay = Math.min(3000 * Math.pow(2, retryCount.current), 30000);
      retryCount.current += 1;

      console.log(`[WS] Reconnecting in ${delay / 1000}s...`);
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, delay);
    };

    socket.onerror = (error) => {
      console.log('[WS] Error occurred, closing socket');
      socket.close();
    };
  };

  useEffect(() => {
    shouldReconnect.current = true;
    retryCount.current = 0;

    if (business_id) {
      connect();
    } else {
      setIsConnected(false);
    }

    return () => {
      shouldReconnect.current = false;
      stopPing();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [business_id]);

  return (
    <WebSocketContext.Provider value={{ lastEvent, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return ctx;
}
