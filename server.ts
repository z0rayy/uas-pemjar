import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import axios from "axios";

const app = express();
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
  res.send("Global Earthquake Server is running!");
});

interface GlobalEarthquake {
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

// Fungsi untuk extract negara dari place string
const extractCountry = (place: string): string => {
  // Format USGS biasanya: "Distance km direction of City, Country"
  const parts = place.split(",");
  if (parts.length > 0) {
    return parts[parts.length - 1].trim();
  }
  return "Unknown";
};

// Fungsi untuk menghitung magnitude scale
const getMagnitudeLevel = (magnitude: number): "low" | "moderate" | "strong" | "major" | "great" => {
  if (magnitude < 4) return "low";
  if (magnitude < 5) return "moderate";
  if (magnitude < 6) return "strong";
  if (magnitude < 7) return "major";
  return "great";
};

// Fetch global earthquake data dari USGS (7 hari terakhir)
const fetchGlobalEarthquakes = async (): Promise<GlobalEarthquake[]> => {
  try {
    // Fetch gempa 7 hari terakhir dengan magnitude >= 2.5
    const response = await axios.get(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    );

    const earthquakes: GlobalEarthquake[] = response.data.features
      .filter((feature: any) => feature.properties.mag >= 2.5) // Filter magnitude >= 2.5
      .map((feature: any) => ({
        id: feature.id,
        time: new Date(feature.properties.time).toLocaleString("id-ID"),
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        depth: feature.geometry.coordinates[2],
        magnitude: feature.properties.mag,
        place: feature.properties.place,
        country: extractCountry(feature.properties.place),
        tsunamiWarning: feature.properties.tsunami === 1,
      }))
      .sort((a: GlobalEarthquake, b: GlobalEarthquake) => {
        // Sort by time descending (terbaru dulu)
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      });

    return earthquakes;
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
    return [];
  }
};

// WebSocket event handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Emit data awal ketika client connect
  socket.emit("connected", { message: "Connected to Global Earthquake Server" });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Update earthquake data setiap 30 detik
let lastEarthquakes: GlobalEarthquake[] = [];

setInterval(async () => {
  try {
    const earthquakes = await fetchGlobalEarthquakes();

    // Check apakah ada earthquake baru
    const newEarthquakes = earthquakes.filter(
      (eq) => !lastEarthquakes.find((lastEq) => lastEq.id === eq.id)
    );

    // Broadcast ke semua clients
    io.emit("earthquakeUpdate", {
      earthquakes: earthquakes.slice(0, 100), // Limit 100 earthquake terakhir
      newEarthquakes: newEarthquakes,
      totalEarthquakes: earthquakes.length,
      timestamp: new Date().toISOString(),
    });

    lastEarthquakes = earthquakes;
  } catch (error) {
    console.error("Error in update loop:", error);
  }
}, 30000); // Update setiap 30 detik

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ Global Earthquake Server running on http://localhost:${PORT}`);
});
