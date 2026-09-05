"""Server startup entrypoint for SIH Landslide Early Warning Backend."""

import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    host = app.config.get("HOST", "0.0.0.0")
    port = app.config.get("PORT", 5000)
    debug = app.config.get("DEBUG", True)

    print("=" * 70)
    print("  AI-Based Early Warning & Landslide Risk Monitoring System (SIH)")
    print("  Focus Area: North Eastern Region (NER) of India")
    print(f"  Running on: http://{host}:{port} (Debug: {debug})")
    print("=" * 70)

    app.run(host=host, port=port, debug=debug)

