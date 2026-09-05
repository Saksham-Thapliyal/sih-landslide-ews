"""Route handler for landslide risk prediction."""

from flask import Blueprint, request, jsonify
from app.services.ml_service import predict_risk

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict-risk", methods=["POST"])
def predict_risk_route():
    """Predict landslide risk given rainfall and soil moisture.

    Accepts JSON body:
    {
        "rainfall": 120.5,        # Cumulative rainfall in mm (>= 0)
        "soil_moisture": 68.2     # Volumetric / saturation percentage (0 - 100)
    }

    Returns:
    {
        "risk_level": "High",
        "risk_score": 0.82,
        "alert_status": "RED ALERT",
        "recommendation": "...",
        "inputs": {
            "rainfall_mm": 120.5,
            "soil_moisture_pct": 68.2
        }
    }
    """
    # Parse payload (handle JSON body or form data gracefully)
    data = request.get_json(silent=True)
    if data is None:
        data = request.form.to_dict()

    if not data:
        return (
            jsonify(
                {
                    "error": "Bad Request",
                    "message": "Missing request payload. Please provide JSON body with 'rainfall' and 'soil_moisture'.",
                }
            ),
            400,
        )

    # Validate rainfall
    if "rainfall" not in data or data["rainfall"] is None or str(data["rainfall"]).strip() == "":
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "Field 'rainfall' is required (numeric, in mm, >= 0).",
                }
            ),
            400,
        )

    try:
        rainfall = float(data["rainfall"])
        if rainfall < 0:
            return (
                jsonify(
                    {
                        "error": "Validation Error",
                        "message": "Field 'rainfall' cannot be negative.",
                    }
                ),
                400,
            )
    except (ValueError, TypeError):
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "Field 'rainfall' must be a valid number.",
                }
            ),
            400,
        )

    # Validate soil moisture
    if (
        "soil_moisture" not in data
        and "soilMoisture" not in data
        and "soil_moisture_pct" not in data
    ):
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "Field 'soil_moisture' is required (numeric percentage between 0 and 100).",
                }
            ),
            400,
        )

    raw_sm = data.get("soil_moisture", data.get("soilMoisture", data.get("soil_moisture_pct")))
    try:
        soil_moisture = float(raw_sm)
        if not (0 <= soil_moisture <= 100):
            return (
                jsonify(
                    {
                        "error": "Validation Error",
                        "message": "Field 'soil_moisture' must be between 0 and 100 percent.",
                    }
                ),
                400,
            )
    except (ValueError, TypeError):
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "Field 'soil_moisture' must be a valid number.",
                }
            ),
            400,
        )

    # Execute ML inference / heuristic prediction
    prediction = predict_risk(rainfall=rainfall, soil_moisture=soil_moisture)

    # Response strictly satisfies {"risk_level": "...", "risk_score": ...} plus helpful demo context
    response_payload = {
        "risk_level": prediction["risk_level"],
        "risk_score": prediction["risk_score"],
        "alert_status": prediction["alert_status"],
        "recommendation": prediction["recommendation"],
        "inputs": {
            "rainfall_mm": rainfall,
            "soil_moisture_pct": soil_moisture,
        },
    }

    return jsonify(response_payload), 200

