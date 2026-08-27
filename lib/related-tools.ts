/**
 * 이 노트의 계산기를 쓴 사람이 **다음에 마주칠 질문**과, 그 답이 있는
 * 다른 노트의 계산기.
 *
 * ⚠️ 이 파일은 워크스페이스 생성기로 만든다. 손으로 고치면 다음 생성 때 덮인다.
 *
 * 규칙 (components/RelatedTools.tsx 주석 참조):
 *   - 계산기마다 최대 3개. 페이지마다 내용이 달라야 한다.
 *   - 같은 노트 안의 계산기는 넣지 않는다.
 *   - "관련 계산기"가 아니라 그 사람이 실제로 다음에 겪는 일로 적는다.
 */
export type RelatedTool = {
  /** 그 사람이 다음에 던지는 질문 — 링크 텍스트가 된다 */
  question: string;
  /** 어느 노트인지 */
  note: string;
  /** 어떤 계산기인지 */
  tool: string;
  /** 전체 URL (다른 도메인이므로 절대 경로) */
  href: string;
};

export const RELATED_TOOLS: Record<string, RelatedTool[]> = {
  "/calc/benefit": [
    {
      question: "퇴사하면 건강보험 피부양자로 들어갈 수 있나요",
      note: "건강보험노트",
      tool: "피부양자 자격 계산기",
      href: "https://health.lifebanjang.com/calc/dependent",
    },
    {
      question: "퇴직금은 얼마나 나오나요",
      note: "급여노트",
      tool: "퇴직금 계산기",
      href: "https://salary.lifebanjang.com/calc/severance",
    },
    {
      question: "실업 기간 동안 국민연금은 어떻게 되나요",
      note: "연금노트",
      tool: "국민연금 예상액 계산기",
      href: "https://pension.lifebanjang.com/calc/national",
    },
  ],
  "/calc/eligibility": [
    {
      question: "퇴직금은 얼마나 나오나요",
      note: "급여노트",
      tool: "퇴직금 계산기",
      href: "https://salary.lifebanjang.com/calc/severance",
    },
    {
      question: "가족 밑으로 피부양자가 될 수 있나요",
      note: "건강보험노트",
      tool: "피부양자 자격 계산기",
      href: "https://health.lifebanjang.com/calc/dependent",
    },
    {
      question: "다음 직장 연봉이면 실수령액이 얼마인가요",
      note: "급여노트",
      tool: "연봉 실수령액 계산기",
      href: "https://salary.lifebanjang.com/calc/salary",
    },
  ],
  "/calc/early": [
    {
      question: "새 직장 연봉이면 실수령액이 얼마인가요",
      note: "급여노트",
      tool: "연봉 실수령액 계산기",
      href: "https://salary.lifebanjang.com/calc/salary",
    },
    {
      question: "다시 직장가입자가 되면 4대보험은 얼마인가요",
      note: "급여노트",
      tool: "4대보험 계산기",
      href: "https://salary.lifebanjang.com/calc/insurance",
    },
    {
      question: "중간에 이직하면 연말정산은 어떻게 되나요",
      note: "세금노트",
      tool: "연말정산 계산기",
      href: "https://tax.lifebanjang.com/calc/year-end",
    },
  ],
  "/calc/health": [
    {
      question: "피부양자로 들어가는 편이 더 싸지 않나요",
      note: "건강보험노트",
      tool: "피부양자 자격 계산기",
      href: "https://health.lifebanjang.com/calc/dependent",
    },
    {
      question: "병원비는 실제로 몇 퍼센트를 내나요",
      note: "건강보험노트",
      tool: "본인부담률 계산기",
      href: "https://health.lifebanjang.com/calc/rate",
    },
    {
      question: "병원비가 많이 나왔는데 돌려받을 수 있나요",
      note: "건강보험노트",
      tool: "본인부담상한제 계산기",
      href: "https://health.lifebanjang.com/calc/cap",
    },
  ],
};
