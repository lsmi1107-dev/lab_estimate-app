
// 기존 src/routes/index.tsx 유지 + SSOT 모듈 import
// STEP 01: 연면적 가산정 (설계단계) - determineGradeByArea
// STEP 02: 총공사비 재확인 (실행단계) - determineGradeByBudget + max
// STEP 1.5: 가설공사 Line Item 자동산출 - items.ssot.yaml 기반
// Summary Sheet는 io/excelExporter.ts가 첨부 양식 그대로 출력

import { calculateAll } from "../calc/quantityEngine";
import items from "../ssot/items.ssot.yaml";
import { ProjectContext } from "../domain/types";

// 예시 사용:
// const ctx: ProjectContext = { 대지면적: 3500, 연면적: 10000, 건물용도: "업무시설", 구조: "철근콘크리트조", 지상층수: 15, 지하층수: 3, 최고높이: 60, 공사기간: 12 };
// const boq = calculateAll(ctx, items);
