import joblib
from flask import Flask, request, jsonify

# Load the trained AI model
model = joblib.load("landslide_model.pkl")

print("AI Landslide Model Loaded Successfully!")

app = Flask(__name__)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    # Check if JSON data was provided
    if not data:
        return jsonify({
            "error": "JSON data is required"
        }), 400

    # Check required inputs
    if "rainfall" not in data or "soil_moisture" not in data:
        return jsonify({
            "error": "rainfall and soil_moisture are required"
        }), 400

    # Convert inputs to numbers
    try:
        rainfall = float(data["rainfall"])
        soil_moisture = float(data["soil_moisture"])
    except (ValueError, TypeError):
        return jsonify({
            "error": "rainfall and soil_moisture must be numbers"
        }), 400

    # Get landslide probability
    probability = model.predict_proba(
        [[rainfall, soil_moisture]]
    )[0][1]

    # Convert probability into risk level
    if probability < 0.30:
        risk = "LOW"
    elif probability < 0.60:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    # Send result as JSON
    return jsonify({
        "rainfall": rainfall,
        "soil_moisture": soil_moisture,
        "landslide_probability": round(float(probability), 3),
        "risk_level": risk
    })


# Start the API
if __name__ == "__main__":
    app.run(debug=True)