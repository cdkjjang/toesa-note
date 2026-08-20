import { describe, expect, it } from "vitest";
import {
  BENEFIT_DAYS,
  BENEFIT_RATE,
  LIMITS_BY_YEAR,
  calcJobseeker,
  dailyMinFromMinWage,
  limitsForYear,
  rateAppliesWageRange,
  type JobseekerInput,
} from "./jobseeker";

// ─────────────────────────────────────────────────────────────
// 고시값 고정 테스트
//
// 상수를 기호로만 참조하면 값이 1년 낡아도 테스트가 전부 통과한다.
// 실제로 워크스페이스의 다른 노트에서 그 사고가 났다. 그래서 여기서는
// **숫자 자체를 리터럴로 박아** 고시가 바뀌면 이 블록이 먼저 깨지게 한다.
// ─────────────────────────────────────────────────────────────
describe("고시값 고정 (2026년)", () => {
  it("구직급여일액 상한 68,100원 — 2019년부터 66,000원으로 동결됐다가 2026년 인상", () => {
    expect(LIMITS_BY_YEAR[2026].dailyMax).toBe(68_100);
  });

  it("임금일액(기초일액) 상한 113,500원", () => {
    expect(LIMITS_BY_YEAR[2026].wageDailyMax).toBe(113_500);
  });

  it("구직급여일액 하한 66,048원", () => {
    expect(LIMITS_BY_YEAR[2026].dailyMin).toBe(66_048);
  });

  it("하한액은 최저시급 10,320원 × 80% × 8시간으로 떨어진다", () => {
    expect(LIMITS_BY_YEAR[2026].minWage).toBe(10_320);
    expect(dailyMinFromMinWage(10_320)).toBe(66_048);
    expect(dailyMinFromMinWage(LIMITS_BY_YEAR[2026].minWage)).toBe(
      LIMITS_BY_YEAR[2026].dailyMin
    );
  });

  it("2025년 이직자 값도 함께 보존한다 (이직일 기준으로 적용되므로)", () => {
    expect(LIMITS_BY_YEAR[2025].dailyMax).toBe(66_000);
    expect(LIMITS_BY_YEAR[2025].dailyMin).toBe(64_192);
    expect(dailyMinFromMinWage(10_030)).toBe(64_192);
  });

  it("지급률은 60%", () => {
    expect(BENEFIT_RATE).toBe(0.6);
  });

  it("상한과 하한의 간격이 2,052원뿐이다 — 이 노트가 설명해야 할 핵심", () => {
    const l = LIMITS_BY_YEAR[2026];
    expect(l.dailyMax - l.dailyMin).toBe(2_052);
  });
});

describe("소정급여일수 (고용보험법 별표1)", () => {
  it("50세 미만 — 120·150·180·210·240일", () => {
    expect(BENEFIT_DAYS.under50).toEqual({
      under1: 120,
      y1to3: 150,
      y3to5: 180,
      y5to10: 210,
      over10: 240,
    });
  });

  it("50세 이상·장애인 — 120·180·210·240·270일", () => {
    expect(BENEFIT_DAYS.over50).toEqual({
      under1: 120,
      y1to3: 180,
      y3to5: 210,
      y5to10: 240,
      over10: 270,
    });
  });

  it("1년 미만은 나이와 무관하게 120일로 같다", () => {
    expect(BENEFIT_DAYS.under50.under1).toBe(BENEFIT_DAYS.over50.under1);
  });
});

const base: JobseekerInput = {
  monthlyWage: 3_000_000,
  totalDays: 91,
  age: 35,
  disabled: false,
  insured: "y5to10",
  leaveYear: 2026,
};

describe("구직급여 계산", () => {
  it("월 300만원이면 60%가 하한에 못 미쳐 하한액이 적용된다", () => {
    const r = calcJobseeker(base);
    // 3,000,000 × 3 ÷ 91 = 98,901원
    expect(r.averageWage).toBe(98_901);
    expect(r.baseDaily).toBe(98_901);
    expect(r.wageCapped).toBe(false);
    // 98,901 × 60% = 59,340원 → 하한 66,048원으로 올라간다
    expect(r.rawDaily).toBe(59_340);
    expect(r.dailyBenefit).toBe(66_048);
    expect(r.bound).toBe("min");
  });

  it("50세 미만·5~10년이면 210일, 총액은 일액 × 일수", () => {
    const r = calcJobseeker(base);
    expect(r.benefitDays).toBe(210);
    expect(r.total).toBe(66_048 * 210);
    expect(r.total).toBe(13_870_080);
  });

  it("월 500만원은 임금일액 상한에 잘려 상한액을 받는다", () => {
    const r = calcJobseeker({ ...base, monthlyWage: 5_000_000 });
    expect(r.averageWage).toBe(164_835);
    expect(r.wageCapped).toBe(true);
    expect(r.baseDaily).toBe(113_500);
    // 113,500 × 60% = 68,100원 — 임금일액 상한이 이미 일액 상한과 맞물려 있다
    expect(r.dailyBenefit).toBe(68_100);
  });

  it("월급이 두 배가 돼도 하한 구간 안에서는 결과가 같다", () => {
    const a = calcJobseeker({ ...base, monthlyWage: 1_800_000 });
    const b = calcJobseeker({ ...base, monthlyWage: 3_300_000 });
    expect(a.dailyBenefit).toBe(b.dailyBenefit);
    expect(a.total).toBe(b.total);
    expect(a.bound).toBe("min");
    expect(b.bound).toBe("min");
  });

  it("60%가 실제로 적용되는 좁은 구간이 존재한다", () => {
    // 기초일액 112,000원 → 월급 약 339만원
    const monthly = Math.round((112_000 * 91) / 3);
    const r = calcJobseeker({ ...base, monthlyWage: monthly });
    expect(r.bound).toBe("none");
    expect(r.dailyBenefit).toBeGreaterThan(66_048);
    expect(r.dailyBenefit).toBeLessThan(68_100);
  });

  it("50세 이상은 같은 조건에서 일수가 더 길다", () => {
    const young = calcJobseeker({ ...base, age: 49, insured: "over10" });
    const old = calcJobseeker({ ...base, age: 50, insured: "over10" });
    expect(young.benefitDays).toBe(240);
    expect(old.benefitDays).toBe(270);
    expect(old.total).toBeGreaterThan(young.total);
  });

  it("장애인은 나이와 무관하게 50세 이상 표를 쓴다", () => {
    const r = calcJobseeker({ ...base, age: 30, disabled: true, insured: "y1to3" });
    expect(r.benefitDays).toBe(180);
  });

  it("2025년 이직자는 옛 상한액이 적용된다", () => {
    const r = calcJobseeker({ ...base, monthlyWage: 5_000_000, leaveYear: 2025 });
    expect(r.baseDaily).toBe(110_000);
    expect(r.dailyBenefit).toBe(66_000);
    expect(r.limits.dailyMin).toBe(64_192);
  });

  it("표에 없는 연도는 최신 값으로 갈음한다", () => {
    expect(limitsForYear(2030)).toEqual(LIMITS_BY_YEAR[2026]);
  });

  it("총일수가 짧으면 평균임금이 올라간다", () => {
    const a = calcJobseeker({ ...base, monthlyWage: 3_500_000, totalDays: 92 });
    const b = calcJobseeker({ ...base, monthlyWage: 3_500_000, totalDays: 89 });
    expect(b.averageWage).toBeGreaterThan(a.averageWage);
  });

  it("급여가 0이어도 하한액은 보장된다", () => {
    const r = calcJobseeker({ ...base, monthlyWage: 0 });
    expect(r.dailyBenefit).toBe(66_048);
    expect(r.bound).toBe("min");
  });

  it("월 환산액은 30일 기준", () => {
    const r = calcJobseeker(base);
    expect(r.monthlyEquivalent).toBe(66_048 * 30);
  });
});

describe("60%가 적용되는 월급 구간", () => {
  it("2026년 기준 약 334만~344만원 사이뿐이다", () => {
    const range = rateAppliesWageRange(2026, 91);
    expect(range.fromMonthly).toBe(3_339_093);
    expect(range.toMonthly).toBe(3_442_833);
    expect(range.toMonthly - range.fromMonthly).toBeLessThan(200_000);
  });

  it("구간 아래는 하한, 위는 상한에 걸린다", () => {
    const range = rateAppliesWageRange(2026, 91);
    const below = calcJobseeker({ ...base, monthlyWage: range.fromMonthly - 100_000 });
    const above = calcJobseeker({ ...base, monthlyWage: range.toMonthly + 100_000 });
    expect(below.bound).toBe("min");
    expect(above.dailyBenefit).toBe(68_100);
  });
});
