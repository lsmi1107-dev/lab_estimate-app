// src/io/excelExporter.ts - 단가 0원 버그 수정
export function exportToExcel(items: any[]) {
  return items.map((it: any) => ({
    No: it.id,
    품명: it.품명,
    규격: it.calc?.spec || it.규격,
    단위: it.단위,
    수량: it.수량?.value || it.calc?.quantity || 1,
    합계단가: it.calc?.totalCost || 0,
    합계금액: it.calc?.totalCost || 0,
    비고: `${it.비고} | 소요 ${it.calc?.requiredArea}㎡ -> 계상 ${it.calc?.totalArea}㎡ | 임대 ${it.calc?.rentTotal} + 설치 ${it.calc?.installCost} + 운반 ${it.calc?.transportCost}`
  }))
}
