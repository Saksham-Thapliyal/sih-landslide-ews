"""Application factory module for Flask backend."""

import os
from pathlib import Path
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from app.database import init_db, close_db
from app.routes.predict import predict_bp
from app.routes.zones import zones_bp
from app.routes.reports import reports_bp
from app.routes.health import health_bp


def create_app(config_class=Config):
    """Factory creating and configuring the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable Cross-Origin Resource Sharing for frontend access
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Ensure upload directory exists
    Path(app.config["UPLOAD_FOLDER"]).mkdir(parents=True, exist_ok=True)

    # Initialize SQLite database and seed NER demo data
    with app.app_context():
        init_db(app)

    # Register teardown to clean up SQLite connections per request
    app.teardown_appcontext(close_db)

    # Register route blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(zones_bp)
    app.register_blueprint(reports_bp)

    # JSON error handlers
    @app.errorhandler(400)
    def handle_bad_request(e):
        return (
            jsonify(
                {
                    "error": "Bad Request",
                    "message": getattr(e, "description", "The request was invalid."),
                }
            ),
            400,
        )

    @app.errorhandler(404)
    def handle_not_found(e):
        return (
            jsonify(
                {
                    "error": "Not Found",
                    "message": getattr(
                        e, "description", "The requested resource was not found."
                    ),
                }
            ),
            404,
        )

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return (
            jsonify(
                {
                    "error": "Method Not Allowed",
                    "message": "The HTTP method is not supported on this endpoint.",
                }
            ),
            405,
        )

    @app.errorhandler(413)
    def handle_payload_too_large(e):
        max_mb = app.config.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024) / (1024 * 1024)
        return (
            jsonify(
                {
                    "error": "Payload Too Large",
                    "message": f"Uploaded file exceeds maximum allowed size limit of {max_mb:.0f} MB.",
                }
            ),
            413,
        )

    @app.errorhandler(500)
    def handle_internal_server_error(e):
        app.logger.error(f"Internal server error: {e}")
        return (
            jsonify(
                {
                    "error": "Internal Server Error",
                    "message": "An unexpected error occurred on the server.",
                }
            ),
            500,
        )

    return app

