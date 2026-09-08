# 091-W annual-environmental-footprint receipt

**Source:** Oklahoma DEQ `2024 Point Source Emissions` Feature Layer, queried
2026-09-08. The layer identifies the reporting year, operating status, facility
location, VOC and HAP totals. Its source records are official reported annual
emissions—not monitor readings and not a real-time AQI feed.

## Frozen extraction

1. `City = CUSHING` according to the DEQ field; this is the **Cushing-city**
   universe, not a radius-based hub universe.
2. `Status = Operating` and `Year_Emissions_Reported = 2024`.
3. Facility name contains `TERMINAL`, `TANK FARM`, or `CRUDE`.

This reproducible name filter yields 17 records. It can include a pipeline
station whose title contains `CRUDE`, and can omit an oil facility with an
unusual name. It is therefore labelled **terminal-like**; it is not a claim of
the complete physical Cushing storage system.

`deq-2024-cushing-terminal-like-facilities.csv` is the derived, filtered public
excerpt. SHA-256: `e633d0077eac2970e268cb40cad632c931e8d444fefe542917c941eb9574af6d`.

Exact query endpoint: [DEQ AirWeb 2024 Point Source Emissions](https://gis.deq.ok.gov/server/rest/services/AirWeb/MapServer/8/query?where=City%3D%27Cushing%27%20AND%20Status%3D%27Operating%27%20AND%20Year_Emissions_Reported%3D2024&outFields=Company%2CFacility%2CCity%2CStatus%2CVOC_Total_Tons%2CHAP_Tons%2CLatitude%2CLongitude%2CYear_Emissions_Reported&returnGeometry=false&f=pjson).
