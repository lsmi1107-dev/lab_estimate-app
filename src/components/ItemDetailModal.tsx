// src/components/ItemDetailModal.tsx - 확정 화면 그대로 (산출식 버튼 모달)
import React, { useState } from 'react'

export default function ItemDetailModal({ item, projectContext, onClose, onSave }: any) {
  const GFA = projectContext?.grossFloorArea || 18119
  const duration = projectContext?.duration || 12

  const is001 = item?.id === 'TEMP-001'
  const requiredArea = is001? (GFA <= 3000? 63 : 130) : (GFA <= 3000? 100 : 200)

  const [count6, setCount6] = useState(is001? 6 : 6)
  const [count9, setCount9] = useState(is001? 1 : 4)
  const [rent6, setRent6] = useState(350000)
  const [rent9, setRent9] = useState(550000)
  const [installCost, setInstallCost] = useState(1000000)
  const [transportCost, setTransportCost] = useState(1200000)

  const totalArea = count6 * 18 + count9 * 27
  const monthlyRent = count6 * rent6 + count9 * rent9
  const rentTotal = monthlyRent * duration
  const totalCost = rentTotal + installCost + transportCost

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#f5f4ef] rounded- max-w-2xl w-full max-h- overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">{item?.id} {item?.품명} - 확정</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="text-sm text-gray-600">연면적 {GFA}㎡ → 소요 {requiredArea}㎡ (2020 표준품셈 2-1-2 건축+기계 합산)</div>
          <div className="text-xs mt-1">{is001? '38+25=63 @3,000 / 80+50=130 @6,000초과' : '50+50=100 @3,000 / 100+100=200 @6,000초과'}</div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-3">컨테이너 혼합배치</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>3.0×6.0m (18㎡)</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCount6(Math.max(0,count6-1))} className="w-8 h-8 border rounded">-</button>
                <span className="w-8 text-center">{count6}동</span>
                <button onClick={() => setCount6(count6+1)} className="w-8 h-8 border rounded">+</button>
                <input value={rent6} onChange={e=>setRent6(Number(e.target.value))} className="w-24 border rounded p-1 text-right text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>3.0×9.0m (27㎡)</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCount9(Math.max(0,count9-1))} className="w-8 h-8 border rounded">-</button>
                <span className="w-8 text-center">{count9}동</span>
                <button onClick={() => setCount9(count9+1)} className="w-8 h-8 border rounded">+</button>
                <input value={rent9} onChange={e=>setRent9(Number(e.target.value))} className="w-24 border rounded p-1 text-right text-sm" />
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm bg-gray-50 p-2 rounded">
            계상: {count6}×18 + {count9}×27 = {totalArea}㎡ (소요 {requiredArea}㎡ 대비 {totalArea-requiredArea}㎡ {totalArea>=requiredArea?'여유':'부족'})
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs">설치·해체비</label>
            <input value={installCost} onChange={e=>setInstallCost(Number(e.target.value))} className="w-full border rounded p-2 text-right" />
          </div>
          <div>
            <label className="text-xs">운반비</label>
            <input value={transportCost} onChange={e=>setTransportCost(Number(e.target.value))} className="w-full border rounded p-2 text-right" />
          </div>
        </div>

        <div className="bg-zinc-900 text-white rounded-xl p-4">
          <div className="flex justify-between text-sm mb-1"><span>임대료 합계</span><span>{rentTotal.toLocaleString()}원 ({monthlyRent.toLocaleString()}×{duration}개월)</span></div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-zinc-700"><span>총 합계</span><span>{totalCost.toLocaleString()}원</span></div>
          <div className="text-xs text-zinc-400 mt-2">연면적 {GFA} → 요구 {requiredArea} → 계상 {totalArea} ({count6}×18 + {count9}×27) · {duration}개월</div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 border rounded-lg p-3">닫기</button>
          <button onClick={() => { onSave?.({count6,count9,rent6,rent9,installCost,transportCost,totalArea,totalCost}); onClose() }} className="flex-1 bg-zinc-900 text-white rounded-lg p-3">저장 (엑셀 반영)</button>
        </div>
      </div>
    </div>
  )
}
