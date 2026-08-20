import { describe, expect, it } from "vitest";
import {
  APPLY_WINDOW_MONTHS,
  HEALTH_RATE_EMPLOYEE,
  HEALTH_RATE_TOTAL,
  LONG_TERM_CARE_RATE,
  MAX_MONTHS,
  REQUIRED_ENROLLED_MONTHS,
  applyDeadline,
  calcHealthInsurance,
  daysUntil,
  type HealthInput,
} from "./health-insurance";

// 고시값 고정 — 급여노트 lib/insurance.ts와 **같은 값**이어야 한다.
// 한쪽만 고치면 두 사이트가 다른 답을 낸다.
describe("고시값 고정 (2026년)", () => {
  it("건강보험 본인부담 3.595% (총 7.19%의 절반)", () => {
    expect(HEALTH_RATE_EMPLOYEE).toBe(0.03595);
    expect(HEALTH_RATE_TOTAL).toBe(0.0719);
    expect(HEALTH_RATE_EMPLOYEE * 2).toBeCloseTo(HEALTH_RATE_TOTAL, 10);
  });

  it("장기요양 13.14%", () => {
    expect(LONG_TERM_CARE_RATE).toBe(0.1314);
  });

  it("임의계속 최대 36개월, 요건 12개월, 신청 창 2개월", () => {
    expect(MAX_MONTHS).toBe(36);
    expect(REQUIRED_ENROLLED_MONTHS).toBe(12);
    expect(APPLY_WINDOW_MONTHS).toBe(2);
  });
});

const base: HealthInput = {
  averageMonthlyWage: 3_500_000,
  enrolledMonths: 24,
  canBeDependent: false,
};

describe("임의계속가입 보험료", () => {
  it("보수월액 350만원이면 월 14만원대", () => {
    const r = calcHealthInsurance(base);
    // 3,500,000 × 3.595% = 125,825 → 125,820
    expect(r.health).toBe(125_820);
    // 125,820 × 13.14% = 16,532.7 → 16,530
    expect(r.longTermCare).toBe(16_530);
    expect(r.monthly).toBe(142_350);
  });

  it("36개월치 총액을 보여준다", () => {
    const r = calcHealthInsurance(base);
    expect(r.maxTotal).toBe(142_350 * 36);
  });

  it("직장가입자 시절 급여에서 빠지던 금액과 같다", () => {
    // 사업주 부담분이 없어 본인부담분만 낸다 = 재직 중과 동일
    const r = calcHealthInsurance(base);
    const whileEmployed =
      Math.floor((3_500_000 * HEALTH_RATE_EMPLOYEE) / 10) * 10;
    expect(r.health).toBe(whileEmployed);
  });

  it("12개월을 채우면 자격이 있다", () => {
    expect(calcHealthInsurance({ ...base, enrolledMonths: 12 }).qualified).toBe(true);
  });

  it("11개월이면 자격이 없고 몇 달 모자란지 알려준다", () => {
    const r = calcHealthInsurance({ ...base, enrolledMonths: 11 });
    expect(r.qualified).toBe(false);
    expect(r.monthsShort).toBe(1);
  });

  it("피부양자가 가능하면 그쪽이 우선임을 표시한다", () => {
    const r = calcHealthInsurance({ ...base, canBeDependent: true });
    expect(r.dependentFirst).toBe(true);
  });

  it("보수가 0이면 보험료도 0", () => {
    const r = calcHealthInsurance({ ...base, averageMonthlyWage: 0 });
    expect(r.monthly).toBe(0);
  });

  it("보수월액이 높을수록 보험료가 비례해 오른다", () => {
    const a = calcHealthInsurance({ ...base, averageMonthlyWage: 3_000_000 });
    const b = calcHealthInsurance({ ...base, averageMonthlyWage: 6_000_000 });
    expect(b.monthly).toBeGreaterThan(a.monthly * 1.9);
  });
});

describe("신청 마감일 — 놓치면 영구히 못 한다", () => {
  it("최초 납부기한부터 2개월", () => {
    expect(applyDeadline("2026-09-10")).toBe("2026-11-10");
  });

  it("말일 보정", () => {
    expect(applyDeadline("2026-12-31")).toBe("2027-02-28");
  });

  it("연도를 넘어간다", () => {
    expect(applyDeadline("2026-11-25")).toBe("2027-01-25");
  });

  it("남은 일수를 센다", () => {
    expect(daysUntil("2026-11-10", "2026-08-19")).toBe(83);
  });

  it("지났으면 음수", () => {
    expect(daysUntil("2026-08-01", "2026-08-19")).toBe(-18);
  });
});
