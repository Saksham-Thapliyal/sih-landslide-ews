"""Automated test suite for SIH Landslide Early Warning Backend."""

import io
import os
import unittest
from app import create_app
from config import Config


class TestConfig(Config):
    """Test configuration with dedicated test database and upload directory."""

    TESTING = True
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), "test_landslide.db")
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "test_uploads")


class LandslideBackendTestCase(unittest.TestCase):
    """Integration and unit tests for Flask API endpoints."""

    @classmethod
    def tearDownClass(cls):
        test_db = TestConfig.DATABASE_PATH
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except OSError:
                pass

    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()

    def tearDown(self):
        # Clean up any test uploads
        upload_dir = self.app.config["UPLOAD_FOLDER"]
        if os.path.exists(upload_dir):
            for fname in os.listdir(upload_dir):
                fpath = os.path.join(upload_dir, fname)
                if os.path.isfile(fpath):
                    try:
                        os.remove(fpath)
                    except OSError:
                        pass
            try:
                os.rmdir(upload_dir)
            except OSError:
                pass

    # ==========================================
    # 1. Root & Health Check Tests
    # ==========================================
    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("project", data)
        self.assertIn("North Eastern Region", data["focus_region"])
        self.assertIn("POST /predict-risk", data["endpoints"])

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["database"], "connected")

    # ==========================================
    # 2. Risk Prediction Tests (POST /predict-risk)
    # ==========================================
    def test_predict_risk_high(self):
        payload = {"rainfall": 160.0, "soil_moisture": 80.0}
        response = self.client.post("/predict-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["risk_level"], "High")
        self.assertGreaterEqual(data["risk_score"], 0.70)
        self.assertIn("alert_status", data)
        self.assertIn("RED ALERT", data["alert_status"])

    def test_predict_risk_low(self):
        payload = {"rainfall": 15.0, "soil_moisture": 20.0}
        response = self.client.post("/predict-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["risk_level"], "Low")
        self.assertLess(data["risk_score"], 0.40)

    def test_predict_risk_missing_rainfall(self):
        payload = {"soil_moisture": 50.0}
        response = self.client.post("/predict-risk", json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn("rainfall", data["message"].lower())

    def test_predict_risk_invalid_soil_moisture(self):
        payload = {"rainfall": 50.0, "soil_moisture": 150.0}  # Over 100%
        response = self.client.post("/predict-risk", json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn("between 0 and 100", data["message"])

    def test_predict_risk_negative_rainfall(self):
        payload = {"rainfall": -10.0, "soil_moisture": 50.0}
        response = self.client.post("/predict-risk", json=payload)
        self.assertEqual(response.status_code, 400)

    # ==========================================
    # 3. GIS Risk Zones Tests (GET /zones)
    # ==========================================
    def test_get_zones_default_list(self):
        response = self.client.get("/zones")
        self.assertEqual(response.status_code, 200)
        zones = response.get_json()
        self.assertIsInstance(zones, list)
        self.assertGreaterEqual(len(zones), 5)

        # Check required fields for first zone
        first_zone = zones[0]
        self.assertIn("id", first_zone)
        self.assertIn("name", first_zone)
        self.assertIn("latitude", first_zone)
        self.assertIn("longitude", first_zone)
        self.assertIn("severity", first_zone)
        self.assertIn("road_status", first_zone)

    def test_get_zones_format_object(self):
        response = self.client.get("/zones?format=object")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("zones", data)
        self.assertIn("count", data)
        self.assertEqual(data["status"], "success")

    def test_get_zones_filter_by_severity(self):
        response = self.client.get("/zones?severity=Critical")
        self.assertEqual(response.status_code, 200)
        zones = response.get_json()
        self.assertGreater(len(zones), 0)
        for zone in zones:
            self.assertEqual(zone["severity"], "Critical")

    # ==========================================
    # 4. Citizen Reporting Tests (POST /report)
    # ==========================================
    def test_submit_report_success(self):
        mock_image_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
        data = {
            "latitude": "27.2750",
            "longitude": "88.5200",
            "description": "Noticeable tension cracks forming near road embankment.",
            "photo": (io.BytesIO(mock_image_bytes), "crack_sample.png"),
        }

        response = self.client.post(
            "/report",
            data=data,
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 201)
        resp_json = response.get_json()
        self.assertEqual(resp_json["status"], "success")
        report = resp_json["report"]
        self.assertTrue(report["report_id"].startswith("rep_"))
        self.assertEqual(report["latitude"], 27.2750)
        self.assertEqual(report["longitude"], 88.5200)
        self.assertTrue(report["image_url"].startswith("/uploads/"))

        # Verify report is listed in GET /reports
        list_resp = self.client.get("/reports")
        self.assertEqual(list_resp.status_code, 200)
        reports = list_resp.get_json()["reports"]
        self.assertTrue(any(r["report_id"] == report["report_id"] for r in reports))

        # Verify photo can be served via GET /uploads/<filename>
        img_resp = self.client.get(report["image_url"])
        self.assertEqual(img_resp.status_code, 200)
        img_resp.close()

    def test_submit_report_missing_photo(self):
        data = {"latitude": "27.2750", "longitude": "88.5200"}
        response = self.client.post(
            "/report",
            data=data,
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 400)
        resp_json = response.get_json()
        self.assertIn("photo", resp_json["message"].lower())

    def test_submit_report_invalid_extension(self):
        data = {
            "latitude": "27.2750",
            "longitude": "88.5200",
            "photo": (io.BytesIO(b"fake data"), "malicious.sh"),
        }
        response = self.client.post(
            "/report",
            data=data,
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 400)
        resp_json = response.get_json()
        self.assertIn("Invalid file type", resp_json["message"])

    def test_submit_report_invalid_coordinates(self):
        data = {
            "latitude": "999.0",  # Out of range
            "longitude": "88.5200",
            "photo": (io.BytesIO(b"fake png"), "crack.png"),
        }
        response = self.client.post(
            "/report",
            data=data,
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 400)
        resp_json = response.get_json()
        self.assertIn("latitude", resp_json["message"].lower())


if __name__ == "__main__":
    unittest.main()

