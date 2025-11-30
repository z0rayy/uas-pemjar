import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import axios from "axios";

const app = express();
const httpServer = createServer(app);

// CORS configuration - allow frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://genfo.netlify.app",
];

// Add additional origins from environment
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
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
        time: feature.properties.time,
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

// Global state untuk earthquake data
let lastEarthquakes: GlobalEarthquake[] = [];
let currentEarthquakeData: any = null;

// Fetch initial data immediately on server start
const initializeData = async () => {
  try {
    console.log("🔄 Fetching initial earthquake data...");
    const earthquakes = await fetchGlobalEarthquakes();
    currentEarthquakeData = {
      earthquakes: earthquakes.slice(0, 100),
      newEarthquakes: earthquakes,
      totalEarthquakes: earthquakes.length,
      timestamp: new Date().toISOString(),
    };
    lastEarthquakes = earthquakes;
    console.log(`✅ Initial data loaded: ${earthquakes.length} earthquakes`);
  } catch (error) {
    console.error("❌ Error loading initial data:", error);
  }
};

// Initialize data before starting server
initializeData();

// WebSocket event handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send current data immediately when client connects
  if (currentEarthquakeData) {
    socket.emit("earthquakeUpdate", currentEarthquakeData);
    console.log(`📤 Sent initial data to client ${socket.id}`);
  } else {
    // If data not loaded yet, send loading message
    socket.emit("connected", { message: "Loading earthquake data..." });
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Update earthquake data setiap 30 detik
setInterval(async () => {
  try {
    const earthquakes = await fetchGlobalEarthquakes();

    // Check apakah ada earthquake baru
    const newEarthquakes = earthquakes.filter(
      (eq) => !lastEarthquakes.find((lastEq) => lastEq.id === eq.id)
    );

    // Update current data
    currentEarthquakeData = {
      earthquakes: earthquakes.slice(0, 100),
      newEarthquakes: newEarthquakes,
      totalEarthquakes: earthquakes.length,
      timestamp: new Date().toISOString(),
    };

    // Broadcast ke semua clients
    io.emit("earthquakeUpdate", currentEarthquakeData);

    lastEarthquakes = earthquakes;
    console.log(`🔄 Data updated: ${earthquakes.length} earthquakes, ${newEarthquakes.length} new`);
  } catch (error) {
    console.error("Error in update loop:", error);
  }
}, 30000); // Update setiap 30 detik

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ Global Earthquake Server running on ${PORT}`);
});
