import { useEarthquakeSocket } from "../hooks/useEarthquakeSocket";
import { CityGrid } from "./CityGrid";
import "./EarthquakeDashboard.css";
import "./CityGrid.css";

export const EarthquakeDashboard = () => {
  const { data, isConnected, error } = useEarthquakeSocket();

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "#90EE90"; // Hijau muda
      case "medium":
        return "#FFD700"; // Kuning
      case "high":
        return "#FF8C00"; // Oranye
      case "very_high":
        return "#FF4500"; // Merah
      default:
        return "#CCCCCC"; // Abu-abu
    }
  };

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "RINGAN";
      case "medium":
        return "SEDANG";
      case "high":
        return "KUAT";
      case "very_high":
        return "SANGAT KUAT";
      default:
        return "TIDAK TERASA";
    }
  };

  return (
    <div className="dashboard-container">
      <h1>🌍 Live Earthquake Dashboard - Pulau Jawa</h1>

      {/* Status Connection */}
      <div className="status-bar">
        <div className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
          <span className="status-dot"></span>
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
      </div>

      {/* Latest Earthquake Info */}
      {data && data.earthquakes.length > 0 && (
        <div className="latest-earthquake">
          <h2>Gempa Terbaru</h2>
          <div className="earthquake-card">
            <p>
              <strong>Magnitude:</strong> {data.earthquakes[0].magnitude.toFixed(1)}
            </p>
            <p>
              <strong>Kedalaman:</strong> {data.earthquakes[0].depth.toFixed(1)} km
            </p>
            <p>
              <strong>Lokasi:</strong> {data.earthquakes[0].place}
            </p>
            <p>
              <strong>Waktu:</strong> {data.earthquakes[0].time}
            </p>
          </div>
        </div>
      )}

      {/* Affected Cities */}
      {data && data.affectedCities.length > 0 ? (
        <div className="affected-cities">
          <h2>Kota-Kota yang Terkena Dampak ({data.affectedCities.length})</h2>
          <div className="cities-grid">
            {data.affectedCities.map((city) => (
              <div
                key={city.cityName}
                className="city-card"
                style={{ borderLeftColor: getIntensityColor(city.intensity) }}
              >
                <h3>{city.cityName}</h3>
                <p className="province">{city.province}</p>

                <div className="intensity-badge" style={{ backgroundColor: getIntensityColor(city.intensity) }}>
                  {getIntensityLabel(city.intensity)}
                </div>

                <div className="details">
                  <p>
                    <strong>Jarak:</strong> {city.distance} km
                  </p>
                  <p>
                    <strong>Magnitude:</strong> {city.magnitude.toFixed(1)}
                  </p>
                  <p>
                    <strong>Kedalaman:</strong> {city.depth.toFixed(1)} km
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-data">
          <p>✅ Tidak ada gempa yang terasa di Pulau Jawa saat ini</p>
        </div>
      )}

      {/* City Status Grid - Menampilkan semua kota dengan notif gempa */}
      {data && <CityGrid affectedCities={data.affectedCities} />}

      {/* Last Updated */}
      {data && (
        <div className="last-updated">Last updated: {new Date(data.timestamp).toLocaleString("id-ID")}</div>
      )}
    </div>
  );
};
