# AI Landslide Risk Prediction API

This API uses a trained Logistic Regression machine learning model
to predict landslide risk using rainfall and soil moisture.

## API Endpoint

POST:

http://127.0.0.1:5000/predict

## Input

Send JSON data containing:

```json
{
    "rainfall": 180,
    "soil_moisture": 0.72
}