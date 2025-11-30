import { useMemo, useState, useEffect } from "react";
import type { GlobalEarthquake } from "../hooks/useGlobalEarthquakeSocket";
import { EarthquakeMap } from "./EarthquakeMap";
import "./EarthquakeHistory.css";

interface EarthquakeHistoryProps {
  earthquakes: GlobalEarthquake[];
  filteredEarthquakes: GlobalEarthquake[];
  searchCountry: string;
  setSearchCountry: (value: string) => void;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  sortBy: "magnitude" | "time";
  setSortBy: (value: "magnitude" | "time") => void;
  countries: string[];
}

export const EarthquakeHistory = ({
  earthquakes,
  filteredEarthquakes,
  searchCountry,
  setSearchCountry,
  selectedDate,
  setSelectedDate,
  sortBy,
  setSortBy,
  countries
}: EarthquakeHistoryProps) => {
  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState<string | null>(null);

  // Clear selected earthquake when filters change to prevent invalid state
  useEffect(() => {
    setSelectedEarthquakeId(null);
  }, [filteredEarthquakes]);

  // Safety check for filteredEarthquakes
  const safeFilteredEarthquakes = filteredEarthquakes || [];

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude < 4) return "#FFD700";
    if (magnitude < 5) return "#FFA500";
    if (magnitude < 6) return "#FF6B6B";
    if (magnitude < 7) return "#FF4500";
    return "#8B0000";
  };

  return (
    <div className="earthquake-history-container">
      <h2 className="history-title"> Earthquake History & Search</h2>

      <div className="filters-section">
        {/* Date Filter */}
        <div className="filter-group">
          <label htmlFor="date-filter" className="filter-label">
            📅 Filter by Date (Max 7 days ago)
          </label>
          <input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            // max={maxDate}
            className="date-input"
          />
          {selectedDate && (
            <button
              className="clear-btn"
              onClick={() => setSelectedDate("")}
            >
              Clear Date
            </button>
          )}
        </div>

        {/* Country Search */}
        <div className="filter-group">
          <label htmlFor="country-search" className="filter-label">
            🌍 Search Country
          </label>
          <input
            id="country-search"
            type="text"
            placeholder="e.g., Indonesia, Japan, Chile..."
            value={searchCountry}
            onChange={(e) => setSearchCountry(e.target.value)}
            className="search-input"
            list="countries-list"
          />
          <datalist id="countries-list">
            {countries.map((country) => (
              <option key={country} value={country} />
            ))}
          </datalist>
          {searchCountry && (
            <button
              className="clear-btn"
              onClick={() => setSearchCountry("")}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="filter-group">
          <label htmlFor="sort-select" className="filter-label">
            🔄 Sort By
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "magnitude" | "time")}
            className="sort-select"
          >
            <option value="magnitude">Magnitude (Highest First)</option>
            <option value="time">Time (Newest First)</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>Found <strong>{safeFilteredEarthquakes.length}</strong> earthquake(s)</p>
      </div>

      {/* Earthquakes List */}
      <div className="earthquakes-list">
        {safeFilteredEarthquakes.length > 0 ? (
          safeFilteredEarthquakes.map((eq) => {
            const isSelected = selectedEarthquakeId === eq.id;

            return (
              <div key={eq.id} className="earthquake-item">
                <div
                  className="magnitude-indicator"
                  style={{ backgroundColor: getMagnitudeColor(eq.magnitude) }}
                >
                  <span className="magnitude">{eq.magnitude.toFixed(1)}</span>
                  <span className="magnitude-label">Magnitude</span>
                </div>

                <div
                  className="earthquake-info"
                  onClick={() => setSelectedEarthquakeId(isSelected ? null : eq.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="place">{eq.place}</h4>
                  <p className="country">{eq.country}</p>

                  <div className="details">
                    <span className="detail-item">
                      📍 {eq.latitude.toFixed(2)}°, {eq.longitude.toFixed(2)}°
                    </span>
                    <span className="detail-item">
                      📏 Depth: {eq.depth.toFixed(1)} km
                    </span>
                    <span className="detail-item">
                      🕐 {new Date(eq.time).toLocaleString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </span>
                    {eq.tsunamiWarning && (
                      <span className="tsunami-alert">⚠️ TSUNAMI WARNING</span>
                    )}
                    <span className="detail-item" style={{ color: '#666', fontSize: '0.9em' }}>
                      {isSelected ? '🗺️ Click to hide map' : '🗺️ Click to show map'}
                    </span>
                  </div>

                  {/* Map showing earthquake location - only when selected and valid */}
                  {isSelected && eq && typeof eq.latitude === 'number' && typeof eq.longitude === 'number' && (
                    <EarthquakeMap earthquake={eq} />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            <p>No earthquakes found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
