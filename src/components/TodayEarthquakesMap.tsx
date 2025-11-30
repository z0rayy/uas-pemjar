import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import type { GlobalEarthquake } from "../hooks/useGlobalEarthquakeSocket";
import "leaflet/dist/leaflet.css";
import "./TodayEarthquakesMap.css";

interface TodayEarthquakesMapProps {
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

export const TodayEarthquakesMap = ({
    filteredEarthquakes
}: TodayEarthquakesMapProps) => {
    // Use the filtered earthquakes instead of 24-hour filter
    const todayEarthquakes = filteredEarthquakes;

    const getMagnitudeColor = (magnitude: number) => {
        if (magnitude < 4) return "#FFD700";
        if (magnitude < 5) return "#FFA500";
        if (magnitude < 6) return "#FF6B6B";
        if (magnitude < 7) return "#FF4500";
        return "#8B0000";
    };

    const getMagnitudeRadius = (magnitude: number) => {
        return Math.max(magnitude * 2, 6);
    };

    // Calculate map center (average of all earthquake positions)
    const mapCenter: [number, number] = todayEarthquakes.length > 0
        ? [
            todayEarthquakes.reduce((sum, eq) => sum + eq.latitude, 0) / todayEarthquakes.length,
            todayEarthquakes.reduce((sum, eq) => sum + eq.longitude, 0) / todayEarthquakes.length
        ]
        : [0, 0]; // Default center if no earthquakes

    if (todayEarthquakes.length === 0) {
        return (
            <div className="today-earthquakes-container">
                <h3 className="today-map-title">24 Hours Filtered Earthquakes Map</h3>
                <div className="no-today-earthquakes">
                    <p>No earthquakes match the current filter criteria</p>
                </div>
            </div>
        );
    }

    return (
        <div className="today-earthquakes-container">
            <h3 className="today-map-title">24 Hours Earthquakes Map</h3>
            <div className="today-earthquakes-map">
                <MapContainer
                    center={mapCenter}
                    zoom={2}
                    scrollWheelZoom={false}
                    style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Earthquake markers for today */}
                    {todayEarthquakes.map((earthquake) => {
                        const position: [number, number] = [earthquake.latitude, earthquake.longitude];

                        return (
                            <CircleMarker
                                key={earthquake.id}
                                center={position}
                                radius={getMagnitudeRadius(earthquake.magnitude)}
                                pathOptions={{
                                    fillColor: getMagnitudeColor(earthquake.magnitude),
                                    fillOpacity: 0.7,
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
                        );
                    })}

                    {/* Tsunami Warning Overlay Circles */}
                    {todayEarthquakes
                        .filter(eq => eq.tsunamiWarning)
                        .map((earthquake) => {
                            const position: [number, number] = [earthquake.latitude, earthquake.longitude];

                            return (
                                <CircleMarker
                                    key={`tsunami-${earthquake.id}`}
                                    center={position}
                                    radius={getMagnitudeRadius(earthquake.magnitude) + 8}
                                    pathOptions={{
                                        fillColor: "#FF0000",
                                        fillOpacity: 0.1,
                                        color: "#FF0000",
                                        weight: 3,
                                        dashArray: "10, 10",
                                    }}
                                />
                            );
                        })}
                </MapContainer>

                {/* Map Legend */}
                <div className="today-map-legend">
                    <div className="legend-title">Magnitude Scale:</div>
                    <div className="legend-items">
                        <div className="legend-item">
                            <div className="legend-circle" style={{ backgroundColor: "#FFD700" }}></div>
                            <span>&lt; 4.0</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-circle" style={{ backgroundColor: "#FFA500" }}></div>
                            <span>4.0 - 4.9</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-circle" style={{ backgroundColor: "#FF6B6B" }}></div>
                            <span>5.0 - 5.9</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-circle" style={{ backgroundColor: "#FF4500" }}></div>
                            <span>6.0 - 6.9</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-circle" style={{ backgroundColor: "#8B0000" }}></div>
                            <span>≥ 7.0</span>
                        </div>
                    </div>
                    <div className="today-earthquakes-count">
                        Filtered results: {todayEarthquakes.length} earthquake(s)
                    </div>
                </div>
            </div>
        </div>
    );
};