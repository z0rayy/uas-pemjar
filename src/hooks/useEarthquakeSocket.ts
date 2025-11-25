import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Earthquake {
  id: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  place: string;
}

interface CityEarthquakeStatus {
  cityName: string;
  province: string;
  distance: number;
  magnitude: number;
  depth: number;
  time: string;
  affectedByEarthquake: boolean;
  intensity: "low" | "medium" | "high" | "very_high";
}

interface EarthquakeData {
  earthquakes: Earthquake[];
  affectedCities: CityEarthquakeStatus[];
  timestamp: string;
}

export const useEarthquakeSocket = () => {
  const [data, setData] = useState<EarthquakeData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    socket.on("earthquakeUpdate", (update: EarthquakeData) => {
      console.log("Earthquake update received:", update);
      setData(update);
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

  return { data, isConnected, error };
};
