// src/calc/quantityEngine.ts - 최종 확정 2026-09-04
// TEMP-001 63/130, TEMP-003 100/200, totalArea 자동계산

export function calculateQuantity(item: any, ctx: any) {
  const GFA = ctx.grossFloorArea || ctx.연면적 || ctx.gfa || 10000
  const duration = ctx.duration || ctx.공사기간 || 12

  let requiredArea = 0
  const is001 = item.id === 'TEMP-001'
  const is003 = item.id === 'TEMP-003'

  if (is001) {
    if (GFA <= 200) requiredArea = 6
    else if (GFA <= 1000) requiredArea = 30
    else if (GFA <= 3000) requiredArea = 63 // 38+25 확정
    else if (GFA <= 6000) requiredArea = 76
    else requiredArea = 130 // 80+50 확정
  } else if (is003) {
    if (GFA <= 200) requiredArea = 12
    else if (GFA <= 1000) requiredArea = 48
    else if (GFA <= 3000) requiredArea = 100 // 50+50 확정
    else if (GFA <= 6000) requiredArea = 120
    else requiredArea = 200 // 100+100 확정
  }

  // 자동계산: required -> count6/count9 (totalArea 0 버그 수정)
  let count9 = 1
  let count6 = Math.max(0, Math.ceil((requiredArea - 27) / 18))
  let totalArea = count6 * 18 + count9 * 27
  while (totalArea < requiredArea) {
    count6++
    totalArea = count6 * 18 + count9 * 27
  }

  // 사용자가 이미 저장한 값이 있으면 그거 우선
  if (item.count6 !== undefined && item.count9 !== undefined && item.count6 !== 0) {
    count6 = item.count6
    count9 = item.count9
    totalArea = count6 * 18 + count9 * 27
  }

  const rent6 = item.rent6 ?? 350000
  const rent9 = item.rent9 ?? 550000
  const monthlyRent = count6 * rent6 + count9 * rent9
  const rentTotal = monthlyRent * duration
  const installCost = item.installCost ?? 1000000
  const transportCost = item.transportCost ?? 1200000
  const etcTotal = item.etcTotal ?? 0
  const totalCost = rentTotal + installCost + transportCost + etcTotal

  return {
    quantity: 1,
    requiredArea,
    count6,
    count9,
    totalArea,
    rent6,
    rent9,
    monthlyRent,
    rentTotal,
    installCost,
    transportCost,
    totalCost,
    spec: `3.0*6.0 x${count6} + 3.0*9.0 x${count9} (totalArea ${totalArea}㎡)`
  }
}

export function calculateAll(items: any[], ctx: any) {
  return items.map((it: any) => ({ ...it, calc: calculateQuantity(it, ctx) }))
}
