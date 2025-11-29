import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import type { GlobalEarthquake } from "../hooks/useGlobalEarthquakeSocket";
import "leaflet/dist/leaflet.css";
import "./EarthquakeMap.css";

interface EarthquakeMapProps {
  earthquake: GlobalEarthquake;
}

export const EarthquakeMap = ({ earthquake }: EarthquakeMapProps) => {
  const position: [number, number] = [earthquake.latitude, earthquake.longitude];

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude < 4) return "#FFD700";
    if (magnitude < 5) return "#FFA500";
    if (magnitude < 6) return "#FF6B6B";
    if (magnitude < 7) return "#FF4500";
    return "#8B0000";
  };

  const getMagnitudeRadius = (magnitude: number) => {
    return Math.max(magnitude * 3, 8);
  };

  return (
    <div className="earthquake-map-container">
      <MapContainer
        center={position}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Earthquake Epicenter Circle */}
        <CircleMarker
          center={position}
          radius={getMagnitudeRadius(earthquake.magnitude)}
          pathOptions={{
            fillColor: getMagnitudeColor(earthquake.magnitude),
            fillOpacity: 0.6,
            color: getMagnitudeColor(earthquake.magnitude),
            weight: 2,
          }}
        >
          <Popup>
            <div className="map-popup">
              <h4>{earthquake.place}</h4>
              <p><strong>Magnitude:</strong> {earthquake.magnitude.toFixed(1)} M</p>
              <p><strong>Depth:</strong> {earthquake.depth.toFixed(1)} km</p>
              <p><strong>Country:</strong> {earthquake.country}</p>
              <p><strong>Time:</strong> {new Date(earthquake.time).toLocaleString("id-ID")}</p>
              {earthquake.tsunamiWarning && (
                <div className="tsunami-popup-warning">
                  ⚠️ TSUNAMI WARNING
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>

        {/* Tsunami Warning Overlay Circle */}
        {earthquake.tsunamiWarning && (
          <CircleMarker
            center={position}
            radius={getMagnitudeRadius(earthquake.magnitude) + 15}
            pathOptions={{
              fillColor: "#FF0000",
              fillOpacity: 0.1,
              color: "#FF0000",
              weight: 3,
              dashArray: "10, 10",
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-circle" style={{ backgroundColor: getMagnitudeColor(earthquake.magnitude) }}></div>
          <span>Epicenter</span>
        </div>
        {earthquake.tsunamiWarning && (
          <div className="legend-item tsunami">
            <div className="legend-circle-dashed"></div>
            <span>Tsunami Risk Zone</span>
          </div>
        )}
      </div>
    </div>
  );
};
