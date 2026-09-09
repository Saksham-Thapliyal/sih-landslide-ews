from __future__ import annotations

import math
from typing import Any

# Publicly documented NRSC/ISRO 1998-2022 landslide inventory counts for states
# appearing in the Landslide Atlas. These are used only as a coarse historical
# exposure prior, not as a district-level occurrence label.
INVENTORY_COUNTS = {
    'Arunachal Pradesh': 7689,
    'Nagaland': 2132,
    'Manipur': 5494,
    'Mizoram': 12385,
    'Tripura': 8070,
    'Assam': 2569,
    'Meghalaya': 2639,
    'Sikkim': 1569,
    'Uttarakhand': 11219,
    'Himachal Pradesh': 1561,
    'West Bengal': 172,
    'Kerala': 6039,
}

MAX_KNOWN = max(INVENTORY_COUNTS.values())
MIN_KNOWN = min(INVENTORY_COUNTS.values())


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def normalized_log_exposure(state: str) -> tuple[float | None, str]:
    count = INVENTORY_COUNTS.get(state)
    if count is None:
        return None, 'No state-level inventory prior configured'
    lo = math.log1p(MIN_KNOWN)
    hi = math.log1p(MAX_KNOWN)
    score = (math.log1p(count) - lo) / (hi - lo) if hi > lo else 0.5
    return round(clamp(score), 4), f'NRSC/ISRO 1998-2022 inventory: {count:,} mapped landslides'


def assess_live_risk(*, rainfall_mm: float | None, soil_moisture: float | None, state: str, region: str) -> dict[str, Any]:
    """Transparent live hazard score using observed environmental conditions.

    This is intentionally NOT presented as a statistically trained probability.
    It is a deterministic risk index until a real event-labelled training set is
    supplied. The weights are exposed so the demo is auditable.
    """
    if rainfall_mm is None or soil_moisture is None:
        return {
            'score': None,
            'risk': None,
            'confidence': None,
            'engine': 'hybrid-live-risk-index-v1',
            'engine_type': 'deterministic_live_index',
            'components': {},
            'note': 'Insufficient live environmental inputs for a current assessment.',
        }

    # Trigger intensity: 0 at dry conditions, approaching 1 at 200 mm/24h.
    rainfall_score = clamp(float(rainfall_mm) / 200.0)
    # Saturation proxy: 0 below 0.25 m3/m3, approaching 1 around 0.75 m3/m3.
    soil_score = clamp((float(soil_moisture) - 0.25) / 0.50)
    exposure_score, exposure_note = normalized_log_exposure(state)

    # Keep the dynamic weather signal dominant. The historical prior is only
    # a modest spatial susceptibility context, never an event label.
    if exposure_score is None:
        score = 0.60 * rainfall_score + 0.40 * soil_score
        confidence = 0.55
    else:
        score = 0.55 * rainfall_score + 0.35 * soil_score + 0.10 * exposure_score
        confidence = 0.65

    score = round(clamp(score), 4)
    if score >= 0.67:
        risk = 'HIGH'
    elif score >= 0.40:
        risk = 'MEDIUM'
    else:
        risk = 'LOW'

    return {
        'score': score,
        'risk': risk,
        'confidence': confidence,
        'engine': 'hybrid-live-risk-index-v1',
        'engine_type': 'deterministic_live_index',
        'components': {
            'rainfall_trigger': round(rainfall_score, 4),
            'soil_saturation': round(soil_score, 4),
            'historical_exposure_prior': exposure_score,
        },
        'historical_exposure_note': exposure_note,
        'note': 'Live risk index, not a calibrated probability of landslide occurrence. Replace with an event-labelled model when the real inventory is ingested.',
    }
