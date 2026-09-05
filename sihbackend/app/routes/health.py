"""Health check and root info routes."""

import sqlite3
from flask import Blueprint, jsonify, current_app
from app.database import get_db

health_bp = Blueprint("health", __name__)


@health_bp.route("/", methods=["GET"])
def index():
    """Root endpoint summarizing API capabilities and SIH project info."""
    return (
        jsonify(
            {
                "project": "AI-Based Early Warning and Landslide Risk Monitoring System",
                "focus_region": "North Eastern Region (NER) of India",
                "hackathon": "Smart India Hackathon (SIH)",
                "status": "online",
                "endpoints": {
                    "POST /predict-risk": "Predict landslide hazard risk from rainfall & soil moisture",
                    "GET /zones": "Fetch sample GIS landslide risk zones across NER for map visualization",
                    "POST /report": "Submit citizen photo report with geolocation of slope movement/cracks",
                    "GET /reports": "List recent citizen landslide hazard reports",
                    "GET /uploads/<filename>": "Serve uploaded citizen report photos",
                    "GET /health": "System and database connectivity status",
                },
                "disclaimer": "Prototype demo data for SIH evaluation. Not for real emergency dispatch.",
            }
        ),
        200,
    )


@health_bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint verifying system and SQLite connectivity."""
    db_status = "unknown"
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1;")
        cursor.fetchone()
        db_status = "connected"
    except Exception as exc:
        db_status = f"error: {str(exc)}"

    is_healthy = db_status == "connected"
    status_code = 200 if is_healthy else 500

    return (
        jsonify(
            {
                "status": "healthy" if is_healthy else "unhealthy",
                "database": db_status,
            }
        ),
        status_code,
    )

