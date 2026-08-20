"use client";

import { useState } from "react";
import { MoneyField, ResultCard, parseMoney } from "./fields";
import OptionGroup from "./OptionGroup";
import {
  calcEarlyReemployment,
  latestPaidDaysForBonus,
} from "@/lib/early-reemployment";
import { formatWon } from "@/lib/date";

const YES_NO = [
  { value: "yes" as const, label: "예" },
  { value: "no" as const, label: "아니오" },
];

export default function EarlyReemploymentCalculator() {
  const [dailyBenefit, setDailyBenefit] = useState("66048");
  const [benefitDays, setBenefitDays] = useState("210");
  const [paidDays, setPaidDays] = useState("60");
  const [daysAfterReport, setDaysAfterReport] = useState("45");
  const [willStay, setWillStay] = useState<"yes" | "no">("yes");
  const [priorClaim, setPriorClaim] = useState<"yes" | "no">("no");
  const [sameEmployer, setSameEmployer] = useState<"yes" | "no">("no");
  const [senior, setSenior] = useState<"yes" | "no">("no");

  const daily = parseMoney(dailyBenefit);
  const total = parseMoney(benefitDays);
  const paid = parseMoney(paidDays);
  const after = parseMoney(daysAfterReport);

  const result =
    daily === null || total === null || paid === null || after === null
      ? null
      : calcEarlyReemployment({
          dailyBenefit: daily,
          benefitDays: total,
          paidDays: paid,
          daysAfterReport: after,
          willStay12Months: willStay === "yes",
          hadPriorClaim: priorClaim === "yes",
          sameEmployer: sameEmployer === "yes",
          senior: senior === "yes",
        });

  const cutoff = total === null ? null : latestPaidDaysForBonus(total);

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
      <MoneyField
        label="구직급여일액"
        hint="실업급여 계산기에서 나온 1일 금액"
        unit="원"
        value={dailyBenefit}
        onChange={setDailyBenefit}
        placeholder="66048"
      />
      <MoneyField
        label="소정급여일수"
        hint="받을 수 있는 전체 일수"
        unit="일"
        value={benefitDays}
        onChange={setBenefitDays}
        placeholder="210"
      />
      <MoneyField
        label="이미 받은 일수"
        hint="재취업일 전날까지"
        unit="일"
        value={paidDays}
        onChange={setPaidDays}
        placeholder="60"
      />
      <MoneyField
        label="실업 신고일부터 재취업까지"
        hint="14일이 지나야 합니다"
        unit="일"
        value={daysAfterReport}
        onChange={setDaysAfterReport}
        placeholder="45"
      />

      <OptionGroup
        label="새 직장에서 12개월 이상 일할 예정인가요"
        options={YES_NO}
        value={willStay}
        onChange={setWillStay}
      />
      <OptionGroup
        label="최근 2년 내 조기재취업수당을 받은 적이 있나요"
        options={YES_NO}
        value={priorClaim}
        onChange={setPriorClaim}
      />
      <OptionGroup
        label="퇴사한 그 회사에 다시 들어가나요"
        options={YES_NO}
        value={sameEmployer}
        onChange={setSameEmployer}
      />
      <OptionGroup
        label="이직일 당시 65세 이상인가요"
        options={YES_NO}
        value={senior}
        onChange={setSenior}
      />

      {result === null ? (
        <p className="text-muted">값을 모두 넣으면 결과가 나옵니다.</p>
      ) : (
        <ResultCard
          title={result.qualified ? "받을 수 있습니다" : "요건이 맞지 않습니다"}
        >
          {result.qualified ? (
            <>
              <p className="text-3xl font-extrabold text-accent-strong">
                {formatWon(result.amount)}
              </p>
              <p className="mt-1 text-[15px] text-muted">
                남은 {result.remainingDays}일 × {formatWon(Number(dailyBenefit) || 0)} × 1/2
              </p>
            </>
          ) : (
            <p className="text-[15px] leading-relaxed text-muted">
              아래 요건 중 ✕ 표시된 것 때문에 지급되지 않습니다. 요건을 다 채웠다면{" "}
              <strong>{formatWon(result.potentialAmount)}</strong>을 받을 수
              있었습니다.
            </p>
          )}

          <ul className="mt-4 space-y-3 border-t border-border-soft pt-4">
            {result.requirements.map((r) => (
              <li key={r.label} className="flex gap-3">
                <span
                  className={`shrink-0 text-lg font-bold ${
                    r.status === "pass"
                      ? "text-accent-strong"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {r.status === "pass" ? "○" : "✕"}
                </span>
                <span>
                  <span className="font-bold">{r.label}</span>
                  <span className="mt-0.5 block text-[15px] text-muted">{r.detail}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-border-soft pt-4 text-[15px] leading-relaxed">
            <p className="font-bold">끝까지 받는 것과 비교하면</p>
            <p className="mt-1 text-muted">
              실업급여를 계속 받으면 {formatWon(result.ifKeptClaiming)}을 더 받습니다.
              조기재취업수당은 그 절반인 {formatWon(result.potentialAmount)}입니다.
              다만 재취업하면 <strong>월급을 함께 벌게 되므로</strong> 대부분
              일찍 취업하는 쪽이 이득입니다.
            </p>
          </div>
        </ResultCard>
      )}

      {cutoff !== null && cutoff > 0 && (
        <div className="mt-5 rounded-xl border border-accent/40 bg-accent/5 p-4 text-[15px] leading-relaxed">
          <p className="font-bold text-accent-strong">
            {cutoff}일치를 받기 전에 취업해야 합니다
          </p>
          <p className="mt-1.5 text-muted">
            소정급여일수 {total}일의 절반입니다. 하루라도 넘기면 조기재취업수당은
            0원이 됩니다. 취업이 가까워졌다면 실업인정 신청 시점을 확인해 보세요.
          </p>
        </div>
      )}

      <p className="mt-5 text-sm leading-relaxed text-muted">
        신청은 재취업한 날이 아니라 <strong>12개월을 채운 뒤</strong>에 합니다.
        재취업일로부터 12개월이 지난 날의 다음날부터 3년 이내에 청구하세요.
        재취업하고 잊고 지내다 못 받는 경우가 가장 많습니다.
      </p>
    </div>
  );
}
