import { useMemo, useState } from "react";
import type { GlobalEarthquake } from "../hooks/useGlobalEarthquakeSocket";
import "./EarthquakeHistory.css";

interface EarthquakeHistoryProps {
  earthquakes: GlobalEarthquake[];
}

export const EarthquakeHistory = ({ earthquakes }: EarthquakeHistoryProps) => {
  const [searchCountry, setSearchCountry] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"magnitude" | "time">("magnitude");

  // Get unique countries
  const countries = useMemo(() => {
    const unique = new Set(earthquakes.map((eq) => eq.country));
    return Array.from(unique).sort();
  }, [earthquakes]);

  // Get date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  // const maxDate = sevenDaysAgo.toISOString().split("T")[0];

  // Filter earthquakes
  const filteredEarthquakes = useMemo(() => {
    let filtered = [...earthquakes];

    // Filter by country
    if (searchCountry) {
      filtered = filtered.filter((eq) =>
        eq.country.toLowerCase().includes(searchCountry.toLowerCase())
      );
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((eq) => {
        const eqDate = new Date(eq.time).toISOString().split("T")[0];
        return eqDate === selectedDate;
      });
    }

    // Sort
    if (sortBy === "magnitude") {
      filtered.sort((a, b) => b.magnitude - a.magnitude);
    } else {
      filtered.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    }

    return filtered;
  }, [earthquakes, searchCountry, selectedDate, sortBy]);

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
        <p>Found <strong>{filteredEarthquakes.length}</strong> earthquake(s)</p>
      </div>

      {/* Earthquakes List */}
      <div className="earthquakes-list">
        {filteredEarthquakes.length > 0 ? (
          filteredEarthquakes.map((eq) => (
            <div key={eq.id} className="earthquake-item">
              <div
                className="magnitude-indicator"
                style={{ backgroundColor: getMagnitudeColor(eq.magnitude) }}
              >
                <span className="magnitude">{eq.magnitude.toFixed(1)}</span>
              </div>

              <div className="earthquake-info">
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
                    🕐 {new Date(eq.time).toLocaleString("id-ID")}
                  </span>
                  {eq.tsunamiWarning && (
                    <span className="tsunami-alert">⚠️ TSUNAMI WARNING</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No earthquakes found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
