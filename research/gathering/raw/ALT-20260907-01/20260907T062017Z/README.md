# ALT-20260907-01 20260907T062017Z

Immutable local snapshot; payloads and manifest are ignored by Git.

- Collection: `research/notebooks/ALT-20260907-01/hunt.py collect --candidate 01`
- Plan SHA256: `a203159fb66f9a68df8eca5d574230f65fbd88da51f281ba06eb38bec0aee7b7`
- Manifest SHA256: `92c97da2722c72e97489846dfccb6cc41d8d143933dab17501a97f82467d9a10`

- https://agtransport.usda.gov/api/views/n4pw-9ygw.json — HTTP 200; `research/gathering/raw/ALT-20260907-01/20260907T062017Z/metadata.json`; SHA256 `2b775345f6dd0b20cc221c3000b0a4699c714c7753674fceaee88ab26e605453`
- https://agtransport.usda.gov/resource/n4pw-9ygw.json?%24where=date+%3E%3D+%272015-01-01T00%3A00%3A00%27+AND+date+%3C+%272024-01-01T00%3A00%3A00%27+AND+lock+in+%28%27MS+Locks+27%27%2C%27Miss+Locks+27%27%29&%24order=date%2Ccommodity&%24limit=10000 — HTTP 200; `research/gathering/raw/ALT-20260907-01/20260907T062017Z/activity.json`; SHA256 `3084f6df9a3083f086a2f9a9bc13bf77138ab5e0069409d3b4ac46926a74e101`
- https://finance.yahoo.com/quote/CL=F/history/ — HTTP Yahoo library; `research/gathering/raw/ALT-20260907-01/20260907T062017Z/wti.csv`; SHA256 `ca318154ae3fa11e96771d4c5c1d47c7edfb9ea59872f631b37352af22bd8750`
