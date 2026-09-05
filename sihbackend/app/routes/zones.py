"""Route handler for GIS risk zones in the North Eastern Region."""

from flask import Blueprint, request, jsonify
from app.database import get_db

zones_bp = Blueprint("zones", __name__)


@zones_bp.route("/zones", methods=["GET"])
def get_zones():
    """Retrieve sample GIS landslide risk-zone data for frontend mapping.

    Query parameters:
        severity: Optional filter by severity ('Critical', 'High', 'Moderate', 'Low').
        state: Optional filter by NER state (e.g., 'Sikkim', 'Meghalaya', 'Assam').
        format: Optional format specification ('list' or 'object'). Defaults to 'list'.

    Returns:
        JSON array of zone objects:
        [
            {
                "id": 1,
                "name": "NH-10 Sevoke - Gangtok Corridor",
                "state": "Sikkim",
                "latitude": 27.2750,
                "longitude": 88.5200,
                "severity": "Critical",
                "vulnerability_type": "National Highway Lifeline",
                "road_status": "Caution - Single Lane Due to Active Debris",
                "historical_risk_score": 0.88,
                "last_updated": "..."
            },
            ...
        ]
    """
    db = get_db()
    cursor = db.cursor()

    severity_filter = request.args.get("severity")
    state_filter = request.args.get("state")
    fmt = request.args.get("format", "list").lower()

    query = "SELECT * FROM risk_zones WHERE 1=1"
    params = []

    if severity_filter:
        query += " AND LOWER(severity) = LOWER(?)"
        params.append(severity_filter.strip())

    if state_filter:
        query += " AND LOWER(state) = LOWER(?)"
        params.append(state_filter.strip())

    query += " ORDER BY id ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    zones = []
    for row in rows:
        zones.append(
            {
                "id": row["id"],
                "name": row["name"],
                "state": row["state"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "severity": row["severity"],
                "vulnerability_type": row["vulnerability_type"],
                "road_status": row["road_status"],
                "historical_risk_score": float(row["historical_risk_score"]),
                "last_updated": row["last_updated"],
            }
        )

    # If the frontend requests an object wrapper (?format=object)
    if fmt == "object":
        return (
            jsonify(
                {
                    "status": "success",
                    "count": len(zones),
                    "disclaimer": "Sample GIS risk-zone data for SIH prototype demonstration only.",
                    "zones": zones,
                }
            ),
            200,
        )

    # Standard direct list format
    return jsonify(zones), 200

