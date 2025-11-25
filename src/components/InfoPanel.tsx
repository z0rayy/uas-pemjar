import "./InfoPanel.css";

interface Earthquake {
  id: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  place: string;
}

interface InfoPanelProps {
  earthquakes: Earthquake[];
  affectedCitiesCount: number;
  isConnected: boolean;
}

export const InfoPanel = ({ earthquakes, affectedCitiesCount, isConnected }: InfoPanelProps) => {
  const latestEarthquake = earthquakes.length > 0 ? earthquakes[0] : null;
  const latestMagnitude = latestEarthquake?.magnitude ?? 0;
  const latestDepth = latestEarthquake?.depth ?? 0;

  return (
    <div className="info-panel">
      <div className="connection-indicator">
        <div className={`status-light ${isConnected ? "online" : "offline"}`}></div>
        <span className="status-text">{isConnected ? "Online - Real-Time" : "Connecting..."}</span>
      </div>

      <div className="info-cards-grid">
        {/* Card 1: Latest Earthquake */}
        <div className="info-card earthquake-card">
          <div className="card-header">
            <h3>Gempa Terbaru</h3>
            <span className="earthquake-icon">🌍</span>
          </div>
          {latestEarthquake ? (
            <div className="card-content">
              <div className="magnitude-display">
                <span className="magnitude-value">{latestMagnitude.toFixed(1)}</span>
                <span className="magnitude-label">SR</span>
              </div>
              <p className="location">{latestEarthquake.place}</p>
              <div className="earthquake-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Kedalaman</span>
                  <span className="detail-value">{latestDepth.toFixed(1)} km</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Waktu</span>
                  <span className="detail-value" style={{ fontSize: "0.85rem" }}>
                    {latestEarthquake.time}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-content no-data">
              <p>Tidak ada data gempa</p>
            </div>
          )}
        </div>

        {/* Card 2: Affected Cities */}
        <div className="info-card affected-card">
          <div className="card-header">
            <h3>Kota Terdeteksi Gempa</h3>
            <span className="earthquake-icon">🚨</span>
          </div>
          <div className="card-content">
            <div className="big-number">{affectedCitiesCount}</div>
            <p className="subtitle">dari 29 kota di Pulau Jawa</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(affectedCitiesCount / 29) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Earthquakes Today */}
        <div className="info-card total-card">
          <div className="card-header">
            <h3>Total Gempa Hari Ini</h3>
            <span className="earthquake-icon">📊</span>
          </div>
          <div className="card-content">
            <div className="big-number">{earthquakes.length}</div>
            <p className="subtitle">terdeteksi di Pulau Jawa</p>
          </div>
        </div>

        {/* Card 4: Earthquake Status */}
        <div className="info-card status-card">
          <div className="card-header">
            <h3>Status Aktivitas</h3>
            <span className="earthquake-icon">⚠️</span>
          </div>
          <div className="card-content">
            <div className={`status-badge ${affectedCitiesCount > 5 ? "high" : affectedCitiesCount > 0 ? "medium" : "low"}`}>
              {affectedCitiesCount > 5 ? "TINGGI" : affectedCitiesCount > 0 ? "SEDANG" : "NORMAL"}
            </div>
            <p className="subtitle">Tingkat aktivitas gempa</p>
          </div>
        </div>
      </div>
    </div>
  );
};
