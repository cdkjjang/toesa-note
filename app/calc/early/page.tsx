import type { Metadata } from "next";
import CalcGuides from "@/components/CalcGuides";
import Link from "next/link";
import EarlyReemploymentCalculator from "@/components/EarlyReemploymentCalculator";
import AdSlot from "@/components/AdSlot";
import CalcNotes from "@/components/CalcNotes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "조기재취업수당 계산기 — 남은 실업급여의 절반",
  description:
    "실업급여를 받다가 일찍 취업하면 남은 구직급여의 절반을 받습니다. 다섯 가지 요건을 하나씩 확인하고 예상 금액을 계산합니다.",
  alternates: { canonical: "/calc/early" },
};

const faq = [
  {
    q: "조기재취업수당은 언제 신청하나요?",
    a: "재취업한 날이 아니라 12개월을 채운 뒤에 신청합니다. 재취업일로부터 12개월이 지난 날의 다음날부터 3년 이내에 청구하면 됩니다. 취업하고 정신없이 지내다 이 사실을 잊어 못 받는 경우가 가장 흔합니다. 취업이 확정되면 달력에 1년 뒤 날짜를 표시해 두세요.",
  },
  {
    q: "일찍 취업하면 손해 아닌가요?",
    a: "아닙니다. 실업급여를 끝까지 받으면 남은 일수 전부를 받지만, 그동안 소득이 없습니다. 일찍 취업하면 남은 금액의 절반을 받으면서 월급도 함께 법니다. 남은 실업급여가 하루 66,048원인데 월급이 그보다 많다면, 계산할 것도 없이 취업하는 쪽이 이득입니다. 이 제도 자체가 '빨리 취업하면 손해'라는 생각을 막으려고 만들어진 것입니다.",
  },
  {
    q: "절반을 남겨야 한다는 게 정확히 무슨 뜻인가요?",
    a: "재취업일 전날을 기준으로 소정급여일수의 2분의 1 이상이 남아 있어야 합니다. 소정급여일수가 210일이라면 105일치를 받기 전에 취업해야 한다는 뜻입니다. 106일치를 받고 취업하면 하루 차이로 한 푼도 못 받습니다. 취업이 가까워졌다면 실업인정 신청 시점을 확인해 보세요.",
  },
  {
    q: "자영업을 시작해도 받을 수 있나요?",
    a: "받을 수 있습니다. 사업자등록을 하고 실제로 사업을 영위하면서 12개월 이상 계속하면 됩니다. 다만 형식적인 사업자등록만으로는 인정되지 않고, 사업 실적을 증명해야 합니다. 고용센터가 요구하는 서류가 취업의 경우보다 많습니다.",
  },
  {
    q: "퇴사한 회사에 다시 들어가면요?",
    a: "받을 수 없습니다. 이직 전 사업주에게 재고용된 경우는 지급 대상에서 제외됩니다. 계열사나 관련 회사로 옮기는 경우도 실질적으로 같은 사업주로 판단되면 제외될 수 있습니다.",
  },
];

export default function EarlyPage() {
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
          { "@type": "ListItem", position: 2, name: "조기재취업수당 계산기" },
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
      <h1 className="mb-2 text-2xl font-extrabold">조기재취업수당 계산기</h1>
      <p className="mb-6 text-muted">
        실업급여를 받다가 일찍 취업하면 남은 금액의 절반을 받습니다. 요건
        다섯 가지를 하나씩 확인하고 금액을 계산합니다.
      </p>

      <EarlyReemploymentCalculator />

      <AdSlot slot="early-below-tool" />

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-xl font-bold">
          왜 이런 제도가 있나
        </h2>
        <p>
          실업급여를 받는 동안 좋은 자리를 제안받으면 이런 생각이 듭니다.
          &ldquo;지금 취업하면 남은 실업급여를 못 받는데, 조금 더 기다렸다
          갈까.&rdquo; 실제로 이런 이유로 취업을 미루는 일이 생기자, 정부가
          만든 장치가 조기재취업수당입니다. 일찍 취업해도 남은 금액의 절반은
          챙겨 주니 미룰 이유가 없게 만든 것입니다.
        </p>
        <p>
          계산해 보면 대부분 일찍 취업하는 쪽이 확실히 이득입니다. 소정급여일수
          210일 중 60일치를 받은 시점에 취업한다고 해봅시다. 남은 150일치는
          991만원인데, 조기재취업수당으로 그 절반인 <strong>495만원</strong>을
          받습니다. 495만원이 줄어든 것 같지만, 그 150일(5개월) 동안{" "}
          <strong>월급을 받습니다.</strong> 월 250만원이면 1,250만원입니다.
          비교가 되지 않습니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          다섯 가지 요건 — 하나라도 빠지면 0원입니다
        </h2>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            <strong>소정급여일수를 1/2 이상 남기고 재취업</strong> — 재취업일
            전날 기준입니다. 210일이면 105일치를 받기 전에 취업해야 합니다.
          </li>
          <li>
            <strong>실업 신고일부터 14일이 지난 뒤 재취업</strong> — 신고하자마자
            바로 취업한 경우는 제외됩니다.
          </li>
          <li>
            <strong>12개월 이상 계속 고용</strong> — 65세 이상은 6개월입니다.
            자영업이면 12개월 이상 사업을 영위해야 합니다.
          </li>
          <li>
            <strong>최근 2년 내 조기재취업수당 수급 이력 없음</strong> — 2년 안에
            받은 적이 있으면 다시 받지 못합니다.
          </li>
          <li>
            <strong>이직 전 사업주가 아닐 것</strong> — 퇴사한 회사에 다시
            들어가면 제외됩니다.
          </li>
        </ol>

        <h2 className="mt-8 text-xl font-bold">
          신청을 잊어서 못 받는 사람이 가장 많습니다
        </h2>
        <p>
          이 제도에서 가장 흔한 실패는 요건 미달이 아니라{" "}
          <strong>신청을 잊는 것</strong>입니다. 조기재취업수당은 재취업한 날
          바로 신청하는 것이 아니라, <strong>12개월을 채운 다음에</strong>{" "}
          신청합니다. 재취업일로부터 12개월이 지난 날의 다음날부터 3년 이내에
          청구해야 합니다.
        </p>
        <p>
          새 직장에 적응하며 1년을 보내고 나면 실업급여를 받던 시절은 기억에서
          멀어집니다. 그래서 자격이 되는데도 청구하지 않아 소멸시키는 경우가
          적지 않습니다. 취업이 확정되면 <strong>1년 뒤 날짜를 달력에
          표시해 두세요.</strong> 그것만으로 수백만원이 갈립니다.
        </p>

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
            law: "고용보험법 제64조 (조기재취업 수당)",
            detail:
              "수급자격자가 안정된 직업에 재취업하거나 스스로 영리를 목적으로 하는 사업을 영위하는 경우, 소정급여일수를 2분의 1 이상 남기고 재취업했다면 조기재취업수당을 지급합니다. 금액은 구직급여일액에 미지급일수의 2분의 1을 곱한 금액입니다.",
          },
          {
            law: "고용보험법 시행령 제84조",
            detail:
              "12개월 이상 계속 고용될 것으로 인정되는 경우에 지급합니다. 이직일 당시 65세 이상인 사람은 6개월 이상으로 완화됩니다. 실업의 신고일부터 14일이 지난 후 재취업해야 합니다.",
          },
          {
            law: "고용보험법 제64조 제2항 (수급 제한)",
            detail:
              "재취업한 날 또는 사업을 시작한 날 이전 2년 이내에 조기재취업수당을 지급받은 사실이 있으면 지급하지 않습니다. 이직 전 사업주에게 다시 고용된 경우도 제외됩니다.",
          },
          {
            law: "청구 기한",
            detail:
              "재취업일로부터 12개월이 지난 날의 다음날부터 3년 이내에 청구해야 합니다. 재취업 직후가 아니라 고용 기간 요건을 채운 뒤에 신청하는 구조입니다.",
          },
        ]}
        note="요건 충족 여부의 최종 판단은 고용센터가 합니다. 특히 '12개월 이상 계속 고용'은 실제 근무 실적으로 확인하며, 자영업의 경우 사업 실적 증빙이 추가로 필요합니다. 계약직으로 취업한 경우 계약기간이 12개월 미만이면 지급되지 않을 수 있으니 미리 확인하세요."
        examples={[
          {
            title: "210일 중 60일 수령 후 취업 · 일액 66,048원",
            steps: [
              "남은 일수 = 210 − 60 = 150일",
              "남은 비율 = 150 ÷ 210 = 71% ≥ 50% → 통과",
              "조기재취업수당 = 66,048 × 150 × 1/2",
            ],
            result: "4,953,600원 (12개월 근속 후 청구)",
          },
          {
            title: "같은 조건인데 120일치를 받고 취업하면",
            steps: [
              "남은 일수 = 210 − 120 = 90일",
              "남은 비율 = 90 ÷ 210 = 43% < 50% → 탈락",
              "요건을 채웠다면 받았을 금액 = 66,048 × 90 × 1/2 = 2,972,160원",
            ],
            result: "0원 — 15일 차이로 약 297만원을 놓칩니다",
          },
          {
            title: "끝까지 받는 것과의 비교 (150일 남은 경우)",
            steps: [
              "계속 수급 = 66,048 × 150 = 9,907,200원 (5개월간 소득 없음)",
              "조기취업 = 4,953,600원 + 5개월치 월급",
              "월 250만원이면 5개월에 12,500,000원",
            ],
            result: "조기취업 쪽이 약 750만원 유리합니다",
          },
        ]}
        pitfalls={[
          {
            heading: "재취업 직후에 신청하는 것이 아닙니다",
            body:
              "12개월을 채운 뒤에 신청합니다. 재취업일로부터 12개월이 지난 날의 다음날부터 3년 이내가 청구 기간입니다. 잊고 지내다 못 받는 사례가 가장 많으니 달력에 표시해 두세요.",
          },
          {
            heading: "하루 차이로 전액이 갈립니다",
            body:
              "소정급여일수의 절반을 넘겨 받으면 요건이 무너집니다. 210일이면 105일이 경계입니다. 취업일이 정해졌다면 그 전에 실업인정을 몇 회까지 받았는지 세어 보세요.",
          },
          {
            heading: "계약직은 계약기간을 먼저 확인하세요",
            body:
              "12개월 이상 계속 고용이 요건이라, 계약기간이 12개월 미만이면 지급되지 않을 수 있습니다. 갱신이 예정돼 있어도 실제로 12개월을 채워야 합니다.",
          },
          {
            heading: "2년 내 수급 이력이 있으면 제외됩니다",
            body:
              "이전에 조기재취업수당을 받고 2년이 지나지 않았다면 다시 받을 수 없습니다. 이직이 잦은 경우 이 조항에 걸리기 쉽습니다.",
          },
        ]}
        sources={[
          { label: "고용보험 홈페이지", href: "https://www.ei.go.kr" },
          { label: "고용노동부 고객상담센터 1350", href: "https://www.moel.go.kr" },
          { label: "국가법령정보센터", href: "https://www.law.go.kr" },
          { label: "실업급여 계산기", href: "/calc/benefit" },
        ]}
      />

      <section className="mt-10 rounded-2xl border border-border-soft bg-card p-5">
        <h2 className="mb-3 font-bold">함께 확인하세요</h2>
        <ul className="space-y-2 text-[15px]">
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
              href="/calc/eligibility"
              className="text-accent underline-offset-4 hover:underline"
            >
              수급자격·신청기한 계산기 →
            </Link>
          </li>
          <li>
            <Link
              href="/guide/early-reemployment-timing"
              className="text-accent underline-offset-4 hover:underline"
            >
              언제 취업해야 가장 이득인가 →
            </Link>
          </li>
        </ul>
      </section>
      <CalcGuides calcHref="/calc/early" />
    </div>
  );
}
