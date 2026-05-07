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

  const connect = () => {
    if (!business_id) return;

    // Use standard wss protocol for Render
    const wsUrl = `wss://syncommerce.onrender.com/ws/${business_id}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WS Connected to business:', business_id);
      setIsConnected(true);
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };

    ws.current.onmessage = (e) => {
      try {
        const data: WsEvent = JSON.parse(e.data);
        console.log('WS Event received:', data.type);
        setLastEvent(data);
      } catch (error) {
        console.error('Failed to parse WS message', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WS Disconnected');
      setIsConnected(false);
      // Auto reconnect
      reconnectTimeout.current = setTimeout(() => {
        console.log('Attempting to reconnect WS...');
        connect();
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.log('WS Error:', error);
      ws.current?.close();
    };
  };

  useEffect(() => {
    if (business_id) {
      connect();
    } else {
      // Clean up if logged out
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      setIsConnected(false);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
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
