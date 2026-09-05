# SIH Landslide Early Warning & Risk Monitoring Backend (NER)

Backend integration service for the Smart India Hackathon (SIH) prototype: **AI-Based Early Warning and Landslide Risk Monitoring System for the North Eastern Region (NER) of India**.

---

## 🏔️ Project Overview & Regional Context

The North Eastern Region (NER) of India—comprising Sikkim, Meghalaya, Nagaland, Mizoram, Arunachal Pradesh, Assam, Manipur, and Tripura—experiences frequent severe rainfall and cloudbursts during the monsoon season. Due to the young, seismically active Himalayan and Indo-Burman mountain belts, landslides pose a grave threat to national highway corridors, border routes, indigenous settlements, and vital infrastructure.

This backend serves as the core integration bridge for the SIH prototype:
- Integrates with the **Frontend GIS Map & Dashboard**
- Exposes clean interfaces for **AI/ML Landslide Risk Prediction**
- Manages **Sample GIS Risk Zones & Highway Status** across the North East
- Safely processes and stores **Citizen Hazard Reports (Photo + Geolocation)** in SQLite

---

## 📁 Architecture & Directory Structure

```
d:/VS CODE FOLDER/sihbackend/
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── .gitignore                # Git exclusions (venv, db, uploads, pycache)
├── requirements.txt          # Python dependencies
├── config.py                 # Configuration class loading from .env
├── run.py                    # Server startup script
├── test_api.py               # Automated unit & integration tests
├── app/
│   ├── __init__.py           # Flask app factory, CORS, JSON error handlers
│   ├── database.py           # SQLite connection, schema & NER sample seed data
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── predict.py        # POST /predict-risk
│   │   ├── zones.py          # GET /zones
│   │   ├── reports.py        # POST /report, GET /reports, GET /uploads/<filename>
│   │   └── health.py         # GET / and GET /health
│   ├── services/
│   │   ├── __init__.py
│   │   └── ml_service.py     # ML interface & geotechnical mock predictor
│   └── utils/
│       ├── __init__.py
│       └── file_storage.py   # Safe file validation, UUID naming & storage
└── uploads/                  # Secure directory for citizen hazard photos
    └── .gitkeep
```

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.11)
- pip

### 2. Setup Virtual Environment
In your terminal / PowerShell:
```powershell
# Navigate to project folder
cd "d:\VS CODE FOLDER\sihbackend"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env` (already done by default):
```powershell
cp .env.example .env
```

### 5. Run the Server
```powershell
python run.py
```
The server will start at `http://localhost:5000` (or `http://0.0.0.0:5000`).

---

## 📡 API Reference & Documentation

### 1. Predict Landslide Risk
- **Endpoint**: `POST /predict-risk`
- **Content-Type**: `application/json`
- **Description**: Predicts landslide hazard risk level and score based on hydro-meteorological indicators (rainfall and soil moisture).

#### Request Payload
```json
{
  "rainfall": 135.5,
  "soil_moisture": 72.0
}
```
*Validation Rules:*
- `rainfall`: Float/int, in millimeters (mm), must be `>= 0`.
- `soil_moisture`: Float/int, saturation percentage, must be between `0` and `100`.

#### Response (`200 OK`)
```json
{
  "risk_level": "High",
  "risk_score": 0.82,
  "alert_status": "RED ALERT",
  "recommendation": "Immediate vigilance required. High risk of debris flow or slope failure. Halt non-essential vehicular movement on vulnerable ghat routes.",
  "inputs": {
    "rainfall_mm": 135.5,
    "soil_moisture_pct": 72.0
  }
}
```

#### Example cURL
```bash
curl -X POST http://127.0.0.1:5000/predict-risk \
  -H "Content-Type: application/json" \
  -d '{"rainfall": 135.5, "soil_moisture": 72.0}'
```

---

### 2. Get GIS Risk Zones
- **Endpoint**: `GET /zones`
- **Description**: Fetches realistic sample GIS risk-zone data across the North Eastern Region for frontend map rendering (Leaflet, Mapbox, Google Maps, OpenLayers).

#### Query Parameters (Optional)
- `severity`: Filter by severity (`Critical`, `High`, `Moderate`, `Low`)
- `state`: Filter by state (`Sikkim`, `Meghalaya`, `Nagaland`, `Mizoram`, `Assam`, `Arunachal Pradesh`, `Manipur`)
- `format`: `list` (default) or `object` (wrapped with metadata)

#### Response (`200 OK`)
```json
[
  {
    "id": 1,
    "name": "NH-10 Sevoke - Gangtok Corridor",
    "state": "Sikkim",
    "latitude": 27.275,
    "longitude": 88.52,
    "severity": "Critical",
    "vulnerability_type": "National Highway Lifeline",
    "road_status": "Caution - Single Lane Due to Active Debris",
    "historical_risk_score": 0.88,
    "last_updated": "2026-09-05T05:30:00Z"
  },
  {
    "id": 2,
    "name": "Sonapur Tunnel - NH-06 Corridor",
    "state": "Meghalaya",
    "latitude": 25.131,
    "longitude": 92.368,
    "severity": "Critical",
    "vulnerability_type": "Inter-State Commercial Highway",
    "road_status": "Blocked - Heavy Mudflow Reported",
    "historical_risk_score": 0.92,
    "last_updated": "2026-09-05T05:30:00Z"
  }
]
```

#### Example cURL
```bash
# Retrieve all zones
curl http://127.0.0.1:5000/zones

# Retrieve critical zones in Sikkim
curl "http://127.0.0.1:5000/zones?severity=Critical&state=Sikkim"
```

---

### 3. Citizen Hazard Photo Report
- **Endpoint**: `POST /report`
- **Content-Type**: `multipart/form-data`
- **Description**: Allows citizens to submit photo reports of tension cracks, slope subsidence, or active mudslides with GPS coordinates.

#### Form Fields
| Field | Type | Required | Description |
|---|---|---|---|
| `photo` | File | Yes | Image file (`.png`, `.jpg`, `.jpeg`, `.webp`, max 16MB) |
| `latitude` | Float | Yes | Latitude of hazard (`-90` to `90`) |
| `longitude` | Float | Yes | Longitude of hazard (`-180` to `180`) |
| `description`| String| No | Description of observed slope deformation |

#### Response (`201 Created`)
```json
{
  "status": "success",
  "message": "Landslide citizen report submitted successfully.",
  "report": {
    "report_id": "rep_7f4d2a1b9c",
    "latitude": 27.275,
    "longitude": 88.52,
    "description": "Deep tension cracks observed across road shoulder.",
    "image_filename": "a1b2c3d4e5f6_crack.jpg",
    "image_url": "/uploads/a1b2c3d4e5f6_crack.jpg",
    "created_at": "2026-09-05T05:40:00.123456Z",
    "status": "Pending Verification"
  }
}
```

#### Example cURL
```bash
curl -X POST http://127.0.0.1:5000/report \
  -F "photo=@/path/to/crack_photo.jpg" \
  -F "latitude=27.2750" \
  -F "longitude=88.5200" \
  -F "description=Tension crack along NH-10 road edge"
```

---

### 4. List Citizen Reports
- **Endpoint**: `GET /reports`
- **Description**: Returns recently submitted citizen hazard reports for the dashboard/admin alert feed.

#### Response (`200 OK`)
```json
{
  "status": "success",
  "count": 1,
  "reports": [
    {
      "id": 1,
      "report_id": "rep_7f4d2a1b9c",
      "latitude": 27.275,
      "longitude": 88.52,
      "description": "Tension crack along NH-10 road edge",
      "image_filename": "a1b2c3d4e5f6_crack.jpg",
      "image_url": "/uploads/a1b2c3d4e5f6_crack.jpg",
      "created_at": "2026-09-05T05:40:00.123456Z",
      "status": "Pending Verification"
    }
  ]
}
```

---

### 5. View Uploaded Citizen Photos
- **Endpoint**: `GET /uploads/<filename>`
- **Description**: Safely serves uploaded hazard images directly to frontend browsers.

---

### 6. System Health Check
- **Endpoint**: `GET /health`
- **Response (`200 OK`)**:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## 🤖 Guide for Kiriti (Plugging in the Real ML Model)

The machine learning logic is strictly decoupled in `app/services/ml_service.py`. When your trained model is ready:

1. Save your trained model artifact (e.g. `landslide_model.joblib`, `.pkl`, or `.onnx`) into `app/services/` or a `models/` directory.
2. In `app/services/ml_service.py`:
   - Load the model inside `LandslidePredictor.__init__()`:
     ```python
     import joblib
     self.model = joblib.load("app/services/landslide_model.joblib")
     self.is_mock = False
     ```
   - In `predict(self, rainfall, soil_moisture)`:
     ```python
     # Example scikit-learn probability inference:
     features = [[rainfall, soil_moisture]]
     prob = float(self.model.predict_proba(features)[0][1])
     risk_score = round(prob, 2)
     risk_level = "High" if risk_score >= 0.70 else ("Moderate" if risk_score >= 0.40 else "Low")
     return {
         "risk_level": risk_level,
         "risk_score": risk_score
     }
     ```
3. **Zero API Changes**: The Flask routes and frontend contracts do not need any modifications!

---

## 💻 Frontend Integration Guide

CORS is globally enabled (`Access-Control-Allow-Origin: *`), so your React, Next.js, Vue, or vanilla JS app can make requests directly.

### Mapping Leaflet / Mapbox Markers:
```javascript
async function loadLandslideZones() {
  const response = await fetch("http://localhost:5000/zones");
  const zones = await response.json();
  
  zones.forEach(zone => {
    // Add marker to map
    const markerColor = zone.severity === 'Critical' ? 'darkred' : 
                        zone.severity === 'High' ? 'red' : 
                        zone.severity === 'Moderate' ? 'orange' : 'green';

    L.circleMarker([zone.latitude, zone.longitude], { color: markerColor })
      .bindPopup(`<b>${zone.name}</b><br/>Severity: ${zone.severity}<br/>Road: ${zone.road_status}`)
      .addTo(map);
  });
}
```

### Submitting a Citizen Report (Form Data):
```javascript
async function submitCitizenReport(photoFile, lat, lng, description) {
  const formData = new FormData();
  formData.append("photo", photoFile);
  formData.append("latitude", lat);
  formData.append("longitude", lng);
  formData.append("description", description);

  const res = await fetch("http://localhost:5000/report", {
    method: "POST",
    body: formData
  });
  return await res.json();
}
```

---

## 🧪 Running Automated Tests

Run the test suite to verify all endpoints and validation handling:
```powershell
python test_api.py
```
Expected output:
```
............
----------------------------------------------------------------------
Ran 12 tests in 0.25s

OK
```

