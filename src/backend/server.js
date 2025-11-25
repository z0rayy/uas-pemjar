const WebSocket = require("ws");
const axios = require("axios");

const wss = new WebSocket.Server({ port: 3001 });

console.log("WebSocket server running on ws://localhost:3001");

wss.on("connection", (ws) => {
    console.log("Client connected");

    // Kirim data tiap 10 detik
    setInterval(async () => {
        try {
            const res = await axios.get(
                "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
            );

            ws.send(JSON.stringify(res.data));
        } catch (err) {
            console.log("Error fetching data:", err);
        }
    }, 10000);
});
