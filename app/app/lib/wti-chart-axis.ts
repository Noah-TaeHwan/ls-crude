/** @param value 가격. @param low 최저가. @param high 최고가. @returns 여백을 포함한 가격축의 아래부터 위까지 비율. */
export function wtiPriceFraction(value: number, low: number, high: number): number {
  const margin = Math.max((high - low) * .06, .05);
  return (value - low + margin) / (high - low + margin * 2);
}

/** @param low 최저가. @param high 최고가. @returns 소수점 두 자리 표시가 겹치지 않는 최저·중간·최고 눈금. */
export function wtiPriceTicks(low: number, high: number): { value: number; label: string }[] {
  const labels = new Set<string>();
  return [low, (high + low) / 2, high].flatMap(value => {
    const label = value.toFixed(2);
    if (labels.has(label)) return [];
    labels.add(label);
    return [{ value, label }];
  });
}
