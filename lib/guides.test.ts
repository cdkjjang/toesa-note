import { describe, expect, it } from "vitest";
import { guides } from "./guides";
import nextConfig from "../next.config";

/**
 * 가이드 데이터가 조용히 망가지는 것을 막는 테스트.
 *
 * 2026-09-10에 13편을 12편으로 합쳤다. 퇴사 후 건강보험과 국민연금은 둘 다
 * '소득이 끊긴 동안의 4대보험'인데 따로 있었고 둘 다 1,300~1,400자대였다.
 * 애드센스가 "가치가 별로 없는 콘텐츠"로 두 번 반려한 뒤 진행한 통합의 일부다
 * (워크스페이스 CLAUDE.md 8장).
 */

/** 화면에 실제로 나가는 본문 길이 (공백 제외) */
function bodyLength(g: (typeof guides)[number]): number {
  const parts = [
    ...g.intro,
    ...g.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.list ?? [])]),
    ...g.faq.flatMap((f) => [f.q, f.a]),
  ];
  return parts.join("").replace(/\s/g, "").length;
}

/**
 * 2026-09-10 통합 뒤에도 1,500자를 밑도는 글 — **남은 숙제 목록이다.**
 * 이번 작업은 노트당 한 편만 합치는 범위였다(워크스페이스 CLAUDE.md 8장 계획표의
 * "퇴사·부동산·연금·상속 각 −1"). 짝을 찾아 합치면 여기서 지운다.
 */
const KNOWN_THIN = [
  "severance-and-benefit", // 1442자
  "early-reemployment-timing", // 1479자
];

describe("가이드 데이터", () => {
  it("슬러그가 중복되지 않는다", () => {
    const seen = new Set<string>();
    const dup: string[] = [];
    for (const g of guides) {
      if (seen.has(g.slug)) dup.push(g.slug);
      seen.add(g.slug);
    }
    expect(dup).toEqual([]);
  });

  it("related가 실제 있는 글을 가리키고 자기 자신을 넣지 않는다", () => {
    const known = new Set(guides.map((g) => g.slug));
    const bad: string[] = [];
    for (const g of guides) {
      for (const r of g.related) {
        if (!known.has(r)) bad.push(`${g.slug} → 없는 글 ${r}`);
        if (r === g.slug) bad.push(`${g.slug} → 자기 자신`);
      }
      if (new Set(g.related).size !== g.related.length) {
        bad.push(`${g.slug}: related 중복`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("새로 얇아진 글이 없다", () => {
    // ⚠️ 기준이 두 가지다. 통합을 결정할 때 쓴 감사 수치는 소스의 문자열
    //    리터럴을 세는 느슨한 방식이고, 여기 bodyLength는 화면에 나가는 글자를
    //    공백까지 빼고 센다. 감사 기준 2,000자 ≈ 여기 1,500자.
    //
    // ⚠️ **아래 목록은 "괜찮다"는 뜻이 아니라 "아직 안 했다"는 뜻이다.**
    //    2026-09-10 통합은 이 노트에서 한 편만 합치는 범위였고, 그때 남은
    //    얇은 글을 그대로 적어 둔 것이다. 통합할 짝을 찾으면 목록에서 지울 것.
    //    **여기에 새 슬러그를 추가하지 말 것** — 그러면 이 테스트가 무의미해진다.
    const thin = guides
      .map((g) => ({ slug: g.slug, len: bodyLength(g) }))
      .filter((x) => x.len < 1500)
      .filter((x) => !KNOWN_THIN.includes(x.slug))
      .map((x) => `${x.slug} (${x.len}자)`);
    expect(thin).toEqual([]);
  });

  it("알려진 얇은 글 목록이 실제와 맞는다", () => {
    // 목록에 적어 둔 글이 이미 두꺼워졌거나 사라졌다면 목록에서 빼야 한다.
    // 그대로 두면 나중에 그 글이 다시 얇아져도 걸리지 않는다.
    const stale = KNOWN_THIN.filter((slug) => {
      const g = guides.find((x) => x.slug === slug);
      return !g || bodyLength(g) >= 1500;
    });
    expect(stale).toEqual([]);
  });

  it("섹션 제목이 한 글 안에서 중복되지 않는다", () => {
    // 템플릿이 heading을 React key로 쓴다. 겹치면 렌더링이 깨진다.
    const bad: string[] = [];
    for (const g of guides) {
      const seen = new Set<string>();
      for (const s of g.sections) {
        if (seen.has(s.heading)) bad.push(`${g.slug}: "${s.heading}"`);
        seen.add(s.heading);
      }
    }
    expect(bad).toEqual([]);
  });

  it("FAQ 질문이 한 글 안에서 중복되지 않는다", () => {
    const bad: string[] = [];
    for (const g of guides) {
      const seen = new Set<string>();
      for (const f of g.faq) {
        if (seen.has(f.q)) bad.push(`${g.slug}: "${f.q}"`);
        seen.add(f.q);
      }
    }
    expect(bad).toEqual([]);
  });

  it("faq에는 ** 를 쓰지 않는다", () => {
    // FAQ는 JSON-LD 구조화 데이터로도 나가므로 태그가 아니라 별표가 그대로 들어간다.
    const bad = guides
      .filter((g) => g.faq.some((f) => f.q.includes("**") || f.a.includes("**")))
      .map((g) => g.slug);
    expect(bad).toEqual([]);
  });

  it("제목의 부제(— 뒤)가 서로 겹치지 않는다", () => {
    const bySub = new Map<string, string[]>();
    for (const g of guides) {
      const parts = g.title.split(" — ");
      if (parts.length < 2) continue;
      const sub = parts.slice(1).join(" — ").trim();
      bySub.set(sub, [...(bySub.get(sub) ?? []), g.slug]);
    }
    const dup = [...bySub.entries()]
      .filter(([, v]) => v.length > 1)
      .map(([k, v]) => `"${k}": ${v.join(", ")}`);
    expect(dup).toEqual([]);
  });

  it("cta가 실제 있는 계산기를 가리킨다", () => {
    const calcs = new Set(["/calc/benefit","/calc/eligibility","/calc/early","/calc/health"]);
    const bad = guides
      .filter((g) => g.cta && !calcs.has(g.cta.href))
      .map((g) => `${g.slug} → ${g.cta!.href}`);
    expect(bad).toEqual([]);
  });
});

describe("다른 노트가 보내오는 리다이렉트의 목적지", () => {
  it("health-insurance-after-quitting 슬러그가 살아 있다", () => {
    // 급여노트와 건강보험노트가 이 슬러그로 301을 보낸다(3중복 해소, 2026-09).
    // 슬러그를 바꾸면 저쪽 두 노트가 조용히 404가 되는데 저쪽 테스트로는 못 잡는다.
    const known = new Set(guides.map((g) => g.slug));
    expect(known.has("health-insurance-after-quitting")).toBe(true);
  });
});

describe("통합으로 사라진 URL의 301", () => {
  it("출발지는 사라진 글이고 목적지는 실재한다", async () => {
    const known = new Set(guides.map((g) => g.slug));
    const rules = await nextConfig.redirects!();
    expect(rules.length).toBe(1);

    const bad: string[] = [];
    for (const r of rules) {
      const from = r.source.replace("/guide/", "");
      const to = r.destination.replace("/guide/", "");
      if (known.has(from)) bad.push(`${from}: 글이 살아 있는데 리다이렉트가 걸려 있음`);
      if (!known.has(to)) bad.push(`${from} → ${to}: 목적지가 없음`);
      if (!r.permanent) bad.push(`${from}: 301이 아님`);
    }
    expect(bad).toEqual([]);
  });

  it("리다이렉트가 다시 리다이렉트로 이어지지 않는다", async () => {
    const rules = await nextConfig.redirects!();
    const sources = new Set(rules.map((r) => r.source));
    const chained = rules
      .filter((r) => sources.has(r.destination))
      .map((r) => `${r.source} → ${r.destination}`);
    expect(chained).toEqual([]);
  });
});
