import assert from "node:assert/strict";
import { test } from "node:test";
import { wtiPriceFraction, wtiPriceTicks } from "../app/lib/wti-chart-axis.ts";

// 테스트 전용 가격이며 연구·운영 데이터가 아니다.
test("WTI ticks preserve negative prices, deduplicate rounded/flat prices and retain the candle scale", () => {
  assert.deepEqual(wtiPriceTicks(-40, 80).map(tick => tick.label), ["-40.00", "20.00", "80.00"]);
  assert.deepEqual(wtiPriceTicks(70, 70), [{ value: 70, label: "70.00" }]);
  assert.equal(wtiPriceTicks(70, 70.004).length, 1);
  assert.equal(wtiPriceFraction(70, 70, 70), .5);
  for (const [low, high] of [[-40, 80], [70, 70], [0, 0], [70, 70.004]]) {
    const margin = Math.max((high - low) * .06, .05);
    for (const { value } of wtiPriceTicks(low, high)) {
      const fraction = wtiPriceFraction(value, low, high);
      assert.ok(Number.isFinite(fraction) && fraction > 0 && fraction < 1);
      assert.equal(320 - 24 - fraction * 272,
        320 - 24 - (value - low + margin) / (high - low + margin * 2) * 272);
    }
  }
});
