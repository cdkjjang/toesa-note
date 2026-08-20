import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "퇴사 가이드 — 실업급여·수급자격·건강보험·정산 총정리",
  description:
    "퇴사 직후 해야 할 일의 순서, 실업급여 금액이 대부분 같은 이유, 자진 퇴사 예외 사유, 신청 절차와 실업인정, 조기재취업수당 시점, 건강보험과 국민연금 처리까지 정리했습니다.",
  alternates: { canonical: "/guide" },
};

export default function GuideListPage() {
  // 가이드 목록임을 알리고 검색결과에 사이트 내 경로가 표시되도록 한다.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${SITE_NAME} 가이드`,
        url: `${SITE_URL}/guide`,
        inLanguage: "ko",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: guides.length,
          itemListElement: guides.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: g.title,
            url: `${SITE_URL}/guide/${g.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "가이드" },
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
      <h1 className="mb-2 text-2xl font-extrabold">퇴사 가이드</h1>
      <p className="mb-8 text-muted">
        퇴사하면 무엇을 어떤 순서로 해야 하는지, 어디서 돈과 기한이 갈리는지
        정리했습니다. 순서대로 읽어도 좋고 지금 필요한 것만 골라 읽어도 좋습니다.
      </p>
      <ul className="space-y-4">
        {guides.map((g) => (
          <li
            key={g.slug}
            className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
          >
            {/* 제목만 링크로 둔다. 설명까지 앵커 안에 넣으면 목록 페이지 본문이
                거의 전부 링크 텍스트가 되어, 검색엔진과 광고 심사 양쪽에서
                '읽을거리 없는 링크 모음'으로 읽힌다. */}
            <h2 className="font-bold leading-snug">
              <Link href={`/guide/${g.slug}`} className="hover:text-accent">
                {g.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {g.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
