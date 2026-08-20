import { describe, expect, it } from "vitest";
import {
  MIN_DAYS_AFTER_REPORT,
  PAYOUT_RATIO,
  REQUIRED_EMPLOYMENT_MONTHS,
  REQUIRED_REMAINING_RATIO,
  calcEarlyReemployment,
  latestPaidDaysForBonus,
  type EarlyReemploymentInput,
} from "./early-reemployment";

describe("법정 요건 고정", () => {
  it("잔여 1/2 이상, 지급 1/2, 14일 경과, 12개월 고용", () => {
    expect(REQUIRED_REMAINING_RATIO).toBe(0.5);
    expect(PAYOUT_RATIO).toBe(0.5);
    expect(MIN_DAYS_AFTER_REPORT).toBe(14);
    expect(REQUIRED_EMPLOYMENT_MONTHS).toBe(12);
  });
});

const base: EarlyReemploymentInput = {
  dailyBenefit: 66_048,
  benefitDays: 210,
  paidDays: 60,
  daysAfterReport: 45,
  willStay12Months: true,
  hadPriorClaim: false,
  sameEmployer: false,
  senior: false,
};

describe("조기재취업수당 계산", () => {
  it("요건을 다 채우면 남은 일수의 절반을 받는다", () => {
    const r = calcEarlyReemployment(base);
    expect(r.remainingDays).toBe(150);
    expect(r.qualified).toBe(true);
    // 66,048 × 150 × 0.5 = 4,953,600
    expect(r.amount).toBe(4_953_600);
  });

  it("끝까지 받는 것보다는 적다 — 대신 월급을 함께 번다", () => {
    const r = calcEarlyReemployment(base);
    expect(r.ifKeptClaiming).toBe(66_048 * 150);
    expect(r.amount).toBe(r.ifKeptClaiming / 2);
  });

  it("절반을 못 남기면 탈락한다", () => {
    const r = calcEarlyReemployment({ ...base, paidDays: 120 });
    expect(r.remainingDays).toBe(90);
    expect(r.qualified).toBe(false);
    expect(r.amount).toBe(0);
    // 얼마를 놓쳤는지는 그대로 보여준다
    expect(r.potentialAmount).toBeGreaterThan(0);
  });

  it("정확히 절반이면 통과한다", () => {
    const r = calcEarlyReemployment({ ...base, paidDays: 105 });
    expect(r.remainingRatio).toBe(0.5);
    expect(r.requirements[0].status).toBe("pass");
  });

  it("14일 안에 재취업하면 탈락", () => {
    const r = calcEarlyReemployment({ ...base, daysAfterReport: 10 });
    expect(r.qualified).toBe(false);
    expect(r.requirements[1].status).toBe("fail");
  });

  it("12개월을 못 채우면 탈락", () => {
    const r = calcEarlyReemployment({ ...base, willStay12Months: false });
    expect(r.qualified).toBe(false);
  });

  it("2년 내 수급 이력이 있으면 탈락", () => {
    const r = calcEarlyReemployment({ ...base, hadPriorClaim: true });
    expect(r.qualified).toBe(false);
    expect(r.requirements[3].status).toBe("fail");
  });

  it("이직 전 회사에 재입사하면 탈락", () => {
    const r = calcEarlyReemployment({ ...base, sameEmployer: true });
    expect(r.qualified).toBe(false);
    expect(r.requirements[4].status).toBe("fail");
  });

  it("65세 이상은 6개월만 채우면 된다", () => {
    const r = calcEarlyReemployment({ ...base, senior: true });
    expect(r.requiredMonths).toBe(6);
    expect(r.requirements[2].label).toContain("6개월");
  });

  it("지급받은 일수가 소정급여일수를 넘어도 음수가 되지 않는다", () => {
    const r = calcEarlyReemployment({ ...base, paidDays: 999 });
    expect(r.remainingDays).toBe(0);
    expect(r.amount).toBe(0);
  });
});

describe("언제까지 취업해야 받나", () => {
  it("소정급여일수의 절반을 받기 전에 취업해야 한다", () => {
    expect(latestPaidDaysForBonus(210)).toBe(105);
    expect(latestPaidDaysForBonus(120)).toBe(60);
    expect(latestPaidDaysForBonus(270)).toBe(135);
  });

  it("홀수 일수는 내림 처리", () => {
    expect(latestPaidDaysForBonus(151)).toBe(75);
  });
});
