import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import HomeNotes from "@/components/HomeNotes";
import { guides } from "@/lib/guides";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const TOOLS = [
  {
    href: "/calc/benefit",
    title: "실업급여 계산기",
    desc: "하루에 얼마를 며칠 동안 받는지. 2026년 상한 68,100원 반영",
    badge: "실업급여",
  },
  {
    href: "/calc/eligibility",
    title: "수급자격 · 신청기한",
    desc: "받을 수 있는지 판정하고, 늦으면 며칠치를 잃는지 날짜로",
    badge: "자격·기한",
  },
  {
    href: "/calc/early",
    title: "조기재취업수당",
    desc: "일찍 취업하면 남은 실업급여의 절반. 요건 다섯 가지 확인",
    badge: "재취업",
  },
  {
    href: "/calc/health",
    title: "퇴사 후 건강보험",
    desc: "임의계속가입 보험료와, 놓치면 영구히 못 하는 신청 마감일",
    badge: "건강보험",
  },
];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ko",
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-6 text-center sm:py-10">
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
          회사를 그만둔 다음에
          <br className="sm:hidden" /> 챙길 것들
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          실업급여를 얼마나 며칠 받는지, 내 퇴사 사유로 받을 수 있는지, 언제까지
          신청해야 손해가 없는지 — 퇴사하면 시계가 돌아가기 시작하는 것들을
          한곳에 모았습니다.
        </p>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
          >
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent-strong">
              {tool.badge}
            </span>
            <h2 className="mt-3 text-lg font-bold leading-snug">{tool.title}</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
              {tool.desc}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">퇴사 가이드</h2>
          <Link href="/guide" className="text-[15px] text-accent hover:underline">
            전체 보기 →
          </Link>
        </div>
        <ul className="space-y-3">
          {guides.slice(0, 10).map((g) => (
            <li key={g.slug}>
              <div className="rounded-xl border border-border-soft bg-card p-4 shadow-sm transition-all hover:border-accent">
                {/* 제목만 링크로 둔다 — 설명까지 앵커에 넣으면 본문 대부분이
                    링크 텍스트가 된다. */}
                <p className="font-bold leading-snug">
                  <Link href={`/guide/${g.slug}`} className="hover:text-accent">
                    {g.title}
                  </Link>
                </p>
                <p className="mt-1 line-clamp-2 text-[15px] text-muted">
                  {g.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <HomeNotes
        siteName={SITE_NAME}
        updated="2026-08-19"
        intro="퇴사하면 여러 기한이 동시에 돌아가기 시작합니다. 그중에는 놓치면 되돌릴 수 없는 것도 있습니다. 아래 네 가지가 실제로 금액이 크게 갈리는 순간입니다."
        scenarios={[
          {
            situation: "실업급여를 얼마나 받을지 궁금할 때",
            action:
              "'평균임금의 60%'로 알고 계시겠지만 대부분 그렇지 않습니다. 2026년 상한 68,100원과 하한 66,048원의 간격이 2,052원뿐이라, 월급 334만원 미만이면 급여가 얼마든 같은 금액을 받습니다. 총액을 가르는 것은 금액이 아니라 며칠 받느냐입니다.",
            href: "/calc/benefit",
            label: "실업급여 계산하기",
          },
          {
            situation: "\"천천히 신청해도 되겠지\" 싶을 때",
            action:
              "그렇지 않습니다. 수급기간은 이직일 다음날부터 12개월이고, 이 날이 지나면 소정급여일수가 남아도 지급이 끊깁니다. 270일 자격자가 다섯 달 쉬다 신청하면 57일치, 약 376만원이 그냥 사라집니다.",
            href: "/calc/eligibility",
            label: "신청 기한 확인하기",
          },
          {
            situation: "실업급여를 받는 중에 취업 제안을 받았을 때",
            action:
              "소정급여일수의 절반을 남기고 취업하면 남은 금액의 절반을 조기재취업수당으로 받습니다. 210일이면 105일이 경계이고, 하루 차이로 수백만원이 갈립니다. 게다가 신청은 재취업 직후가 아니라 12개월을 채운 뒤에 합니다.",
            href: "/calc/early",
            label: "조기재취업수당 계산하기",
          },
          {
            situation: "퇴사 후 첫 건강보험 고지서를 받았을 때",
            action:
              "금액이 올랐다면 지역가입자로 넘어간 것입니다. 재산과 자동차까지 계산에 들어가기 때문입니다. 임의계속가입으로 최대 36개월간 재직 중 보험료를 유지할 수 있는데, 신청 기한이 첫 납부기한부터 2개월이고 연장도 구제도 없습니다.",
            href: "/calc/health",
            label: "건강보험 계산하기",
          },
        ]}
        faq={[
          {
            q: "계산 결과가 고용센터에서 안내받은 금액과 다릅니다.",
            a: "이 계산기는 이직 전 3개월의 총일수를 91일로 놓고 평균임금을 구합니다. 실제로는 퇴사한 달에 따라 89~92일이라 하루치 금액이 조금 달라집니다. 또 상한액은 이직일이 속한 연도 기준으로 적용되므로, 연말·연초 퇴사자는 연도를 정확히 선택해야 합니다. 확정 금액은 고용센터의 수급자격 인정 결과를 따릅니다.",
          },
          {
            q: "자진 퇴사인데 정말 못 받나요?",
            a: "원칙적으로는 그렇지만 예외가 꽤 넓습니다. 2개월 이상 임금체불, 직장 내 괴롭힘, 통근 왕복 3시간 이상, 질병으로 업무 수행이 어려운데 배치전환을 거부당한 경우 등이 고용보험법 시행규칙 별표2에 열거돼 있습니다. 관건은 증빙이므로 퇴사 전에 자료를 모아 두세요.",
          },
          {
            q: "반복수급 감액 제도는 반영돼 있나요?",
            a: "반영하지 않았습니다. 여러 차례 개정안이 논의됐지만 확정된 시행 내용이 없기 때문입니다. 이 사이트는 확정된 법령만 계산에 넣고, 논의 중인 개편안은 계산기에 넣지 않습니다. 확정되면 반영하겠습니다.",
          },
          {
            q: "입력한 급여가 저장되나요?",
            a: "저장되지 않습니다. 모든 계산은 이용자의 브라우저 안에서 이루어지며 서버로 전송되지 않습니다. 회원가입도 없습니다.",
          },
        ]}
        maintained={[
          "구직급여 상한액 — 고용노동부 고시, 2026년 68,100원(7년 만에 인상)",
          "구직급여 하한액 — 최저임금 × 80% × 8시간, 2026년 66,048원",
          "임금일액 상한 — 2026년 113,500원",
          "소정급여일수 — 고용보험법 별표1 (2019. 8. 27. 개정)",
          "건강보험료율 — 매년 초 고시, 2026년 본인부담 3.595%",
          "장기요양보험료율 — 2026년 건강보험료의 13.14%",
        ]}
      />

      <AdSlot slot="home-bottom" />
    </div>
  );
}
