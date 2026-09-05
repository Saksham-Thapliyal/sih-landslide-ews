// ==========================================
// Backend URL
// ==========================================

const API_URL = "http://localhost:5000";


// ==========================================
// Create Map
// ==========================================

const map = L.map("map").setView([27.5, 93.5], 6);


// OpenStreetMap

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ==========================================
// Get Risk Color
// ==========================================

function getRiskColor(severity) {

    severity = severity.toLowerCase();

    if (severity === "critical") {
        return "#991b1b";
    }

    if (severity === "high") {
        return "#dc2626";
    }

    if (severity === "moderate") {
        return "#f97316";
    }

    return "#16a34a";
}


// ==========================================
// Load Risk Zones
// ==========================================

async function loadZones() {

    try {

        const response = await fetch(`${API_URL}/zones`);

        if (!response.ok) {
            throw new Error("Failed to load zones");
        }

        const zones = await response.json();


        zones.forEach(zone => {

            const color = getRiskColor(zone.severity);


            // Create marker

            const marker = L.circleMarker(
                [zone.latitude, zone.longitude],
                {
                    radius: 10,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7
                }
            ).addTo(map);


            // Marker popup

            marker.bindPopup(`
                <strong>${zone.name}</strong><br>
                State: ${zone.state}<br>
                Risk: ${zone.severity}
            `);

        });


        // Show alerts

        displayAlerts(zones);

    }
    catch (error) {

        console.error("Error loading zones:", error);

        document.getElementById("alertFeed").innerHTML =
            "<p>Unable to load risk zones.</p>";
    }
}


// ==========================================
// Display Alerts
// ==========================================

function displayAlerts(zones) {

    const alertFeed = document.getElementById("alertFeed");

    alertFeed.innerHTML = "";


    // Highest risk first

    zones.sort((a, b) => {

        const risk = {
            critical: 4,
            high: 3,
            moderate: 2,
            low: 1
        };

        return risk[b.severity.toLowerCase()]
             - risk[a.severity.toLowerCase()];
    });


    zones.forEach(zone => {

        const severity = zone.severity.toLowerCase();

        const alert = document.createElement("div");

        alert.classList.add("alert");


        if (severity === "critical" || severity === "high") {
            alert.classList.add("high-alert");
        }
        else if (severity === "moderate") {
            alert.classList.add("medium-alert");
        }
        else {
            alert.classList.add("low-alert");
        }


        alert.innerHTML = `
            <h3>${zone.name}</h3>
            <p>Risk Level: ${zone.severity}</p>
        `;


        alertFeed.appendChild(alert);
    });
}


// ==========================================
// Citizen Report Form
// ==========================================

const reportForm = document.getElementById("reportForm");


reportForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const photo =
        document.getElementById("photo").files[0];

    const latitude =
        document.getElementById("latitude").value;

    const longitude =
        document.getElementById("longitude").value;

    const description =
        document.getElementById("description").value;


    // FormData is used for image upload

    const formData = new FormData();

    formData.append("photo", photo);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("description", description);


    const message =
        document.getElementById("reportMessage");


    message.textContent = "Submitting report...";


    try {

        const response = await fetch(
            `${API_URL}/report`,
            {
                method: "POST",
                body: formData
            }
        );


        const result = await response.json();


        if (response.ok) {

            message.textContent =
                "✅ Report submitted successfully!";

            reportForm.reset();

        }
        else {

            message.textContent =
                `❌ ${result.message || "Failed to submit report."}`;
        }


        console.log(result);

    }
    catch (error) {

        console.error("Report error:", error);

        message.textContent =
            "❌ Could not connect to the backend.";
    }

});

// ==========================================
// Load Citizen Reports
// ==========================================

async function loadReports() {

    try {

        const response = await fetch(`${API_URL}/reports`);

        if (!response.ok) {
            throw new Error("Failed to load reports");
        }

        const data = await response.json();

        const alertFeed = document.getElementById("alertFeed");

        data.reports.forEach(report => {

            const alert = document.createElement("div");

            alert.classList.add("alert");

            alert.innerHTML = `
    <h3>📍 Citizen Report</h3>

    <img
        src="${API_URL}${report.image_url}"
        alt="Citizen Report"
        class="report-image"
    >

    <p>${report.description || "No description provided"}</p>

    <p>
        Location: ${report.latitude}, ${report.longitude}
    </p>

    <p>
        Status: ${report.status}
    </p>
`;

            alertFeed.appendChild(alert);
        });

    }
    catch (error) {

        console.error("Error loading reports:", error);
    }
}
// ==========================================
// Risk Prediction
// ==========================================

const predictionForm = document.getElementById("predictionForm");

predictionForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const rainfall =
        document.getElementById("rainfall").value;

    const soilMoisture =
        document.getElementById("soilMoisture").value;

    const predictionResult =
        document.getElementById("predictionResult");

    predictionResult.textContent = "Predicting risk...";

    try {

        const response = await fetch(
            `${API_URL}/predict-risk`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    rainfall: rainfall,
                    soil_moisture: soilMoisture
                })
            }
        );

        const result = await response.json();

        if (response.ok) {

            predictionResult.innerHTML = `
                <h3>Risk Level: ${result.risk_level}</h3>
                <p>Risk Score: ${result.risk_score}</p>
                <p>Alert: ${result.alert_status}</p>
                <p>${result.recommendation}</p>
            `;

        }
        else {

            predictionResult.textContent =
                `❌ ${result.message || "Prediction failed."}`;
        }

    }
    catch (error) {

        console.error("Prediction error:", error);

        predictionResult.textContent =
            "❌ Could not connect to the backend.";
    }

});
// ==========================================
// Start Application
// ==========================================

loadZones();
loadReports();