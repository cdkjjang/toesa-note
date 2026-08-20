"use client";

import { useState } from "react";
import { DateField, MoneyField, ResultCard, parseMoney } from "./fields";
import OptionGroup from "./OptionGroup";
import {
  LEAVE_REASONS,
  calcEligibility,
  forfeitedDays,
  lastSafeApplyDate,
  type LeaveReason,
} from "@/lib/eligibility";
import { BENEFIT_DAYS, INSURED_BRACKETS, type InsuredBracket } from "@/lib/jobseeker";

const STATUS_STYLE = {
  pass: { mark: "○", cls: "text-accent-strong" },
  warn: { mark: "△", cls: "text-amber-600 dark:text-amber-400" },
  fail: { mark: "✕", cls: "text-rose-600 dark:text-rose-400" },
} as const;

/** 오늘 날짜를 YYYY-MM-DD로. 클라이언트에서만 부른다. */
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function EligibilityCalculator() {
  const [insuredDays, setInsuredDays] = useState("400");
  const [reason, setReason] = useState<LeaveReason>("layoff");
  const [ableToWork, setAbleToWork] = useState<"yes" | "no">("yes");
  const [leaveDate, setLeaveDate] = useState("");
  const [ageGroup, setAgeGroup] = useState<"under50" | "over50">("under50");
  const [insured, setInsured] = useState<InsuredBracket>("y3to5");

  const days = parseMoney(insuredDays);
  const today = todayISO();

  const result =
    days === null || leaveDate === ""
      ? null
      : calcEligibility({
          insuredDays: days,
          reason,
          ableToWork: ableToWork === "yes",
          leaveDate,
          today,
        });

  const benefitDays = BENEFIT_DAYS[ageGroup][insured];
  const lost = result ? forfeitedDays(result.daysLeft, benefitDays) : 0;
  const deadline = leaveDate ? lastSafeApplyDate(leaveDate, benefitDays) : null;

  return (
    <div className="rounded-2xl border border-border-soft bg-card p-5 shadow-sm">
      <MoneyField
        label="이직 전 18개월간 피보험단위기간"
        hint="고용보험 가입일수. 모르면 근무일수로 어림잡으세요"
        unit="일"
        value={insuredDays}
        onChange={setInsuredDays}
        placeholder="400"
      />

      <OptionGroup
        label="퇴사 사유"
        options={LEAVE_REASONS.map((r) => ({ value: r.key, label: r.label }))}
        value={reason}
        onChange={setReason}
      />
      <p className="-mt-3 mb-5 text-sm text-muted">
        {LEAVE_REASONS.find((r) => r.key === reason)?.hint}
      </p>

      <OptionGroup
        label="지금 바로 일할 수 있나요"
        options={[
          { value: "yes" as const, label: "예" },
          { value: "no" as const, label: "아니오", hint: "질병·육아 등" },
        ]}
        value={ableToWork}
        onChange={setAbleToWork}
      />

      <DateField label="이직일(마지막 근무일)" value={leaveDate} onChange={setLeaveDate} />

      <div className="mb-5 rounded-xl border border-border-soft p-4">
        <p className="mb-3 text-sm font-bold">
          받을 수 있는 일수를 함께 보려면 (선택)
        </p>
        <OptionGroup
          label="나이"
          options={[
            { value: "under50" as const, label: "50세 미만" },
            { value: "over50" as const, label: "50세 이상·장애인" },
          ]}
          value={ageGroup}
          onChange={setAgeGroup}
        />
        <OptionGroup
          label="고용보험 가입기간"
          options={INSURED_BRACKETS.map((b) => ({ value: b.key, label: b.label }))}
          value={insured}
          onChange={setInsured}
        />
        <p className="text-sm text-muted">
          소정급여일수 <strong>{benefitDays}일</strong>
        </p>
      </div>

      {result === null ? (
        <p className="text-muted">이직일을 넣으면 판정 결과가 나옵니다.</p>
      ) : (
        <ResultCard
          title={
            result.eligible
              ? result.hasWarning
                ? "조건부로 가능해 보입니다"
                : "수급 요건을 갖춘 것으로 보입니다"
              : "지금 조건으로는 어렵습니다"
          }
        >
          <ul className="space-y-3">
            {result.checks.map((c) => {
              const s = STATUS_STYLE[c.status];
              return (
                <li key={c.label} className="flex gap-3">
                  <span className={`shrink-0 text-lg font-bold ${s.cls}`}>{s.mark}</span>
                  <span>
                    <span className="font-bold">{c.label}</span>
                    <span className="mt-0.5 block text-[15px] text-muted">{c.detail}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 border-t border-border-soft pt-4">
            <p className="font-bold">수급기간 만료 {result.expiryDate}</p>
            <p className="mt-1 text-[15px] text-muted">
              {result.expired
                ? `${-result.daysLeft}일 전에 끝났습니다.`
                : `오늘부터 ${result.daysLeft}일 남았습니다.`}
            </p>
          </div>

          {!result.expired && lost > 0 && (
            <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/5 p-4 text-[15px] leading-relaxed">
              <p className="font-bold text-rose-600 dark:text-rose-400">
                지금 신청해도 {lost}일치를 못 받습니다
              </p>
              <p className="mt-1.5 text-muted">
                소정급여일수 {benefitDays}일인데 수급기간이 {result.daysLeft}일밖에
                남지 않았습니다. 수급기간은 이직일 다음날부터 12개월이고,
                이 날이 지나면 남은 일수가 있어도 지급이 끊깁니다.
              </p>
            </div>
          )}

          {!result.expired && lost === 0 && deadline && (
            <div className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-4 text-[15px] leading-relaxed">
              <p className="font-bold text-accent-strong">
                {deadline}까지 신청하면 {benefitDays}일을 다 받습니다
              </p>
              <p className="mt-1.5 text-muted">
                대기기간 7일과 소정급여일수 {benefitDays}일을 만료일 안에
                소화해야 하기 때문입니다. 이 날을 넘기면 넘긴 만큼 못 받고 끝납니다.
              </p>
            </div>
          )}
        </ResultCard>
      )}

      <p className="mt-5 text-sm leading-relaxed text-muted">
        이 판정은 참고용입니다. 최종 판단은 고용센터가 합니다. 특히 퇴사 사유는
        회사가 제출한 이직확인서의 상실코드로 정해지므로, 본인 생각과 다를 수
        있습니다. 이직확인서 내용은 고용보험 홈페이지에서 확인할 수 있고,
        사실과 다르면 정정을 요청할 수 있습니다.
      </p>
    </div>
  );
}
