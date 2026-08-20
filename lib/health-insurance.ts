// 퇴사 후 건강보험 — 임의계속가입 보험료와 신청 기한
//
// 근거: 국민건강보험법 제110조(실업자에 대한 특례), 같은 법 시행령 제77조
//
// [퇴사하면 무슨 일이 벌어지나]
//   직장가입자 자격은 퇴사 다음날 사라진다. 그러면 둘 중 하나가 된다.
//     · 피부양자 — 배우자·부모 등의 직장보험에 얹힌다. 보험료 0원.
//     · 지역가입자 — 소득뿐 아니라 **재산과 자동차**에도 보험료가 붙는다.
//   문제는 지역가입자다. 회사 다닐 때는 사업주가 절반을 냈고 급여에만 부과됐는데,
//   지역가입자가 되면 집·차까지 계산에 들어가면서 보험료가 몇 배로 뛰는 일이 흔하다.
//   소득이 끊긴 시점에 보험료가 오르는 셈이라 "퇴직 후 건보료 폭탄"이라 불린다.
//
// [임의계속가입 — 최대 36개월 직장가입자 보험료로 버티기]
//   요건: 퇴직 직전 18개월 동안 직장가입자 자격이 통산 12개월 이상
//   보험료: 퇴직 전 **12개월 보수월액의 평균**을 기준으로 산정하되,
//           사업주 부담분 없이 **본인부담분(절반)만** 낸다.
//           결과적으로 회사 다닐 때 급여에서 빠져나가던 금액과 같아진다.
//   기간: 최대 36개월
//
// [신청 기한 — 놓치면 영구히 못 한다]
//   지역가입자 보험료의 **최초 납부기한으로부터 2개월 이내**에 신청해야 한다.
//   이 기한은 연장도 구제도 없다. 퇴사하고 정신없이 지내다 고지서를 한 번
//   흘려보내면 그대로 끝난다. 이 계산기가 D-day를 크게 보여주는 이유다.
//
// ⚠️ 지역가입자 보험료는 계산하지 않는다 (의도적)
//   지역가입자 보험료는 소득·재산·자동차를 점수로 환산하는 점수제이고,
//   점수표가 매년 바뀐다. 여기서 어설프게 추정하면 오히려 잘못된 판단을
//   부르므로, 임의계속 보험료만 정확히 내고 비교는 건보공단 모의계산으로
//   안내한다. 이 방침을 바꾸지 말 것.
//
// ⚠️ 갱신 대상: 건강보험료율·장기요양요율은 매년 초 보건복지부 고시.
//   급여노트(`salary-note/lib/insurance.ts`)와 **같은 값을 써야 한다.**
//   한쪽만 고치면 두 사이트가 다른 답을 낸다.

/** 건강보험료율 — 본인부담분 3.595% (총 7.19%의 절반), 2026년 */
export const HEALTH_RATE_EMPLOYEE = 0.03595;

/** 총 건강보험료율 (노사 합계) — 화면에 근거로 표시 */
export const HEALTH_RATE_TOTAL = 0.0719;

/** 장기요양보험료율 — 건강보험료 대비 13.14%, 2026년 */
export const LONG_TERM_CARE_RATE = 0.1314;

/** 임의계속가입 최대 기간 (개월) */
export const MAX_MONTHS = 36;

/** 요건 — 퇴직 직전 이 기간 동안 */
export const LOOKBACK_MONTHS = 18;

/** 직장가입자 자격이 통산 이 개월 수 이상이어야 한다 */
export const REQUIRED_ENROLLED_MONTHS = 12;

/** 신청 기한 — 최초 지역보험료 납부기한부터 (개월) */
export const APPLY_WINDOW_MONTHS = 2;

/** 10원 미만 절사 (부동소수점 오차 보정 포함) */
export function floor10(n: number): number {
  return Math.floor(n / 10 + 1e-6) * 10;
}

export interface HealthInput {
  /** 퇴직 전 12개월 보수월액 평균 (원) */
  averageMonthlyWage: number;
  /** 퇴직 직전 18개월 중 직장가입자였던 개월 수 */
  enrolledMonths: number;
  /** 피부양자로 들어갈 수 있는지 (배우자·부모의 직장보험) */
  canBeDependent: boolean;
}

export interface HealthResult {
  /** 월 건강보험료 (원) */
  health: number;
  /** 월 장기요양보험료 (원) */
  longTermCare: number;
  /** 월 합계 (원) */
  monthly: number;
  /** 36개월 최대 납부 총액 (원) */
  maxTotal: number;
  /** 임의계속가입 요건을 충족하는지 */
  qualified: boolean;
  /** 요건까지 모자란 개월 수 */
  monthsShort: number;
  /** 피부양자가 가능하면 그쪽이 먼저다 */
  dependentFirst: boolean;
}

export function calcHealthInsurance(input: HealthInput): HealthResult {
  const wage = Math.max(0, input.averageMonthlyWage);
  const health = floor10(wage * HEALTH_RATE_EMPLOYEE);
  const longTermCare = floor10(health * LONG_TERM_CARE_RATE);
  const monthly = health + longTermCare;

  const enrolled = Math.max(0, Math.floor(input.enrolledMonths));
  const qualified = enrolled >= REQUIRED_ENROLLED_MONTHS;

  return {
    health,
    longTermCare,
    monthly,
    maxTotal: monthly * MAX_MONTHS,
    qualified,
    monthsShort: qualified ? 0 : REQUIRED_ENROLLED_MONTHS - enrolled,
    dependentFirst: input.canBeDependent,
  };
}

/**
 * 임의계속가입 신청 마감일.
 *
 * 지역가입자 최초 고지서의 납부기한으로부터 2개월. 납부기한을 모르면
 * 퇴사 다음 달 말일쯤으로 잡히는 것이 보통이라, 화면에서는 사용자가
 * 고지서에 적힌 날짜를 직접 넣게 한다.
 */
export function applyDeadline(firstBillDueDate: string): string {
  const [y, m, d] = firstBillDueDate.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  const target = new Date(base.getTime());
  const month = target.getUTCMonth() + APPLY_WINDOW_MONTHS;
  target.setUTCDate(1);
  target.setUTCMonth(month);
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));

  const yy = target.getUTCFullYear();
  const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(target.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** 마감일까지 남은 일수. 지났으면 음수. */
export function daysUntil(deadline: string, today: string): number {
  const p = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((p(deadline) - p(today)) / 86_400_000);
}
