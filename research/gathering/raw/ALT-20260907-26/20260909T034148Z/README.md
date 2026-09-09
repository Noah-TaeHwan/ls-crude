# ALT-20260907-26 metadata manifest

요청 UTC: 2026-09-09T03:41:48Z~03:42Z (curl 3회, 키 없음, 공개 v2 메타데이터 API).

- metadata-breakdown.json: https://api-production.data.gov.sg/v2/public/api/datasets/d_c9dcfd8b85990669d1e74dd7ad71eb8b/metadata; HTTP 200; SHA-256 `cc2816e8e12dd6344b90c09a520c8ff15d631cc8607f8db562043b7dfa88c35e`
- metadata-total.json: https://api-production.data.gov.sg/v2/public/api/datasets/d_9adb5ace517591edd9a8c88291ac1f1c/metadata; HTTP 200; SHA-256 `c98c82886ce3dda7f1d1385f48e74d75dd58cf0d3c35e99fd72490bcfbd779c3`
- metadata-collection.json: https://api-production.data.gov.sg/v2/public/api/collections/392/metadata; HTTP 200; SHA-256 `63bc6a404eaaac8749f744a93d865025e20ffaa0cdfde186ab7eab9b84c69360`

확인값: breakdown `data.lastUpdatedAt=2026-09-07T12:06:35+08:00`, `data.coverageEnd=2026-07-01T08:00:00+08:00`; total `data.lastUpdatedAt=2026-09-07T12:07:17+08:00`, `data.coverageEnd=2026-07-01T08:00:00+08:00`; collection `frequency=monthly`, `coverageEnd=2023-08-31T08:00:00+08:00`(stale, 데이터셋 레벨 사용). 양 데이터셋·컬렉션 description에 `(Latest month figures are preliminary estimates.)` 포함.

MPA/data.gov.sg, Singapore Open Data Licence 1.0 https://data.gov.sg/open-data-licence (2026-09-09 확인). 원본 불변·gitignored. 재취득은 위 URL 3건 GET.
