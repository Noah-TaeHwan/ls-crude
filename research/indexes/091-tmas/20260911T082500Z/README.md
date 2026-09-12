# 091 TMAS 인덱스 영수증 — 20260911T082500Z (DATA-03)

이 런의 입력→코드→출력 SHA-256 영수증이다. 전체 90행은 [`receipt.sha256`](receipt.sha256) (레포 루트 기준 상대경로)이며 다음으로 검증한다:

```bash
shasum -a 256 -c research/indexes/091-tmas/20260911T082500Z/receipt.sha256
```

월별 품질 표는 [`monthly_quality.csv`](monthly_quality.csv)(+`.json`), 역 연속성 증거는 [`station_avc040_continuity.json`](station_avc040_continuity.json)(+`.csv`)이다.

## 1. 입력 (input) — 이 런 다운로드 13건

| 파일 | bytes | SHA-256 | 수집(UTC) |
| --- | ---: | --- | --- |
| `2020_station_data.zip` | 1,192,245 | `7024400bb6b7bd3dd34fa9ee90d11b0542d458c05236aefd4db3df6e1b2ef8b3` | 2026-09-11T08:40:28Z |
| `apr_2023_ccs_data.zip` | 25,867,023 | `f9df202f8d387a57be7cf873303cf88cd92a39c14df94aeedbc083af97c6f435` | 2026-09-11T08:35:57Z |
| `aug_2023_ccs_data.zip` | 27,642,223 | `ac6bdecf1b1f7f67c1c10fa6169cbec39aed93093bbfbd1b3ac7c3b97d796732` | 2026-09-11T08:37:04Z |
| `dec_2023_ccs_data.zip` | 27,514,252 | `88a4446791a5e98aa9d0bdd3be02b969991bd19a7198368934f5ad170a187442` | 2026-09-11T08:37:47Z |
| `feb_2023_ccs_data.zip` | 24,109,855 | `83797bf8d592c3c8b006ba1a48a24444fd6d9d179ada55f8c79db4c5374e2552` | 2026-09-11T08:35:52Z |
| `jan_2023_ccs_data.zip` | 26,034,982 | `a1ac6438b9ee45bb3d9e35ff0334df01a5142d5655a9187510caa44801d0405e` | 2026-09-11T08:35:48Z |
| `jul_2023_ccs_data.zip` | 27,453,955 | `f38a221373681d1ccafdc4ca92ad47c7859da9fa4a02388484c73ae2792a08cd` | 2026-09-11T08:36:49Z |
| `jun_2023_ccs_data.zip` | 26,419,183 | `17eb68361f00f80f37077576dde47163ba3bce1859147b307b64906f0008af0e` | 2026-09-11T08:36:32Z |
| `mar_2020_ccs_data.zip` | 28,429,778 | `5bcbffcc1833e89d2b9b7b7b0184f66b3f9ad4706825eca76cb7e7d5c432f15c` | 2026-09-11T08:38:03Z |
| `may_2023_ccs_data.zip` | 27,096,886 | `16a33d806f0687b84363d658e711c7b8deb0484b4adce96b2636a06aace98bb0` | 2026-09-11T08:36:19Z |
| `nov_2023_ccs_data.zip` | 26,945,885 | `2a3a8501f80809031efa87257433b684dd1e2f07fdde2ff7124adf942d9d5688` | 2026-09-11T08:37:31Z |
| `oct_2023_ccs_data.zip` | 27,917,077 | `25ebb5e23acc72484bff96519ebd8f58a32a6ecb485859617fca081603ae8213` | 2026-09-11T08:37:26Z |
| `sep_2023_ccs_data.zip` | 26,871,278 | `48c9085c301500f4bc166b9b4cff23644cf56c993c5cb40559a83edf1c6e2e41` | 2026-09-11T08:37:10Z |

`download_manifest.json`(raw 폴더)에 URL·HTTP 상태·Last-Modified·ETag·수집시각이 원장으로 남아 있다. URL당 1회, 실패 0건.

## 2. 입력 (input) — 이 런 zip에서 추출한 원본 14건

| 파일 | bytes | SHA-256 |
| --- | ---: | --- |
| `OK_APR_2023 (TMAS).VOL` | 1,031,824 | `5444d8d8741f3e7fcd2cbc347c78a64166e1f3a9c29c30161933c6d58c7f816e` |
| `OK_AUG_2023 (TMAS).VOL` | 1,091,869 | `bb6b28969f6e620bda1e8c210adc60aeb7a2390628706d1331837ca4ab978fe6` |
| `OK_DEC_2023 (TMAS).VOL` | 1,103,107 | `55d7ced493cf9d1fb9ef3ef4e1d879a625f4a12fd0c531542a1a2c85a1ec241d` |
| `OK_FEB_2023 (TMAS).VOL` | 990,920 | `ffffeadcfd28c0b5f5767b61396439b7e866af56864fec72ca00b3df1a53741f` |
| `OK_JAN_2023 (TMAS).VOL` | 1,098,695 | `9fe6c5cd5ce9d8f49ec3dfe4b5bfb6919fe51e2ed7c8c15df3e3ddd886ad47a1` |
| `OK_JUL_2023 (TMAS).VOL` | 1,080,225 | `7b8e82ad74c8dc58b60e2a5445395e52738d81a9fa779fd80311599cc93e6d92` |
| `OK_JUN_2023 (TMAS).VOL` | 1,043,836 | `c7de826ebab72a51078f67f32e7656ec3f359ace89a1917042538fb3976fd969` |
| `OK_MAR_2020 (TMAS).VOL` | 1,536,535 | `f2284e1736496f3acd3b15ad150d97d95040107b34862009de70e15c73218c93` |
| `OK_MAR_2023 (TMAS).VOL` | 1,065,987 | `269373638d5b069ca2f411cc966e8196bf2733f1eb404b0df82380ce170d06b4` |
| `OK_MAY_2023 (TMAS).VOL` | 1,094,171 | `ad0b3d807af9c26febbc7b988cddef62db7b75914634acf831be83299bfe0e6e` |
| `OK_NOV_2023 (TMAS).VOL` | 1,054,793 | `9d52717353047fb42e5e23abde3e0758c695a104e9a373f82e6d54603185aacc` |
| `OK_OCT_2023 (TMAS).VOL` | 1,130,529 | `e4d13d7bb4d30639bc458989e7e30961410073b499f272906637d5a81e570888` |
| `OK_SEP_2023 (TMAS).VOL` | 1,062,799 | `79c81799812745bf3d69cad0b9c4707eaf6c3d962493aa15dada85dc340bb904` |
| `Station_Data_Extract_Pipe_Delimited_CleanData_2020.txt` | 7,148,347 | `023ece374c4208a721d24964d6c4efd96c3137e4180da4d3640e32e37ff3015f` |

## 3. 입력 (input) — 앞 런(20260911T075705Z)에서 사용한 파일

| 파일 | bytes | SHA-256 |
| --- | ---: | --- |
| `research/gathering/raw/091-tmas/20260911T075705Z/extracted/mar_2016/OK_MAR_2016 (TMAS).VOL` | 1,431,716 | `d55444cf924034ac4caeec487967be4d601fcf9f51b23c215d1ae0413a8c41ab` |
| `research/gathering/raw/091-tmas/20260911T075705Z/zips/mar_2016_ccs_data.zip` | 19,946,970 | `a601c66f7c3e30b620c300ca0889a36f1953406e1ef50e4398448734b714e19e` |
| `research/gathering/raw/091-tmas/20260911T075705Z/zips/2023_station_data.zip` | 835,077 | `cff460a00e43134723b357737ba372f68bfc581dbb95d8a96298c2ef58501cda` |
| `research/gathering/raw/091-tmas/20260911T075705Z/extracted/mar_2023/OK_MAR_2023 (TMAS).VOL` | 1,065,987 | `269373638d5b069ca2f411cc966e8196bf2733f1eb404b0df82380ce170d06b4` |
| `research/gathering/raw/091-tmas/20260911T075705Z/zips/mar_2023_ccs_data.zip` | 26,515,716 | `017de6550a69674dbbc4030edcaf6231a32b70a2b572778b0b99f1fd7d6ce827` |
| `research/gathering/raw/091-tmas/20260911T075705Z/download_manifest.json` | 4,148 | `c3d5aea2a397e54db28b66012021b45af27d45b5749c9cc056c283aeb0505a18` |
| `research/gathering/raw/091-tmas/20260911T075705Z/README.md` | 6,870 | `0383f2406dbbff0d8da1b5c6984079968c081def1ccb6badf0864b761f45d021` |
| `research/indexes/091-tmas/20260911T075705Z/avc040_mar2016_quality.json` | 1,773 | `c821621f2fea44f2bde0daa6502545b576180d54b18cee30c44519683e7f7ced` |
| `research/indexes/091-tmas/20260911T075705Z/avc040_mar2016_hourly.csv` | 40,588 | `8f29a5244ad2aa541cf679f580837641089d0944cfc39d730737b239be83db2a` |
| `research/indexes/091-tmas/20260911T075705Z/avc040_mar2023_quality.json` | 1,797 | `aeb5aba7d01be45e639a83e20546a544d004a73ebd0e328a6bb64a48539ce673` |
| `research/indexes/091-tmas/20260911T075705Z/avc040_mar2023_hourly.csv` | 41,936 | `1ca48b95aeb6e791c8414e810b31c5f554f34da5f1b7cbe6286bcff32ee63cc1` |
| `research/indexes/091-tmas/20260911T075705Z/station_screen_within40km.csv` | 433 | `2b2ad311502f0974f597bf8683a597d062b51cf33efb569fafd6d6658a138329` |
| `research/indexes/091-tmas/20260911T075705Z/README.md` | 4,502 | `137ab94ed4217a860aecd7ffd3f3bdac69de73819b12ad6ae03f942c59e0df87` |

## 4. 코드 (code)

| 파일 | bytes | SHA-256 |
| --- | ---: | --- |
| `research/notebooks/091-tmas/download.py` | 6,980 | `db318ebecbd9be38266a0f59e3436605fe3f02cb44b1d936563d6921dc4ece1c` |
| `research/notebooks/091-tmas/parse_volume.py` | 10,473 | `4dc62c9350f30cc5b910c7073e45a1f0b53f6fd377c652b2c68f1b209f65e1ea` |
| `research/notebooks/091-tmas/parse_stations.py` | 6,668 | `e3d7511d376036179732e5ebecbfbe145f3b769d6efe1911ee84cbe8af21c9da` |
| `research/notebooks/091-tmas/monthly_quality.py` | 4,583 | `9b34cc39fd1c93e73657adfe8d87eecdd0757aa4b88c1a33e0cb228451695f55` |
| `research/notebooks/091-tmas/check_station_continuity.py` | 5,417 | `5f212a86aa69ee992e72eb9357ea8a43dc77f6146cfe98c4cf6b094a07ac7c81` |
| `research/notebooks/091-tmas/expand_2023.sh` | 1,351 | `af8fb50f69b7f0f27ebca3a5110424a187971fb00ef64f64a108552f2c41f3e7` |

파서 `parse_volume.py`는 형식 자동 판별(첫 줄 `record_type|` → pipe_2023, 아니면 fixed_legacy)로 2016·2020 고정폭과 2023 파이프를 모두 처리한다. 실행 명령 전체는 raw README(§정확한 명령) 참조.

## 5. 출력 (output) 43건 + 이 README (receipt.sha256에 포함)

| 파일 | bytes | SHA-256 |
| --- | ---: | --- |
| `avc040_apr2023_daily.csv` | 2,186 | `51ea577e136f434fd06ac7d2e4e90aea471e032581d46e5ffff355853e2d3293` |
| `avc040_apr2023_hourly.csv` | 41,969 | `99e5c462898727886f030d094961720d88316ed6f4502dfc91824621a4d5a35c` |
| `avc040_apr2023_quality.json` | 1,728 | `19159896410960c0b6f9efa7474b94f121b34b2c5ac870a98d7b77604576f4a7` |
| `avc040_aug2023_daily.csv` | 2,256 | `8962e2f360ef3e83cfc4aea679d7568b4ba238cb46be33ed07e991efe5edf768` |
| `avc040_aug2023_hourly.csv` | 43,340 | `2b308c8e6e6be38eda576b3018a9478e3ed32f3adaa1cff2d07ce36bbe612a34` |
| `avc040_aug2023_quality.json` | 1,744 | `127cc7989315b00c1857f9c777ff7b18152d3b8de55b65ff7f7343ebee7cadbe` |
| `avc040_dec2023_daily.csv` | 2,256 | `ca4314c12653f603e8309bdb9cdb2ffc45d7940855d84c07311f986ed65faf2c` |
| `avc040_dec2023_hourly.csv` | 43,298 | `fbb259c16e1c6f72e29e9475c49a4f04a9470b1b521f54ef95e4c8a907214043` |
| `avc040_dec2023_quality.json` | 1,744 | `b0c39d62f78caa0b9ebd123c86eb21340cd18254347b75a0211c625073d662b0` |
| `avc040_feb2023_daily.csv` | 2,046 | `473034663ed04497dd452cfa2243bea94b4c6cdacd03d162c11b52ae59dc0f7f` |
| `avc040_feb2023_hourly.csv` | 39,106 | `9e8d64e5614cd0995400c8a5cf19acabd489779059dba0882b88f51e578583ba` |
| `avc040_feb2023_quality.json` | 1,742 | `178635e19706ae3b1493d2e962871ed89946e429a6847a08535119f121db4551` |
| `avc040_jan2023_daily.csv` | 2,256 | `d45efd0beff0d678b4a94de1c65c38efc64821964cfc1f82d3ef90a00be20b3c` |
| `avc040_jan2023_hourly.csv` | 43,248 | `565118b4686352fb72b4af708bb03ab0abc7e0fc0e2278de946f1abde34037af` |
| `avc040_jan2023_quality.json` | 1,744 | `9187f7fd050c3ddf46d9a4b0c0f82d319d0650b183805d6072c0e11916bf6ae6` |
| `avc040_jul2023_daily.csv` | 2,256 | `b63ec2f5b14f7fd12c577124424e25a2ba5f5d2c0fa3577f2b3ac6d9148861f4` |
| `avc040_jul2023_hourly.csv` | 43,344 | `e9895f3c3155338e6f5d3c6802be44ce18f7e9769c5b4f7f46d094cb4bfa54a1` |
| `avc040_jul2023_quality.json` | 1,743 | `ce4761517078a136c4b96212ca71aacfaed84f00421d43beed25f5c9ac7db4b7` |
| `avc040_jun2023_daily.csv` | 2,186 | `c7136d2d546bde5fa3931e74113b40cff1fdc740cd713229c8b87576eea02613` |
| `avc040_jun2023_hourly.csv` | 41,974 | `a79f0f3f07db740a68ecc4e95931f60b79d6197ce554381dbdd2fab26fcd1d65` |
| `avc040_jun2023_quality.json` | 1,743 | `ce72eb146428620cb410a9e2d58557a5e040b655f72fa9cfda110590744d9e47` |
| `avc040_mar2020_daily.csv` | 2,186 | `ccb360d03b5b0128fee7239c7c51eaea4b3db52deef45e23769299f339a01710` |
| `avc040_mar2020_hourly.csv` | 41,869 | `fa76ac1ec56062c7cccb49128daefc8904e7dc717a17e29e452e93a96f6ad795` |
| `avc040_mar2020_quality.json` | 1,733 | `a6a57c6ec6f8abc9eb489fbc54769969b37eb5a4380f6a6f2b56b22c07b2a843` |
| `avc040_mar2023_daily.csv` | 2,186 | `a3091dfaac47cd57ee71a16c08b225d4f1423cc4f51f87a826b6693d5a7190e7` |
| `avc040_mar2023_hourly.csv` | 41,936 | `1ca48b95aeb6e791c8414e810b31c5f554f34da5f1b7cbe6286bcff32ee63cc1` |
| `avc040_mar2023_quality.json` | 1,788 | `d5187f8ab991473d49748114ec40ddba2ccfbd42ea97013f7ad0f535e585d7b7` |
| `avc040_may2023_daily.csv` | 2,256 | `125c5d2468bbc04db1dabe91bdd8a579265f3dcda03f8a3215bac60027f08934` |
| `avc040_may2023_hourly.csv` | 43,355 | `6a90df80adf69fc7a12fe1792eb20840e3f363e960a6fd7d4cb70ade0abf069d` |
| `avc040_may2023_quality.json` | 1,744 | `fdb863a6dbb4f28ef7f36b1764b5993af65e6ad6f017330c1a08ebece51954cd` |
| `avc040_nov2023_daily.csv` | 2,116 | `4b799d0f29ffe364836c232c55bc3ccbc2e7223b2f2916b0143f5bb615a262c4` |
| `avc040_nov2023_hourly.csv` | 40,529 | `efd8b2486d000c0e8b4ce98ed40b5014bd594f60564ac155f5c00d89a430b0ae` |
| `avc040_nov2023_quality.json` | 1,786 | `4fce73d79ac32f5e25cbe13b5d6d1ed70465c6098f77894225dd5ccbb6a11e6e` |
| `avc040_oct2023_daily.csv` | 2,256 | `e394c09b44b4ecdfef78596c76559eccdab7ea3fb302ded72e01d8a5f91bc58c` |
| `avc040_oct2023_hourly.csv` | 43,323 | `c1e501a7a0f3b57b81316371d6703d42a8f1208605467a196e0da748462c2c3e` |
| `avc040_oct2023_quality.json` | 1,744 | `ab711af1399cc9615ed11aabe98ee5bac62c27e6f715124234af96f6a00dd629` |
| `avc040_sep2023_daily.csv` | 2,186 | `5720ab5657ca9be0dce6b3e0fbeec8c505d89dbaf45b172483c3f8c1be8872ff` |
| `avc040_sep2023_hourly.csv` | 41,939 | `be0137b56ef238a33a48f8cdafd8dce8c0ce016afb52d52fb9b93442c45f8ba9` |
| `avc040_sep2023_quality.json` | 1,744 | `2f7b1d9c75001794de539fdedab33093fd4c42e7eeb4c08025dc3867ae80ad69` |
| `monthly_quality.csv` | 3,131 | `9e86272fc28ff7dfe29d2470e830ff006b36f0ef5453f883745a0de7762fcbef` |
| `monthly_quality.json` | 9,770 | `047f4b04ee1cfcd25b589ad5c4939ce68e1d01da97b1d7899290e5d5b9e9f797` |
| `station_avc040_continuity.csv` | 606 | `d09e01713282de0290d9dc4e1a76192861117d85acbee0c823a22e7c583aad04` |
| `station_avc040_continuity.json` | 1,801 | `8db220d86e5f863f67dffa7f45a563b8926c3b4c64b37481bbbaa2f217919673` |

## 6. 메모

- **2023-03 재파싱 동일성(가정 아님, 검증):** 이 런에서 같은 추출 파일(sha256 `269373638d…`, 앞 런과 동일)로 다시 파싱한 결과 `avc040_mar2023_hourly.csv`=`1ca48b95…`, `avc040_mar2023_daily.csv`=`a3091dfa…`가 앞 런 산출물과 **바이트 동일**했다. 이 런의 `avc040_mar2023_quality.json`은 `file.path` 필드만 달라 해시가 다르며 수치(8,926레코드/80역/AVC040 60레코드/결측 0셀)는 이전 JSON과 일치한다.
- **DST:** 결측일 2016-03-13·2020-03-08·2023-03-12·2023-11-05는 미국 DST 전이일과 겹친다. **상관 기록, 원인 미확정.**
- **2020-03 파일 중복 키 20건은 파일 전체(90역) 감사 값**이다. AVC040 자체는 역 단위 중복 0건(`dup_keys_station=0`)이며 차선은 1만 존재(lane 0 없음 → 총계-차선 이중계상 그룹 0).
- 단위는 파일의 hour 필드 그대로 vehicles/hour이며 환산·보간·대체 없다. 결측은 결측대로 기록.
