import { useEffect, useMemo, useState } from "react";
import { useGlobalEarthquakeSocket } from "../hooks/useGlobalEarthquakeSocket";
import { EarthquakeHistory } from "./EarthquakeHistory";
import { TodayEarthquakesMap } from "./TodayEarthquakesMap";
import { Header } from "./Header";
import "./EarthquakeDashboard.css";

export const EarthquakeDashboard = () => {
  const { data, isConnected, error } = useGlobalEarthquakeSocket();
  const [searchCountry, setSearchCountry] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"magnitude" | "time">("time");

  useEffect(() => {
    document.title = `Earthquake Detection - ${data?.totalEarthquakes || 0} Events`;
  }, [data?.totalEarthquakes]);

  // Get unique countries for filter options
  const countries = useMemo(() => {
    if (!data?.earthquakes) return [];
    const unique = new Set(data.earthquakes.map((eq) => eq.country));
    return Array.from(unique).sort();
  }, [data?.earthquakes]);

  // Filter and sort earthquakes
  const filteredEarthquakes = useMemo(() => {
    if (!data?.earthquakes || !Array.isArray(data.earthquakes)) return [];

    try {
      let filtered = [...data.earthquakes].filter(eq =>
        eq &&
        typeof eq.latitude === 'number' &&
        typeof eq.longitude === 'number' &&
        typeof eq.magnitude === 'number' &&
        eq.id
      );

      // Filter by country
      if (searchCountry) {
        filtered = filtered.filter((eq) =>
          eq.country && eq.country.toLowerCase().includes(searchCountry.toLowerCase())
        );
      }

      // Filter by date
      if (selectedDate) {
        filtered = filtered.filter((eq) => {
          try {
            const eqDate = new Date(eq.time).toISOString().split("T")[0];
            return eqDate === selectedDate;
          } catch (error) {
            return false;
          }
        });
      }

      // Sort
      if (sortBy === "magnitude") {
        filtered.sort((a, b) => b.magnitude - a.magnitude);
      } else {
        filtered.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      }

      return filtered;
    } catch (error) {
      console.error('Error filtering earthquakes:', error);
      return [];
    }
  }, [data?.earthquakes, searchCountry, selectedDate, sortBy]);

  const getLatestEarthquake = () => {
    if (!data?.earthquakes || data.earthquakes.length === 0) return null;
    return data.earthquakes.reduce((latest, current) =>
      new Date(current.time) > new Date(latest.time) ? current : latest
    );
  };

  const getHighestMagnitude = () => {
    if (!data?.earthquakes || data.earthquakes.length === 0) return null;
    return data.earthquakes.reduce((max, eq) =>
      eq.magnitude > max.magnitude ? eq : max
    );
  };

  const getMostAffectedCountry = () => {
    if (!data?.earthquakes || data.earthquakes.length === 0) return null;
    const countries: { [key: string]: number } = {};
    data.earthquakes.forEach((eq) => {
      countries[eq.country] = (countries[eq.country] || 0) + 1;
    });
    return Object.entries(countries).sort((a, b) => b[1] - a[1])[0];
  };

  const latest = getLatestEarthquake();
  const highest = getHighestMagnitude();
  const mostAffected = getMostAffectedCountry();

  return (
    <div className="earthquake-dashboard">
      <Header />

      <div className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
        <span className="status-dot"></span>
        {isConnected ? (
          <span>Live - Connected to Earthquake Server</span>
        ) : (
          <span>Offline - Reconnecting...</span>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ Error: {error}</span>
        </div>
      )}

      {data && (
        <div className="stats-container">
          <div className="stat-card latest">
            <div className="stat-label">📍 Latest Earthquake</div>
            {latest ? (
              <>
                <div className="stat-value">{latest.magnitude.toFixed(1)} M</div>
                <div className="stat-detail">{latest.country}</div>
                <div className="stat-time">
                  {new Date(latest.time).toLocaleString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                </div>
              </>
            ) : (
              <div className="stat-value">-</div>
            )}
          </div>

          <div className="stat-card highest">
            <div className="stat-label">🔴 Highest Magnitude</div>
            {highest ? (
              <>
                <div className="stat-value">{highest.magnitude.toFixed(1)} M</div>
                <div className="stat-detail">{highest.place}</div>
                <div className="stat-time">
                  {new Date(highest.time).toLocaleDateString("id-ID")}
                </div>
              </>
            ) : (
              <div className="stat-value">-</div>
            )}
          </div>

          <div className="stat-card affected">
            <div className="stat-label">🌍 Most Affected</div>
            {mostAffected ? (
              <>
                <div className="stat-value">{mostAffected[1]}</div>
                <div className="stat-detail">{mostAffected[0]}</div>
                <div className="stat-time">events in 7 days</div>
              </>
            ) : (
              <div className="stat-value">-</div>
            )}
          </div>

          <div className="stat-card total">
            <div className="stat-label">📊 Total Events</div>
            <div className="stat-value">{data.totalEarthquakes}</div>
            <div className="stat-detail">Last 7 days</div>
            <div className="stat-time">from USGS</div>
          </div>
        </div>
      )}

      {data?.earthquakes && (
        <>
          <TodayEarthquakesMap
            earthquakes={data.earthquakes}
            filteredEarthquakes={filteredEarthquakes}
            searchCountry={searchCountry}
            setSearchCountry={setSearchCountry}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            sortBy={sortBy}
            setSortBy={setSortBy}
            countries={countries}
          />
          <EarthquakeHistory
            earthquakes={data.earthquakes}
            filteredEarthquakes={filteredEarthquakes}
            searchCountry={searchCountry}
            setSearchCountry={setSearchCountry}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            sortBy={sortBy}
            setSortBy={setSortBy}
            countries={countries}
          />
        </>
      )}

      {!data && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-title">Loading earthquake data...</p>
          <p className="loading-subtitle">
            Fetching global earthquake data from USGS.<br />
            This may take a moment, please wait...
          </p>
        </div>
      )}
    </div>
  );
};
