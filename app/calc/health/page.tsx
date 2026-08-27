import type { Metadata } from "next";
import CalcGuides from "@/components/CalcGuides";
import NextStep from "@/components/NextStep";
import RelatedTools from "@/components/RelatedTools";
import Link from "next/link";
import HealthCalculator from "@/components/HealthCalculator";
import AdSlot from "@/components/AdSlot";
import CalcNotes from "@/components/CalcNotes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "퇴사 후 건강보험 계산기 — 임의계속가입 보험료·신청기한",
  description:
    "퇴직하면 건강보험료가 오릅니다. 임의계속가입으로 최대 36개월 직장가입자 보험료를 유지할 때의 월 보험료와, 놓치면 영구히 못 하는 신청 마감일을 계산합니다.",
  alternates: { canonical: "/calc/health" },
};

const faq = [
  {
    q: "퇴사하면 건강보험료가 왜 오르나요?",
    a: "부과 기준이 통째로 바뀌기 때문입니다. 직장가입자일 때는 급여에만 보험료가 붙었고 그마저도 회사가 절반을 냈습니다. 퇴사해서 지역가입자가 되면 소득뿐 아니라 재산과 자동차까지 점수로 환산해 보험료를 매기고, 전액을 본인이 냅니다. 소득이 끊긴 시점에 보험료가 오히려 오르는 셈이라 '퇴직 후 건보료 폭탄'이라고들 합니다. 집 한 채 있는 경우 특히 크게 뜁니다.",
  },
  {
    q: "임의계속가입을 하면 얼마를 내나요?",
    a: "퇴직 전 12개월 보수월액 평균을 기준으로 산정하되, 사업주 부담분 없이 본인부담분만 냅니다. 결과적으로 회사 다닐 때 급여명세서에서 빠져나가던 건강보험료와 같은 금액입니다. 보수월액도 퇴직 시점 기준으로 고정되므로, 재직 중 내던 금액이 최대 36개월간 그대로 유지됩니다.",
  },
  {
    q: "신청 기한이 언제까지인가요?",
    a: "지역가입자 보험료의 최초 납부기한으로부터 2개월 이내입니다. 이 기한은 연장도 구제도 없습니다. 퇴사하고 경황이 없는 사이 첫 고지서를 흘려보내면 그대로 끝나고, 이후 내내 지역가입자 보험료를 내야 합니다. 퇴사하면 첫 건강보험 고지서가 언제 오는지부터 챙기세요.",
  },
  {
    q: "무조건 임의계속가입이 유리한가요?",
    a: "대개 그렇지만 항상은 아닙니다. 재산이 거의 없고 소득도 없다면 지역가입자 보험료가 더 쌀 수 있습니다. 반대로 집이나 차가 있으면 임의계속가입이 훨씬 유리합니다. 건강보험공단 홈페이지의 지역보험료 모의계산으로 양쪽을 비교한 뒤 정하세요. 한 번 임의계속가입을 하면 중간에 지역가입자로 바꿀 수도 있습니다.",
  },
  {
    q: "피부양자로 들어가면 안 되나요?",
    a: "가능하다면 그쪽이 먼저입니다. 배우자나 부모의 직장보험에 피부양자로 등재되면 보험료가 0원입니다. 다만 소득·재산 기준을 넘으면 자격이 안 됩니다. 참고로 실업급여는 피부양자 자격 판단에서 소득으로 보지 않으므로, 실업급여를 받는다는 이유로 자격을 잃지는 않습니다.",
  },
];

export default function HealthPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "퇴사 후 건강보험 계산기" },
        ],
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="mb-2 text-2xl font-extrabold">퇴사 후 건강보험 계산기</h1>
      <p className="mb-6 text-muted">
        임의계속가입으로 최대 36개월 직장가입자 보험료를 유지할 때의 월
        보험료와, 놓치면 영구히 못 하는 신청 마감일을 계산합니다.
      </p>

      <HealthCalculator />

      <NextStep calc="/calc/health" />

      <AdSlot slot="health-below-tool" />

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-xl font-bold">
          소득이 끊겼는데 보험료가 오릅니다
        </h2>
        <p>
          퇴사하면 직장가입자 자격이 다음날 사라지고, 둘 중 하나가 됩니다.
          배우자나 부모의 직장보험에 <strong>피부양자</strong>로 들어가거나,
          <strong> 지역가입자</strong>가 되거나입니다.
        </p>
        <p>
          문제는 지역가입자입니다. 직장가입자일 때는 급여에만 보험료가 붙었고
          회사가 절반을 냈습니다. 지역가입자는 다릅니다. 소득은 물론{" "}
          <strong>재산과 자동차까지</strong> 점수로 환산해 보험료를 매기고,
          전액을 본인이 냅니다. 소득이 0이 된 시점에 보험료가 오히려 오르는
          역설이 벌어집니다. 집 한 채 있는 사람이라면 두세 배로 뛰는 일도
          드물지 않습니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          임의계속가입 — 36개월 동안 시간을 벌 수 있습니다
        </h2>
        <p>
          이 상황을 완충하려고 만든 것이 임의계속가입입니다. 퇴직 직전 18개월
          동안 직장가입자였던 기간이 통산 12개월 이상이면 신청할 수 있고,
          최대 <strong>36개월</strong>간 직장가입자 시절 보험료를 유지합니다.
        </p>
        <p>
          보험료는 퇴직 전 12개월 보수월액 평균을 기준으로 산정하되{" "}
          <strong>본인부담분만</strong> 냅니다. 사업주 부담분이 빠지므로,
          결과적으로 회사 다닐 때 급여명세서에서 빠져나가던 금액과 같아집니다.
          재산이 얼마든 자동차가 몇 대든 계산에 들어가지 않습니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          신청 기한 2개월 — 놓치면 되돌릴 수 없습니다
        </h2>
        <p>
          이 제도에서 가장 중요한 것은 금액이 아니라 <strong>기한</strong>입니다.
          지역가입자 보험료의 최초 납부기한으로부터 2개월 이내에 신청해야
          합니다. <strong>연장도 구제도 없습니다.</strong>
        </p>
        <p>
          퇴사 직후는 정신이 없습니다. 실업급여 신청하랴 이력서 쓰랴 바쁜
          사이에 건강보험 고지서 한 장이 우편함에 쌓여 있다가 기한을 넘기는
          일이 흔합니다. 그러면 남은 기간 내내 지역가입자 보험료를 내야 합니다.
          36개월치를 합치면 수백만원 차이가 납니다.
        </p>
        <p>
          퇴사하면 <strong>첫 건강보험 고지서가 언제 오는지부터</strong>{" "}
          확인하세요. 고지서에 적힌 납부기한에 2개월을 더한 날이 마감일입니다.
          위 계산기에 그 날짜를 넣으면 D-day를 계산해 드립니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          순서는 피부양자 → 임의계속 → 지역가입자
        </h2>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            <strong>피부양자</strong> — 가능하면 무조건 이쪽입니다. 보험료가
            0원입니다. 배우자·부모·자녀의 직장보험에 등재하며, 소득·재산
            기준을 넘지 않아야 합니다. 실업급여는 소득으로 보지 않습니다.
          </li>
          <li>
            <strong>임의계속가입</strong> — 피부양자가 안 되면 이쪽입니다.
            재산이 있는 사람일수록 유리합니다.
          </li>
          <li>
            <strong>지역가입자</strong> — 위 둘이 안 될 때입니다. 재산이 거의
            없고 소득도 없다면 오히려 이쪽이 쌀 수도 있으니, 공단 모의계산으로
            비교해 보세요.
          </li>
        </ol>

        <h2 className="mt-8 text-xl font-bold">자주 묻는 질문</h2>
        <dl className="space-y-4">
          {faq.map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl border border-border-soft bg-card p-4 shadow-sm"
            >
              <dt className="font-bold">
                <span className="text-accent">Q.</span> {q}
              </dt>
              <dd className="mt-2 text-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <CalcNotes
        updated="2026-08-19"
        basis={[
          {
            law: "국민건강보험법 제110조 (실업자에 대한 특례)",
            detail:
              "사용관계가 끝난 사람 중 직장가입자 자격을 유지한 기간이 퇴직 직전 18개월 동안 통산 1년 이상인 사람은, 지역가입자가 된 이후 최초로 고지받은 지역보험료 납부기한부터 2개월이 지나기 전에 신청하면 임의계속가입자가 될 수 있습니다.",
          },
          {
            law: "국민건강보험법 시행령 제77조",
            detail:
              "임의계속가입자의 보수월액은 퇴직 전 12개월간 받은 보수월액을 평균한 금액으로 하며, 보험료는 사업주 부담분 없이 가입자 본인이 전부 부담합니다. 유지 기간은 최대 36개월입니다.",
          },
          {
            law: "2026년 보험료율",
            detail:
              "건강보험료율은 보수월액의 7.19%이며 이 중 본인부담은 절반인 3.595%입니다. 장기요양보험료는 건강보험료의 13.14%입니다. 매년 초 보건복지부가 고시합니다.",
          },
        ]}
        note="지역가입자 보험료는 여기서 계산하지 않습니다. 소득·재산·자동차를 점수로 환산하는 방식이고 점수표가 매년 바뀌어, 어설픈 추정이 오히려 잘못된 판단을 부르기 때문입니다. 두 쪽을 비교하려면 건강보험공단의 지역보험료 모의계산을 이용하세요. 임의계속가입 중에도 지역가입자로 전환할 수 있으므로, 나중에 재산이 줄면 다시 비교해 볼 수 있습니다."
        examples={[
          {
            title: "보수월액 평균 350만원 · 직장가입 24개월",
            steps: [
              "건강보험료 = 3,500,000 × 3.595% = 125,820원",
              "장기요양보험료 = 125,820 × 13.14% = 16,530원",
              "월 합계 = 142,350원",
              "36개월 유지 시 = 5,124,600원",
            ],
            result: "월 142,350원 — 재직 중 급여에서 빠지던 금액과 같습니다",
          },
          {
            title: "보수월액 평균 500만원",
            steps: [
              "건강보험료 = 5,000,000 × 3.595% = 179,750원",
              "장기요양보험료 = 179,750 × 13.14% = 23,620원",
            ],
            result: "월 203,370원",
          },
          {
            title: "직장가입 11개월 — 자격이 안 됩니다",
            steps: [
              "퇴직 직전 18개월 중 직장가입 기간 11개월 < 12개월",
              "이전 직장 기간이 그 18개월 안에 있다면 합산 가능",
              "합산해도 12개월에 못 미치면 지역가입자로 전환",
            ],
            result: "1개월이 모자라 임의계속가입을 할 수 없습니다",
          },
        ]}
        pitfalls={[
          {
            heading: "기한을 놓치면 영구히 못 합니다",
            body:
              "최초 지역보험료 납부기한부터 2개월. 이 기한은 연장도 구제도 없습니다. 퇴사하면 첫 고지서가 언제 오는지부터 확인하고, 받자마자 납부기한에 2개월을 더한 날을 달력에 적어 두세요.",
          },
          {
            heading: "이전 직장 기간도 합산됩니다",
            body:
              "퇴직 직전 18개월 안에 있는 직장가입 기간은 회사가 달라도 통산합니다. 최근 직장이 짧아도 그 전 직장을 합쳐 12개월이 되면 자격이 있으니, 포기하기 전에 공단에 확인하세요.",
          },
          {
            heading: "피부양자가 가능한지부터 보세요",
            body:
              "보험료 0원인 선택지가 있는데 임의계속가입부터 알아보는 경우가 많습니다. 배우자·부모의 직장보험에 등재할 수 있는지 먼저 확인하세요. 실업급여는 피부양자 소득 판단에 들어가지 않습니다.",
          },
          {
            heading: "36개월이 지나면 지역가입자가 됩니다",
            body:
              "임의계속가입은 최대 36개월입니다. 그 뒤에는 자동으로 지역가입자로 전환되므로, 3년 안에 재취업하거나 피부양자 등재를 준비해 두는 것이 좋습니다.",
          },
        ]}
        sources={[
          { label: "국민건강보험공단 (고객센터 1577-1000)", href: "https://www.nhis.or.kr" },
          { label: "건보공단 지역보험료 모의계산", href: "https://www.nhis.or.kr/nhis/policy/wbhadi01500m01.do" },
          { label: "국가법령정보센터", href: "https://www.law.go.kr" },
          { label: "실업급여 계산기", href: "/calc/benefit" },
        ]}
      />

      <section className="mt-10 rounded-2xl border border-border-soft bg-card p-5">
        <h2 className="mb-3 font-bold">함께 확인하세요</h2>
        <ul className="space-y-2 text-[15px]">
          <li>
            <Link
              href="/calc/eligibility"
              className="text-accent underline-offset-4 hover:underline"
            >
              수급자격·신청기한 계산기 →
            </Link>
          </li>
          <li>
            <Link
              href="/calc/benefit"
              className="text-accent underline-offset-4 hover:underline"
            >
              실업급여 계산기 →
            </Link>
          </li>
          <li>
            <Link
              href="/guide/after-quitting-checklist"
              className="text-accent underline-offset-4 hover:underline"
            >
              퇴사하고 2주 안에 해야 할 일 →
            </Link>
          </li>
          {/* 임의계속가입보다 먼저 확인해야 할 선택지 — 자격이 되면 보험료가 0원이라
              이 계산기의 결과 자체가 필요 없어진다. 건강보험노트로 보낸다. */}
          <li>
            <a
              href="https://health.lifebanjang.com/calc/dependent"
              className="text-accent underline-offset-4 hover:underline"
            >
              피부양자 자격 판정 (건강보험노트) →
            </a>
            <span className="block text-sm text-muted">
              가족의 피부양자가 되면 보험료가 0원입니다. 임의계속가입보다 먼저
              확인해 볼 선택지입니다.
            </span>
          </li>
        </ul>
      </section>
      <CalcGuides calcHref="/calc/health" />
      <RelatedTools calc="/calc/health" />
    </div>
  );
}
