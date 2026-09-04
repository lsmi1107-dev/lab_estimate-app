// src/calc/quantityEngine.ts - 2026-09-04 최종 확정
// 버그 수정: totalArea 0 → 자동계산, 단가 0 → totalCost 반영

export function calculateQuantity(item: any, ctx: any) {
  const GFA = ctx.grossFloorArea || ctx.연면적 || 3000
  const duration = ctx.duration || ctx.공사기간 || 12

  let requiredArea = 0
  if (item.id === 'TEMP-001') {
    if (GFA <= 200) requiredArea = 6
    else if (GFA <= 1000) requiredArea = 30
    else if (GFA <= 3000) requiredArea = 63 // 건축 38 + 기계 25 = 63 확정
    else if (GFA <= 6000) requiredArea = 76
    else requiredArea = 130 // 건축 80 + 기계 50 = 130
  } else if (item.id === 'TEMP-003') {
    if (GFA <= 200) requiredArea = 12
    else if (GFA <= 1000) requiredArea = 48
    else if (GFA <= 3000) requiredArea = 100 // 50+50 = 100 확정
    else if (GFA <= 6000) requiredArea = 120
    else requiredArea = 200 // 100+100 = 200
  }

  // 컨테이너 자동 계산 - 0동 버그 수정
  let count9 = item.count9 ?? 1
  let count6 = item.count6 ?? 0
  
  // totalArea가 0이면 자동계산
  if (requiredArea > 0) {
    if (count6 === 0 && count9 === 0) {
      count9 = 1
      const remaining = requiredArea - 27
      count6 = Math.max(0, Math.ceil(remaining / 18))
    }
  }

  const totalArea = count6 * 18 + count9 * 27
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
    monthlyRent,
    rentTotal,
    totalCost,
    spec: `3.0*6.0 x${count6} + 3.0*9.0 x${count9} (totalArea ${totalArea}㎡)`
  }
}

export function calculateAll(items: any[], ctx: any) {
  return items.map((it: any) => ({ 
    ...it, 
    calc: calculateQuantity(it, ctx) 
  }))
}

