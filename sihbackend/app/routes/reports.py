"""Route handlers for citizen photo reporting of landslide hazards."""

import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from app.database import get_db
from app.utils.file_storage import save_uploaded_file

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/report", methods=["POST"])
def submit_report():
    """Accept and store a citizen hazard report with photo.

    Expects multipart/form-data:
        photo (or image/file): Uploaded image file (.png, .jpg, .jpeg, .webp)
        latitude: Numeric float (-90 to 90)
        longitude: Numeric float (-180 to 180)
        description: Optional string describing crack/slope movement

    Returns:
        201 Created with report summary and unique report_id.
    """
    # 1. Validate photo upload presence
    file = None
    for field_name in ["photo", "image", "file"]:
        if field_name in request.files:
            file = request.files[field_name]
            break

    if not file or not file.filename:
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "A photo file must be provided (field name 'photo', 'image', or 'file').",
                }
            ),
            400,
        )

    # 2. Validate latitude
    raw_lat = request.form.get("latitude")
    if raw_lat is None or str(raw_lat).strip() == "":
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "Field 'latitude' is required.",
                }
            ),
            400,
        )

    try:
        latitude = float(raw_lat)
        if not (-90.0 <= latitude <= 90.0):
            return (
                jsonify(
                    {
                        "error": "Validation Error",
                        "message": "Field 'latitude' must be between -90 and 90 degrees.",
                    }
                ),
                400,
            )
    except (ValueError, TypeError):
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "Field 'latitude' must be a valid number.",
                }
            ),
            400,
        )

    # 3. Validate longitude
    raw_lon = request.form.get("longitude")
    if raw_lon is None or str(raw_lon).strip() == "":
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "Field 'longitude' is required.",
                }
            ),
            400,
        )

    try:
        longitude = float(raw_lon)
        if not (-180.0 <= longitude <= 180.0):
            return (
                jsonify(
                    {
                        "error": "Validation Error",
                        "message": "Field 'longitude' must be between -180 and 180 degrees.",
                    }
                ),
                400,
            )
    except (ValueError, TypeError):
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "Field 'longitude' must be a valid number.",
                }
            ),
            400,
        )

    # 4. Optional description
    description = request.form.get("description", "").strip()

    # 5. Save uploaded file safely
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    allowed_extensions = current_app.config["ALLOWED_EXTENSIONS"]

    try:
        saved_file_info = save_uploaded_file(file, upload_folder, allowed_extensions)
    except ValueError as val_err:
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": str(val_err),
                }
            ),
            400,
        )
    except Exception as exc:
        current_app.logger.error(f"File upload failure: {exc}")
        return (
            jsonify(
                {
                    "error": "Upload Error",
                    "message": "Failed to save the uploaded image safely.",
                }
            ),
            500,
        )

    # 6. Generate unique report ID
    report_id = f"rep_{uuid.uuid4().hex[:10]}"
    created_at = datetime.utcnow().isoformat() + "Z"
    status = "Pending Verification"

    # 7. Store in SQLite
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """
        INSERT INTO citizen_reports (
            report_id, latitude, longitude, description,
            image_filename, image_url, created_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            report_id,
            latitude,
            longitude,
            description,
            saved_file_info["filename"],
            saved_file_info["relative_url"],
            created_at,
            status,
        ),
    )
    db.commit()

    report_record = {
        "report_id": report_id,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "image_filename": saved_file_info["filename"],
        "image_url": saved_file_info["relative_url"],
        "created_at": created_at,
        "status": status,
    }

    return (
        jsonify(
            {
                "status": "success",
                "message": "Landslide citizen report submitted successfully.",
                "report": report_record,
            }
        ),
        201,
    )


@reports_bp.route("/reports", methods=["GET"])
def list_reports():
    """Retrieve all citizen reports for dashboard feeds and alerts."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "SELECT * FROM citizen_reports ORDER BY id DESC LIMIT 100;"
    )
    rows = cursor.fetchall()

    reports = []
    for row in rows:
        reports.append(
            {
                "id": row["id"],
                "report_id": row["report_id"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "description": row["description"],
                "image_filename": row["image_filename"],
                "image_url": row["image_url"],
                "created_at": row["created_at"],
                "status": row["status"],
            }
        )

    return (
        jsonify(
            {
                "status": "success",
                "count": len(reports),
                "reports": reports,
            }
        ),
        200,
    )


@reports_bp.route("/uploads/<path:filename>", methods=["GET"])
def serve_uploaded_file(filename):
    """Serve uploaded citizen photos safely."""
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    return send_from_directory(upload_folder, filename)

