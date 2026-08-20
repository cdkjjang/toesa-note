// 실업급여 수급자격 판정 + 신청 기한
//
// 근거: 고용보험법 제40조(구직급여의 수급 요건), 제43조, 제48조(수급기간),
//       제49조(대기기간), 같은 법 시행규칙 별표2(정당한 이직 사유)
//
// [네 가지를 모두 만족해야 한다]
//   ① 피보험단위기간: 이직 전 18개월 동안 통산 180일 이상
//   ② 이직 사유: 비자발적일 것 (자발적 퇴사는 원칙적으로 안 되고, 예외가 있다)
//   ③ 근로의 의사와 능력이 있는데 취업하지 못한 상태일 것
//   ④ 재취업을 위해 적극적으로 노력할 것
//
// [사람들이 가장 많이 놓치는 것 — 수급기간 12개월]
//   소정급여일수(120~270일)와 수급기간(12개월)은 다른 것이다.
//   수급기간은 **이직일 다음날부터 12개월**이고, 이 날짜가 지나면 소정급여일수가
//   남아 있어도 지급이 끊긴다. 즉 "천천히 신청해도 어차피 다 받는다"가 아니다.
//   퇴직 후 5개월쯤 지나 신청하면 270일짜리 자격이어도 실제로는 7개월분밖에
//   못 받는다. 이 계산기가 D-day를 보여주는 이유가 이것이다.
//
// ⚠️ 이 판정은 참고용이다. 최종 판단은 고용센터가 한다. 특히 이직 사유는
//   이직확인서에 적힌 상실코드로 결정되며, 본인 생각과 다른 경우가 많다.

/** 피보험단위기간 요건 — 이직 전 18개월간 통산 180일 */
export const REQUIRED_INSURED_DAYS = 180;
export const LOOKBACK_MONTHS = 18;

/** 수급기간 — 이직일 다음날부터 12개월 (법 제48조) */
export const CLAIM_PERIOD_MONTHS = 12;

/** 대기기간 — 수급자격 인정일부터 7일은 지급 제외 (법 제49조) */
export const WAITING_DAYS = 7;

/** 이직 사유 구분 */
export type LeaveReason =
  | "layoff"        // 권고사직·경영상 해고
  | "contractEnd"   // 계약기간 만료·정년
  | "voluntary"     // 자발적 퇴사
  | "justCause"     // 자발적이지만 정당한 사유가 있는 경우
  | "misconduct";   // 중대한 귀책사유로 인한 해고

export const LEAVE_REASONS: { key: LeaveReason; label: string; hint: string }[] = [
  {
    key: "layoff",
    label: "권고사직·경영상 해고",
    hint: "회사가 나가라고 한 경우. 가장 명확한 수급 사유입니다.",
  },
  {
    key: "contractEnd",
    label: "계약만료·정년",
    hint: "재계약을 원했는데 회사가 거절한 경우 수급 대상입니다.",
  },
  {
    key: "justCause",
    label: "자발적이지만 사유가 있음",
    hint: "임금체불·괴롭힘·통근 3시간 이상·질병 등 시행규칙 별표2의 사유.",
  },
  {
    key: "voluntary",
    label: "개인 사정으로 자진 퇴사",
    hint: "이직·창업·단순 불만 등. 원칙적으로 받을 수 없습니다.",
  },
  {
    key: "misconduct",
    label: "중대한 귀책사유로 해고",
    hint: "형법 위반·금품 횡령·장기 무단결근 등. 수급 자격이 제한됩니다.",
  },
];

export interface EligibilityInput {
  /** 이직 전 18개월간 피보험단위기간 (일) */
  insuredDays: number;
  /** 이직 사유 */
  reason: LeaveReason;
  /** 근로의 의사와 능력이 있는지 */
  ableToWork: boolean;
  /** 이직일 (YYYY-MM-DD) */
  leaveDate: string;
  /** 오늘 날짜 (YYYY-MM-DD). 테스트를 위해 주입받는다. */
  today: string;
}

export type CheckStatus = "pass" | "fail" | "warn";

export interface Check {
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface EligibilityResult {
  /** 네 가지 요건 판정 결과 */
  checks: Check[];
  /** 전체 판정 — 하나라도 fail이면 false */
  eligible: boolean;
  /** 경고가 있는지 (조건부 가능) */
  hasWarning: boolean;
  /** 수급기간 만료일 (YYYY-MM-DD) — 이직일 다음날 + 12개월 */
  expiryDate: string;
  /** 만료까지 남은 일수. 이미 지났으면 음수 */
  daysLeft: number;
  /** 이직일부터 오늘까지 지난 일수 */
  daysSinceLeave: number;
  /** 이미 수급기간이 지났는지 */
  expired: boolean;
}

/** YYYY-MM-DD → UTC 자정 기준 Date. 시간대 때문에 하루 어긋나는 것을 막는다. */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addMonths(d: Date, months: number): Date {
  const r = new Date(d.getTime());
  const targetMonth = r.getUTCMonth() + months;
  const day = r.getUTCDate();
  r.setUTCDate(1);
  r.setUTCMonth(targetMonth);
  // 1/31 + 1개월 같은 경우 말일로 맞춘다
  const lastDay = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
  r.setUTCDate(Math.min(day, lastDay));
  return r;
}

export function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function calcEligibility(input: EligibilityInput): EligibilityResult {
  const leave = parseDate(input.leaveDate);
  const today = parseDate(input.today);

  // 수급기간은 이직일 다음날부터 12개월
  const start = new Date(leave.getTime() + 86_400_000);
  const expiry = addMonths(start, CLAIM_PERIOD_MONTHS);
  const daysLeft = diffDays(today, expiry);
  const daysSinceLeave = diffDays(leave, today);
  const expired = daysLeft < 0;

  const checks: Check[] = [];

  // ① 피보험단위기간
  const days = Math.max(0, Math.floor(input.insuredDays));
  checks.push({
    label: "피보험단위기간 180일 이상",
    status: days >= REQUIRED_INSURED_DAYS ? "pass" : "fail",
    detail:
      days >= REQUIRED_INSURED_DAYS
        ? `${days}일 — 요건을 채웠습니다.`
        : `${days}일 — ${REQUIRED_INSURED_DAYS - days}일이 모자랍니다. 이전 직장 기간을 합산할 수 있는지 확인해 보세요.`,
  });

  // ② 이직 사유
  const reasonCheck: Record<LeaveReason, { status: CheckStatus; detail: string }> = {
    layoff: { status: "pass", detail: "비자발적 이직으로 수급 사유에 해당합니다." },
    contractEnd: {
      status: "pass",
      detail: "계약만료는 수급 사유입니다. 다만 회사가 재계약을 제안했는데 거절했다면 자발적 퇴사로 처리될 수 있습니다.",
    },
    justCause: {
      status: "warn",
      detail: "정당한 사유로 인정되면 받을 수 있습니다. 임금체불 내역·진단서·녹취 등 증빙을 준비해 고용센터에 상담하세요.",
    },
    voluntary: {
      status: "fail",
      detail: "자진 퇴사는 원칙적으로 수급할 수 없습니다. 다만 사유에 따라 예외가 있으니 위 항목을 다시 확인해 보세요.",
    },
    misconduct: {
      status: "fail",
      detail: "중대한 귀책사유로 인한 해고는 수급 자격이 제한됩니다.",
    },
  };
  checks.push({ label: "이직 사유", ...reasonCheck[input.reason] });

  // ③ 근로의 의사와 능력
  checks.push({
    label: "근로의 의사와 능력",
    status: input.ableToWork ? "pass" : "fail",
    detail: input.ableToWork
      ? "즉시 일할 수 있는 상태여야 합니다."
      : "질병·부상·육아 등으로 당장 일할 수 없다면 수급기간 연기 신청(최대 4년)을 먼저 하세요.",
  });

  // ④ 수급기간
  checks.push({
    label: "수급기간 12개월 이내",
    status: expired ? "fail" : daysLeft < 90 ? "warn" : "pass",
    detail: expired
      ? `수급기간이 ${-daysLeft}일 전에 끝났습니다. 남은 일수가 있어도 지급되지 않습니다.`
      : daysLeft < 90
        ? `만료까지 ${daysLeft}일 남았습니다. 늦게 신청할수록 못 받고 끝나는 날이 늘어납니다.`
        : `만료까지 ${daysLeft}일 남았습니다.`,
  });

  return {
    checks,
    eligible: checks.every((c) => c.status !== "fail"),
    hasWarning: checks.some((c) => c.status === "warn"),
    expiryDate: formatDate(expiry),
    daysLeft,
    daysSinceLeave,
    expired,
  };
}

/**
 * 늦게 신청해서 못 받게 되는 일수.
 *
 * 수급기간 만료일까지 남은 날이 소정급여일수보다 적으면 그 차이만큼 날아간다.
 * "언제까지 신청해야 다 받나"를 뒤집어 계산한 것.
 */
export function forfeitedDays(daysLeft: number, benefitDays: number): number {
  if (daysLeft >= benefitDays) return 0;
  return benefitDays - Math.max(0, daysLeft);
}

/** 소정급여일수를 다 받으려면 늦어도 이 날까지는 신청해야 한다. */
export function lastSafeApplyDate(leaveDate: string, benefitDays: number): string {
  const start = new Date(parseDate(leaveDate).getTime() + 86_400_000);
  const expiry = addMonths(start, CLAIM_PERIOD_MONTHS);
  // 대기기간 7일 + 소정급여일수를 만료일 안에 소화해야 한다
  const deadline = new Date(expiry.getTime() - (benefitDays + WAITING_DAYS) * 86_400_000);
  return formatDate(deadline);
}
