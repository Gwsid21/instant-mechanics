"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";

interface LiveContextValue {
  socket: Socket | null;
  connected: boolean;
}

const LiveContext = createContext<LiveContextValue>({
  socket: null,
  connected: false,
});

export function LiveProvider({ children }: { children: ReactNode }) {
  const [socket] = useState<Socket>(() =>
    io(API_BASE_URL, {
      transports: ["websocket"],
      reconnectionDelay: 1500,
    })
  );
  const [connected, setConnected] = useState(false);

    useEffect(() => {
    if (socket.connected) setConnected(true);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <LiveContext.Provider value={{ socket, connected }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive() {
  return useContext(LiveContext);
}

/**
 * Subscribe to a socket event for the lifetime of the calling component.
 * Falls back to a no-op if the socket hasn't connected yet (it will attach
 * once `useLive()` re-renders with a live socket instance).
 */
export function useLiveEvent<T = unknown>(
  event: string,
  handler: (payload: T) => void
) {
  const { socket } = useLive();

  useEffect(() => {
    if (!socket) return;
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event]);
}
