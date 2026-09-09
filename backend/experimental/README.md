# Experimental synthetic model

This model is retained only for comparison/debugging from the original prototype.
It was trained on the project's synthetic Northeast India dataset and is **not loaded by production inference**.

Production inference uses `app/risk_engine.py`, which consumes live government rainfall and live environmental data and does not use synthetic labels.

For a calibrated ML model, ingest a real event-labelled landslide inventory (e.g. GSI/NRSC) with occurrence date/location and join it to historical rainfall/soil/topography features before training.
