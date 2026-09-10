import { describe, expect, it } from "vitest";
import { metadata as benefitMeta } from "../app/calc/benefit/page";
import { metadata as earlyMeta } from "../app/calc/early/page";
import { metadata as eligibilityMeta } from "../app/calc/eligibility/page";
import { LATEST_YEAR, limitsForYear } from "./jobseeker";

/**
 * 계산기 페이지 제목의 연도가 고시 표에서 파생되는지 고정하는 테스트.
 *
 * 2026-09-10 측정에서 본문 페이지 444개 중 제목에 연도가 있는 것이 9개(2%)뿐이었다.
 * 한국어 검색은 "2026 실업급여"처럼 연도를 붙이므로 그 검색어를 못 잡고 있었다.
 *
 * 그래서 제목에 연도를 넣되 **`LIMITS_BY_YEAR` 표에서 끌어오게** 했다.
 * 손으로 적으면 1월 1일에 제목만 낡아 계산 결과와 어긋난다 —
 * 워크스페이스 CLAUDE.md 8장 규칙 9가 경고하는 "연도에 묶인 제목"이 그것이다.
 * 표에서 파생시키면 새 연도를 넣는 순간 제목이 함께 따라오므로 낡지 않는다.
 */

const pages = [
  ["실업급여 계산기", benefitMeta],
  ["조기재취업수당 계산기", earlyMeta],
  ["수급자격 계산기", eligibilityMeta],
] as const;

describe("계산기 페이지 제목의 연도", () => {
  it("세 페이지 모두 제목에 현행 고시 연도가 들어 있다", () => {
    const bad: string[] = [];
    for (const [label, meta] of pages) {
      if (!String(meta.title).includes(String(LATEST_YEAR))) {
        bad.push(`${label}: "${meta.title}"`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("표에 없는 연도를 제목에 박아 두지 않았다", () => {
    // LATEST_YEAR 가 2027로 바뀌었는데 제목에 2026이 남아 있으면 여기서 걸린다.
    const known = new Set([String(LATEST_YEAR)]);
    const bad: string[] = [];
    for (const [label, meta] of pages) {
      for (const m of String(meta.title).matchAll(/20\d\d/g)) {
        if (!known.has(m[0])) bad.push(`${label}: 제목에 ${m[0]} (현행 ${LATEST_YEAR})`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("설명의 상·하한 금액도 표에서 온 값이다", () => {
    const limits = limitsForYear(LATEST_YEAR);
    const desc = String(benefitMeta.description);
    expect(desc).toContain(limits.dailyMax.toLocaleString());
    expect(desc).toContain(limits.dailyMin.toLocaleString());
    // 옛 연도 값이 남아 있으면 안 된다
    expect(desc).not.toContain("66,000");
  });

  it("제목이 검색결과에서 잘리지 않는다", () => {
    // 사이트 이름 접미사(" | 퇴사노트")까지 붙으므로 여유를 둔다.
    for (const [label, meta] of pages) {
      expect(String(meta.title).length, label).toBeLessThanOrEqual(45);
    }
  });
});
