import express, { Express } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import axios from "axios";
import { javaCities, calculateDistance } from "./src/data/javaCities";

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Simple API endpoint
app.get("/", (req, res) => {
  res.send("Earthquake Server is running!");
});

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

// Fungsi untuk menghitung intensitas berdasarkan magnitude dan jarak
const calculateIntensity = (magnitude: number, distance: number): "low" | "medium" | "high" | "very_high" => {
  const intensityScore = magnitude - Math.log10(distance) / 2;

  if (intensityScore < 2) return "low";
  if (intensityScore < 4) return "medium";
  if (intensityScore < 6) return "high";
  return "very_high";
};

// Fetch data dari USGS API
const fetchEarthquakeData = async (): Promise<Earthquake[]> => {
  try {
    // Mengambil gempa dalam 24 jam terakhir di area Indonesia
    const response = await axios.get(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    );

    const earthquakes: Earthquake[] = response.data.features
      .filter(
        (feature: any) =>
          feature.geometry.coordinates[1] >= -8.8 && // Latitude Jawa
          feature.geometry.coordinates[1] <= -5.0 &&
          feature.geometry.coordinates[0] >= 105.0 && // Longitude Jawa
          feature.geometry.coordinates[0] <= 115.0
      )
      .map((feature: any) => ({
        id: feature.id,
        time: new Date(feature.properties.time).toLocaleString("id-ID"),
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        depth: feature.geometry.coordinates[2],
        magnitude: feature.properties.mag,
        place: feature.properties.place,
      }));

    return earthquakes;
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
    return [];
  }
};

// Fungsi untuk menentukan kota yang terkena gempa
const getAffectedCities = (earthquakes: Earthquake[]): CityEarthquakeStatus[] => {
  const cityStatuses: CityEarthquakeStatus[] = [];

  // Jika ada gempa, hitung jarak dan intensitas untuk setiap kota
  if (earthquakes.length > 0) {
    const latestEarthquake = earthquakes[0]; // Ambil gempa terbaru

    javaCities.forEach((city) => {
      const distance = calculateDistance(
        city.latitude,
        city.longitude,
        latestEarthquake.latitude,
        latestEarthquake.longitude
      );

      // Gempa terasa jika magnitude >= 3.0 dan jarak <= 300 km
      const affectedByEarthquake = latestEarthquake.magnitude >= 3.0 && distance <= 300;

      if (affectedByEarthquake) {
        const intensity = calculateIntensity(latestEarthquake.magnitude, distance);

        cityStatuses.push({
          cityName: city.name,
          province: city.province,
          distance: Math.round(distance),
          magnitude: latestEarthquake.magnitude,
          depth: latestEarthquake.depth,
          time: latestEarthquake.time,
          affectedByEarthquake: true,
          intensity,
        });
      }
    });
  }

  return cityStatuses;
};

// WebSocket event handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Emit data awal ketika client connect
  socket.emit("connected", { message: "Connected to Earthquake Server" });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Update earthquake data setiap 10 detik
setInterval(async () => {
  try {
    const earthquakes = await fetchEarthquakeData();
    const affectedCities = getAffectedCities(earthquakes);

    // Broadcast ke semua client
    io.emit("earthquakeUpdate", {
      earthquakes,
      affectedCities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in update loop:", error);
  }
}, 10000); // Update setiap 10 detik

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
