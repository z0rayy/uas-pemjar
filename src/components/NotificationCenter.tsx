import { useEffect, useState } from "react";
import { useGlobalEarthquakeSocket } from "../hooks/useGlobalEarthquakeSocket";
import type { GlobalEarthquake } from "../hooks/useGlobalEarthquakeSocket";
import "./NotificationCenter.css";

export const NotificationCenter = () => {
  const { data } = useGlobalEarthquakeSocket();
  const [displayedNotifications, setDisplayedNotifications] = useState<GlobalEarthquake[]>([]);

  // Update displayed notifications saat ada new earthquakes
  useEffect(() => {
    if (data?.newEarthquakes && data.newEarthquakes.length > 0) {
      setDisplayedNotifications((prev) => [
        ...data.newEarthquakes,
        ...prev,
      ].slice(0, 5));

      // Auto dismiss pertama notifikasi setelah 8 detik
      const timer = setTimeout(() => {
        setDisplayedNotifications((prev) => prev.slice(1));
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [data?.newEarthquakes]);

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude < 4) return "#FFD700";
    if (magnitude < 5) return "#FFA500";
    if (magnitude < 6) return "#FF6B6B";
    if (magnitude < 7) return "#FF4500";
    return "#8B0000";
  };

  const getMagnitudeLabel = (magnitude: number) => {
    if (magnitude < 4) return "MINOR";
    if (magnitude < 5) return "LIGHT";
    if (magnitude < 6) return "MODERATE";
    if (magnitude < 7) return "STRONG";
    return "MAJOR";
  };

  if (displayedNotifications.length === 0) return null;

  return (
    <div className="notification-center">
      {displayedNotifications.map((notification, index) => (
        <div
          key={`${notification.id}-${index}`}
          className="notification-card"
          style={{
            borderLeftColor: getMagnitudeColor(notification.magnitude),
            animation: `slideIn 0.5s ease-out ${index * 0.1}s forwards`,
            animationFillMode: "both",
          }}
        >
          <div className="notification-header">
            <div className="magnitude-badge" style={{ backgroundColor: getMagnitudeColor(notification.magnitude) }}>
              <span className="mag-value">{notification.magnitude.toFixed(1)}</span>
              <span className="mag-label">{getMagnitudeLabel(notification.magnitude)}</span>
            </div>

            <button
              className="close-btn"
              onClick={() => {
                setDisplayedNotifications((prev) =>
                  prev.filter((n) => n.id !== notification.id)
                );
              }}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>

          <div className="notification-content">
            <h4 className="location">{notification.place}</h4>
            <p className="country">📍 {notification.country}</p>

            <div className="details-grid">
              <div className="detail">
                <span className="label">Depth</span>
                <span className="value">{notification.depth.toFixed(1)} km</span>
              </div>
              <div className="detail">
                <span className="label">Lat/Lon</span>
                <span className="value">{notification.latitude.toFixed(2)}°, {notification.longitude.toFixed(2)}°</span>
              </div>
            </div>

            {notification.tsunamiWarning && (
              <div className="tsunami-warning">
                ⚠️ TSUNAMI WARNING
              </div>
            )}

            <p className="time">{new Date(notification.time).toLocaleString("id-ID")}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
