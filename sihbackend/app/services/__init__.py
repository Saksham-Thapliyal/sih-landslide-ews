"""ML Service Package for Landslide Prediction.

Provides the interface and mock implementation for the AI-based
landslide risk prediction model.
"""

from .ml_service import LandslidePredictor, predict_risk

__all__ = ["LandslidePredictor", "predict_risk"]

