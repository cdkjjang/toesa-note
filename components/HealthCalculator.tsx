"use client";

import { useEffect, useState } from "react";
import { DateField, MoneyField, ResultCard, parseMoney } from "./fields";
import OptionGroup from "./OptionGroup";
import {
  MAX_MONTHS,
  applyDeadline,
  calcHealthInsurance,
  daysUntil,
} from "@/lib/health-insurance";
import { formatWon } from "@/lib/date";

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HealthCalculator() {
  const [wage, setWage] = useState("350");
  const [months, setMonths] = useState("24");
  const [dependent, setDependent] = useState<"yes" | "no" | "unknown">("no");
  const [billDue, setBillDue] = useState("");

  const manwon = parseMoney(wage);
  const enrolled = parseMoney(months);

  const result =
    manwon === null || enrolled === null
      ? null
      : calcHealthInsurance({
          averageMonthlyWage: manwon * 10_000,
          enrolledMonths: enrolled,
          canBeDependent: dependent === "yes",
        });

  // 정적 프리렌더라 렌더 본문에서 오늘 날짜를 구하면 서버 HTML에 '빌드 날짜' 기준
  // 남은 일수가 담겨 브라우저 계산과 어긋난다. 마운트 후에 채운다.
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(todayISO());
  }, []);

  const deadline = billDue ? applyDeadline(billDue) : null;
  const left = deadline && today ? daysUntil(deadline, today) : null;

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
      <MoneyField
        label="퇴직 전 12개월 보수월액 평균"
        hint="세전 월급 평균"
        unit="만원"
        value={wage}
        onChange={setWage}
        placeholder="350"
      />
      <MoneyField
        label="퇴직 직전 18개월 중 직장가입자였던 기간"
        hint="통산 12개월 이상이어야 합니다"
        unit="개월"
        value={months}
        onChange={setMonths}
        placeholder="24"
      />

      <OptionGroup
        label="배우자·부모의 직장보험에 피부양자로 들어갈 수 있나요"
        options={[
          { value: "no" as const, label: "아니오" },
          { value: "yes" as const, label: "예" },
          { value: "unknown" as const, label: "모르겠음" },
        ]}
        value={dependent}
        onChange={setDependent}
      />

      <DateField
        label="지역가입자 첫 고지서의 납부기한 (선택)"
        hint="신청 마감일을 계산합니다"
        value={billDue}
        onChange={setBillDue}
      />

      {result === null ? (
        <p className="text-muted">값을 넣으면 보험료가 나옵니다.</p>
      ) : (
        <ResultCard title="임의계속가입 시 월 보험료">
          {result.qualified ? (
            <>
              <p className="text-3xl font-extrabold text-accent-strong">
                {formatWon(result.monthly)}
                <span className="ml-1 text-base font-normal text-muted">/월</span>
              </p>
              <dl className="mt-4 space-y-1.5 border-t border-border-soft pt-4 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">건강보험료 (3.595%)</dt>
                  <dd>{formatWon(result.health)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">장기요양보험료 (13.14%)</dt>
                  <dd>{formatWon(result.longTermCare)}</dd>
                </div>
                <div className="flex justify-between gap-4 font-bold">
                  <dt>월 합계</dt>
                  <dd>{formatWon(result.monthly)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[15px] text-muted">
                최대 {MAX_MONTHS}개월 유지 시 총 {formatWon(result.maxTotal)}
              </p>
            </>
          ) : (
            <p className="text-[15px] leading-relaxed text-muted">
              퇴직 직전 18개월 동안 직장가입자 기간이 통산 12개월 이상이어야
              합니다. <strong>{result.monthsShort}개월</strong>이 모자랍니다.
              이전 직장 기간이 이 18개월 안에 들어간다면 합산되니 건보공단에
              확인해 보세요.
            </p>
          )}

          <div className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-4 text-[15px] leading-relaxed">
            <p className="font-bold text-accent-strong">
              회사 다닐 때 급여에서 빠지던 금액과 같습니다
            </p>
            <p className="mt-1.5 text-muted">
              임의계속가입자는 사업주 부담분 없이 본인부담분(절반)만 냅니다.
              보수월액도 퇴직 전 12개월 평균으로 고정되므로, 재직 중 내던
              금액이 그대로 유지되는 셈입니다.
            </p>
          </div>

          {result.dependentFirst && (
            <div className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-4 text-[15px] leading-relaxed">
              <p className="font-bold text-accent-strong">피부양자가 먼저입니다</p>
              <p className="mt-1.5 text-muted">
                피부양자로 등재되면 보험료가 <strong>0원</strong>입니다.
                임의계속가입보다 유리하니 자격 요건(소득·재산 기준)을 먼저
                확인하세요. 다만 실업급여는 소득으로 보지 않습니다.
              </p>
            </div>
          )}
        </ResultCard>
      )}

      {deadline && left !== null && (
        <div
          className={`mt-5 rounded-xl border p-4 text-[15px] leading-relaxed ${
            left < 0
              ? "border-rose-400/40 bg-rose-500/5"
              : "border-accent/40 bg-accent/5"
          }`}
        >
          <p
            className={`font-bold ${
              left < 0 ? "text-rose-600 dark:text-rose-400" : "text-accent-strong"
            }`}
          >
            {left < 0
              ? `신청 기한이 ${-left}일 지났습니다`
              : `신청 마감 ${deadline} — ${left}일 남았습니다`}
          </p>
          <p className="mt-1.5 text-muted">
            첫 지역보험료 납부기한으로부터 2개월 이내에 신청해야 합니다.{" "}
            <strong>이 기한은 연장도 구제도 없습니다.</strong> 한 번 놓치면
            임의계속가입은 영영 할 수 없고, 남은 기간 내내 지역가입자 보험료를
            내야 합니다.
          </p>
        </div>
      )}

      <p className="mt-5 text-sm leading-relaxed text-muted">
        지역가입자 보험료는 여기서 계산하지 않습니다. 소득뿐 아니라 재산과
        자동차를 점수로 환산하는 방식이고 점수표가 매년 바뀌어, 어설픈 추정이
        오히려 잘못된 판단을 부르기 때문입니다. 두 쪽을 비교하려면 건강보험공단
        홈페이지의 지역보험료 모의계산으로 확인한 뒤, 더 싼 쪽을 고르세요.
        대개는 임의계속가입이 유리하지만 재산이 적고 소득이 없으면 지역가입자가
        더 쌀 수도 있습니다.
      </p>
    </div>
  );
}
