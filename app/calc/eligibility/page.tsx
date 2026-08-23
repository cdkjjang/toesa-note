import type { Metadata } from "next";
import CalcGuides from "@/components/CalcGuides";
import Link from "next/link";
import EligibilityCalculator from "@/components/EligibilityCalculator";
import AdSlot from "@/components/AdSlot";
import CalcNotes from "@/components/CalcNotes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "실업급여 수급자격 · 신청기한 계산기",
  description:
    "퇴사 사유와 고용보험 가입일수로 수급자격을 판정하고, 수급기간 만료일까지 며칠 남았는지, 늦게 신청하면 며칠치를 못 받는지 계산합니다.",
  alternates: { canonical: "/calc/eligibility" },
};

const faq = [
  {
    q: "자진 퇴사인데 정말 못 받나요?",
    a: "원칙적으로는 못 받지만 예외가 꽤 넓습니다. 고용보험법 시행규칙 별표2가 '정당한 이직 사유'를 정하고 있습니다. 두 달 이상 임금이 체불됐거나, 최저임금에 미달했거나, 직장 내 괴롭힘·성희롱을 당했거나, 사업장 이전으로 통근이 왕복 3시간 이상 걸리게 됐거나, 질병으로 업무 수행이 어려운데 회사가 배치전환을 해주지 않은 경우 등입니다. 증빙이 관건이므로 퇴사 전에 자료를 모아 두는 것이 좋습니다.",
  },
  {
    q: "수급기간과 소정급여일수는 뭐가 다른가요?",
    a: "소정급여일수는 '며칠치를 받을 자격이 있는가'이고, 수급기간은 '언제까지 받을 수 있는가'입니다. 소정급여일수가 270일이어도 수급기간(이직일 다음날부터 12개월)이 끝나면 남은 일수는 사라집니다. 늦게 신청할수록 못 받는 날이 늘어나는 구조라, 이 둘을 같은 것으로 생각하면 손해를 봅니다.",
  },
  {
    q: "피보험단위기간 180일은 근무일수인가요?",
    a: "달력상 날짜가 아니라 보수를 받은 날을 셉니다. 주 5일 근무자라면 유급휴일인 주휴일이 포함되어 대체로 주 6일씩 쌓입니다. 따라서 180일을 채우려면 대략 7~8개월 근무가 필요합니다. 이전 직장 기간도 이직 전 18개월 안에 있고 그 사이 실업급여를 받은 적이 없다면 합산됩니다.",
  },
  {
    q: "계약만료인데 회사가 재계약을 제안했다면요?",
    a: "재계약 제안을 거절하면 자발적 퇴사로 처리될 수 있습니다. 반대로 근로자가 계속 일하기를 원했는데 회사가 거절한 경우는 수급 사유가 됩니다. 이직확인서에 어떤 상실코드가 적히는지가 결정적이므로, 사실과 다르면 정정을 요청하세요.",
  },
  {
    q: "당장 일할 수 없는 상태면 어떻게 하나요?",
    a: "질병·부상·임신·출산·육아 등으로 즉시 취업할 수 없다면 수급기간 연기를 신청할 수 있습니다. 최대 4년까지 시계를 멈춰 둘 수 있어, 회복한 뒤에 온전히 받을 수 있습니다. 이 신청을 하지 않고 시간을 보내면 수급기간이 그냥 흘러가 버립니다.",
  },
];

export default function EligibilityPage() {
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
          { "@type": "ListItem", position: 2, name: "수급자격·신청기한 계산기" },
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
      <h1 className="mb-2 text-2xl font-extrabold">
        수급자격 · 신청기한 계산기
      </h1>
      <p className="mb-6 text-muted">
        받을 수 있는지 네 가지 요건으로 판정하고, 언제까지 신청해야 손해가
        없는지 날짜로 보여줍니다.
      </p>

      <EligibilityCalculator />

      <AdSlot slot="eligibility-below-tool" />

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-xl font-bold">네 가지를 모두 만족해야 합니다</h2>
        <p>
          실업급여 수급 요건은 고용보험법 제40조에 있습니다. 하나라도 빠지면
          받을 수 없습니다.
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>피보험단위기간 180일</strong> — 이직 전 18개월 동안 보수를
            받은 날이 통산 180일 이상
          </li>
          <li>
            <strong>비자발적 이직</strong> — 회사 사정으로 그만두었을 것. 자진
            퇴사는 정당한 사유가 있어야 함
          </li>
          <li>
            <strong>근로의 의사와 능력</strong> — 지금 바로 일할 수 있는 상태일 것
          </li>
          <li>
            <strong>적극적인 재취업 노력</strong> — 실업인정일마다 구직활동을
            증명할 것
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-bold">
          가장 많이 놓치는 것 — 수급기간 12개월
        </h2>
        <p>
          &ldquo;나중에 천천히 신청해도 어차피 다 받는다&rdquo;고 생각하는
          분이 많습니다. 사실이 아닙니다. 수급기간은{" "}
          <strong>이직일 다음날부터 12개월</strong>이고, 이 날짜가 지나면
          소정급여일수가 남아 있어도 지급이 끊깁니다.
        </p>
        <p>
          예를 들어 소정급여일수가 270일인 사람이 퇴사 후 다섯 달을 쉬다가
          신청하면, 남은 수급기간이 213일이라 <strong>57일치가 그대로
          사라집니다.</strong> 하한액 기준으로 약 376만원입니다. 되돌릴 방법은
          없습니다.
        </p>
        <p>
          그래서 퇴사하면 재취업 계획이 있든 없든 일단 워크넷 구직등록과
          수급자격 신청부터 해 두는 편이 안전합니다. 신청한다고 해서 반드시
          받아야 하는 것도 아니고, 중간에 취업하면{" "}
          <Link
            href="/calc/early"
            className="text-accent underline-offset-4 hover:underline"
          >
            조기재취업수당
          </Link>
          을 받을 수도 있습니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          자진 퇴사여도 받을 수 있는 경우가 있습니다
        </h2>
        <p>
          고용보험법 시행규칙 별표2는 &lsquo;정당한 이직 사유&rsquo;를 열거하고
          있습니다. 자발적으로 그만두었더라도 여기에 해당하면 수급할 수
          있습니다. 대표적인 것들입니다.
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>이직 전 1년 안에 2개월 이상 임금이 체불된 경우</li>
          <li>최저임금에 미달하는 임금을 받은 경우</li>
          <li>직장 내 괴롭힘·성희롱·차별을 당한 경우</li>
          <li>
            사업장 이전이나 전근으로 통근이 왕복 3시간 이상 걸리게 된 경우
          </li>
          <li>
            질병·부상으로 업무 수행이 어려운데 회사가 휴직이나 배치전환을
            거부한 경우
          </li>
          <li>
            임신·출산·육아로 계속 일하기 어려운데 휴직이 허용되지 않은 경우
          </li>
          <li>회사가 폐업하거나 대량 감원이 예정된 경우</li>
        </ul>
        <p>
          <strong>증빙이 전부입니다.</strong> 임금체불이면 급여명세서와 통장
          내역, 괴롭힘이면 메신저 기록·녹취·동료 진술, 질병이면 진단서가
          필요합니다. 퇴사한 뒤에는 자료를 모으기가 훨씬 어려우니 나오기 전에
          챙겨 두세요.
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
            law: "고용보험법 제40조 (구직급여의 수급 요건)",
            detail:
              "이직 전 18개월(기준기간) 동안 피보험단위기간이 통산 180일 이상이어야 하고, 근로의 의사와 능력이 있는데 취업하지 못한 상태여야 하며, 재취업을 위해 적극적으로 노력해야 합니다.",
          },
          {
            law: "고용보험법 제58조 (이직 사유에 따른 수급자격의 제한)",
            detail:
              "중대한 귀책사유로 해고되거나 정당한 사유 없이 자발적으로 이직한 경우 수급자격이 제한됩니다. 정당한 사유는 시행규칙 별표2에 열거돼 있습니다.",
          },
          {
            law: "고용보험법 제48조 (수급기간)",
            detail:
              "이직일 다음날부터 12개월 이내에 소정급여일수를 한도로 지급합니다. 질병·임신·출산·육아 등으로 취업할 수 없으면 최대 4년까지 수급기간을 연기할 수 있습니다.",
          },
          {
            law: "고용보험법 제49조 (대기기간)",
            detail:
              "수급자격 인정일부터 7일간은 대기기간으로 보아 구직급여를 지급하지 않습니다. 소정급여일수를 온전히 받으려면 이 7일도 수급기간 안에 들어가야 합니다.",
          },
        ]}
        note="이 판정은 공개된 법령 기준을 코드로 옮긴 참고용입니다. 최종 판단은 고용센터가 합니다. 특히 이직 사유는 회사가 제출한 이직확인서의 상실코드로 결정되며, 본인이 생각하는 사유와 다르게 기재되는 경우가 적지 않습니다. 이직확인서는 고용보험 홈페이지에서 확인할 수 있고 사실과 다르면 정정을 요청할 수 있습니다."
        examples={[
          {
            title: "권고사직 · 가입 400일 · 2026-06-30 퇴사 · 오늘 2026-08-19",
            steps: [
              "피보험단위기간 400일 ≥ 180일 → 통과",
              "권고사직은 비자발적 이직 → 통과",
              "수급기간 시작 = 이직일 다음날 2026-07-01",
              "수급기간 만료 = 2027-07-01 (316일 남음)",
              "소정급여일수 180일 < 316일 → 전부 수령 가능",
            ],
            result: "수급 가능 · 2026-11-26까지 신청하면 180일 전부 수령",
          },
          {
            title: "같은 조건인데 5개월 늦게 신청하면",
            steps: [
              "2026-11-30에 신청 → 만료까지 213일 남음",
              "소정급여일수가 270일이라면 213일밖에 소화 못 함",
              "270 − 213 = 57일치 소멸",
            ],
            result: "57일치(하한액 기준 약 376만원)를 못 받고 끝납니다",
          },
          {
            title: "가입 150일 — 30일이 모자랍니다",
            steps: [
              "피보험단위기간 150일 < 180일 → 탈락",
              "이직 전 18개월 안에 다른 직장 기간이 있는지 확인",
              "그 기간에 실업급여를 받은 적이 없다면 합산 가능",
            ],
            result: "합산해도 180일에 못 미치면 수급할 수 없습니다",
          },
        ]}
        pitfalls={[
          {
            heading: "피보험단위기간은 달력 날짜가 아닙니다",
            body:
              "보수를 받은 날만 셉니다. 주 5일 근무자는 유급 주휴일이 포함돼 주 6일씩 쌓이고, 무급휴일과 결근일은 빠집니다. 7~8개월 근무하면 대체로 180일이 채워집니다.",
          },
          {
            heading: "이직확인서의 상실코드를 꼭 확인하세요",
            body:
              "권고사직으로 나왔다고 알고 있었는데 '개인사정으로 인한 자진 퇴사'로 기재되는 경우가 있습니다. 고용보험 홈페이지에서 확인할 수 있고, 사실과 다르면 정정을 요청하거나 고용센터에 이의를 제기할 수 있습니다.",
          },
          {
            heading: "아파서 일을 못 할 때는 연기 신청부터",
            body:
              "질병·출산·육아로 즉시 취업이 어렵다면 수급기간 연기를 신청하세요. 최대 4년까지 시계를 멈출 수 있습니다. 이 신청 없이 시간을 보내면 12개월이 그냥 흘러가 버립니다.",
          },
          {
            heading: "실업인정을 안 받으면 그 회차는 지급되지 않습니다",
            body:
              "수급자격을 인정받은 뒤에도 1~4주마다 실업인정을 받아야 그 기간분이 나옵니다. 정해진 날에 신청하지 않으면 해당 기간은 지급되지 않습니다. 재취업활동 증빙도 함께 제출해야 합니다.",
          },
        ]}
        sources={[
          { label: "고용보험 홈페이지", href: "https://www.ei.go.kr" },
          { label: "워크넷 구직등록", href: "https://www.work24.go.kr" },
          { label: "고용노동부 고객상담센터 1350", href: "https://www.moel.go.kr" },
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
              href="/calc/health"
              className="text-accent underline-offset-4 hover:underline"
            >
              퇴사 후 건강보험 계산기 →
            </Link>
          </li>
          <li>
            <Link
              href="/guide/voluntary-resignation-exceptions"
              className="text-accent underline-offset-4 hover:underline"
            >
              자진 퇴사인데 실업급여를 받는 경우 →
            </Link>
          </li>
        </ul>
      </section>
      <CalcGuides calcHref="/calc/eligibility" />
    </div>
  );
}
