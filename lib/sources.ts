// 가이드 "이 글의 근거"에 쓰는 링크.
//
// 2026-09-28 전수 대조에서 **본문을 열어 확인한 것만** 넣었다.
// law.go.kr 조문은 법령 본문, 별표는 문서뷰어 텍스트, 고시는 행정규칙 본문까지 읽었다.
// 별표 링크는 lsiSeq(연혁 번호) 없이 법령명으로 걸어 늘 현행을 연다.
// ⚠️ 확인하지 않은 링크를 여기에 추가하지 말 것.

type Source = { label: string; href: string; note?: string };

const BYL = (lsNm: string, bylNo: string) =>
  `https://www.law.go.kr/LSW/lsBylInfoPLinkR.do?lsNm=${encodeURIComponent(lsNm).replace(/%20/g, "+")}&bylNo=${bylNo}&bylBrNo=00&bylCls=BE&bylEfYdYn=Y`;

const JO = (law: string, jo: string) => `https://www.law.go.kr/법령/${law}/${jo}`;

export const SRC = {
  requirements: {
    label: "고용보험법 제40조",
    href: JO("고용보험법", "제40조"),
    note: "수급 요건, 기준기간 18개월(초단시간 24개월·무급 30일 이상이면 연장)",
  },
  baseWage: {
    label: "고용보험법 제45조·제46조",
    href: JO("고용보험법", "제45조"),
    note: "기초일액, 60%, 최저구직급여일액 = 최저임금 × 1일 소정근로시간 × 80%",
  },
  claimPeriod: {
    label: "고용보험법 제48조",
    href: JO("고용보험법", "제48조"),
    note: "이직일 다음 날부터 12개월 내, 취업 불가 기간 가산 최대 4년",
  },
  waiting: {
    label: "고용보험법 제49조",
    href: JO("고용보험법", "제49조"),
    note: "실업 신고일부터 7일 대기기간",
  },
  fraud: {
    label: "고용보험법 제61조·제62조",
    href: JO("고용보험법", "제62조"),
    note: "지급 제한(신고의무 첫 위반은 해당 기간만), 반환 + 추가징수 2배 이하·공모 5배 이하",
  },
  sickness: {
    label: "고용보험법 제63조",
    href: JO("고용보험법", "제63조"),
    note: "상병급여 — 실업 신고 후 질병·부상·출산, 소정급여일수 한도",
  },
  earlyLaw: {
    label: "고용보험법 제64조",
    href: JO("고용보험법", "제64조"),
    note: "조기재취업 수당, 2년 내 수급 제한",
  },
  earlyDecree: {
    label: "고용보험법 시행령 제84조~제86조",
    href: JO("고용보험법시행령", "제84조"),
    note: "14일 경과·절반 남김·12개월(65세 6개월), 채용 약속·고시 임금액 이상 제외, 12개월 후 청구",
  },
  earlyWage: {
    label: "고용노동부고시 제2024-60호",
    href: "https://www.law.go.kr/LSW//admRulInfoP.do?admRulSeq=2100000251270&chrClsCd=010201",
    note: "조기재취업 수당 지급제외 임금액 월 574만원 (2025~2027년)",
  },
  justCause: {
    label: "고용보험법 시행규칙 별표2",
    href: BYL("고용보험법 시행규칙", "0002"),
    note: "수급자격이 제한되지 않는 정당한 이직 사유",
  },
  continued: {
    label: "국민건강보험법 제110조",
    href: JO("국민건강보험법", "제110조"),
    note: "임의계속가입 — 신청 기한, 첫 보험료 2개월 미납 시 자격 상실, 12개월 평균 보수월액",
  },
  pensionLocal: {
    label: "국민연금법 제9조·제10조",
    href: JO("국민연금법", "제9조"),
    note: "퇴사자는 당연 지역가입자, 임의가입은 지역가입 대상이 아닌 사람",
  },
  pensionCredit: {
    label: "국민연금법 제19조의2",
    href: JO("국민연금법", "제19조의2"),
    note: "실업크레딧 — 최대 1년, 인정소득은 기초 임금일액 월환산의 절반",
  },
} satisfies Record<string, Source>;
