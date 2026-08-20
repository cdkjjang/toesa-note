import type { Metadata } from "next";
import Link from "next/link";
import JobseekerCalculator from "@/components/JobseekerCalculator";
import AdSlot from "@/components/AdSlot";
import CalcNotes from "@/components/CalcNotes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "실업급여 계산기 — 얼마를 며칠 받는지 30초 만에",
  description:
    "월급과 나이, 고용보험 가입기간을 넣으면 구직급여 일액과 소정급여일수, 예상 총액을 계산합니다. 2026년 상한 68,100원·하한 66,048원 반영.",
  alternates: { canonical: "/calc/benefit" },
};

const faq = [
  {
    q: "실업급여는 평균임금의 60%라던데 왜 계산이 다르게 나오나요?",
    a: "상한액과 하한액에 걸리기 때문입니다. 2026년 기준 하한액은 66,048원, 상한액은 68,100원으로 둘의 차이가 2,052원뿐입니다. 60%를 역산하면 월급 약 334만원 미만이면 무조건 하한액, 약 344만원을 넘으면 무조건 상한액입니다. 결국 '60%'가 실제로 적용되는 사람은 그 사이 구간에 있는 소수뿐이고, 대부분은 월급과 무관하게 같은 금액을 받습니다.",
  },
  {
    q: "월급이 200만원인 사람과 320만원인 사람이 같은 금액을 받나요?",
    a: "네, 같습니다. 둘 다 60%를 적용하면 하한액에 미치지 못해 하한액 66,048원을 받습니다. 실업급여가 저임금 근로자의 생활을 보장하는 쪽으로 설계돼 있어서 그렇습니다. 다만 받는 일수는 고용보험 가입기간과 나이에 따라 다르므로 총액은 달라질 수 있습니다.",
  },
  {
    q: "2025년에 퇴사했는데 2026년 상한액을 받을 수 있나요?",
    a: "받을 수 없습니다. 상한액은 신청일이 아니라 이직일 기준으로 적용됩니다. 2025년 12월 31일에 퇴사했다면 2026년 1월에 신청해도 옛 상한액 66,000원이 적용됩니다. 이 계산기에서 이직 연도를 따로 묻는 이유입니다.",
  },
  {
    q: "소정급여일수는 어떻게 정해지나요?",
    a: "고용보험법 별표1에 나이와 피보험기간으로 짜인 표가 있습니다. 50세 미만은 가입기간에 따라 120·150·180·210·240일, 50세 이상과 장애인은 120·180·210·240·270일입니다. 나이는 이직일 당시 만 나이 기준입니다. 1년 미만 가입자는 나이와 무관하게 120일로 같습니다.",
  },
  {
    q: "상한액이 7년 만에 올랐다는 게 무슨 뜻인가요?",
    a: "구직급여 상한액은 2019년 66,000원으로 정해진 뒤 2025년까지 그대로였습니다. 그사이 최저임금은 계속 올라 하한액이 상한액을 거의 따라잡았고, 2026년에는 하한액(66,048원)이 옛 상한액(66,000원)을 넘어설 상황이 됐습니다. 그래서 상한액을 68,100원으로 인상했습니다. 상·하한의 간격이 2,052원까지 좁혀진 배경입니다.",
  },
];

export default function BenefitPage() {
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
          { "@type": "ListItem", position: 2, name: "실업급여 계산기" },
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
      <h1 className="mb-2 text-2xl font-extrabold">실업급여 계산기</h1>
      <p className="mb-6 text-muted">
        월급과 나이, 고용보험 가입기간을 넣으면 하루에 얼마를 며칠 동안 받는지
        계산합니다. 2026년 개정된 상한액을 반영했습니다.
      </p>

      <JobseekerCalculator />

      <AdSlot slot="benefit-below-tool" />

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed">
        <h2 className="text-xl font-bold">
          &ldquo;평균임금의 60%&rdquo;가 대부분 사실이 아닌 이유
        </h2>
        <p>
          실업급여를 설명할 때 거의 항상 나오는 문장이 &ldquo;이직 전 평균임금의
          60%&rdquo;입니다. 법 조문에도 그렇게 적혀 있습니다. 그런데 실제로 이
          비율대로 받는 사람은 많지 않습니다. 상한액과 하한액이 양쪽에서 값을
          잘라내기 때문입니다.
        </p>
        <p>
          2026년 기준 하한액은 <strong>66,048원</strong>입니다. 최저시급
          10,320원의 80%에 하루 8시간을 곱한 값입니다. 상한액은{" "}
          <strong>68,100원</strong>입니다. 둘의 차이가{" "}
          <strong>2,052원밖에 되지 않습니다.</strong>
        </p>
        <p>
          여기에 60%를 역산해 보면 이렇게 됩니다. 하한액에 대응하는 기초일액은
          110,080원이고, 이는 월급으로 약 334만원입니다. 상한액에 대응하는 값은
          113,500원, 월급으로 약 344만원입니다. 즉:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            월급 <strong>334만원 미만</strong> → 급여가 얼마든 하한액 66,048원
          </li>
          <li>
            월급 <strong>334만~344만원</strong> → 이 좁은 구간에서만 60%가
            실제로 적용됨
          </li>
          <li>
            월급 <strong>344만원 초과</strong> → 급여가 얼마든 상한액 68,100원
          </li>
        </ul>
        <p>
          월급 200만원인 사람과 320만원인 사람이 하루에 똑같이 66,048원을
          받습니다. 월급 400만원인 사람과 1,000만원인 사람도 똑같이 68,100원을
          받습니다. 실업급여를 &lsquo;소득 비례 급여&rsquo;로 생각하면 계산이
          어긋나는 이유가 이것입니다. 실제로는 <strong>거의 정액 급여</strong>에
          가깝습니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          총액을 가르는 것은 금액이 아니라 일수입니다
        </h2>
        <p>
          일액이 사실상 고정돼 있으니, 총액은 <strong>며칠 받느냐</strong>로
          결정됩니다. 소정급여일수는 고용보험법 별표1에 나이와 가입기간으로 짜인
          표를 따릅니다.
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border-soft text-left">
                <th className="py-2 pr-3 font-bold">가입기간</th>
                <th className="py-2 pr-3 font-bold">1년 미만</th>
                <th className="py-2 pr-3 font-bold">1~3년</th>
                <th className="py-2 pr-3 font-bold">3~5년</th>
                <th className="py-2 pr-3 font-bold">5~10년</th>
                <th className="py-2 font-bold">10년 이상</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-soft">
                <td className="py-2 pr-3 text-muted">50세 미만</td>
                <td className="py-2 pr-3">120일</td>
                <td className="py-2 pr-3">150일</td>
                <td className="py-2 pr-3">180일</td>
                <td className="py-2 pr-3">210일</td>
                <td className="py-2">240일</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-muted">50세 이상·장애인</td>
                <td className="py-2 pr-3">120일</td>
                <td className="py-2 pr-3">180일</td>
                <td className="py-2 pr-3">210일</td>
                <td className="py-2 pr-3">240일</td>
                <td className="py-2">270일</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          120일과 270일의 차이는 하한액 기준으로{" "}
          <strong>약 990만원</strong>입니다. 같은 월급이라도 가입기간과 나이에
          따라 총액이 두 배 넘게 벌어집니다. 나이는 <strong>이직일 당시</strong>{" "}
          만 나이로 봅니다. 49세에 퇴사하는 것과 50세에 퇴사하는 것이 다르므로,
          생일이 가깝다면 확인해 볼 만합니다.
        </p>

        <h2 className="mt-8 text-xl font-bold">
          받는 금액보다 중요한 것 — 언제까지 신청하느냐
        </h2>
        <p>
          소정급여일수가 270일이라고 해서 반드시 270일치를 받는 것은 아닙니다.
          <strong> 수급기간</strong>이라는 별개의 제한이 있습니다. 이직일
          다음날부터 12개월이 지나면, 남은 일수가 있어도 지급이 끊깁니다.
        </p>
        <p>
          퇴직하고 다섯 달쯤 쉬다가 신청하면 270일짜리 자격이어도 실제로는
          일곱 달분밖에 받지 못합니다. 이 손실은 되돌릴 방법이 없습니다.
          얼마를 받는지보다 이 날짜가 훨씬 중요한 이유입니다.{" "}
          <Link
            href="/calc/eligibility"
            className="text-accent underline-offset-4 hover:underline"
          >
            수급자격·신청기한 계산기
          </Link>
          에서 만료일과 손실 일수를 확인해 보세요.
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
            law: "고용보험법 제46조 (구직급여일액)",
            detail:
              "구직급여일액은 기초일액의 60%입니다. 기초일액은 이직 전 3개월 임금총액을 그 기간의 총일수로 나눈 평균임금이며, 고용노동부 장관이 고시한 상한(2026년 113,500원)을 넘을 수 없습니다.",
          },
          {
            law: "고용노동부 고시 (구직급여일액 상·하한)",
            detail:
              "2026년 상한액은 1일 68,100원입니다. 2019년부터 66,000원으로 동결됐다가 7년 만에 인상됐습니다. 하한액은 최저임금법상 시간급 최저임금의 80%에 1일 소정근로시간 8시간을 곱한 금액으로, 2026년은 10,320 × 0.8 × 8 = 66,048원입니다.",
          },
          {
            law: "고용보험법 별표1 (구직급여의 소정급여일수)",
            detail:
              "이직일 당시 연령과 피보험기간으로 120~270일이 정해집니다. 50세 미만은 120·150·180·210·240일, 50세 이상 및 장애인은 120·180·210·240·270일입니다.",
          },
          {
            law: "고용보험법 제48조 (수급기간)",
            detail:
              "구직급여는 이직일 다음날부터 12개월 이내에만 지급됩니다. 소정급여일수가 남아 있어도 이 기간이 지나면 종료됩니다.",
          },
        ]}
        note="이직 전 3개월의 총일수는 91일로 놓고 계산합니다. 실제로는 퇴사한 달에 따라 89~92일이라 하루치 금액이 조금 달라질 수 있습니다. 반복수급자 감액 규정은 개정 논의가 진행 중이며 확정되지 않아 반영하지 않았습니다. 확정 금액은 고용센터의 수급자격 인정 결과를 따릅니다."
        examples={[
          {
            title: "35세 · 월 280만원 · 가입 4년",
            steps: [
              "평균임금 = 2,800,000 × 3 ÷ 91 = 92,307원",
              "기초일액 = 92,307원 (상한 113,500원 미만이라 그대로)",
              "60% 적용 = 55,384원 → 하한액 66,048원에 미달",
              "구직급여일액 = 66,048원 (하한 적용)",
              "소정급여일수 = 50세 미만·3~5년 → 180일",
            ],
            result: "66,048 × 180 = 11,888,640원",
          },
          {
            title: "52세 · 월 600만원 · 가입 12년 — 상한에 걸립니다",
            steps: [
              "평균임금 = 6,000,000 × 3 ÷ 91 = 197,802원",
              "기초일액 = 113,500원 (임금일액 상한으로 잘림)",
              "60% 적용 = 68,100원 (상한액과 일치)",
              "구직급여일액 = 68,100원",
              "소정급여일수 = 50세 이상·10년 이상 → 270일",
            ],
            result: "68,100 × 270 = 18,387,000원",
          },
          {
            title: "월급만 다르고 조건이 같은 두 사람 — 결과가 같습니다",
            steps: [
              "A: 월 200만원 → 평균임금 65,934원 → 60%는 39,560원 → 하한 66,048원",
              "B: 월 320만원 → 평균임금 105,494원 → 60%는 63,296원 → 하한 66,048원",
              "둘 다 하한액에 걸려 일액이 같아집니다",
            ],
            result: "월급이 60% 차이인데 실업급여는 1원도 다르지 않습니다",
          },
        ]}
        pitfalls={[
          {
            heading: "상한액은 이직일 기준입니다",
            body:
              "2025년 12월에 퇴사하고 2026년에 신청하면 2026년 상한액이 아니라 2025년 상한액 66,000원이 적용됩니다. 연말·연초에 퇴사를 앞두고 있다면 며칠 차이로 금액이 달라질 수 있으니 확인해 보세요.",
          },
          {
            heading: "세전 급여를 넣어야 합니다",
            body:
              "평균임금은 세금과 4대보험을 떼기 전 금액으로 계산합니다. 통장에 들어온 실수령액을 넣으면 실제보다 적게 나옵니다. 상여금과 각종 수당도 임금총액에 포함됩니다.",
          },
          {
            heading: "소정급여일수를 다 받으려면 빨리 신청해야 합니다",
            body:
              "수급기간은 이직일 다음날부터 12개월입니다. 늦게 신청하면 남은 일수를 소화할 시간이 부족해 그만큼 못 받고 끝납니다. 퇴사하면 바로 워크넷 구직등록과 수급자격 신청을 하는 것이 안전합니다.",
          },
          {
            heading: "퇴직금·실업급여는 별개입니다",
            body:
              "퇴직금을 받았다고 실업급여가 깎이지 않습니다. 다만 퇴직금은 소득으로 잡히므로 건강보험 피부양자 자격 판단 등에는 영향을 줄 수 있습니다.",
          },
        ]}
        sources={[
          { label: "고용보험 홈페이지", href: "https://www.ei.go.kr" },
          { label: "고용노동부 고객상담센터 1350", href: "https://www.moel.go.kr" },
          { label: "국가법령정보센터", href: "https://www.law.go.kr" },
          { label: "수급자격·신청기한 계산기", href: "/calc/eligibility" },
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
              href="/calc/early"
              className="text-accent underline-offset-4 hover:underline"
            >
              조기재취업수당 계산기 →
            </Link>
          </li>
          <li>
            <Link
              href="/guide/benefit-amount-truth"
              className="text-accent underline-offset-4 hover:underline"
            >
              실업급여는 왜 대부분 같은 금액인가 →
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
