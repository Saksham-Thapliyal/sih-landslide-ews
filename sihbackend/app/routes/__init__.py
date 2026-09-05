"""Routes package for SIH Landslide Early Warning backend."""

from .predict import predict_bp
from .zones import zones_bp
from .reports import reports_bp
from .health import health_bp

__all__ = ["predict_bp", "zones_bp", "reports_bp", "health_bp"]

