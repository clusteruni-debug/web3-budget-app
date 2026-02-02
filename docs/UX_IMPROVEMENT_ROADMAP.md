# 자산관리 앱 UX/UI 개선 로드맵

> 작성일: 2026-02-02
> 버전: 1.0
> 상태: 계획 수립 완료

---

## 목차

1. [Executive Summary](#executive-summary)
2. [현재 상태 분석](#현재-상태-분석)
3. [개선 우선순위 매트릭스](#개선-우선순위-매트릭스)
4. [Phase별 로드맵](#phase별-로드맵)
5. [상세 태스크 목록](#상세-태스크-목록)
6. [성공 지표(KPIs)](#성공-지표kpis)
7. [참고 자료](#참고-자료)

---

## Executive Summary

### 앱 개요
- **제품명**: 통합 자산 관리
- **목적**: 개인 자산/부채 추적, 현금흐름 시각화, 크립토 포트폴리오 관리
- **차별점**: 크립토 자산(스테이킹, 에어드랍, NFT) 특화
- **기술 스택**: Vite + Vanilla JS + Supabase + Chart.js

### 현재 점수

| 영역 | 점수 | 상태 |
|------|------|------|
| PM (제품 전략) | 6/10 | 기능 과다, 핵심 여정 불명확 |
| UX/UI (사용자 경험) | 5/10 | 정보 과부하, 인터랙션 부족 |
| Visual Design (시각 디자인) | 7/10 | 좋은 기반, 일관성 부족 |
| **종합** | **6/10** | 개선 필요 |

### 핵심 문제 3가지

1. **정보 과부하**: 홈 탭에 13개 섹션, 사용자가 어디를 봐야 할지 모름
2. **기능 중복**: 동일 정보가 여러 탭에 산재, IA(정보구조) 혼란
3. **입력 허들**: 거래 추가에 45초+ 소요, 이탈 원인

### 목표

```
현재: "기능은 많지만 쓰기 어려운 앱"
     ↓
목표: "매일 30초만에 자산을 관리하는 앱"
```

---

## 현재 상태 분석

### 1. PM 관점 분석

#### 1.1 현재 기능 맵

```
메인 탭 (5개)
├── 홈: 순자산, 월간요약, 인사이트, 목표, 퀵액션, 차트, 자산목록, 스테이킹, 에어드랍, 부채, 고정수입/지출, 예산
├── 현금흐름: Sankey, 수입/지출 상세, 분류별 지출, 부채
├── 자산관리: 전체/스테이킹/에어드랍/부채/정리이력 + 필터
├── 거래: 추가 폼, 필터, 목록
└── 도구 (9개 서브탭)
    ├── 월 예산
    ├── 저축 목표
    ├── 구독 서비스
    ├── 결제 일정
    ├── 고정 지출
    ├── 소비 분석
    ├── 투자 손익
    ├── 대출 계산
    └── 설정
```

#### 1.2 문제점

| 문제 | 영향 | 심각도 |
|------|------|--------|
| 기능 간 중복 (자산목록이 홈/자산관리에 중복) | 유지보수 어려움, 사용자 혼란 | 높음 |
| 핵심 사용자 여정 부재 | 리텐션 저하 | 높음 |
| 데이터 입력 허들 (수동 입력만 가능) | 신규 사용자 이탈 | 높음 |
| 성공 지표 미측정 | 개선 방향 알 수 없음 | 중간 |

#### 1.3 경쟁사 대비 SWOT

| 강점 (S) | 약점 (W) |
|---------|---------|
| 크립토 특화 | 자동 연동 없음 |
| 풍부한 기능 | 복잡한 구조 |
| 다크모드 | 모바일 미최적화 |

| 기회 (O) | 위협 (T) |
|---------|---------|
| Web3 시장 성장 | 대형 앱의 크립토 기능 추가 |
| 개인 투자자 증가 | 규제 리스크 |

---

### 2. UX/UI 관점 분석

#### 2.1 현재 정보 구조 (IA)

```
문제: 깊이 불균형
- 홈 탭: 13개 섹션 (과다)
- 도구 탭: 9개 서브탭 (경계선)
- 동일 정보 중복: 자산목록, 부채, 고정지출
```

#### 2.2 핵심 태스크 플로우 분석

**태스크: 지출 기록하기**

| 단계 | 현재 | 개선 후 |
|------|------|---------|
| 1 | 앱 실행 → 홈 탭 로딩 (3초+) | 앱 실행 |
| 2 | 퀵액션 "거래 추가" 클릭 | 플로팅 "+" 버튼 클릭 |
| 3 | 거래 탭 이동 | 바텀 시트 모달 |
| 4 | 폼 입력 (7개 필드) | 금액 입력 + 분류 선택 |
| 5 | 저장 | 저장 |
| **소요 시간** | **45-60초** | **15-20초** |

#### 2.3 인지 부하 분석

| 법칙 | 기준 | 현재 상태 | 판정 |
|------|------|----------|------|
| 밀러의 법칙 | 7±2개 | 홈 탭 13개 섹션 | 위반 |
| 힉의 법칙 | 선택지 최소화 | 분류 20개+ | 위반 |

#### 2.4 개선된 IA 제안

```
개선 후 구조:
├── 홈 (Dashboard) - 핵심 KPI 3개 + 빠른 액션
├── 자산 (Assets) - 자산 + 부채 + 크립토
├── 거래 (Transactions) - 거래 + 현금흐름
├── 예산 (Budget) - 예산 + 목표 + 고정지출
└── 더보기 (More) - 구독, 계산기, 분석, 설정
```

---

### 3. 웹 디자이너 관점 분석

#### 3.1 디자인 시스템 현황

**잘 되어 있는 것:**
- CSS 변수 시스템 (컬러, 스페이싱, 타이포그래피)
- 8px 그리드 기반 일관된 스페이싱
- Pretendard 폰트로 한글 가독성 우수
- 다크 테마 + Glassmorphism 스타일

**부족한 것:**
- 폰트 웨이트 변수 미정의
- 애니메이션/트랜지션 변수 부재
- z-index 스케일 미정의
- 컴포넌트 간 스타일 불일관

#### 3.2 컬러 접근성 이슈

| 요소 | 현재 대비 | WCAG AA 기준 | 상태 |
|------|----------|--------------|------|
| 보조 텍스트 (gray-400) | ~3.5:1 | 4.5:1 | 미달 |
| 비활성 버튼 | ~3:1 | 4.5:1 | 미달 |
| 주요 텍스트 | 7:1+ | 4.5:1 | 통과 |

#### 3.3 버튼 시스템 현황

현재 버튼 클래스가 분산되어 있음:
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.tool-tab-btn`
- `.quick-action-btn`
- `.trend-period-btn`
- `.preset-btn`

**문제:** 같은 역할의 버튼이 다른 스타일

#### 3.4 반응형 브레이크포인트

| 현재 | 개선 제안 |
|------|----------|
| 768px, 480px (2개) | sm: 480px, md: 768px, lg: 1024px, xl: 1280px (4개) |

---

## 개선 우선순위 매트릭스

### Impact vs Effort 매트릭스

```
높은 영향
    │
    │  [P0] 홈 탭 간소화        [P1] IA 재구성
    │  [P0] 거래 입력 간편화    [P2] 거래소 API 연동
    │
    │  [P1] 빈 상태 CTA 추가    [P2] 디자인 시스템 정비
    │  [P1] 버튼 시스템 통합
    │
낮은 영향
    └───────────────────────────────────────
         적은 노력                많은 노력
```

### 우선순위 목록

| 우선순위 | 항목 | 예상 노력 | 예상 영향 |
|---------|------|----------|----------|
| **P0** | 홈 탭 간소화 (핵심 KPI만 표시) | 1일 | 정보 과부하 해소 |
| **P0** | 플로팅 "+" 버튼으로 거래 빠른 추가 | 2일 | 입력 허들 60% 감소 |
| **P1** | 도구 탭 재구성 (자주 쓰는 기능 상단) | 1일 | 기능 접근성 개선 |
| **P1** | 빈 상태에 CTA 버튼 추가 | 1일 | 온보딩 개선 |
| **P1** | 버튼/카드 컴포넌트 표준화 | 2일 | 일관성 개선 |
| **P2** | 색상 대비 접근성 개선 | 1일 | WCAG AA 준수 |
| **P2** | 모달 애니메이션 추가 | 1일 | 사용감 개선 |
| **P2** | 현금흐름/거래 탭 통합 검토 | 3일 | 구조 단순화 |
| **P3** | 거래소 API 연동 (업비트, 바이낸스) | 2주 | 차별화 |
| **P3** | 월간 리포트 자동 생성 | 1주 | 리텐션 개선 |

---

## Phase별 로드맵

### Overview

```
Phase 1: Quick Wins (1주)
    ↓
Phase 2: Core UX (2주)
    ↓
Phase 3: Design System (1주)
    ↓
Phase 4: Advanced Features (4주+)
```

---

### Phase 1: Quick Wins (1주)

> 목표: 즉시 체감되는 사용성 개선

#### 1.1 홈 탭 간소화

**현재 상태:**
```
홈 탭 (13개 섹션)
├── 순자산 히어로
├── 월간 요약 카드
├── 인사이트 카드
├── 목표 진행률
├── 퀵 액션
├── 순자산 추이 차트
├── 자산 구성 차트
├── 자산 목록
├── 스테이킹 현황
├── 에어드랍 현황
├── 부채 현황
├── 고정 수입/지출
└── 예산 현황
```

**개선 후:**
```
홈 탭 (5개 섹션)
├── 순자산 히어로 (유지)
├── 월간 요약 카드 (유지)
├── 목표 진행률 (유지)
├── 퀵 액션 (유지, 하단 고정)
└── 인사이트 카드 (1-2개만)

나머지 → 각 전문 탭으로 이동:
- 자산 목록, 스테이킹, 에어드랍, 부채 → 자산관리 탭
- 순자산 추이, 자산 구성 → 자산관리 탭 또는 별도 "분석" 섹션
- 고정 수입/지출, 예산 현황 → 도구 탭
```

**체크리스트:**
- [ ] HomeTab.js에서 섹션 제거 또는 숨김 처리
- [ ] 퀵 액션을 플로팅 버튼으로 변경
- [ ] 이동된 섹션의 링크 제공

#### 1.2 거래 빠른 입력

**구현 방법:**
```javascript
// 플로팅 액션 버튼 (FAB)
<button class="fab-add-transaction" onclick="openQuickAddModal()">
    <span class="fab-icon">+</span>
</button>

// 바텀 시트 모달 (최소 필드)
<div class="quick-add-modal">
    <input type="number" placeholder="금액" autofocus>
    <div class="quick-categories">
        <!-- 최근 사용 3개 + 더보기 -->
        <button data-category="식비">🍽️ 식비</button>
        <button data-category="교통비">🚌 교통비</button>
        <button data-category="쇼핑">🛒 쇼핑</button>
        <button class="more">더보기</button>
    </div>
    <button class="btn-save">저장</button>
</div>
```

**체크리스트:**
- [ ] FAB 컴포넌트 CSS 추가
- [ ] 바텀 시트 모달 컴포넌트 생성
- [ ] 최근 사용 분류 저장 로직 추가
- [ ] 저장 후 토스트 메시지 표시

#### 1.3 빈 상태 개선

**현재:**
```html
<div class="empty-state">등록된 자산이 없습니다</div>
```

**개선 후:**
```html
<div class="empty-state">
    <div class="empty-icon">💰</div>
    <h3>아직 등록된 자산이 없어요</h3>
    <p>첫 번째 자산을 추가하고 순자산을 추적해보세요!</p>
    <button class="btn-primary" onclick="openAddAssetModal()">
        + 자산 추가하기
    </button>
</div>
```

**체크리스트:**
- [ ] 빈 상태 컴포넌트 스타일 정의
- [ ] 모든 빈 상태에 CTA 버튼 추가
- [ ] 아이콘 및 친절한 메시지 작성

---

### Phase 2: Core UX 개선 (2주)

> 목표: 핵심 사용자 경험 개선

#### 2.1 정보 구조(IA) 재구성

**현재 vs 개선:**

| 현재 | 개선 |
|------|------|
| 홈 (과다) | 홈 (간소화) |
| 현금흐름 | → 거래 탭에 통합 |
| 자산관리 | 자산 (자산+부채+크립토) |
| 거래 | 거래 (거래+현금흐름) |
| 도구 (9개) | 예산 (예산+목표+고정지출) + 더보기 |

**체크리스트:**
- [ ] 탭 네비게이션 재구성
- [ ] 현금흐름 → 거래 탭 하위로 이동
- [ ] 도구 탭 분할 (예산 / 더보기)
- [ ] URL 라우팅 업데이트

#### 2.2 모바일 최적화

**하단 탭 바 구현:**
```css
.bottom-tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: var(--bg-elevated);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-bottom: env(safe-area-inset-bottom); /* 아이폰 노치 대응 */
}
```

**체크리스트:**
- [ ] 데스크탑: 상단 탭 유지
- [ ] 모바일(768px 미만): 하단 탭 바
- [ ] 터치 타겟 44px 이상 보장
- [ ] 스와이프 제스처 검토

#### 2.3 피드백 시스템 구축

**토스트 메시지:**
```javascript
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : '!'}</span>
        <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// 사용 예
showToast('거래가 저장되었습니다', 'success');
showToast('네트워크 오류가 발생했습니다', 'error');
```

**체크리스트:**
- [ ] 토스트 컴포넌트 생성
- [ ] 저장/삭제/에러 시 토스트 표시
- [ ] 로딩 스피너 표준화

#### 2.4 스마트 거래 입력

**자연어 파싱:**
```javascript
// "커피 4500원" → { category: '식비', amount: 4500, title: '커피' }
function parseTransactionText(text) {
    const amountMatch = text.match(/(\d+)[원]?/);
    const amount = amountMatch ? parseInt(amountMatch[1]) : 0;

    const keywords = {
        '커피': '식비', '점심': '식비', '저녁': '식비',
        '택시': '교통비', '버스': '교통비', '지하철': '교통비',
        // ...
    };

    let category = '기타 지출';
    for (const [keyword, cat] of Object.entries(keywords)) {
        if (text.includes(keyword)) {
            category = cat;
            break;
        }
    }

    return { amount, category, title: text.replace(/\d+[원]?/g, '').trim() };
}
```

**체크리스트:**
- [ ] 자연어 파싱 함수 구현
- [ ] 빠른 입력 모달에 텍스트 입력 필드 추가
- [ ] 파싱 결과 미리보기 표시

---

### Phase 3: Design System 정비 (1주)

> 목표: 일관된 디자인 시스템 구축

#### 3.1 CSS 변수 확장

```css
:root {
    /* 기존 변수 유지 + 추가 */

    /* 폰트 웨이트 */
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;

    /* 라인 하이트 */
    --leading-tight: 1.25;
    --leading-normal: 1.5;
    --leading-relaxed: 1.75;

    /* 트랜지션 */
    --transition-fast: 150ms ease;
    --transition-normal: 200ms ease;
    --transition-slow: 300ms ease;
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

    /* z-index 스케일 */
    --z-dropdown: 100;
    --z-sticky: 200;
    --z-modal: 300;
    --z-toast: 400;

    /* 접근성 개선 컬러 */
    --text-secondary: rgba(255, 255, 255, 0.65);
    --text-muted: rgba(255, 255, 255, 0.5);
}
```

**체크리스트:**
- [ ] main.css에 변수 추가
- [ ] 기존 하드코딩된 값을 변수로 교체
- [ ] 문서화

#### 3.2 버튼 시스템 통합

```css
/* 버튼 기본 */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-md);
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    transition: var(--transition-fast);
    cursor: pointer;
    border: none;
}

/* 버튼 변형 */
.btn-primary {
    background: var(--primary);
    color: white;
}
.btn-primary:hover {
    background: var(--primary-dark);
}

.btn-secondary {
    background: var(--bg-card);
    color: var(--gray-100);
    border: 1px solid var(--border-color);
}

.btn-ghost {
    background: transparent;
    color: var(--gray-200);
}

.btn-danger {
    background: var(--negative);
    color: white;
}

/* 버튼 크기 */
.btn-sm { padding: var(--space-2) var(--space-3); font-size: var(--text-xs); }
.btn-lg { padding: var(--space-4) var(--space-6); font-size: var(--text-base); }

/* 칩 버튼 (탭, 필터용) */
.btn-chip {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
}
.btn-chip.active {
    background: var(--primary);
    color: white;
}
```

**체크리스트:**
- [ ] 버튼 클래스 통합 정의
- [ ] 기존 버튼들을 새 시스템으로 마이그레이션
- [ ] 버튼 상태 (hover, active, disabled) 정의

#### 3.3 카드 컴포넌트 표준화

```css
/* 카드 기본 */
.card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
}

/* 카드 변형 */
.card-elevated {
    background: var(--bg-elevated);
    box-shadow: var(--shadow-md);
}

.card-interactive {
    cursor: pointer;
    transition: var(--transition-fast);
}
.card-interactive:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-color-hover);
}

/* 카드 내부 구조 */
.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
}

.card-title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
}

.card-content {
    /* 내용 영역 */
}

.card-footer {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-color);
}
```

**체크리스트:**
- [ ] 카드 컴포넌트 정의
- [ ] 기존 카드들을 새 시스템으로 마이그레이션
- [ ] 카드 내부 레이아웃 표준화

#### 3.4 애니메이션 추가

```css
/* 모달 애니메이션 */
@keyframes modalIn {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes modalOut {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
}

.modal.show .modal-content {
    animation: modalIn 0.25s var(--ease-out-expo);
}

.modal.hide .modal-content {
    animation: modalOut 0.2s ease-in forwards;
}

/* 토스트 애니메이션 */
@keyframes toastIn {
    from {
        opacity: 0;
        transform: translateY(100%);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.toast {
    animation: toastIn 0.3s var(--ease-out-expo);
}

/* 숫자 카운트업 (JS와 함께) */
.count-up {
    transition: var(--transition-slow);
}

/* 스켈레톤 로딩 */
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.skeleton {
    background: linear-gradient(
        90deg,
        var(--bg-card) 25%,
        var(--bg-card-hover) 50%,
        var(--bg-card) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-md);
}
```

**체크리스트:**
- [ ] 모달 애니메이션 적용
- [ ] 토스트 애니메이션 적용
- [ ] 스켈레톤 로딩 컴포넌트 생성
- [ ] 숫자 카운트업 효과 구현

---

### Phase 4: Advanced Features (4주+)

> 목표: 차별화 기능 및 고급 기능

#### 4.1 거래소 API 연동 (2주)

**지원 거래소:**
- 업비트 (국내)
- 바이낸스 (해외)

**기능:**
- Read-Only API 연동
- 잔액 자동 동기화
- 거래 내역 자동 가져오기

**체크리스트:**
- [ ] 업비트 API 연동 모듈 개발
- [ ] 바이낸스 API 연동 모듈 개발
- [ ] API 키 안전한 저장 (Supabase Secret)
- [ ] 동기화 스케줄러 구현
- [ ] 연동 설정 UI

#### 4.2 월간 리포트 (1주)

**기능:**
- 매월 1일 자동 생성
- 지난달 수입/지출 요약
- 분류별 지출 비교
- 목표 달성률
- 인사이트 제공

**체크리스트:**
- [ ] 리포트 생성 로직 구현
- [ ] 리포트 UI 디자인
- [ ] 이메일 발송 기능 (선택)
- [ ] 리포트 히스토리 저장

#### 4.3 알림 시스템 (1주)

**알림 유형:**
- 예산 80% 도달 알림
- 예산 초과 알림
- 결제일 D-3 알림
- 저축 목표 달성 알림

**체크리스트:**
- [ ] 알림 설정 UI
- [ ] 브라우저 Push 알림 구현
- [ ] 알림 히스토리 저장
- [ ] 알림 읽음 처리

#### 4.4 데이터 내보내기/가져오기 (3일)

**기능:**
- CSV 내보내기 (기존 기능 개선)
- JSON 백업/복원
- 다른 가계부 앱에서 가져오기

**체크리스트:**
- [ ] 내보내기 포맷 표준화
- [ ] 가져오기 파서 구현
- [ ] 백업/복원 UI

---

## 상세 태스크 목록

### Phase 1 체크리스트 (1주)

#### Day 1-2: 홈 탭 간소화
- [ ] HomeTab.js 섹션 정리
- [ ] 불필요한 섹션 제거 또는 다른 탭으로 이동
- [ ] 퀵 액션 플로팅 버튼으로 변경

#### Day 3-4: 거래 빠른 입력
- [ ] FAB 컴포넌트 추가
- [ ] 바텀 시트 모달 구현
- [ ] 최소 필드 입력 폼 (금액 + 분류)
- [ ] 최근 사용 분류 표시

#### Day 5: 빈 상태 개선
- [ ] 빈 상태 컴포넌트 스타일 정의
- [ ] 모든 빈 상태에 CTA 추가
- [ ] 친절한 메시지 작성

#### Day 6-7: 테스트 및 버그 수정
- [ ] 반응형 테스트
- [ ] 버그 수정
- [ ] 코드 리뷰

### Phase 2 체크리스트 (2주)

#### Week 1: IA 재구성 + 모바일
- [ ] 탭 네비게이션 재구성
- [ ] 하단 탭 바 구현 (모바일)
- [ ] 현금흐름 탭 통합

#### Week 2: 피드백 + 스마트 입력
- [ ] 토스트 메시지 구현
- [ ] 로딩 스피너 표준화
- [ ] 자연어 파싱 기능
- [ ] 스마트 입력 UI

### Phase 3 체크리스트 (1주)

- [ ] CSS 변수 확장
- [ ] 버튼 시스템 통합
- [ ] 카드 컴포넌트 표준화
- [ ] 애니메이션 추가
- [ ] 문서화

### Phase 4 체크리스트 (4주+)

- [ ] 거래소 API 연동
- [ ] 월간 리포트
- [ ] 알림 시스템
- [ ] 데이터 내보내기/가져오기

---

## 성공 지표(KPIs)

### 측정할 지표

| 지표 | 현재 | Phase 1 후 목표 | 최종 목표 |
|------|------|----------------|----------|
| 거래 입력 소요 시간 | 45초+ | 20초 | 15초 |
| 홈 탭 섹션 수 | 13개 | 5개 | 5개 |
| 첫 방문 이탈률 | 측정 불가 | 30% 미만 | 20% 미만 |
| 주간 거래 입력 수 (사용자당) | 측정 불가 | 5건+ | 10건+ |
| DAU/MAU | 측정 불가 | 20%+ | 30%+ |

### 측정 방법

1. **Supabase Analytics 연동**
   - 페이지 뷰 추적
   - 기능 사용 이벤트 추적

2. **사용자 피드백**
   - 인앱 피드백 버튼
   - 간단한 만족도 조사

3. **성능 모니터링**
   - 페이지 로딩 시간
   - API 응답 시간

---

## 참고 자료

### 벤치마크 앱
- [뱅크샐러드](https://banksalad.com/) - 자동 연동, 깔끔한 UI
- [토스](https://toss.im/) - 간편한 송금/결제, 우수한 UX
- [Mint](https://mint.intuit.com/) - 해외 가계부 앱
- [YNAB](https://www.youneedabudget.com/) - 예산 중심 앱

### UX 원칙
- [Miller's Law](https://lawsofux.com/millers-law/) - 7±2 법칙
- [Hick's Law](https://lawsofux.com/hicks-law/) - 선택지와 결정 시간
- [Don't Make Me Think](https://sensible.com/dont-make-me-think/) - 스티브 크룩

### 디자인 시스템 참고
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 퍼스트
- [Radix UI](https://www.radix-ui.com/) - 접근성 우선 컴포넌트
- [shadcn/ui](https://ui.shadcn.com/) - 복사-붙여넣기 컴포넌트

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-02-02 | 1.0 | 초기 로드맵 작성 |

---

## 다음 단계

1. **이 로드맵 검토** 후 우선순위 조정
2. **Phase 1 착수** - Quick Wins 먼저 진행
3. **주간 리뷰** - 진행 상황 체크

> 질문이나 수정 사항은 이 문서에 코멘트로 남겨주세요.
