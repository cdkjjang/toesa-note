// 구직급여(실업급여) 계산
//
// 근거: 고용보험법 제45조~제50조, 같은 법 별표1(구직급여의 소정급여일수),
//       고용노동부 고시(구직급여일액 상한액), 최저임금법
//
// [계산 순서]
//   ① 평균임금(1일) = 이직 전 3개월 임금총액 ÷ 그 기간의 총일수
//   ② 기초일액       = min(평균임금, 임금일액 상한)
//   ③ 구직급여일액   = 기초일액 × 60%   → 상한·하한으로 자름
//   ④ 소정급여일수   = 별표1에서 (연령, 피보험기간)으로 조회
//   ⑤ 예상 총액      = ③ × ④
//
// [2026년의 특이한 점 — 이 노트가 설명해야 할 핵심]
//   상한액이 7년 만에 66,000 → 68,100원으로 올랐는데, 하한액도 최저임금
//   인상에 따라 66,048원이 됐다. 둘의 간격이 **2,052원밖에 안 된다.**
//   지급률 60%를 역산하면
//     · 기초일액 110,080원 이하 → 무조건 하한 66,048원
//     · 기초일액 113,500원 이상 → 무조건 상한 68,100원
//   즉 월급 약 335만원 미만이면 급여가 얼마든 결과가 같다. "60%를 받는다"는
//   설명이 실제로 들어맞는 사람은 극히 일부다. 계산 결과에 어느 쪽이
//   적용됐는지(`bound`)를 반드시 표시해 이 사실이 드러나게 한다.
//
// ⚠️ 갱신 대상
//   · 매년 1월: 최저임금이 바뀌면 하한액이 따라 바뀐다 (최저임금 × 80% × 8시간)
//   · 상한액·임금일액 상한: 고용노동부 고시. 2019~2025년 66,000원으로 동결됐다가
//     2026년 인상됐다. 동결이 길어 무심코 지나치기 쉬우니 연초에 확인할 것.
//   · 값을 고치면 `jobseeker.test.ts`의 고시값 고정 테스트가 먼저 깨진다.

/** 지급률 — 이직 전 평균임금의 60% (고용보험법 제46조) */
export const BENEFIT_RATE = 0.6;

/** 연도별 고시값. 키는 "이직일이 속한 연도" 기준으로 적용된다. */
export interface YearlyLimits {
  /** 구직급여일액 상한 (원/일) */
  dailyMax: number;
  /** 임금일액(기초일액) 상한 (원/일) */
  wageDailyMax: number;
  /** 구직급여일액 하한 (원/일) = 최저임금 × 80% × 8시간 */
  dailyMin: number;
  /** 하한액 산출에 쓰인 최저시급 (원) — 화면에 근거로 보여준다 */
  minWage: number;
}

/**
 * 이직 연도별 고시값.
 *
 * 상한액은 **이직일 기준**으로 적용된다. 2025년 12월에 퇴사하고 2026년 1월에
 * 신청해도 상한은 66,000원이다. 사람들이 가장 많이 헷갈리는 지점이라
 * 계산기에서 신청일이 아니라 이직일을 묻는다.
 */
export const LIMITS_BY_YEAR: Record<number, YearlyLimits> = {
  2025: { dailyMax: 66_000, wageDailyMax: 110_000, dailyMin: 64_192, minWage: 10_030 },
  2026: { dailyMax: 68_100, wageDailyMax: 113_500, dailyMin: 66_048, minWage: 10_320 },
};

/**
 * 표에 값이 있는 이직 연도 (오름차순).
 * 화면의 연도 선택지는 이 배열에서 만든다 — 하드코딩하면 새 연도가 와도
 * 사용자가 자기 연도를 고를 수 없는데 화면은 옛 연도를 기준이라고 표시하게 된다.
 */
export const AVAILABLE_YEARS = Object.keys(LIMITS_BY_YEAR)
  .map(Number)
  .sort((a, b) => a - b);

/** 표에 없는 연도는 가장 최근 값으로 갈음한다. */
export const LATEST_YEAR = AVAILABLE_YEARS.at(-1) ?? 2026;

export function limitsForYear(year: number): YearlyLimits {
  return LIMITS_BY_YEAR[year] ?? LIMITS_BY_YEAR[LATEST_YEAR];
}

/**
 * 해당 연도의 고시값이 표에 있는지. false면 LATEST_YEAR 값으로 갈음해 계산하므로
 * 화면에서 "아직 고시가 반영되지 않았다"고 밝혀야 한다.
 */
export function hasLimitsForYear(year: number): boolean {
  return LIMITS_BY_YEAR[year] !== undefined;
}

/** 오늘(또는 주어진 시점) 기준으로 기본 선택할 이직 연도 — 표 범위를 넘지 않게 자른다. */
export function defaultLeaveYear(base: Date = new Date()): number {
  const y = base.getFullYear();
  if (hasLimitsForYear(y)) return y;
  return y > LATEST_YEAR ? LATEST_YEAR : (AVAILABLE_YEARS[0] ?? LATEST_YEAR);
}

/** 하한액 산식 — 최저임금의 80% × 1일 소정근로 8시간 */
export function dailyMinFromMinWage(minWage: number): number {
  return Math.round(minWage * 0.8 * 8);
}

/** 피보험기간 구간 (고용보험법 별표1) */
export type InsuredBracket = "under1" | "y1to3" | "y3to5" | "y5to10" | "over10";

export const INSURED_BRACKETS: { key: InsuredBracket; label: string }[] = [
  { key: "under1", label: "1년 미만" },
  { key: "y1to3", label: "1년 이상 3년 미만" },
  { key: "y3to5", label: "3년 이상 5년 미만" },
  { key: "y5to10", label: "5년 이상 10년 미만" },
  { key: "over10", label: "10년 이상" },
];

/**
 * 소정급여일수 (고용보험법 별표1, 2019. 8. 27. 개정)
 *
 * 50세 이상과 장애인은 같은 줄을 쓴다. 나이는 **이직일 당시** 기준이다.
 */
export const BENEFIT_DAYS: Record<"under50" | "over50", Record<InsuredBracket, number>> = {
  under50: { under1: 120, y1to3: 150, y3to5: 180, y5to10: 210, over10: 240 },
  over50: { under1: 120, y1to3: 180, y3to5: 210, y5to10: 240, over10: 270 },
};

/** 대기기간 — 수급자격 인정일부터 7일은 지급되지 않는다 (법 제49조) */
export const WAITING_DAYS = 7;

/** 수급기간 — 이직일 다음날부터 12개월. 이 기간이 지나면 남은 일수가 있어도 끝난다. */
export const CLAIM_PERIOD_MONTHS = 12;

export interface JobseekerInput {
  /** 이직 전 3개월 세전 월평균 급여 (원) */
  monthlyWage: number;
  /** 이직 전 3개월의 총일수 (일). 달에 따라 89~92일 */
  totalDays: number;
  /** 이직일 당시 만 나이 */
  age: number;
  /** 장애인 여부 — 50세 이상과 동일한 일수표를 쓴다 */
  disabled: boolean;
  /** 고용보험 피보험기간 구간 */
  insured: InsuredBracket;
  /** 이직일이 속한 연도 — 상한액이 이 연도 기준으로 정해진다 */
  leaveYear: number;
}

/** 일액이 어느 경계에 걸렸는지 */
export type Bound = "min" | "max" | "none";

export interface JobseekerResult {
  /** 1일 평균임금 (원) */
  averageWage: number;
  /** 기초일액 — 평균임금에 임금일액 상한을 씌운 값 (원) */
  baseDaily: number;
  /** 상·하한 적용 전의 60% 금액 (원) */
  rawDaily: number;
  /** 구직급여일액 (원) */
  dailyBenefit: number;
  /** 상한·하한 중 어디에 걸렸는지 */
  bound: Bound;
  /** 소정급여일수 (일) */
  benefitDays: number;
  /** 예상 총 수령액 (원) */
  total: number;
  /** 월 환산액 (30일 기준, 원) — 체감용 */
  monthlyEquivalent: number;
  /** 적용된 고시값 */
  limits: YearlyLimits;
  /** 임금일액 상한에 잘렸는지 */
  wageCapped: boolean;
}

export function calcJobseeker(input: JobseekerInput): JobseekerResult {
  const limits = limitsForYear(input.leaveYear);

  const totalDays = Math.max(1, Math.round(input.totalDays));
  // 3개월 임금총액 ÷ 총일수. 월급제는 월평균 × 3이 곧 3개월 임금총액이다.
  const averageWage = Math.floor((Math.max(0, input.monthlyWage) * 3) / totalDays);

  const wageCapped = averageWage > limits.wageDailyMax;
  const baseDaily = Math.min(averageWage, limits.wageDailyMax);

  const rawDaily = Math.floor(baseDaily * BENEFIT_RATE);

  let dailyBenefit = rawDaily;
  let bound: Bound = "none";
  if (rawDaily < limits.dailyMin) {
    dailyBenefit = limits.dailyMin;
    bound = "min";
  } else if (rawDaily > limits.dailyMax) {
    dailyBenefit = limits.dailyMax;
    bound = "max";
  }

  const row = input.age >= 50 || input.disabled ? "over50" : "under50";
  const benefitDays = BENEFIT_DAYS[row][input.insured];

  return {
    averageWage,
    baseDaily,
    rawDaily,
    dailyBenefit,
    bound,
    benefitDays,
    total: dailyBenefit * benefitDays,
    monthlyEquivalent: dailyBenefit * 30,
    limits,
    wageCapped,
  };
}

/**
 * 상·하한에 걸리지 않고 실제로 60%가 적용되는 월급 구간을 돌려준다.
 * "내 월급이면 어차피 하한액"이라는 사실을 화면에서 보여주기 위한 것.
 *
 * 총일수 91일을 기준으로 환산한 월급이다.
 */
export function rateAppliesWageRange(
  year: number,
  totalDays = 91
): { fromMonthly: number; toMonthly: number } {
  const l = limitsForYear(year);
  // 일액 하한에 대응하는 기초일액 = 하한 ÷ 60%
  const fromDaily = l.dailyMin / BENEFIT_RATE;
  const toDaily = l.wageDailyMax;
  return {
    fromMonthly: Math.round((fromDaily * totalDays) / 3),
    toMonthly: Math.round((toDaily * totalDays) / 3),
  };
}
