import Link from "next/link";
import FamilyLinks from "@/components/FamilyLinks";
import { SITE_NAME } from "@/lib/site";

const TOOL_LINKS = [
  { href: "/calc/benefit", label: "실업급여 계산기" },
  { href: "/calc/eligibility", label: "수급자격·신청기한" },
  { href: "/calc/early", label: "조기재취업수당" },
  { href: "/calc/health", label: "퇴사 후 건강보험" },
  { href: "/guide", label: "퇴사 가이드" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border-soft bg-card">
      <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted">
        <nav aria-label="사이트 바로가기" className="mb-5">
          <p className="mb-2 font-semibold text-foreground">{SITE_NAME} 도구</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {TOOL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <FamilyLinks />
        <p className="mb-3">
          {SITE_NAME}의 계산 결과는 고용보험법·국민건강보험법과 고용노동부 고시 등
          공개된 기준을 정리한 참고용 추정치이며, 노무·법률 자문이 아닙니다.
          수급자격과 확정 금액은 고용센터가 이직확인서와 사실관계를 바탕으로
          판단하므로 결과가 다를 수 있습니다. 실업급여는 고용노동부 고객상담센터(1350),
          건강보험은 국민건강보험공단(1577-1000)에서 최종 확인하세요.
        </p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-accent">
            소개
          </Link>
          <Link href="/editorial" className="hover:text-accent">
            편집 원칙
          </Link>
          <Link href="/contact" className="hover:text-accent">
            문의
          </Link>
          <Link href="/terms" className="hover:text-accent">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:text-accent">
            개인정보처리방침
          </Link>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
