# ALT-20260907-04: source access snapshot

Activity series not collected. Metadata/access response only.

- UTC: 2026-09-07T06:20:23.331100+00:00
- Method/status: GET / 200
- URL: https://services9.arcgis.com/weJ1QsnbMYJlCHdG/ArcGIS/rest/services/Daily_Chokepoints_Data/FeatureServer/0/query?where=portid%3D%27chokepoint6%27+AND+date+%3C%3D+date+%272023-12-31%27&outStatistics=%5B%7B%22statisticType%22%3A+%22min%22%2C+%22onStatisticField%22%3A+%22date%22%2C+%22outStatisticFieldName%22%3A+%22min_date%22%7D%2C+%7B%22statisticType%22%3A+%22max%22%2C+%22onStatisticField%22%3A+%22date%22%2C+%22outStatisticFieldName%22%3A+%22max_date%22%7D%2C+%7B%22statisticType%22%3A+%22count%22%2C+%22onStatisticField%22%3A+%22date%22%2C+%22outStatisticFieldName%22%3A+%22n_dates%22%7D%5D&f=json&returnGeometry=false
- Bytes: 607
- SHA-256: 96343a81962f3b5ef57eea4c19d4a27f9d5c16d27e030dae7328a8283d824a16
- Payload: portwatch_coverage.body
- Reacquire: curl -sS -L --max-time 30 'https://services9.arcgis.com/weJ1QsnbMYJlCHdG/ArcGIS/rest/services/Daily_Chokepoints_Data/FeatureServer/0/query?where=portid%3D%27chokepoint6%27+AND+date+%3C%3D+date+%272023-12-31%27&outStatistics=%5B%7B%22statisticType%22%3A+%22min%22%2C+%22onStatisticField%22%3A+%22date%22%2C+%22outStatisticFieldName%22%3A+%22min_date%22%7D%2C+%7B%22statisticType%22%3A+%22max%22%2C+%22onStatisticField%22%3A+%22date%22%2C+%22outStatisticFieldName%22%3A+%22max_date%22%7D%2C+%7B%22statisticType%22%3A+%22count%22%2C+%22onStatisticField%22%3A+%22date%22%2C+%22outStatisticFieldName%22%3A+%22n_dates%22%7D%5D&f=json&returnGeometry=false'
- Permission: see candidate terms_evidence; response bytes remain ignored/local.
