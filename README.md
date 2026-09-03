# lab_estimate-app v3 - SSOT 기반 가설공사 자동산출

## Scaffolding
/src/domain/types.ts - ProjectContext, BOQLineItem (1급 시민)
/src/ssot/items.ssot.yaml - 단일 진실 공급원 (SSOT)
/src/calc/quantityEngine.ts - 수량 산출 엔진 (SSOT만 보고 계산)
/src/validation/ratchet.ts - Tight Loop 검증 + Ratchet
/src/io/excelExporter.ts - 첨부 엑셀 양식 그대로 출력
/src/routes/index.tsx - 기존 라우트 유지

## SSOT 원칙
- 모든 Line Item 정의는 items.ssot.yaml에만 존재
- 각 Line Item은 개별 산출식(formula) 보유, 개별 편집 가능
- 계산 화면과 Summary Sheet 모두 SSOT 기반 렌더 -> 불일치 원천 차단

## ProjectContext 변경 (사용자 요청 반영)
- 삭제: 월평균노무자수, 형상보정계수
- 추가: 건물용도, 구조, 층수(지상/지하)

## Line Item (8개)
TEMP-001 ~ TEMP-008 - 각 항목별 산출식 포함, 추가 가능 (TEMP-009...)

## Tight Loop
Input(ProjectContext) -> calculateAll -> validate -> Summary Sheet -> Feedback

## Ratchet
- snapshot(): Golden Excel 비교
- ratchetCheck(): 수량 하향 변경시 approval 필요
- Change Log: formula 변경시 edited_by, edited_at 기록

## Lovable 테스트 프롬프트
```
https://github.com/lsmi1107-dev/lab_estimate-app 이 저장소의 v3 코드를 반영해줘.
SSOT는 src/ssot/items.ssot.yaml
ProjectContext는 건물용도/구조/층수 포함, 월평균노무자수/형상보정계수 제거
Summary Sheet는 첨부 엑셀 양식(품명/규격/단위/수량/재료비/노무비/경비/합계/비고) 그대로
각 Line Item마다 산출식 개별 편집 가능하게
```

## 다음 단계
- 각 Line Item 산출식 사용자 회사 기준으로 교체
- Line Item 추가 (분진망, 시스템비계 등) -> items.ssot.yaml에 추가만 하면 됨
