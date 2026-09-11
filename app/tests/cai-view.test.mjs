import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  displayedProbabilities,
  emptyCaiView,
  gaugeAngle,
  parseCaiPublicView,
} from "../app/lib/cai-view.ts";
import { readCaiPublicView } from "../app/lib/cai-view.server.ts";

// PUBLIC_VIEW 계약 E의 테스트 벡터. 아래 숫자는 테스트 전용이며
// 운영 코드의 기본값이 아니다.

function validIndex(overrides = {}) {
  return {
    index_id: "cushing-activity-index",
    definition_version: "wk-2026-W37",
    weighting_method: "equal-weight",
    score: 62.5,
    previous_score: 60.0,
    as_of: "2026-09-11",
    observed_at: "2026-09-11T00:35:00+00:00",
    available_at: "2026-09-11T01:00:00+00:00",
    computed_at: "2026-09-11T01:05:00+00:00",
    retrieved_at: "2026-09-11T01:06:00+00:00",
    data_origin: "OBSERVED",
    freshness: "FRESH",
    run_id: "run-001",
    constituent_count: 3,
    coverage: 0.8,
    history: [
      { date: "2026-09-04", score: 60.0, definition_version: "wk-2026-W37" },
      { date: "2026-09-11", score: 62.5, definition_version: "wk-2026-W37" },
    ],
    ...overrides,
  };
}

function validForecast(overrides = {}) {
  return {
    model_id: "cai-logistic-v1",
    trained_run_id: "train-001",
    generated_at: "2026-09-11T01:00:00+00:00",
    decision_cutoff: "2026-09-11T23:59:59-05:00",
    target_start: "2026-09-14T00:00:00-05:00",
    target_end: "2026-09-18T23:59:59-05:00",
    target_definition: "F5 > 0",
    publication_approved: true,
    probabilities: { up: 0.642, not_up: 0.358 },
    data_origin: "OBSERVED",
    freshness: "FRESH",
    ...overrides,
  };
}

function validSnapshot(overrides = {}) {
  return {
    schema_version: "cai.public.v1",
    index: validIndex(),
    forecast: validForecast(),
    validation: {
      status: "EXPLORATORY",
      n: 120,
      sample_start: "2015-01-01",
      sample_end: "2023-12-31",
      oos_exposure: "UNSEEN",
      freeze_ref: null,
      review_ref: null,
      metrics: [],
    },
    constituents: [],
    evidence: [],
    warnings: [],
    ...overrides,
  };
}

describe("parseCaiPublicView: 루트 검증", () => {
  it("null 입력은 빈 객체 계약 + INVALID_SNAPSHOT", () => {
    const out = parseCaiPublicView(null);
    assert.equal(out.schema_version, "cai.public.v1");
    assert.equal(out.index.score, null);
    assert.ok(out.warnings.includes("INVALID_SNAPSHOT"));
  });

  it("빈 객체와 schema 불일치는 빈 객체 계약 + INVALID_SNAPSHOT", () => {
    for (const input of [{}, { schema_version: "cai.public.v0" }, []]) {
      const out = parseCaiPublicView(input);
      assert.equal(out.index.data_origin, "NO_DATA");
      assert.ok(out.warnings.includes("INVALID_SNAPSHOT"));
    }
  });

  it("알 수 없는 raw/weights/token 필드는 출력에 남지 않음", () => {
    const out = parseCaiPublicView({
      ...validSnapshot(),
      raw: { secret: 1 },
      weights: [0.5, 0.5],
      token: "abc",
    });
    const text = JSON.stringify(out);
    assert.ok(!text.includes("secret"));
    assert.ok(!text.includes("weights"));
    assert.ok(!text.includes("abc"));
  });
});

describe("parseCaiPublicView: index 영역", () => {
  it("score 0은 보존되고 gaugeAngle(0)은 -90", () => {
    const out = parseCaiPublicView(validSnapshot({ index: validIndex({ score: 0 }) }));
    assert.equal(out.index.score, 0);
    assert.equal(gaugeAngle(out.index.score), -90);
  });

  it("score null은 null 유지, 0으로 변환 금지", () => {
    const out = parseCaiPublicView(validSnapshot({ index: validIndex({ score: null }) }));
    assert.equal(out.index.score, null);
    assert.equal(gaugeAngle(out.index.score), null);
  });

  it("score 101/-1/NaN은 index만 비우고 경고", () => {
    for (const score of [101, -1, Number.NaN]) {
      const out = parseCaiPublicView(validSnapshot({ index: validIndex({ score }) }));
      assert.equal(out.index.score, null);
      assert.ok(out.warnings.length > 0);
      // forecast 영역은 유지된다(부분 실패 격리).
      assert.deepEqual(out.forecast.probabilities, { up: 0.642, not_up: 0.358 });
    }
  });

  it("STALE 유효 index는 원래 observed_at을 유지", () => {
    const observed = "2026-09-09T00:35:00+00:00";
    const out = parseCaiPublicView(
      validSnapshot({ index: validIndex({ freshness: "STALE", observed_at: observed }) }),
    );
    assert.equal(out.index.freshness, "STALE");
    assert.equal(out.index.observed_at, observed);
  });

  it("존재하지 않는 날짜(2026-02-30)는 history를 비우고 경고", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        index: validIndex({
          history: [{ date: "2026-02-30", score: 10, definition_version: "wk-2026-W37" }],
        }),
      }),
    );
    assert.deepEqual(out.index.history, []);
    assert.ok(out.warnings.length > 0);
  });

  it("history 중간 null은 보존되고 보간되지 않음", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        index: validIndex({
          history: [
            { date: "2026-09-04", score: 60.0, definition_version: "wk-2026-W37" },
            { date: "2026-09-05", score: null, definition_version: "wk-2026-W37" },
            { date: "2026-09-11", score: 62.5, definition_version: "wk-2026-W37" },
          ],
        }),
      }),
    );
    assert.equal(out.index.history.length, 3);
    assert.equal(out.index.history[1].score, null);
  });

  it("다른 definition_version 항목은 선에서 제외", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        index: validIndex({
          history: [
            { date: "2026-09-04", score: 60.0, definition_version: "wk-2026-W36" },
            { date: "2026-09-11", score: 62.5, definition_version: "wk-2026-W37" },
          ],
        }),
      }),
    );
    assert.equal(out.index.history.length, 1);
    assert.equal(out.index.history[0].date, "2026-09-11");
  });

  it("DEMO 숫자 점수는 미게시 값으로 취급하고 DEMO를 유지", () => {
    const out = parseCaiPublicView(
      validSnapshot({ index: validIndex({ data_origin: "DEMO", score: 73.3 }) }),
    );
    assert.equal(out.index.score, null);
    assert.equal(out.index.data_origin, "DEMO");
  });
});

describe("parseCaiPublicView: forecast 영역", () => {
  it("정상 index + 미승인 forecast는 index 유지·확률 표시 없음", () => {
    const out = parseCaiPublicView(
      validSnapshot({ forecast: validForecast({ publication_approved: false }) }),
    );
    assert.equal(out.index.score, 62.5);
    assert.equal(displayedProbabilities(out.forecast), null);
  });

  it("메타·승인 유효 시 확률 반환, 표시 규칙은 64.2/35.8", () => {
    const out = parseCaiPublicView(validSnapshot());
    const shown = displayedProbabilities(out.forecast);
    assert.deepEqual(shown, { up: 0.642, not_up: 0.358 });
    // UI 표시 규칙(S2b 범위, 여기서는 계약 예시 고정용):
    // 상승% 소수 1자리 반올림, 하락·보합은 100에서 뺌.
    const upShown = Math.round(shown.up * 1000) / 10;
    assert.equal(upShown, 64.2);
    assert.equal(Math.round((100 - upShown) * 10) / 10, 35.8);
  });

  it("확률 합계 1.1은 표시 없음", () => {
    const out = parseCaiPublicView(
      validSnapshot({ forecast: validForecast({ probabilities: { up: 0.7, not_up: 0.4 } }) }),
    );
    assert.equal(displayedProbabilities(out.forecast), null);
  });

  it("시간대 누락·순서 오류는 표시 없음", () => {
    const cases = [
      // 시간대 없는 naive 시각.
      validForecast({ decision_cutoff: "2026-09-11 23:59:59" }),
      // 생성 시각이 대상 시작일 이후.
      validForecast({ generated_at: "2026-09-20T00:00:00+00:00" }),
      // 대상 시작일이 종료일보다 늦음.
      validForecast({
        target_start: "2026-09-20T00:00:00+00:00",
        target_end: "2026-09-18T00:00:00+00:00",
      }),
      // cutoff가 대상 시작일 이후.
      validForecast({ decision_cutoff: "2026-09-20T00:00:00+00:00" }),
    ];
    for (const forecast of cases) {
      const out = parseCaiPublicView(validSnapshot({ forecast }));
      assert.equal(displayedProbabilities(out.forecast), null);
    }
  });

  it("같은 시각의 다른 표기도 같은 기준으로 비교", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        forecast: validForecast({
          // 2026-09-11T23:59:59-05:00 == 2026-09-12T04:59:59Z
          decision_cutoff: "2026-09-12T04:59:59+00:00",
        }),
      }),
    );
    assert.deepEqual(displayedProbabilities(out.forecast), { up: 0.642, not_up: 0.358 });
  });
});

describe("gaugeAngle", () => {
  it("0→-90, 50→0, 100→90", () => {
    assert.equal(gaugeAngle(0), -90);
    assert.equal(gaugeAngle(50), 0);
    assert.equal(gaugeAngle(100), 90);
  });

  it("null·NaN·범위 밖·무한대는 null", () => {
    for (const v of [null, Number.NaN, 101, -1, Number.POSITIVE_INFINITY]) {
      assert.equal(gaugeAngle(v), null);
    }
  });
});

describe("validation 영역", () => {
  it("독립 검증 정보 누락 시 INDEPENDENT_TESTED로 게시하지 않음", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        validation: {
          status: "INDEPENDENT_TESTED",
          n: null,
          sample_start: null,
          sample_end: null,
          oos_exposure: "UNKNOWN",
          freeze_ref: null,
          review_ref: null,
          metrics: [],
        },
      }),
    );
    assert.notEqual(out.validation.status, "INDEPENDENT_TESTED");
    assert.ok(out.warnings.length > 0);
  });

  it("n·표본·UNSEEN·동결·검토가 있으면 INDEPENDENT_TESTED 유지", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        validation: {
          status: "INDEPENDENT_TESTED",
          n: 224,
          sample_start: "2024-01-01",
          sample_end: "2026-04-21",
          oos_exposure: "UNSEEN",
          freeze_ref: "freeze-001",
          review_ref: "review-001",
          metrics: [{ name: "brier", value: 0.24, benchmark: "constant", benchmark_value: 0.25 }],
        },
      }),
    );
    assert.equal(out.validation.status, "INDEPENDENT_TESTED");
  });
});

describe("emptyCaiView와 서버 리더", () => {
  it("emptyCaiView는 빈 상태 계약을 만족", () => {
    const out = emptyCaiView();
    assert.equal(out.index.index_id, "cushing-activity-index");
    assert.equal(out.index.data_origin, "NO_DATA");
    assert.equal(out.index.freshness, null);
    assert.equal(out.index.score, null);
    assert.equal(out.index.constituent_count, 0);
    assert.deepEqual(out.index.history, []);
    assert.deepEqual(out.constituents, []);
    assert.deepEqual(out.evidence, []);
    assert.equal(out.forecast.publication_approved, false);
    assert.equal(out.forecast.probabilities, null);
    assert.equal(out.validation.status, "NOT_RUN");
    assert.equal(out.validation.oos_exposure, "UNKNOWN");
  });

  it("빈 서버 리더에 임의 점수·확률·외부 호출이 없음", async () => {
    const out = await readCaiPublicView();
    assert.deepEqual(out, emptyCaiView());
    const text = JSON.stringify(out);
    assert.ok(!text.includes("73.3"));
    assert.ok(!text.includes("64.2"));
  });
});

describe("R1-F1: 실제 달력 날짜 검증", () => {
  it("존재하지 않는 날짜의 generated_at은 확률 null, index 유지", () => {
    const out = parseCaiPublicView(
      validSnapshot({ forecast: validForecast({ generated_at: "2026-02-30T01:00:00Z" }) }),
    );
    assert.equal(displayedProbabilities(out.forecast), null);
    assert.equal(out.index.score, 62.5);
  });

  it("존재하지 않는 날짜의 available_at은 score null + 경고", () => {
    const out = parseCaiPublicView(
      validSnapshot({ index: validIndex({ available_at: "2026-02-30T01:00:00Z" }) }),
    );
    assert.equal(out.index.score, null);
    assert.ok(out.warnings.length > 0);
  });

  it("정상 윤일 2024-02-29T01:00:00+09:00은 거부하지 않음", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        forecast: validForecast({
          generated_at: "2024-02-29T01:00:00+09:00",
          decision_cutoff: "2024-02-29T02:00:00+09:00",
          target_start: "2024-03-01T00:00:00+09:00",
          target_end: "2024-03-05T00:00:00+09:00",
        }),
      }),
    );
    assert.deepEqual(displayedProbabilities(out.forecast), { up: 0.642, not_up: 0.358 });
  });
});

describe("R1-F2: 근거 URL 공개 경계", () => {
  function withEvidence(evidence) {
    return validSnapshot({ evidence });
  }

  it("토큰 query URL은 제외되고 경고에 비밀 없음", () => {
    const out = parseCaiPublicView(
      withEvidence([
        {
          id: "e1",
          title: "t",
          url: "https://data.example.org/file?token=REVIEW_TEST_SECRET",
          access: "public",
        },
      ]),
    );
    assert.deepEqual(out.evidence, []);
    assert.ok(out.warnings.length > 0);
    assert.ok(!JSON.stringify(out.warnings).includes("REVIEW_TEST_SECRET"));
  });

  it("userinfo 포함 URL은 제외", () => {
    const out = parseCaiPublicView(
      withEvidence([
        {
          id: "e2",
          title: "t",
          url: "https://user:REVIEW_TEST_SECRET@data.example.org/file",
          access: "public",
        },
      ]),
    );
    assert.deepEqual(out.evidence, []);
    assert.ok(!JSON.stringify(out.warnings).includes("REVIEW_TEST_SECRET"));
  });

  it("scheme-relative 주소는 제외", () => {
    const out = parseCaiPublicView(
      withEvidence([{ id: "e3", title: "t", url: "//outside.example.org/file", access: "public" }]),
    );
    assert.deepEqual(out.evidence, []);
    assert.ok(out.warnings.length > 0);
  });

  it("앞 공백 위장 scheme은 제외", () => {
    const out = parseCaiPublicView(
      withEvidence([{ id: "e4", title: "t", url: " javascript:alert(1)", access: "public" }]),
    );
    assert.deepEqual(out.evidence, []);
    assert.ok(!JSON.stringify(out).includes("alert(1)"));
  });

  it("team_only 내부 주소는 url null로, 제목·접근 유지", () => {
    const out = parseCaiPublicView(
      withEvidence([
        {
          id: "e5",
          title: "internal report",
          url: "https://internal.example.org/private/report",
          access: "team_only",
        },
      ]),
    );
    assert.equal(out.evidence.length, 1);
    assert.equal(out.evidence[0].url, null);
    assert.equal(out.evidence[0].title, "internal report");
    assert.equal(out.evidence[0].access, "team_only");
    assert.ok(!JSON.stringify(out).includes("internal.example.org"));
  });

  it("정상 로컬 링크 유지 (대조)", () => {
    const out = parseCaiPublicView(
      withEvidence([{ id: "e6", title: "t", url: "/research#e1", access: "public" }]),
    );
    assert.equal(out.evidence.length, 1);
    assert.equal(out.evidence[0].url, "/research#e1");
  });

  it("정상 원출처 query 유지 (대조)", () => {
    const url = "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=SERIES&f=W";
    const out = parseCaiPublicView(
      withEvidence([{ id: "e7", title: "t", url, access: "public" }]),
    );
    assert.equal(out.evidence.length, 1);
    assert.equal(out.evidence[0].url, url);
  });
});

describe("R1-F3: DEMO 이전값·추이 비게시", () => {
  it("DEMO score/previous/history 숫자는 남지 않고 DEMO 유지", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        index: validIndex({
          data_origin: "DEMO",
          score: 50,
          previous_score: 40,
          history: [
            { date: "2026-09-04", score: 40, definition_version: "wk-2026-W37" },
            { date: "2026-09-11", score: 50, definition_version: "wk-2026-W37" },
          ],
        }),
      }),
    );
    assert.equal(out.index.data_origin, "DEMO");
    assert.equal(out.index.score, null);
    assert.equal(out.index.previous_score, null);
    assert.deepEqual(out.index.history, []);
  });

  it("정상 OBSERVED 이전값·추이는 보존 (대조)", () => {
    const out = parseCaiPublicView(validSnapshot());
    assert.equal(out.index.previous_score, 60.0);
    assert.equal(out.index.history.length, 2);
    assert.equal(out.index.history[0].score, 60.0);
  });
});

describe("R1-F4: 표본 기간·공백 필수값", () => {
  function independentOverrides(overrides) {
    return {
      status: "INDEPENDENT_TESTED",
      n: 224,
      sample_start: "2024-01-01",
      sample_end: "2026-04-21",
      oos_exposure: "UNSEEN",
      freeze_ref: "freeze-001",
      review_ref: "review-001",
      metrics: [],
      ...overrides,
    };
  }

  it("표본 시작일이 종료일보다 늦으면 INDEPENDENT 아님", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        validation: independentOverrides({ sample_start: "2025-12-31", sample_end: "2024-01-01" }),
      }),
    );
    assert.notEqual(out.validation.status, "INDEPENDENT_TESTED");
    assert.ok(out.warnings.length > 0);
  });

  it("공백 freeze/review 참조면 INDEPENDENT 아님", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        validation: independentOverrides({ freeze_ref: " ", review_ref: "\t" }),
      }),
    );
    assert.notEqual(out.validation.status, "INDEPENDENT_TESTED");
  });

  it("공백 모델 식별자면 확률 null", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        forecast: validForecast({ model_id: " ", trained_run_id: "\t", target_definition: " " }),
      }),
    );
    assert.equal(displayedProbabilities(out.forecast), null);
  });
});

describe("R2-F3: DEMO 비공개는 score 상태와 독립", () => {
  const demoHistory = [
    { date: "2026-09-04", score: 40, definition_version: "wk-2026-W37" },
    { date: "2026-09-11", score: 50, definition_version: "wk-2026-W37" },
  ];

  function demoSnapshot(index) {
    return validSnapshot({
      index: validIndex({ data_origin: "DEMO", previous_score: 40, history: demoHistory, ...index }),
    });
  }

  function assertUnpublished(index) {
    const out = parseCaiPublicView(demoSnapshot(index));
    assert.equal(out.index.data_origin, "DEMO");
    assert.equal(out.index.score, null);
    assert.equal(out.index.previous_score, null);
    assert.deepEqual(out.index.history, []);
  }

  it("DEMO + score null이어도 previous 40이 남지 않음", () => {
    assertUnpublished({ score: null });
  });

  it("DEMO + score 필드 삭제여도 previous 40이 남지 않음", () => {
    const { score: _omitted, ...withoutScore } = validIndex({ data_origin: "DEMO", previous_score: 40, history: demoHistory });
    const out = parseCaiPublicView(validSnapshot({ index: withoutScore }));
    assert.equal(out.index.data_origin, "DEMO");
    assert.equal(out.index.score, null);
    assert.equal(out.index.previous_score, null);
    assert.deepEqual(out.index.history, []);
  });

  it("DEMO + score 101이어도 previous 40이 남지 않음", () => {
    assertUnpublished({ score: 101 });
  });

  it("DEMO + score NaN이어도 previous 40이 남지 않음", () => {
    assertUnpublished({ score: Number.NaN });
  });

  it("DEMO 점수 0·50·100 모두 동일하게 비워짐", () => {
    for (const score of [0, 50, 100]) {
      assertUnpublished({ score });
    }
  });

  it("DEMO index 처리 후에도 정상 forecast 확률은 유지", () => {
    const out = parseCaiPublicView(demoSnapshot({ score: 50 }));
    assert.deepEqual(displayedProbabilities(out.forecast), { up: 0.642, not_up: 0.358 });
  });

  it("정상 OBSERVED 이전값·추이와 history 중간 null은 보존 (대조)", () => {
    const observed = parseCaiPublicView(validSnapshot());
    assert.equal(observed.index.previous_score, 60.0);
    assert.equal(observed.index.history.length, 2);
    const withNull = parseCaiPublicView(
      validSnapshot({
        index: validIndex({
          history: [
            { date: "2026-09-04", score: 60.0, definition_version: "wk-2026-W37" },
            { date: "2026-09-05", score: null, definition_version: "wk-2026-W37" },
            { date: "2026-09-11", score: 62.5, definition_version: "wk-2026-W37" },
          ],
        }),
      }),
    );
    assert.equal(withNull.index.history[1].score, null);
    assert.equal(withNull.index.history.length, 3);
  });
});

describe("R2-F2: URL 구조·인증정보 일관 검사", () => {
  const cases = [
    ["TAB 위장 scheme", "java\t" + "script:alert(1)"],
    ["LF 위장 scheme", "java\n" + "script:alert(1)"],
    ["역슬래시 두 개 scheme-relative", "\\".repeat(2) + "outside.example.org/file"],
    ["X-Amz 서명 query", "https://data.example.org/file?X-Amz-Signature=R06_DUMMY_SIGNATURE"],
    ["X-Goog 서명 query", "https://data.example.org/file?X-Goog-Signature=R06_DUMMY_SIGNATURE"],
    ["fragment 인증값", "https://data.example.org/report#access_token=R06_DUMMY_SIGNATURE"],
  ];

  for (const [label, url] of cases) {
    it(`${label}는 공개되지 않고 원문이 경고에 남지 않음`, () => {
      const out = parseCaiPublicView(
        validSnapshot({ evidence: [{ id: "review", title: "safe label", access: "public", url }] }),
      );
      const serialized = JSON.stringify(out);
      assert.equal(out.evidence.length, 0);
      assert.ok(!serialized.includes("R06_DUMMY_SIGNATURE"));
      assert.ok(!serialized.includes("alert(1)"));
      assert.ok(!serialized.includes("outside.example.org"));
      assert.ok(!JSON.stringify(out.warnings).includes("R06_DUMMY_SIGNATURE"));
      // 정상 index·forecast는 유지된다.
      assert.equal(out.index.score, 62.5);
      assert.deepEqual(displayedProbabilities(out.forecast), { up: 0.642, not_up: 0.358 });
    });
  }

  it("team_only 내부 주소 비공개 처리는 유지 (대조)", () => {
    const out = parseCaiPublicView(
      validSnapshot({
        evidence: [
          {
            id: "e5",
            title: "internal report",
            url: "https://internal.example.org/private/report",
            access: "team_only",
          },
        ],
      }),
    );
    assert.equal(out.evidence.length, 1);
    assert.equal(out.evidence[0].url, null);
    assert.equal(out.evidence[0].access, "team_only");
  });
});
