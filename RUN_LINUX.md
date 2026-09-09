# Bhoomi Rakshak — Linux Quick Start

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env
```

Set your private Government OGD API key:

```env
DATA_GOV_API_KEY=YOUR_KEY
DATA_GOV_RESOURCE_ID=6c05cd1b-ed59-40c2-bc31-e314f39c6971
```

Start the API:

```bash
python3 run.py
```

Test in a second terminal:

```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/data-sources
curl http://localhost:8000/api/map/risk
```

Swagger: http://localhost:8000/docs

## Frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000

## Important

- Keep the backend terminal running while using the frontend.
- Never commit `backend/.env` or expose the Government API key.
- Current district identity, coordinates, government rainfall, soil moisture and live risk score are hydrated from `/api/map/risk` at startup and every 5 minutes.
- Production inference uses the transparent `hybrid-live-risk-index-v1`; it is not presented as a calibrated probability.
- Government OGD daily rainfall is the preferred rainfall input when a recent record is available. Open-Meteo supplies soil moisture and acts as the rainfall fallback.
- The old synthetic Logistic Regression model is intentionally excluded from this release and is not loaded by production inference.


## If the map shows no points

The map will still show district display points in grey if the live environmental feed is unavailable; it will not invent a 0% risk value. Check the backend first:

```bash
curl http://localhost:8000/api/health
curl --max-time 45 http://localhost:8000/api/map/risk?region=northeast
```

If the second command returns live points, refresh `http://localhost:3000`. If the environmental provider is temporarily unreachable, retry after a minute; the backend also falls back from multi-location Open-Meteo requests to individual requests.
