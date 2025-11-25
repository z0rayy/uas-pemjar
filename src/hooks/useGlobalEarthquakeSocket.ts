import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface GlobalEarthquake {
  id: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  place: string;
  country: string;
  tsunamiWarning: boolean;
}

interface EarthquakeUpdate {
  earthquakes: GlobalEarthquake[];
  newEarthquakes: GlobalEarthquake[];
  totalEarthquakes: number;
  timestamp: string;
}

export const useGlobalEarthquakeSocket = () => {
  const [data, setData] = useState<EarthquakeUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNotifications, setNewNotifications] = useState<GlobalEarthquake[]>([]);

  useEffect(() => {
    const socket: Socket = io("http://localhost:3001", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      setError(null);
    });

    socket.on("connected", (response) => {
      console.log("Server response:", response);
    });

    socket.on("earthquakeUpdate", (update: EarthquakeUpdate) => {
      console.log("Earthquake update received:", update);
      setData(update);

      // Add new earthquakes to notifications
      if (update.newEarthquakes && update.newEarthquakes.length > 0) {
        setNewNotifications((prev) => [...update.newEarthquakes, ...prev].slice(0, 50));
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      setError("Failed to connect to server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { data, isConnected, error, newNotifications, setNewNotifications };
};
