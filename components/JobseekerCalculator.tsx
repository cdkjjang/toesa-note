"use client";

import { useState } from "react";
import { MoneyField, ResultCard, parseMoney } from "./fields";
import OptionGroup from "./OptionGroup";
import {
  INSURED_BRACKETS,
  calcJobseeker,
  rateAppliesWageRange,
  type InsuredBracket,
} from "@/lib/jobseeker";
import { formatWon } from "@/lib/date";

const AGE_OPTIONS = [
  { value: "under50" as const, label: "50세 미만" },
  { value: "over50" as const, label: "50세 이상" },
  { value: "disabled" as const, label: "장애인", hint: "나이 무관" },
];

const YEAR_OPTIONS = [
  { value: "2026" as const, label: "2026년" },
  { value: "2025" as const, label: "2025년" },
];

export default function JobseekerCalculator() {
  const [wage, setWage] = useState("300");
  const [ageGroup, setAgeGroup] = useState<"under50" | "over50" | "disabled">("under50");
  const [insured, setInsured] = useState<InsuredBracket>("y3to5");
  const [year, setYear] = useState<"2026" | "2025">("2026");

  const manwon = parseMoney(wage);
  const monthlyWage = manwon === null ? null : manwon * 10_000;

  const result =
    monthlyWage === null
      ? null
      : calcJobseeker({
          monthlyWage,
          totalDays: 91,
          age: ageGroup === "over50" ? 50 : 30,
          disabled: ageGroup === "disabled",
          insured,
          leaveYear: Number(year),
        });

  const band = rateAppliesWageRange(Number(year));

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
      <MoneyField
        label="이직 전 3개월 세전 월평균 급여"
        hint="상여·수당 포함, 세금 떼기 전"
        unit="만원"
        value={wage}
        onChange={setWage}
        placeholder="300"
      />

      <OptionGroup
        label="이직일 당시 나이"
        options={AGE_OPTIONS}
        value={ageGroup}
        onChange={setAgeGroup}
      />

      <OptionGroup
        label="고용보험 가입기간"
        options={INSURED_BRACKETS.map((b) => ({ value: b.key, label: b.label }))}
        value={insured}
        onChange={setInsured}
      />

      <OptionGroup
        label="이직일이 속한 연도"
        options={YEAR_OPTIONS}
        value={year}
        onChange={setYear}
      />
      <p className="-mt-3 mb-5 text-sm text-muted">
        상한액은 <strong>신청일이 아니라 이직일</strong> 기준입니다. 2025년 12월에
        퇴사했다면 2026년에 신청해도 옛 상한액(66,000원)이 적용됩니다.
      </p>

      {result === null ? (
        <p className="text-muted">급여를 입력하면 예상 수령액이 나옵니다.</p>
      ) : (
        <ResultCard title="예상 실업급여">
          <p className="text-3xl font-extrabold text-accent-strong">
            {formatWon(result.total)}
          </p>
          <p className="mt-1 text-[15px] text-muted">
            1일 {formatWon(result.dailyBenefit)} × {result.benefitDays}일
            <span className="ml-2">(월 환산 약 {formatWon(result.monthlyEquivalent)})</span>
          </p>

          <dl className="mt-4 space-y-1.5 border-t border-border-soft pt-4 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">1일 평균임금</dt>
              <dd>{formatWon(result.averageWage)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">기초일액</dt>
              <dd>
                {formatWon(result.baseDaily)}
                {result.wageCapped && (
                  <span className="ml-1 text-xs text-accent">상한 적용</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">60% 적용액</dt>
              <dd>{formatWon(result.rawDaily)}</dd>
            </div>
            <div className="flex justify-between gap-4 font-bold">
              <dt>구직급여일액</dt>
              <dd>{formatWon(result.dailyBenefit)}</dd>
            </div>
          </dl>

          {result.bound === "min" && (
            <div className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-4 text-[15px] leading-relaxed">
              <p className="font-bold text-accent-strong">하한액이 적용됐습니다</p>
              <p className="mt-1.5 text-muted">
                평균임금의 60%({formatWon(result.rawDaily)})가 하한액
                {" "}{formatWon(result.limits.dailyMin)}에 못 미쳐 하한액을 받습니다.
                {" "}
                <strong>
                  월 급여가 약 {Math.round(band.fromMonthly / 10_000).toLocaleString()}만원
                  미만이면 급여가 얼마든 결과가 같습니다.
                </strong>{" "}
                실업급여를 &ldquo;평균임금의 60%&rdquo;로 알고 계신 분이 많지만,
                실제로 그 비율이 적용되는 사람은
                월 {Math.round(band.fromMonthly / 10_000).toLocaleString()}만~
                {Math.round(band.toMonthly / 10_000).toLocaleString()}만원 구간뿐입니다.
              </p>
            </div>
          )}

          {result.bound !== "min" && result.dailyBenefit >= result.limits.dailyMax && (
            <div className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-4 text-[15px] leading-relaxed">
              <p className="font-bold text-accent-strong">상한액이 적용됐습니다</p>
              <p className="mt-1.5 text-muted">
                급여가 높아도 1일 {formatWon(result.limits.dailyMax)}을 넘지 않습니다.
                {year === "2026" && " 이 상한액은 2019년부터 66,000원으로 동결됐다가 2026년에 7년 만에 올랐습니다."}
              </p>
            </div>
          )}

          <p className="mt-4 text-sm text-muted">
            {year === "2026" ? "2026년" : "2025년"} 기준 · 상한{" "}
            {formatWon(result.limits.dailyMax)} / 하한{" "}
            {formatWon(result.limits.dailyMin)}(최저시급{" "}
            {result.limits.minWage.toLocaleString()}원 × 80% × 8시간)
          </p>
        </ResultCard>
      )}

      <p className="mt-5 text-sm leading-relaxed text-muted">
        평균임금은 3개월 총일수를 91일로 놓고 환산한 값입니다. 실제로는 퇴사한
        달에 따라 89~92일이라 하루치가 조금 달라질 수 있습니다. 확정 금액은
        고용센터의 수급자격 인정 결과를 따릅니다.
      </p>
    </div>
  );
}
