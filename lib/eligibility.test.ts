import { describe, expect, it } from "vitest";
import {
  CLAIM_PERIOD_MONTHS,
  REQUIRED_INSURED_DAYS,
  WAITING_DAYS,
  addMonths,
  calcEligibility,
  forfeitedDays,
  lastSafeApplyDate,
  parseDate,
  type EligibilityInput,
} from "./eligibility";

describe("법정 요건 고정", () => {
  it("피보험단위기간 180일", () => {
    expect(REQUIRED_INSURED_DAYS).toBe(180);
  });
  it("수급기간 12개월", () => {
    expect(CLAIM_PERIOD_MONTHS).toBe(12);
  });
  it("대기기간 7일", () => {
    expect(WAITING_DAYS).toBe(7);
  });
});

describe("날짜 유틸", () => {
  it("월 더하기는 말일을 넘기지 않는다", () => {
    expect(addMonths(parseDate("2026-01-31"), 1)).toEqual(parseDate("2026-02-28"));
    expect(addMonths(parseDate("2028-01-31"), 1)).toEqual(parseDate("2028-02-29"));
  });
  it("연도를 넘어가도 맞는다", () => {
    expect(addMonths(parseDate("2026-08-19"), 12)).toEqual(parseDate("2027-08-19"));
  });
});

const base: EligibilityInput = {
  insuredDays: 400,
  reason: "layoff",
  ableToWork: true,
  leaveDate: "2026-06-30",
  today: "2026-08-19",
};

describe("수급자격 판정", () => {
  it("권고사직·180일 충족·근로 가능이면 자격이 있다", () => {
    const r = calcEligibility(base);
    expect(r.eligible).toBe(true);
    expect(r.hasWarning).toBe(false);
    expect(r.checks).toHaveLength(4);
  });

  it("피보험단위기간이 모자라면 탈락하고 며칠 부족한지 알려준다", () => {
    const r = calcEligibility({ ...base, insuredDays: 150 });
    expect(r.eligible).toBe(false);
    expect(r.checks[0].status).toBe("fail");
    expect(r.checks[0].detail).toContain("30일이 모자랍니다");
  });

  it("자진 퇴사는 탈락", () => {
    const r = calcEligibility({ ...base, reason: "voluntary" });
    expect(r.eligible).toBe(false);
  });

  it("정당한 사유가 있는 자진 퇴사는 경고로 처리한다 — 고용센터가 판단할 몫", () => {
    const r = calcEligibility({ ...base, reason: "justCause" });
    expect(r.eligible).toBe(true);
    expect(r.hasWarning).toBe(true);
    expect(r.checks[1].status).toBe("warn");
  });

  it("중대 귀책사유 해고는 탈락", () => {
    const r = calcEligibility({ ...base, reason: "misconduct" });
    expect(r.eligible).toBe(false);
  });

  it("근로 능력이 없으면 탈락하고 수급기간 연기를 안내한다", () => {
    const r = calcEligibility({ ...base, ableToWork: false });
    expect(r.eligible).toBe(false);
    expect(r.checks[2].detail).toContain("연기");
  });
});

describe("수급기간 — 이직일 다음날부터 12개월", () => {
  it("만료일은 이직일 다음날 + 12개월", () => {
    const r = calcEligibility(base); // 이직 2026-06-30 → 시작 07-01 → 만료 2027-07-01
    expect(r.expiryDate).toBe("2027-07-01");
  });

  it("남은 일수를 센다", () => {
    const r = calcEligibility(base);
    // 2026-08-19 → 2027-07-01
    expect(r.daysLeft).toBe(316);
    expect(r.daysSinceLeave).toBe(50);
    expect(r.expired).toBe(false);
  });

  it("90일 미만이면 경고", () => {
    const r = calcEligibility({ ...base, today: "2027-05-01" });
    expect(r.checks[3].status).toBe("warn");
    expect(r.eligible).toBe(true);
  });

  it("수급기간이 지나면 탈락한다 — 소정급여일수가 남아도 소용없다", () => {
    const r = calcEligibility({ ...base, today: "2027-08-01" });
    expect(r.expired).toBe(true);
    expect(r.eligible).toBe(false);
    expect(r.daysLeft).toBeLessThan(0);
  });
});

describe("늦게 신청해서 날아가는 일수", () => {
  it("남은 기간이 충분하면 손해가 없다", () => {
    expect(forfeitedDays(300, 210)).toBe(0);
  });

  it("남은 기간이 짧으면 그 차이만큼 못 받는다", () => {
    expect(forfeitedDays(100, 210)).toBe(110);
  });

  it("이미 만료됐으면 전부 날아간다", () => {
    expect(forfeitedDays(-5, 240)).toBe(240);
  });

  it("270일 자격자가 퇴사 5개월 뒤 신청하면 상당 부분을 잃는다", () => {
    const r = calcEligibility({ ...base, today: "2026-11-30" });
    const lost = forfeitedDays(r.daysLeft, 270);
    expect(r.daysLeft).toBe(213);
    expect(lost).toBe(57);
  });
});

describe("전부 받으려면 언제까지 신청해야 하나", () => {
  it("소정급여일수 + 대기기간 7일을 만료일 안에 소화해야 한다", () => {
    // 만료 2027-07-01에서 (210 + 7)일을 뺀 날
    expect(lastSafeApplyDate("2026-06-30", 210)).toBe("2026-11-26");
  });

  it("일수가 길수록 마감이 앞당겨진다", () => {
    const short = lastSafeApplyDate("2026-06-30", 120);
    const long = lastSafeApplyDate("2026-06-30", 270);
    expect(new Date(long).getTime()).toBeLessThan(new Date(short).getTime());
  });
});
