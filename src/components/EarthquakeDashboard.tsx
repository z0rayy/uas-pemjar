import { useEffect } from "react";
import { useGlobalEarthquakeSocket } from "../hooks/useGlobalEarthquakeSocket";
import { EarthquakeHistory } from "./EarthquakeHistory";
import { Header } from "./Header";
import "./EarthquakeDashboard.css";

export const EarthquakeDashboard = () => {
  const { data, isConnected, error } = useGlobalEarthquakeSocket();

  useEffect(() => {
    document.title = `Earthquake Detection - ${data?.totalEarthquakes || 0} Events`;
  }, [data?.totalEarthquakes]);

  const getLatestEarthquake = () => {
    if (!data?.earthquakes || data.earthquakes.length === 0) return null;
    return data.earthquakes[0];
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
                <div className="stat-value">{latest.magnitude.toFixed(1)}</div>
                <div className="stat-detail">{latest.country}</div>
                <div className="stat-time">
                  {new Date(latest.time).toLocaleTimeString("id-ID")}
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
                <div className="stat-value">{highest.magnitude.toFixed(1)}</div>
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
        <EarthquakeHistory earthquakes={data.earthquakes} />
      )}

      {!data && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading earthquake data...</p>
        </div>
      )}
    </div>
  );
};
