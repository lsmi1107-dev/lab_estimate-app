
import { ProjectContext, BOQLineItem } from "../domain/types";
import items from "../ssot/items.ssot.yaml"; // vite yaml plugin or import via json

function evalFormula(formula: string, ctx: ProjectContext): number {
  // Tight loop용 안전한 수식 평가기 - SSOT만 신뢰
  // 지원: SQRT, CEIL, FLOOR, IF, MAX, MIN, +, -, *, /, 비교
  const SQRT = Math.sqrt;
  const CEIL = Math.ceil;
  const FLOOR = Math.floor;
  const MAX = Math.max;
  const MIN = Math.min;
  const IF = (cond: boolean, t: number, f: number) => cond ? t : f;
  const { 대지면적, 연면적, 지상층수, 지하층수, 최고높이, 공사기간, 건물외주=0 } = ctx;
  try {
    // eslint-disable-next-line no-eval
    return eval(formula);
  } catch (e) {
    console.warn(`Formula eval failed: ${formula}`, e);
    return 0;
  }
}

export function calculateAll(ctx: ProjectContext, ssotItems: any[]): BOQLineItem[] {
  return ssotItems.map(item => {
    const val = evalFormula(item.산출식.formula, ctx);
    let detail = "";
    let qty = 1;
    if (item.id === "TEMP-007") {
      detail = `L=${Math.round(val)}m`;
      qty = 1; // 식으로 표기, 연장은 비고에
    } else {
      qty = Math.max(0, Math.round(val) || 1);
      if (item.id === "TEMP-002" || item.id === "TEMP-004") {
        // 0이면 미해당
        qty = val === 0 ? 0 : 1;
        if (item.id === "TEMP-002" && ctx.연면적 >= 10000) qty = 2;
      }
    }
    return {
      ...item,
      수량: { value: qty, logic: item.산출식.logic, detail },
      비고: detail ? `${item.비고} ${detail}`.trim() : item.비고,
      source: "items.ssot.yaml"
    } as BOQLineItem;
  });
}
