import { useState } from "react";
import { javaCities } from "../data/javaCities";
import "./AllCitiesCard.css";

interface CityHistoryData {
  lastEarthquakeTime: string | null;
  lastMagnitude: number | null;
  totalEarthquakes: number;
  isCurrentlyAffected: boolean;
  lastEarthquakeData: any | null;
}

interface AllCitiesCardProps {
  cityHistory: {
    [cityName: string]: CityHistoryData;
  };
}

export const AllCitiesCard = ({ cityHistory }: AllCitiesCardProps) => {
  const [filter, setFilter] = useState<"all" | "affected" | "safe">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter dan search kota
  const filteredCities = javaCities.filter((city) => {
    const history = cityHistory[city.name];
    const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "affected") {
      return matchesSearch && history && history.isCurrentlyAffected;
    }
    if (filter === "safe") {
      return matchesSearch && (!history || !history.isCurrentlyAffected);
    }
    return matchesSearch;
  });

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "#90EE90";
      case "medium":
        return "#FFD700";
      case "high":
        return "#FF8C00";
      case "very_high":
        return "#FF4500";
      default:
        return "#CCCCCC";
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID");
  };

  return (
    <div className="all-cities-container">
      <div className="cities-header">
        <h2>📍 Status Semua Kota di Pulau Jawa</h2>

        <div className="controls">
          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Cari kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Semua ({javaCities.length})
            </button>
            <button
              className={`filter-btn ${filter === "affected" ? "active" : ""}`}
              onClick={() => setFilter("affected")}
            >
              Terdeteksi Gempa
            </button>
            <button
              className={`filter-btn ${filter === "safe" ? "active" : ""}`}
              onClick={() => setFilter("safe")}
            >
              Aman
            </button>
          </div>
        </div>
      </div>

      <div className="cities-cards-grid">
        {filteredCities.map((city) => {
          const history = cityHistory[city.name];
          const isAffected = history && history.isCurrentlyAffected;
          const lastEarthquakeData = history?.lastEarthquakeData;

          return (
            <div
              key={city.name}
              className={`city-card ${isAffected ? "affected" : "safe"} ${
                isAffected ? "pulse" : ""
              }`}
            >
              {/* Header dengan Status Badge */}
              <div className="card-header">
                <div className="city-name-section">
                  <h3 className="city-name">{city.name}</h3>
                  <p className="province">{city.province}</p>
                </div>

                {isAffected && lastEarthquakeData ? (
                  <div
                    className="status-badge affected-badge"
                    style={{
                      backgroundColor: getIntensityColor(
                        lastEarthquakeData.intensity
                      ),
                    }}
                  >
                    <div className="badge-pulse"></div>
                    <span className="badge-text">
                      {getIntensityLabel(lastEarthquakeData.intensity)}
                    </span>
                  </div>
                ) : (
                  <div className="status-badge safe-badge">
                    <span className="badge-text">✓ AMAN</span>
                  </div>
                )}
              </div>

              {/* Earthquake Data Section */}
              {isAffected && lastEarthquakeData && history ? (
                <div className="earthquake-data">
                  <div className="data-row">
                    <span className="data-label">Magnitude</span>
                    <span className="data-value magnitude">
                      {lastEarthquakeData.magnitude.toFixed(1)} SR
                    </span>
                  </div>

                  <div className="data-row">
                    <span className="data-label">Kedalaman</span>
                    <span className="data-value">{lastEarthquakeData.depth.toFixed(1)} km</span>
                  </div>

                  <div className="data-row">
                    <span className="data-label">Jarak</span>
                    <span className="data-value">{lastEarthquakeData.distance} km</span>
                  </div>

                  <div className="data-row">
                    <span className="data-label">Waktu Terakhir</span>
                    <span className="data-value time">
                      {formatTimeAgo(lastEarthquakeData.time)}
                    </span>
                  </div>

                  <div className="data-row">
                    <span className="data-label">Total Gempa</span>
                    <span className="data-value counter">{history.totalEarthquakes}x</span>
                  </div>
                </div>
              ) : (
                <div className="earthquake-data empty">
                  <p className="no-earthquake">Tidak ada data gempa</p>
                </div>
              )}

              {/* Footer dengan Detail */}
              <div className="card-footer">
                {isAffected && lastEarthquakeData ? (
                  <div className="footer-info">
                    <span className="info-text">⚠️ Terdeteksi gempa</span>
                  </div>
                ) : (
                  <div className="footer-info safe">
                    <span className="info-text">✅ Status aman</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCities.length === 0 && (
        <div className="no-results">
          <p>Tidak ada kota yang sesuai dengan pencarian</p>
        </div>
      )}
    </div>
  );
};
