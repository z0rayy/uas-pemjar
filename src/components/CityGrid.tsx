import { javaCities } from "../data/javaCities";

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

interface CityGridProps {
  affectedCities: CityEarthquakeStatus[];
}

export const CityGrid = ({ affectedCities }: CityGridProps) => {
  // Buat map untuk quick lookup status kota
  const affectedCitiesMap = new Map(affectedCities.map((city) => [city.cityName, city]));

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
        return "";
    }
  };

  return (
    <div className="city-grid-container">
      <h2>Status Semua Kota di Pulau Jawa</h2>
      <div className="cities-status-grid">
        {javaCities.map((city) => {
          const affectedCity = affectedCitiesMap.get(city.name);
          const hasEarthquake = !!affectedCity;

          return (
            <div key={city.name} className={`city-status-card ${hasEarthquake ? "affected" : "safe"}`}>
              {/* Earthquake Notification Badge */}
              {hasEarthquake && (
                <div
                  className="earthquake-notification"
                  style={{ backgroundColor: getIntensityColor(affectedCity.intensity) }}
                >
                  <div className="notification-pulse"></div>
                  <span className="notification-text">{getIntensityLabel(affectedCity.intensity)}</span>
                </div>
              )}

              {/* Safe Badge */}
              {!hasEarthquake && <div className="safe-badge">✓ AMAN</div>}

              {/* City Name */}
              <h3 className="city-name">{city.name}</h3>

              {/* Province */}
              <p className="province">{city.province}</p>

              {/* Earthquake Details if affected */}
              {hasEarthquake && (
                <div className="earthquake-details">
                  <p>
                    <span className="label">Jarak:</span>
                    <span className="value">{affectedCity.distance} km</span>
                  </p>
                  <p>
                    <span className="label">Magnitude:</span>
                    <span className="value">{affectedCity.magnitude.toFixed(1)}</span>
                  </p>
                  <p>
                    <span className="label">Kedalaman:</span>
                    <span className="value">{affectedCity.depth.toFixed(1)} km</span>
                  </p>
                  <p className="time">
                    <span className="label">Waktu:</span>
                    <span className="value">{affectedCity.time}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
