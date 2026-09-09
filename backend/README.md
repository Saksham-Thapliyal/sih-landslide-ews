# Bhoomi Rakshak Backend

FastAPI backend for the live Bhoomi Rakshak prototype.

## Production data flow

1. **Government of India OGD / NWIC Daily District-wise Rainfall** is the preferred rainfall source.
2. **Open-Meteo** supplies soil moisture (0–7 cm), temperature, humidity and rainfall fallback.
3. A transparent **hybrid live risk index** combines rainfall intensity, soil saturation and a modest state-level historical inventory prior based on NRSC/ISRO landslide inventory counts.
4. SQLite stores observations and citizen ground reports for audit/history.
5. The old synthetic Logistic Regression model is retained only under `experimental/` and is not loaded by production inference.

## Important scientific boundary

The production score is a **risk index, not a calibrated probability of landslide occurrence**. A real predictive ML model requires an event-labelled landslide inventory with time/location plus matched historical environmental and terrain features. The backend is structured so that such a model can replace `risk_engine.py` later without changing the frontend/API contract.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your OGD API key to .env
python run.py
```


The live upstream fetches use short timeouts and bounded collection so an unavailable weather/government feed cannot leave API requests hanging indefinitely.


### Demo reliability / live coverage

The map attempts live Open-Meteo environmental data for eight priority Northeast monitoring points (one per state) on each refresh. The remaining configured locations are returned with an explicit `UNAVAILABLE` status until their live observation is available. This keeps the SIH demo responsive without fabricating measurements.
