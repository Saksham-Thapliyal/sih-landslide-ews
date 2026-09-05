import sqlite3
from datetime import datetime
from pathlib import Path
from flask import current_app, g

NER_SAMPLE_ZONES = [
    {
        "name": "NH-10 Sevoke - Gangtok Corridor",
        "state": "Sikkim",
        "latitude": 27.2750,
        "longitude": 88.5200,
        "severity": "Critical",
        "vulnerability_type": "National Highway Lifeline",
        "road_status": "Caution - Single Lane Due to Active Debris",
        "historical_risk_score": 0.88,
    },
    {
        "name": "Sonapur Tunnel - NH-06 Corridor",
        "state": "Meghalaya",
        "latitude": 25.1310,
        "longitude": 92.3680,
        "severity": "Critical",
        "vulnerability_type": "Inter-State Commercial Highway",
        "road_status": "Blocked - Heavy Mudflow Reported",
        "historical_risk_score": 0.92,
    },
    {
        "name": "Kohima - Zubza Valley Section (NH-29)",
        "state": "Nagaland",
        "latitude": 25.6880,
        "longitude": 94.0450,
        "severity": "High",
        "vulnerability_type": "National Highway & Settlement Slopes",
        "road_status": "Caution - Debris Clearing in Progress",
        "historical_risk_score": 0.78,
    },
    {
        "name": "Aizawl - Sairang Ridge Corridor",
        "state": "Mizoram",
        "latitude": 23.7660,
        "longitude": 92.6590,
        "severity": "High",
        "vulnerability_type": "Strategic Railway & Road Link",
        "road_status": "Open with Caution - Saturated Soil",
        "historical_risk_score": 0.74,
    },
    {
        "name": "Bhalukpong - Bomdila Trans-Himalayan Highway",
        "state": "Arunachal Pradesh",
        "latitude": 27.2640,
        "longitude": 92.4230,
        "severity": "High",
        "vulnerability_type": "Strategic Mountain Highway",
        "road_status": "Caution - Watch for Rockfalls",
        "historical_risk_score": 0.71,
    },
    {
        "name": "Upper Shillong - Laitkor Slopes",
        "state": "Meghalaya",
        "latitude": 25.5390,
        "longitude": 91.8230,
        "severity": "Moderate",
        "vulnerability_type": "Urban Fringe & Eco-Tourism Route",
        "road_status": "Open",
        "historical_risk_score": 0.45,
    },
    {
        "name": "Mangan - Chungthang Valley Road",
        "state": "Sikkim",
        "latitude": 27.5100,
        "longitude": 88.5300,
        "severity": "High",
        "vulnerability_type": "North Sikkim Hydropower & Defense Corridor",
        "road_status": "Open with Severe Weather Warning",
        "historical_risk_score": 0.82,
    },
    {
        "name": "Haflong - Jatinga Hill Section",
        "state": "Assam",
        "latitude": 25.1700,
        "longitude": 93.0300,
        "severity": "Critical",
        "vulnerability_type": "Dima Hasao Rail & Road Corridor",
        "road_status": "Caution - Embankment Subsidence Monitored",
        "historical_risk_score": 0.85,
    },
    {
        "name": "Kalapahar Hills Slopes, Guwahati",
        "state": "Assam",
        "latitude": 26.1420,
        "longitude": 91.7370,
        "severity": "Moderate",
        "vulnerability_type": "Dense Urban Hill Settlement",
        "road_status": "Open",
        "historical_risk_score": 0.48,
    },
    {
        "name": "Imphal - Senapati Sector (NH-02)",
        "state": "Manipur",
        "latitude": 25.2600,
        "longitude": 94.0200,
        "severity": "High",
        "vulnerability_type": "Essential Supply Line & Villages",
        "road_status": "Caution - Slope Erosion Observed",
        "historical_risk_score": 0.76,
    },
    {
        "name": "Champhai - Zokhawthar Border Route",
        "state": "Mizoram",
        "latitude": 23.4730,
        "longitude": 93.3280,
        "severity": "Low",
        "vulnerability_type": "Border Connectivity Highway",
        "road_status": "Open",
        "historical_risk_score": 0.28,
    },
    {
        "name": "Itanagar - Chimpu Foothills",
        "state": "Arunachal Pradesh",
        "latitude": 27.0700,
        "longitude": 93.6050,
        "severity": "Low",
        "vulnerability_type": "Capital Suburban Slopes",
        "road_status": "Open",
        "historical_risk_score": 0.25,
    },
]


def get_db():
    """Get database connection for current request context."""
    if "db" not in g:
        db_path = current_app.config["DATABASE_PATH"]
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    """Close database connection at end of request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(app):
    """Initialize database tables and seed initial demo data."""
    db_path = Path(app.config["DATABASE_PATH"])
    db_path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()

        # Risk Zones Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS risk_zones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                state TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                severity TEXT NOT NULL,
                vulnerability_type TEXT NOT NULL,
                road_status TEXT NOT NULL,
                historical_risk_score REAL DEFAULT 0.0,
                last_updated TEXT NOT NULL
            );
            """
        )

        # Citizen Reports Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS citizen_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_id TEXT UNIQUE NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                description TEXT,
                image_filename TEXT NOT NULL,
                image_url TEXT NOT NULL,
                created_at TEXT NOT NULL,
                status TEXT DEFAULT 'Pending Verification'
            );
            """
        )

        conn.commit()

        # Seed sample NER risk zones if none exist
        cursor.execute("SELECT COUNT(*) FROM risk_zones;")
        count = cursor.fetchone()[0]
        if count == 0:
            now_iso = datetime.utcnow().isoformat() + "Z"
            for zone in NER_SAMPLE_ZONES:
                cursor.execute(
                    """
                    INSERT INTO risk_zones (
                        name, state, latitude, longitude, severity,
                        vulnerability_type, road_status, historical_risk_score, last_updated
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                    """,
                    (
                        zone["name"],
                        zone["state"],
                        zone["latitude"],
                        zone["longitude"],
                        zone["severity"],
                        zone["vulnerability_type"],
                        zone["road_status"],
                        zone["historical_risk_score"],
                        now_iso,
                    ),
                )
            conn.commit()

