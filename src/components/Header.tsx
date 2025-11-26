import "./Header.css";

export const Header = () => {
  return (
    <header className="header">
      <div className="header-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="header-content">
        <div className="header-icon-container">
          <div className="seismic-wave">
            <svg viewBox="0 0 100 50" className="seismic-svg">
              <polyline
                points="0,25 10,25 15,5 20,40 25,25 35,25 40,15 45,35 50,25 60,25 65,10 70,38 75,25 85,25 90,20 100,25"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        <h1 className="header-title">
          <span className="main-title">GENFO</span>
        </h1>

        <p className="header-subtitle">Pantau Aktivitas Gempa Bumi Real-Time di Seluruh Dunia</p>

        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Coverage Area</span>
            <span className="stat-value">Dunia</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Data Source</span>
            <span className="stat-value">USGS Real-Time</span>
          </div>
        </div>
      </div>
    </header>
  );
};
