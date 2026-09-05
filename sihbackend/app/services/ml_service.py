"""Machine Learning Landslide Risk Prediction Service.

=============================================================================
INTEGRATION GUIDE FOR KIRITI (ML LEAD):
-----------------------------------------------------------------------------
1. This module acts as the prediction boundary between the web API and the ML model.
2. When your trained model (e.g. scikit-learn, XGBoost, PyTorch, or ONNX) is ready:
   a. Place the model weight/artifact file (e.g., model.joblib or model.pkl)
      in this directory or a dedicated models/ folder.
   b. Load the model inside `LandslidePredictor.__init__()` or a module-level loader.
   c. Update the `predict()` method to pass `[rainfall, soil_moisture]` into
      your model's `.predict()` or `.predict_proba()`.
   d. Ensure the return structure remains identical:
      {
          "risk_level": "Low" | "Moderate" | "High",
          "risk_score": float  # Between 0.00 and 1.00
      }
3. The API endpoint (/predict-risk) does NOT need any changes when you plug in
   the real model.
=============================================================================
"""

import math
from typing import Dict, Any


class LandslidePredictor:
    """Predicts landslide hazard risk based on hydro-meteorological indicators."""

    def __init__(self, model_path: str = None):
        """Initialize the predictor.

        Args:
            model_path: Optional path to a trained serialized model artifact.
                        If None, the robust heuristic mock model is used.
        """
        self.model_path = model_path
        self.is_mock = True

        if model_path:
            # TODO (Kiriti): Load trained model artifact here:
            # import joblib
            # self.model = joblib.load(model_path)
            # self.is_mock = False
            pass

    def predict(self, rainfall: float, soil_moisture: float) -> Dict[str, Any]:
        """Generate landslide risk prediction.

        Geotechnical Logic (Heuristic Mock Model):
        - rainfall: precipitation in millimeters (mm) over past 24-72 hours.
          In the North Eastern Region, rainfall > 100mm saturates slopes rapidly.
        - soil_moisture: volumetric/saturation percentage (0% to 100%).
          High pore water pressure occurs when soil moisture exceeds ~60-70%.

        Returns:
            Dict containing:
                - risk_level: str ("Low", "Moderate", "High")
                - risk_score: float (0.0 to 1.0)
                - alert_status: str
                - recommendation: str
        """
        if not self.is_mock:
            # TODO (Kiriti): Invoke model inference:
            # features = [[rainfall, soil_moisture]]
            # proba = self.model.predict_proba(features)[0][1]
            pass

        # Normalize rainfall (assuming 200mm is near-extreme saturation trigger in NER)
        rf_norm = min(1.0, max(0.0, rainfall / 200.0))

        # Normalize soil moisture (0 to 100%)
        sm_norm = min(1.0, max(0.0, soil_moisture / 100.0))

        # Geotechnical interaction: risk escalates rapidly when BOTH rainfall and soil moisture are high
        # Base linear combination
        base_score = 0.52 * rf_norm + 0.48 * sm_norm

        # Synergistic pore-pressure amplification factor when both are elevated
        synergy = 0.15 * (rf_norm * sm_norm)

        raw_score = base_score + synergy
        risk_score = round(min(1.0, max(0.0, raw_score)), 2)

        # Classify risk level
        if risk_score >= 0.70 or (rainfall >= 120.0 and soil_moisture >= 65.0):
            risk_level = "High"
            alert_status = "RED ALERT"
            recommendation = (
                "Immediate vigilance required. High risk of debris flow or slope failure. "
                "Halt non-essential vehicular movement on vulnerable ghat routes."
            )
        elif risk_score >= 0.40 or rainfall >= 60.0:
            risk_level = "Moderate"
            alert_status = "AMBER WARNING"
            recommendation = (
                "Heightened monitoring recommended. Saturated soil conditions detected. "
                "Maintain active road inspection teams along vulnerable corridors."
            )
        else:
            risk_level = "Low"
            alert_status = "GREEN MONITORING"
            recommendation = "Normal baseline conditions. Regular periodic monitoring."

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "alert_status": alert_status,
            "recommendation": recommendation,
        }


# Singleton instance for application-wide reuse
_predictor_instance = LandslidePredictor()


def predict_risk(rainfall: float, soil_moisture: float) -> Dict[str, Any]:
    """Helper function to execute prediction using the default predictor."""
    return _predictor_instance.predict(rainfall, soil_moisture)

