
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef } from "react";
import { Check } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LabEstimatePage,
});

type Grade = "특급" | "1급" | "2급" | "3급";
type CostType = "구매" | "임대";
type PriceSource = "물가정보" | "거래가격" | "물가자료" | "직접입력";
type ChecklistItem = {
  id: string; name: string; spec: string; quantity: number; unit: string;
  basePrice: number; unitPrice: number; costType: CostType; source: PriceSource; ref: string; selected: boolean;
  ratio: { mat: number; lab: number; exp: number };
};

const PRICE_INDEX = [
  { month: "2026-08", label: "2026년 8월호", index: 104.6 },
  { month: "2026-07", label: "2026년 7월호", index: 104.1 },
  { month: "2026-06", label: "2026년 6월호", index: 103.5 },
  { month: "2026-05", label: "2026년 5월호", index: 102.8 },
  { month: "2026-04", label: "2026년 4월호", index: 102.2 },
  { month: "2026-03", label: "2026년 3월호", index: 101.4 },
  { month: "2026-02", label: "2026년 2월호", index: 100.7 },
  { month: "2026-01", label: "2026년 1월호", index: 100.0 },
];

const GRADE_THRESHOLDS = [
  { grade: "특급" as Grade, minArea: 50000, minBudget: 100_000_000_000, label: "특급", minLabArea: 50 },
  { grade: "1급" as Grade, minArea: 20000, minBudget: 30_000_000_000, label: "1급", minLabArea: 30 },
  { grade: "2급" as Grade, minArea: 5000, minBudget: 10_000_000_000, label: "2급", minLabArea: 18 },
  { grade: "3급" as Grade, minArea: 0, minBudget: 0, label: "3급", minLabArea: 0 },
];

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: "container", ratio: { mat: 1, lab: 0, exp: 0 }, name: "시험실 컨테이너", spec: "3x9m (27㎡) 기준 컨테이너 임대", quantity: 2, unit: "EA", basePrice: 350000, unitPrice: 350000, costType: "임대", source: "물가정보", ref: "가설건물 / 이동식 컨테이너 임대", selected: true },
  { id: "container-move", ratio: { mat: 0, lab: 0.4, exp: 0.6 }, name: "컨테이너 상하차·운반", spec: "설치 및 철거 시 왕복 운반비", quantity: 2, unit: "EA", basePrice: 600000, unitPrice: 600000, costType: "구매", source: "거래가격", ref: "운반비 / 카고크레인 5톤", selected: true },
  { id: "electrical", ratio: { mat: 0.55, lab: 0.45, exp: 0 }, name: "전기 및 통신 설비", spec: "전등, 전열, LAN 배선 공사", quantity: 1, unit: "식", basePrice: 1200000, unitPrice: 1200000, costType: "구매", source: "물가자료", ref: "전기공사 / 가설전등·전열", selected: true },
  { id: "plumbing", ratio: { mat: 0.6, lab: 0.4, exp: 0 }, name: "급배수 및 정화조", spec: "시험대 싱크 및 오수관 연결", quantity: 1, unit: "식", basePrice: 2500000, unitPrice: 2500000, costType: "구매", source: "물가정보", ref: "위생기구 / 가설 급배수", selected: true },
  { id: "exhaust", ratio: { mat: 0.7, lab: 0.3, exp: 0 }, name: "강제 배기 시스템", spec: "시료 건조 및 가스 배출용", quantity: 0, unit: "SET", basePrice: 850000, unitPrice: 850000, costType: "구매", source: "거래가격", ref: "송풍기 / 강제배기 후드", selected: false },
  { id: "hvac", ratio: { mat: 1, lab: 0, exp: 0 }, name: "냉난방 설비", spec: "항온항습 및 벽걸이형 15평형 임대", quantity: 2, unit: "EA", basePrice: 90000, unitPrice: 90000, costType: "임대", source: "물가정보", ref: "냉난방기 / 벽걸이 15평형 임대", selected: true },
];

const GRADE_ORDER = { "특급": 3, "1급": 2, "2급": 1, "3급": 0 } as const;
function parseNumber(value: string){ return Number(value.replace(/[^0-9]/g, "")) || 0; }
function formatKRW(value: number){ return value.toLocaleString("ko-KR"); }
function determineGradeByArea(area: number){
  for (const t of GRADE_THRESHOLDS){ if (area >= t.minArea) return { grade: t.grade, minLabArea: t.minLabArea, reason: `연면적 ${t.minArea.toLocaleString("ko-KR")}㎡ 이상` }; }
  return { grade: "3급" as Grade, minLabArea: 0, reason: "연면적 5,000㎡ 미만" };
}
function determineGradeByBudget(budget: number){
  if (budget === 0) return null;
  for (const t of GRADE_THRESHOLDS){ if (budget >= t.minBudget) return { grade: t.grade, minLabArea: t.minLabArea, reason: `총공사비 ${(t.minBudget/100_000_000).toLocaleString("ko-KR")}억원 이상` }; }
  return { grade: "3급" as Grade, minLabArea: 0, reason: "총공사비 100억원 미만" };
}
const DEFAULT_MONTH = PRICE_INDEX[0]!.month;
function indexOf(month: string){ return PRICE_INDEX.find((m) => m.month === month)?.index ?? 100; }
function monthLabel(month: string){ return PRICE_INDEX.find((m) => m.month === month)?.label ?? month; }
function applyIndex(base: number, month: string){ return Math.round((base * indexOf(month)) / 100 / 1000) * 1000; }

function LabEstimatePage() {
  const [projectName, setProjectName] = useState("");
  const [budgetRaw, setBudgetRaw] = useState("");
  const [areaRaw, setAreaRaw] = useState("");
  const [monthsRaw, setMonthsRaw] = useState("12");
  const [priceMonth, setPriceMonth] = useState(DEFAULT_MONTH);
  const [items, setItems] = useState<ChecklistItem[]>(() => DEFAULT_ITEMS.map((i) => ({ ...i, unitPrice: applyIndex(i.basePrice, DEFAULT_MONTH) })));
  const checklistRef = useRef<HTMLDivElement>(null);

  const budget = parseNumber(budgetRaw);
  const area = parseNumber(areaRaw);
  const months = Math.max(0, Number(monthsRaw.replace(/[^0-9]/g, "")) || 0);

  const byArea = useMemo(() => determineGradeByArea(area), [area]);
  const byBudget = useMemo(() => determineGradeByBudget(budget), [budget]);
  const final = useMemo(() => {
    if (!byBudget) return { ...byArea, phase: "design" as const, isUpgraded: false, byArea, byBudget };
    const isUpgraded = GRADE_ORDER[byBudget.grade] > GRADE_ORDER[byArea.grade];
    const chosen = isUpgraded ? byBudget : byArea;
    return { ...chosen, phase: "confirm" as const, isUpgraded, byArea, byBudget };
  }, [byArea, byBudget]);

  const syncPriceMonth = (month: string) => {
    setPriceMonth(month);
    setItems((prev) => prev.map((i) => i.source === "직접입력" ? i : { ...i, unitPrice: applyIndex(i.basePrice, month) }));
  };
  const itemAmount = (item: ChecklistItem) => item.selected ? item.quantity * item.unitPrice * (item.costType === "임대" ? months : 1) : 0;
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + itemAmount(item), 0), [items, months]);
  const boqRows = useMemo(() => items.filter((i) => i.selected && i.quantity > 0).map((i) => {
    const unit = i.unitPrice * (i.costType === "임대" ? months : 1);
    const mat = Math.round(unit * i.ratio.mat); const lab = Math.round(unit * i.ratio.lab); const exp = unit - mat - lab;
    return { ...i, matUnit: mat, labUnit: lab, expUnit: exp, sumUnit: unit, matAmt: mat * i.quantity, labAmt: lab * i.quantity, expAmt: exp * i.quantity, sumAmt: unit * i.quantity };
  }), [items, months]);
  const boqTotal = useMemo(() => boqRows.reduce((a, r) => ({ mat: a.mat + r.matAmt, lab: a.lab + r.labAmt, exp: a.exp + r.expAmt, sum: a.sum + r.sumAmt }), { mat: 0, lab: 0, exp: 0, sum: 0 }), [boqRows]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="bg-zinc-100 py-6 border-b border-zinc-950/5">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <div><h1 className="text-xl font-semibold">가설 시험실 공사비 산출기 v2 - 2단계 확정</h1><p className="text-sm text-zinc-500 mt-1">연면적 가산정 → 총공사비 재확인 프로세스</p></div>
          <div className="px-3 py-1 bg-orange-700/10 ring-1 ring-orange-700/20 rounded-full"><span className="text-xs font-medium text-orange-700">최종: {final.grade} / {final.phase === "design" ? "설계 가산정" : "확정"}</span></div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* 01 Project */}
        <section><h2 className="text-lg font-medium mb-4">01. 프로젝트 기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="col-span-2 px-3 py-2.5 bg-zinc-100 ring-1 ring-black/5 rounded-md text-sm" placeholder="프로젝트 명칭" value={projectName} onChange={e=>setProjectName(e.target.value)} />
            <div className="relative"><input className="w-full px-3 py-2.5 bg-zinc-100 ring-1 ring-black/5 rounded-md text-sm pr-10" placeholder="연면적" value={areaRaw} onChange={e=>{ const raw=parseNumber(e.target.value); setAreaRaw(raw?formatKRW(raw):""); }} /><span className="absolute right-3 top-2.5 text-xs text-zinc-400">㎡</span></div>
            <div className="relative"><input className="w-full px-3 py-2.5 bg-zinc-100 ring-1 ring-black/5 rounded-md text-sm pr-10" placeholder="총공사비" value={budgetRaw} onChange={e=>{ const raw=parseNumber(e.target.value); setBudgetRaw(raw?formatKRW(raw):""); }} /><span className="absolute right-3 top-2.5 text-xs text-zinc-400">원</span></div>
            <div className="relative"><input className="w-full px-3 py-2.5 bg-zinc-100 ring-1 ring-black/5 rounded-md text-sm pr-12" placeholder="공사기간" value={monthsRaw} onChange={e=>setMonthsRaw(e.target.value.replace(/[^0-9]/g,""))} /><span className="absolute right-3 top-2.5 text-xs text-zinc-400">개월</span></div>
            <select value={priceMonth} onChange={e=>syncPriceMonth(e.target.value)} className="px-3 py-2.5 bg-zinc-100 ring-1 ring-black/5 rounded-md text-sm">{PRICE_INDEX.map(m=><option key={m.month} value={m.month}>{m.label} (지수 {m.index})</option>)}</select>
          </div>
        </section>
        {/* 02 Grade Stepper */}
        <section className="p-6 bg-zinc-100 rounded-xl ring-1 ring-black/5">
          <h2 className="text-lg font-medium mb-4">02. 2단계 등급 확정</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ring-1 ${final.phase==="design" ? "ring-orange-500 bg-orange-50" : "bg-white ring-zinc-200"}`}>
              <div className="text-[10px] tracking-widest text-zinc-500">STEP 01 · 연면적 기준</div>
              <div className="text-2xl font-semibold mt-1">{byArea.grade}</div>
              <div className="text-xs text-zinc-600 mt-1">{byArea.reason} → 법정 {byArea.minLabArea}㎡</div>
            </div>
            <div className={`p-4 rounded-lg ring-1 ${final.phase==="confirm" ? "ring-zinc-900 bg-zinc-900 text-white" : "bg-white ring-zinc-200"}`}>
              <div className="text-[10px] tracking-widest opacity-70">STEP 02 · 총공사비 기준</div>
              <div className="text-2xl font-semibold mt-1">{byBudget ? byBudget.grade : "미입력"}</div>
              <div className="text-xs mt-1 opacity-80">{byBudget ? `${byBudget.reason} → 법정 ${byBudget.minLabArea}㎡` : "총공사비 입력 시 재확인"}</div>
            </div>
          </div>
          <div className="mt-4">
            {!byBudget && <div className="p-3 bg-zinc-50 rounded border text-sm">설계단계: 연면적 {area.toLocaleString()}㎡ 기준으로 <b>{byArea.grade}</b> 가산정됨. 총공사비 입력 시 최종 등급이 확정됩니다.</div>}
            {byBudget && !final.isUpgraded && <div className="p-3 bg-green-50 text-green-800 rounded border border-green-200 text-sm">✅ 등급 유지: 연면적 기준 {byArea.grade}와 총공사비 기준 {byBudget.grade}가 동일하여 최종 {final.grade}로 확정.</div>}
            {byBudget && final.isUpgraded && <div className="p-3 bg-orange-50 text-orange-800 rounded border-l-4 border-orange-600 text-sm">⚠️ 등급 상향 필요: 연면적 기준 {byArea.grade} ({byArea.minLabArea}㎡) → 총공사비 기준 {byBudget.grade} ({byBudget.minLabArea}㎡)로 상향. 최종 {final.grade} 적용.</div>}
          </div>
        </section>
        {/* 03 BOQ summary */}
        <section>
          <h2 className="text-lg font-medium mb-2">03. 공사비 내역서 ({final.grade} / {final.minLabArea}㎡ 기준)</h2>
          <div className="overflow-x-auto ring-1 ring-zinc-900/15 rounded-lg bg-white">
            <table className="w-full min-w-[900px] text-[12px] border-collapse">
              <thead className="bg-zinc-100"><tr><th className="border border-zinc-300 px-2 py-2">품명</th><th className="border border-zinc-300 px-2 py-2">수량</th><th className="border border-zinc-300 px-2 py-2">단가</th><th className="border border-zinc-300 px-2 py-2">금액</th></tr></thead>
              <tbody>{boqRows.map(r=><tr key={r.id}><td className="border px-2 py-1">{r.name}</td><td className="border px-2 py-1 text-right">{r.quantity}</td><td className="border px-2 py-1 text-right">{formatKRW(r.sumUnit)}</td><td className="border px-2 py-1 text-right">{formatKRW(r.sumAmt)}</td></tr>)}<tr className="bg-zinc-100 font-bold"><td colSpan={3} className="border px-2 py-2 text-center">합계</td><td className="border px-2 py-2 text-right">{formatKRW(boqTotal.sum)}</td></tr></tbody>
            </table>
          </div>
        </section>
      </main>
      <div className="fixed bottom-0 inset-x-0 bg-zinc-900 text-zinc-50 py-4"><div className="max-w-5xl mx-auto px-6 flex justify-between"><span className="text-xs text-zinc-400">최종 산정 총액 ({final.grade})</span><span className="text-xl font-semibold">{formatKRW(totalAmount)} KRW - {final.phase === "design" ? "가산정" : "확정"}</span></div></div>
    </div>
  );
}
