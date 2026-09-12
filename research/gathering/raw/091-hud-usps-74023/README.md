# Raw — HUD USPS vacancy hunt for ZIP 74023 (091-VACZ)

Keyless probes only. No registration, no login, no paid USPS product.
Nothing under this dir is committed (gitignored); the freeze verdict lives in
`research/indexes/091-cushing-operations-nowcasting/20260910T091VACZ/`.

## Probe recipe (2026-09-09)

1. Read `https://www.huduser.gov/portal/datasets/usps.html` (HUD program page).
   Finding, quoted: "Under the current agreement with the USPS, HUD can make
   the data accessible only to governmental entities and non-profit
   organizations registered as users." Access is via
   `https://www.huduser.gov/apps/public/usps/login` (registration required).
2. Read the login page `https://www.huduser.gov/apps/public/usps/login`.
   Finding, quoted: "HUD can make the data accessible only to governmental
   entities and non-profit organizations registered as users. This page allows
   registered users to login and access the data." Also: "HUD is provided with
   a tabulation of all addresses ... HUD tabulates these counts according to
   the Census Tract that they fall in and distributes the data by tract as the
   final product." — i.e. even registered access yields tract rows, not ZIP rows.
3. HUD "Guide to HUD User Data Sets" (PDF): "HUD makes the vacancy data
   available at the census tract level to government and nonprofit
   organizations through its controlled access page ... Permitted users must
   register to obtain a username and password to access these data."
   Formats: dBase. Periods: 2005–present.
4. Direct `curl` of the data-dictionary xlsx and the login page from this
   shell returned HTTP 202 with 0 bytes (AWS WAF bot challenge); no keyless
   file bytes were retrievable by script. Page text above was verified via
   rendered fetch instead. Zero-byte challenge bodies were deleted, not kept.
5. SOCDS checked as an alternative keyless HUD surface: per
   `https://www.huduser.gov/portal/datasets/socds-other.html`, "the only
   dataset that is being actively updated is the Building Permits Database"
   (permits are out of scope for this task); no vacancy series in SOCDS.
6. HUD-USPS ZIP crosswalk (`usps_crosswalk.html`) checked: it carries only
   allocation ratios (ZIP, TRACT/COUNTY/CBSA, RES_RATIO, BUS_RATIO, OTH_RATIO,
   TOT_RATIO) — no vacancy counts and no total-address counts as filed — and
   its downloads now also sit behind "please login here" (API needs a token).
   Ratios are not counts; deriving vacancy from them would be invention.
7. Third-party ZIP 74023 vacancy figures found and REJECTED (not HUD USPS,
   not dated series): repit.org 15.8% snapshot, ACS-derived 18.77%
   (1,034/5,510), investor marketing pages. No dates, no HUD USPS provenance.

## Conclusion

No keyless HUDUSER USPS file with dated ZIP 74023 vacancy or total-address
counts exists. Dated local rows: 0 (bar: ≥2). Fail closed.
