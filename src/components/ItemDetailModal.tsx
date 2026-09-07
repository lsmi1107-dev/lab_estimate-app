// 최종 확정 - 초기값 자동계산 + 임대료 기본값 수정
import { useState, useMemo } from 'react'

export default function ItemDetailModal({ item, projectContext, onClose, onSave }: any) {
  const GFA = projectContext?.grossFloorArea || projectContext?.연면적 || 10000
  const duration = projectContext?.duration || projectContext?.공사기간 || 12
  const is001 = item?.id === 'TEMP-001'

  // 오늘 확정 - requiredArea
  const requiredArea = useMemo(() => {
    if (is001) {
      if (GFA <= 200) return 6
      if (GFA <= 1000) return 30
      if (GFA <= 3000) return 63
      if (GFA <= 6000) return 76
      return 130
    } else {
      if (GFA <= 200) return 12
      if (GFA <= 1000) return 48
      if (GFA <= 3000) return 100
      if (GFA <= 6000) return 120
      return 200
    }
  }, [GFA, is001])

  // 자동계산: requiredArea -> count6/count9
  const autoCalc = useMemo(() => {
    let c9 = 1
    let c6 = Math.max(0, Math.ceil((requiredArea - 27) / 18))
    // 더 최적화: totalArea가 required보다 크면 유지, 작으면 +1
    let total = c6*18 + c9*27
    while (total < requiredArea) { c6++; total = c6*18 + c9*27 }
    return { c6, c9, total }
  }, [requiredArea])

  const [count6, setCount6] = useState(autoCalc.c6)
  const [count9, setCount9] = useState(autoCalc.c9)
  const [rent6, setRent6] = useState(350000) // 기본값 35만
  const [rent9, setRent9] = useState(550000) // 기본값 55만
  const [installCost, setInstallCost] = useState(1000000)
  const [transportCost, setTransportCost] = useState(1200000)

  const totalArea = count6 * 18 + count9 * 27
  const monthlyRent = count6 * rent6 + count9 * rent9
  const rentTotal = monthlyRent * duration
  const totalCost = rentTotal + installCost + transportCost
  const diff = totalArea - requiredArea

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#f5f4ef] rounded- max-w-2xl w-full max-h- overflow-y-auto p-6">
        <div className="flex justify-between">
          <div><div className="font-bold">상세 산출 — {item?.id} {item?.품명}</div><div className="text-xs text-gray-500">2020 표준품셈 2-1-2 · 컨테이너 혼합배치</div></div>
          <button onClick={onClose}>×</button>
        </div>

        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="bg-white rounded-xl p-3"><div className="text-xs text-gray-400">연면적</div><div className="font-bold">{GFA.toLocaleString()}㎡</div></div>
          <div className="bg-white rounded-xl p-3"><div className="text-xs text-gray-400">건물용도</div><div className="font-bold">업무시설</div></div>
          <div className="bg-white rounded-xl p-3"><div className="text-xs text-gray-400">공사기간</div><div className="font-bold">{duration}개월</div></div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="font-semibold text-sm mb-2">필요 면적 산출 과정</div>
          <div className="bg-slate-50 rounded p-2 text-xs font-mono">IF(연면적 &lt;= 200, {is001?6:12}, IF(연면적 &lt;= 1000, {is001?30:48}, IF(연면적 &lt;= 3000, {is001?63:100}, IF(연면적 &lt;= 6000, {is001?76:120}, {is001?130:200}))))</div>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>연면적 ≤ 200</span><span>{is001?'6':'12'}㎡</span></div>
            <div className="flex justify-between"><span>연면적 ≤ 1,000</span><span>{is001?'30':'48'}㎡</span></div>
            <div className="flex justify-between"><span>연면적 ≤ 3,000</span><span>{is001?'63':'100'}㎡</span></div>
            <div className="flex justify-between"><span>연면적 ≤ 6,000</span><span>{is001?'76':'120'}㎡</span></div>
            <div className="flex justify-between bg-gray-100 p-2 rounded font-bold"><span>연면적 &gt; 6,000</span><span>{is001?'130':'200'}㎡</span></div>
          </div>
          <div className="flex justify-between mt-3 pt-2 border-t font-bold"><span>requiredArea</span><span>{requiredArea}㎡</span></div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="font-semibold text-sm mb-3">컨테이너 혼합배치 (자동계산됨)</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-xl p-3">
              <div className="flex justify-between items-center"><div><div className="font-bold text-sm">3.0 × 6.0</div><div className="text-xs text-gray-500">18㎡ / 동</div></div>
              <div className="flex items-center gap-2"><button onClick={()=>setCount6(Math.max(0,count6-1))} className="w-7 h-7 border rounded">-</button><span className="w-6 text-center font-bold">{count6}</span><button onClick={()=>setCount6(count6+1)} className="w-7 h-7 border rounded">+</button></div></div>
              <div className="flex items-center gap-1 mt-2"><span className="text-xs">월 임</span><input type="number" value={rent6} onChange={e=>setRent6(Number(e.target.value))} className="flex-1 border rounded p-1 text-right text-sm" /><span className="text-xs">원</span></div>
            </div>
            <div className="border rounded-xl p-3">
              <div className="flex justify-between items-center"><div><div className="font-bold text-sm">3.0 × 9.0</div><div className="text-xs text-gray-500">27㎡ / 동</div></div>
              <div className="flex items-center gap-2"><button onClick={()=>setCount9(Math.max(0,count9-1))} className="w-7 h-7 border rounded">-</button><span className="w-6 text-center font-bold">{count9}</span><button onClick={()=>setCount9(count9+1)} className="w-7 h-7 border rounded">+</button></div></div>
              <div className="flex items-center gap-1 mt-2"><span className="text-xs">월 임</span><input type="number" value={rent9} onChange={e=>setRent9(Number(e.target.value))} className="flex-1 border rounded p-1 text-right text-sm" /><span className="text-xs">원</span></div>
            </div>
          </div>
          <div className={`mt-3 p-2 rounded text-sm text-center font-bold ${diff>=0?'bg-green-50 text-green-700':'bg-red-50 text-red-600'}`}>
            totalArea = {count6}×18 + {count9}×27 = {totalArea}㎡ / 필요 {requiredArea}㎡ · {diff>=0?`${diff}㎡ 여유`:`${Math.abs(diff)}㎡ 부족`}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mt-4 grid grid-cols-2 gap-3">
          <div><label className="text-xs">설치·해체비</label><input type="number" value={installCost} onChange={e=>setInstallCost(Number(e.target.value))} className="w-full border rounded p-2 text-right" /></div>
          <div><label className="text-xs">운반비</label><input type="number" value={transportCost} onChange={e=>setTransportCost(Number(e.target.value))} className="w-full border rounded p-2 text-right" /></div>
        </div>

        <div className="bg-zinc-900 text-white rounded-xl p-4 mt-4">
          <div className="flex justify-between text-sm"><span>월 임대료 합계</span><span>{monthlyRent.toLocaleString()}원</span></div>
          <div className="flex justify-between text-sm mt-1 text-zinc-400"><span>임대료 총액 (×{duration}개월)</span><span>{rentTotal.toLocaleString()}원</span></div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-zinc-700"><span>총 합계</span><span>{totalCost.toLocaleString()}원</span></div>
          <div className="text-xs text-zinc-400 mt-1">연면적 {GFA} → 요구 {requiredArea} → 계상 {totalArea} ({count6}×18+{count9}×27) · {duration}개월</div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 border rounded-lg p-3">닫기</button>
          <button onClick={()=>{ onSave?.({count6,count9,rent6,rent9,installCost,transportCost,totalArea,totalCost, spec:`3.0*6.0 x${count6} + 3.0*9.0 x${count9} (totalArea ${totalArea}㎡)`}); onClose() }} className="flex-1 bg-zinc-900 text-white rounded-lg p-3">저장 (규격란/엑셀 반영)</button>
        </div>
      </div>
    </div>
  )
}
