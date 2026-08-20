// 조기재취업수당 계산
//
// 근거: 고용보험법 제64조(조기재취업 수당), 같은 법 시행령 제84조
//
// [무엇인가]
//   실업급여를 받다가 일찍 재취업하면, 못 받고 남은 구직급여의 절반을 준다.
//   "빨리 취업하면 손해"라는 생각을 막으려고 만든 제도다.
//
// [요건 — 하나라도 빠지면 못 받는다]
//   ① 재취업일 전날 기준으로 소정급여일수를 **1/2 이상** 남기고 재취업
//   ② 실업 신고일부터 **14일이 지난 뒤** 재취업했을 것
//   ③ 재취업한 곳에서 **12개월 이상 계속 고용**될 것
//      (또는 자영업을 12개월 이상 계속 영위)
//   ④ 재취업일 이전 **2년 이내에 조기재취업수당을 받은 적이 없을 것**
//   ⑤ 이직 전 사업주에게 다시 고용된 것이 아닐 것
//
// [금액]
//   구직급여일액 × 남은 소정급여일수 × 1/2
//
// [신청 시점 — 여기서 많이 놓친다]
//   재취업한 날 바로 신청하는 게 아니다. **12개월을 채운 다음에** 신청한다.
//   재취업일로부터 12개월이 지난 날의 다음날부터 3년 이내에 청구해야 한다.
//   그래서 재취업하고 잊고 지내다 못 받는 사람이 많다.

/** 남겨야 하는 소정급여일수 비율 */
export const REQUIRED_REMAINING_RATIO = 0.5;

/** 지급 비율 — 남은 일수의 절반 */
export const PAYOUT_RATIO = 0.5;

/** 실업 신고일부터 이 일수가 지난 뒤 재취업해야 한다 */
export const MIN_DAYS_AFTER_REPORT = 14;

/** 재취업 후 이 개월 수 이상 계속 고용돼야 한다 */
export const REQUIRED_EMPLOYMENT_MONTHS = 12;

/** 65세 이상은 6개월로 완화된다 */
export const REQUIRED_EMPLOYMENT_MONTHS_SENIOR = 6;

/** 직전 수급 이력 제한 기간 (년) */
export const PRIOR_CLAIM_BLOCK_YEARS = 2;

export interface EarlyReemploymentInput {
  /** 구직급여일액 (원) */
  dailyBenefit: number;
  /** 소정급여일수 (일) */
  benefitDays: number;
  /** 이미 지급받은 일수 (일) */
  paidDays: number;
  /** 실업 신고일부터 재취업일까지 지난 일수 (일) */
  daysAfterReport: number;
  /** 재취업한 곳에서 12개월 이상 계속 일할 예정인지 */
  willStay12Months: boolean;
  /** 최근 2년 이내에 조기재취업수당을 받은 적이 있는지 */
  hadPriorClaim: boolean;
  /** 이직 전 사업주에게 다시 고용된 것인지 */
  sameEmployer: boolean;
  /** 이직일 당시 65세 이상인지 — 고용 기간 요건이 6개월로 완화 */
  senior: boolean;
}

export type ReqStatus = "pass" | "fail";

export interface Requirement {
  label: string;
  status: ReqStatus;
  detail: string;
}

export interface EarlyReemploymentResult {
  /** 남은 소정급여일수 (일) */
  remainingDays: number;
  /** 남은 비율 (0~1) */
  remainingRatio: number;
  /** 요건별 판정 */
  requirements: Requirement[];
  /** 모든 요건을 만족하는지 */
  qualified: boolean;
  /** 조기재취업수당 예상액 (원). 요건 미달이면 0 */
  amount: number;
  /** 요건을 다 채웠다고 가정했을 때의 금액 — 얼마를 놓치는지 보여준다 */
  potentialAmount: number;
  /** 그냥 실업급여를 끝까지 받았을 때의 잔여 수령액 (원) */
  ifKeptClaiming: number;
  /** 필요한 계속 고용 개월 수 */
  requiredMonths: number;
}

export function calcEarlyReemployment(
  input: EarlyReemploymentInput
): EarlyReemploymentResult {
  const benefitDays = Math.max(0, Math.floor(input.benefitDays));
  const paidDays = Math.min(Math.max(0, Math.floor(input.paidDays)), benefitDays);
  const remainingDays = benefitDays - paidDays;
  const remainingRatio = benefitDays > 0 ? remainingDays / benefitDays : 0;

  const requiredMonths = input.senior
    ? REQUIRED_EMPLOYMENT_MONTHS_SENIOR
    : REQUIRED_EMPLOYMENT_MONTHS;

  const requirements: Requirement[] = [
    {
      label: "소정급여일수를 1/2 이상 남김",
      status: remainingRatio >= REQUIRED_REMAINING_RATIO ? "pass" : "fail",
      detail:
        remainingRatio >= REQUIRED_REMAINING_RATIO
          ? `${benefitDays}일 중 ${remainingDays}일 남음 (${Math.round(remainingRatio * 100)}%)`
          : `${remainingDays}일 남음 (${Math.round(remainingRatio * 100)}%) — 절반인 ${Math.ceil(benefitDays / 2)}일에 미치지 못합니다.`,
    },
    {
      label: "실업 신고일부터 14일 경과 후 재취업",
      status: input.daysAfterReport >= MIN_DAYS_AFTER_REPORT ? "pass" : "fail",
      detail:
        input.daysAfterReport >= MIN_DAYS_AFTER_REPORT
          ? `신고일부터 ${input.daysAfterReport}일 뒤 재취업`
          : `${input.daysAfterReport}일 만에 재취업 — 14일이 지난 뒤여야 합니다.`,
    },
    {
      label: `${requiredMonths}개월 이상 계속 고용`,
      status: input.willStay12Months ? "pass" : "fail",
      detail: input.willStay12Months
        ? `${requiredMonths}개월을 채운 뒤에 신청합니다. 재취업 즉시 신청하는 것이 아닙니다.`
        : `${requiredMonths}개월을 채우지 못하면 지급되지 않습니다.`,
    },
    {
      label: "최근 2년 내 조기재취업수당 수급 이력 없음",
      status: input.hadPriorClaim ? "fail" : "pass",
      detail: input.hadPriorClaim
        ? "2년 이내에 받은 적이 있으면 다시 받을 수 없습니다."
        : "제한 사유가 없습니다.",
    },
    {
      label: "이직 전 사업주가 아닐 것",
      status: input.sameEmployer ? "fail" : "pass",
      detail: input.sameEmployer
        ? "퇴사한 회사에 다시 들어간 경우에는 지급되지 않습니다."
        : "새 사업주에게 고용됐습니다.",
    },
  ];

  const qualified = requirements.every((r) => r.status === "pass");
  const potentialAmount = Math.floor(
    input.dailyBenefit * remainingDays * PAYOUT_RATIO
  );

  return {
    remainingDays,
    remainingRatio,
    requirements,
    qualified,
    amount: qualified ? potentialAmount : 0,
    potentialAmount,
    ifKeptClaiming: input.dailyBenefit * remainingDays,
    requiredMonths,
  };
}

/**
 * 1/2 요건을 채우려면 늦어도 며칠째에 재취업해야 하는지.
 *
 * 소정급여일수 210일이면 105일치를 받기 전에 취업해야 한다는 뜻이다.
 */
export function latestPaidDaysForBonus(benefitDays: number): number {
  return Math.floor(benefitDays / 2);
}
