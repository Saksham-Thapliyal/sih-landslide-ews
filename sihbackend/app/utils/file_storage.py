"""Secure file handling and storage utility."""

import os
import uuid
from pathlib import Path
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage


def is_allowed_file(filename: str, allowed_extensions: set) -> bool:
    """Check if file has an approved extension."""
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in allowed_extensions


def save_uploaded_file(file: FileStorage, upload_folder: str, allowed_extensions: set) -> dict:
    """Validates and securely saves an uploaded photo.

    Args:
        file: Werkzeug FileStorage object.
        upload_folder: Absolute or relative directory path to save images.
        allowed_extensions: Set of allowed lowercase file extensions.

    Returns:
        dict with keys:
            - filename: Unique safe filename saved on disk.
            - file_path: Absolute file path where file is saved.
            - relative_url: URL path to serve the file (e.g. /uploads/<filename>).

    Raises:
        ValueError: If file is missing, empty, or has an unapproved extension.
    """
    if not file or not file.filename:
        raise ValueError("No file was provided in the upload request.")

    raw_filename = file.filename.strip()
    if not raw_filename:
        raise ValueError("Uploaded file has an empty filename.")

    if not is_allowed_file(raw_filename, allowed_extensions):
        valid_exts = ", ".join(sorted(allowed_extensions))
        raise ValueError(
            f"Invalid file type. Allowed image formats are: {valid_exts}"
        )

    # Sanitize original name to prevent directory traversal
    clean_name = secure_filename(raw_filename)
    if not clean_name:
        clean_name = "upload.jpg"

    # Prefix unique identifier to prevent overwrites and guessing
    unique_prefix = uuid.uuid4().hex[:12]
    safe_filename = f"{unique_prefix}_{clean_name}"

    upload_dir = Path(upload_folder).resolve()
    upload_dir.mkdir(parents=True, exist_ok=True)

    dest_path = upload_dir / safe_filename

    # Save to disk
    file.save(str(dest_path))

    return {
        "filename": safe_filename,
        "file_path": str(dest_path),
        "relative_url": f"/uploads/{safe_filename}",
    }

