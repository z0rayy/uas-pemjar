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

interface CityHistory {
  [cityName: string]: {
    lastEarthquakeTime: string | null;
    lastMagnitude: number | null;
    totalEarthquakes: number;
    isCurrentlyAffected: boolean;
    lastEarthquakeData: CityEarthquakeStatus | null;
  };
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
  const [cityHistory, setCityHistory] = useState<CityHistory>({});

  useEffect(() => {
    const socket: Socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3001",
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      }
    );

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

      // Update city history dengan data gempa terbaru
      setCityHistory((prevHistory) => {
        const newHistory = { ...prevHistory };

        // Update affected cities
        update.affectedCities.forEach((city) => {
          if (!newHistory[city.cityName]) {
            newHistory[city.cityName] = {
              lastEarthquakeTime: null,
              lastMagnitude: null,
              totalEarthquakes: 0,
              isCurrentlyAffected: false,
              lastEarthquakeData: null,
            };
          }

          // Check apakah ini earthquake baru (berbeda dari yang terakhir)
          const prevData = newHistory[city.cityName].lastEarthquakeData;
          const isNewEarthquake = !prevData || prevData.time !== city.time;

          if (isNewEarthquake) {
            newHistory[city.cityName].totalEarthquakes += 1;
          }

          newHistory[city.cityName].lastEarthquakeTime = city.time;
          newHistory[city.cityName].lastMagnitude = city.magnitude;
          newHistory[city.cityName].isCurrentlyAffected = true;
          newHistory[city.cityName].lastEarthquakeData = city;
        });

        return newHistory;
      });
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

  return { data, isConnected, error, cityHistory };
};
