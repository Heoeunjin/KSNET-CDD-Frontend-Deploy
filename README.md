# KSNET 고객확인제도 (KYC)

<img alt="KSNET KYC" src="https://via.placeholder.com/1200x600/1A4CC0/FFFFFF?text=KSNET+KYC" />

---

## 📋 프로젝트 소개

케이에스넷(KSNET) 선불지갑 서비스 이용을 위한 고객확인제도(KYC - Know Your Customer) 프론트 페이지 디자인 및 개발 프로젝트입니다.

금융거래의 안전성을 높이고 자금세탁 등 불법 금융거래를 예방하기 위해 시행되는 법적 의무 제도에 따라, 고객의 신원 정보 확인 절차를 웹 프론트엔드로 구현합니다.

---

## 🎯 주요 기능

### 📱 KYC 단계별 인증 플로우

- 기본정보 입력 (이름, 주민등록번호, 휴대폰 본인인증)
- 추가 기본정보 (여권 영문명, 국적, 거주지 주소)
- 추가정보 (직업, 거래 자금의 원천, 거래 목적, 실소유자 여부)
- 계좌 인증 (1원 인증)
- 신분증 인증 (주민등록증 / 운전면허증)

---

## 📁 프로젝트 구조

```
KSNET_CDD/
│
├── index.html              # 메인 시작 화면
├── index.css               # 메인 화면 스타일
├── index.js                # 메인 화면 스크립트
│
├── css/                    # 전역 스타일시트
│   ├── common.css          # 공통 스타일 (변수, 리셋, 버튼, 폼, 모달)
│   └── module/             # 모듈별 CSS
│       ├── progress.css    # 진행 단계 표시
│       ├── form.css        # 폼 공통 스타일
│       └── modal.css       # 팝업/모달 스타일
│
├── js/                     # 전역 JavaScript
│   ├── common.js           # 공통 유틸리티
│   └── module/             # 모듈별 JS
│       ├── validation.js   # 입력 유효성 검사
│       └── timer.js        # 타이머 기능
│
├── intro/                  # 고객확인제도 안내 페이지
│   └── index.html
│
├── basic-info/             # 기본정보 입력 (Step 1)
│   ├── index.html          # 이름, 주민등록번호, 통신사, 휴대폰 인증
│   ├── index.css
│   └── index.js
│
├── personal-info/          # 추가 기본정보 (Step 2)
│   ├── index.html          # 여권 영문명, 국적, 거주지 주소
│   ├── index.css
│   └── index.js
│
├── additional-info/        # 추가정보 (Step 3)
│   ├── index.html          # 직업, 자금원천, 거래목적, 실소유자 여부
│   ├── index.css
│   └── index.js
│
├── account-verify/         # 계좌 인증 (Step 4)
│   ├── index.html          # 은행 선택, 계좌번호, 1원 인증
│   ├── index.css
│   └── index.js
│
├── id-verify/              # 신분증 인증 (Step 5)
│   ├── index.html          # 주민등록증 / 운전면허증 탭
│   ├── index.css
│   └── index.js
│
└── complete/               # 완료 페이지
    └── index.html
```

---

## 🛠 기술 스택

### Frontend

- **HTML5** - 마크업
- **CSS3** - 스타일링 (CSS 변수, Flexbox, Grid)
- **JavaScript (Vanilla JS)** - 인터랙션 및 동적 기능

---

## 📂 주요 디렉토리 설명

| 디렉토리               | 설명                                    |
| ---------------------- | --------------------------------------- |
| **`/css`**             | 전역 스타일 및 모듈별 CSS               |
| **`/js`**              | 전역 공통 스크립트 및 모듈별 JS         |
| **`/intro`**           | 고객확인제도 안내 및 설명 페이지        |
| **`/basic-info`**      | KYC Step 1: 기본정보 입력 + 휴대폰 인증 |
| **`/personal-info`**   | KYC Step 2: 여권영문명, 국적, 주소 입력 |
| **`/additional-info`** | KYC Step 3: 직업, 자금원천, 거래목적    |
| **`/account-verify`**  | KYC Step 4: 계좌 1원 인증               |
| **`/id-verify`**       | KYC Step 5: 신분증 인증                 |
| **`/complete`**        | 고객확인 완료 페이지                    |

---

## 🔄 KYC 진행 플로우

```
메인 화면
    │
    ├── [고객확인제도란?] → 안내 페이지 (intro/)
    │
    └── [고객확인하기] ──→ 기본정보 입력 (basic-info/)
                               │
                               ↓
                          추가 기본정보 (personal-info/)
                               │
                               ↓
                          추가정보 입력 (additional-info/)
                               │
                               ↓
                          계좌 인증 (account-verify/)
                               │
                               ↓
                          신분증 인증 (id-verify/)
                               │
                               ↓
                          고객확인 완료 (complete/)
```

---

## 📱 반응형 디자인

모바일 우선(Mobile First) 설계로 구현됩니다.

- ✅ 모바일 최적화 레이아웃 (기준 너비: 390px)
- ✅ 터치 인터페이스 최적화

---

**마지막 업데이트**: 2026년 3월
