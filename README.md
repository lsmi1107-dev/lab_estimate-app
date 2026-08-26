
# 가설 시험실 공사비 산출기 v2 - GitHub 연동 버전

## 2단계 등급 확정 로직
- STEP1: 연면적 기준 가산정 (설계단계)
- STEP2: 총공사비 기준 재확인 (실행단계)
- 최종 등급 = max(연면적등급, 총공사비등급)

## Lovable + GitHub 연동 방법
1. 이 repo를 GitHub에 push
2. Lovable 대시보드 > Settings > GitHub 연결 > 이 repo 선택
3. Lovable이 자동으로 import
4. 이후 Lovable에서 수정하면 GitHub로 auto-commit, GitHub에서 push하면 Lovable로 auto-sync

## 로컬 실행
```
npm install
npm run dev
```

## 배포
- Vercel / Netlify에 이 GitHub repo 연결하면 자동 배포
