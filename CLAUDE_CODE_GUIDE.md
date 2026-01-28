# 🎮 바이브 코딩을 위한 Claude Code 완벽 활용법

## 🎯 핵심 원칙

### 규칙 1: 명확하고 구체적으로
```
❌ 나쁜 예: "거래 기능 만들어줘"
✅ 좋은 예: "src/components/TransactionsTab.js 파일을 만들어줘. 
            database.js의 getTransactions()를 사용해서 
            거래 목록을 테이블로 표시하고, 
            각 행에 수정/삭제 버튼을 추가해줘."
```

### 규칙 2: 한 번에 하나씩
```
❌ 나쁜 예: "전체 거래 시스템 만들어줘"
✅ 좋은 예: 
   "Step 1: 거래 목록만 표시하는 컴포넌트 만들어줘"
   [확인]
   "Step 2: 이제 필터 기능 추가해줘"
   [확인]
   "Step 3: 거래 추가 폼 만들어줘"
```

### 규칙 3: 컨텍스트 제공
```
✅ 좋은 예: 
"거래 추가 폼을 만들어줘.
참고할 것:
- 원본 web3-budget.html의 거래 입력 부분
- main.css의 form-group 스타일 사용
- database.js의 createTransaction() 함수 사용
- 카테고리는 utils/constants.js에서 가져오기"
```

---

## 💡 실전 바이브 코딩 패턴

### 패턴 1: 탐색 → 계획 → 실행

```bash
# 1. 탐색 (Web Chat)
"지금까지 뭐가 완성됐고 뭐가 남았어?"

# 2. 계획 (Web Chat)
"거래 관리 UI를 만들려고 해. 어떤 순서로 만들면 좋을까?"

# 3. 실행 (Claude Code)
claude-code "첫 번째 단계: 거래 목록 컴포넌트 만들어줘"
```

---

### 패턴 2: 빠른 반복

```bash
# Claude Code에서 연속 작업
claude-code

> "TransactionsTab.js 만들어줘"
[생성됨]

> "이제 필터 기능 추가해줘"
[추가됨]

> "날짜 정렬 기능도 넣어줘"
[추가됨]

> "CSS 좀 더 예쁘게 만들어줘"
[수정됨]
```

---

### 패턴 3: 에러 처리

```bash
# 에러 발생 시
1. 에러 메시지 복사
2. Web Chat에 물어보기
3. Claude Code로 수정

# Web Chat
"이런 에러가 났어: [에러 메시지]
코드는 이렇게 되어 있어: [코드 일부]
왜 이런거야?"

# 해결책 받음

# Claude Code
"auth.js 42번째 줄을 이렇게 수정해줘: [해결책]"
```

---

## 🎯 Claude Code 프롬프트 템플릿

### 1. 새 컴포넌트 만들기
```
"[컴포넌트명].js 파일을 src/components/에 만들어줘.

요구사항:
- [기능 1]
- [기능 2]
- [기능 3]

사용할 것:
- [API 함수]
- [스타일 클래스]

참고:
- [기존 파일이나 패턴]"
```

### 2. 기존 파일 수정
```
"[파일명]을 수정해줘.

변경 사항:
- [변경 1]
- [변경 2]

[수정할 부분의 현재 코드]를
[이렇게 바꿔줘]"
```

### 3. 기능 추가
```
"[파일명]에 [기능]을 추가해줘.

동작:
1. [단계 1]
2. [단계 2]
3. [단계 3]

사용할 함수: [함수명]"
```

### 4. 버그 수정
```
"[파일명]의 [함수명]에서 버그가 있어.

문제:
- [증상]

예상 원인:
- [추정]

이렇게 수정해줘:
- [해결책]"
```

---

## 🚀 효율적인 작업 흐름

### 아침 시작할 때
```bash
# 1. Web Chat에서 계획
"오늘은 거래 관리 UI를 완성하고 싶어.
어떤 순서로 하면 좋을까?"

# 2. Claude Code로 시작
claude-code "오늘 할 작업: 거래 관리 UI
             첫 번째 작업부터 시작해줘"

# 3. 순차 진행
```

### 막혔을 때
```bash
# 1. 일단 멈추기
# 2. Web Chat에서 질문
"이 부분이 이해가 안 가는데, 설명해줘"
# 3. 이해 후 Claude Code 재개
```

### 완성했을 때
```bash
# 1. Web Chat에서 체크
"지금까지 완성된 것 정리해줘"
# 2. 다음 단계 계획
"다음은 뭐 하면 좋을까?"
```

---

## 📋 프로젝트 진행 시 Claude Code 프롬프트 시퀀스

### 🎯 지금 당장 (에러 수정)

```bash
claude-code

"FIX_AUTO_LOGIN_ERROR.md 파일을 읽고, 
거기 나온 대로 정확히 수정해줘.

순서:
1. database.js에 createDefaultAccounts 함수 추가
2. database.js에 createDefaultRPGData 함수 추가
3. auth.js의 signUp 함수 수정
4. auth.js의 autoSignUpAndLogin 함수 수정

하나씩 완료될 때마다 알려줘."
```

---

### 🎯 에러 수정 후 (거래 관리 UI)

```bash
claude-code

"거래 관리 UI를 단계별로 만들어줘.

Phase 1: 거래 목록 기본
- src/components/TransactionsTab.js 생성
- database.js의 getTransactions() 사용
- 거래를 테이블로 표시 (날짜, 분류, 카테고리, 금액, 설명)
- main.css 스타일 사용

Phase 1만 먼저 완성해줘.
완료되면 다음 Phase 알려줘."
```

---

## 💡 고급 팁

### Tip 1: 컨텍스트 유지
```bash
# 연속 작업 시 컨텍스트 제공
"아까 만든 TransactionsTab.js에 
필터 기능을 추가해줘.
전체/수입/지출 버튼으로 필터링되게."
```

### Tip 2: 예제 제공
```bash
"거래 추가 폼을 만들어줘.

원본 HTML의 이 부분 참고:
[web3-budget.html의 관련 코드]

이 구조를 React 스타일 컴포넌트로 변환해줘."
```

### Tip 3: 스타일 일관성
```bash
"버튼 스타일을 기존 CSS와 동일하게 해줘.
main.css의 .btn-primary 클래스 사용."
```

---

## 🎮 실전 시나리오

### 시나리오 1: 새 기능 추가
```
[Web Chat]
"거래에 태그 기능을 추가하고 싶어. 어떻게 구현하면 좋을까?"
→ 구조 논의

[Claude Code]
"database.js에 태그 관련 함수 추가해줘"
→ 코드 생성

[Web Chat]
"UI는 어떻게 만들면 좋을까?"
→ 디자인 논의

[Claude Code]
"TransactionsTab.js에 태그 입력 필드 추가해줘"
→ UI 생성
```

### 시나리오 2: 버그 발견
```
[브라우저]
에러 발견!

[Web Chat]
"이런 에러가 나는데 왜 그런거야? [스크린샷]"
→ 원인 분석

[Claude Code]
"auth.js 42번 줄 수정해줘: [해결책]"
→ 빠른 수정

[브라우저]
확인!
```

---

## 📝 체크리스트

### 작업 시작 전
- [ ] 목표 명확하게 정의
- [ ] Web Chat에서 전략 논의
- [ ] 작업 순서 결정

### 작업 중
- [ ] 한 번에 하나씩
- [ ] 각 단계마다 확인
- [ ] 에러는 Web Chat에서 분석

### 작업 완료 후
- [ ] 동작 확인
- [ ] 코드 정리
- [ ] 다음 단계 계획

---

## 🎯 지금 바로 시작하기

```bash
# 1. Claude Code 실행
claude-code

# 2. 첫 프롬프트
"안녕! 지금 웹 채팅에서 여기로 넘어왔어.

현재 상황:
- 자동 로그인 에러 있음 (Database error saving new user)
- FIX_AUTO_LOGIN_ERROR.md에 해결 방법 있음

먼저 이 에러를 수정해줘.
FIX_AUTO_LOGIN_ERROR.md 파일을 읽고 정확히 따라서 수정해줘."
```

---

## 💬 도움이 필요할 때

### Claude Code에서 막힐 때
→ Web Chat으로 와서 "Claude Code에서 이렇게 했는데 안 돼" 질문

### 큰 그림이 필요할 때
→ Web Chat에서 "지금까지 뭐 했고 다음은 뭐 해야 해?" 질문

### 빠른 수정이 필요할 때
→ Claude Code에서 바로 "이거 고쳐줘"
