# KSNET 고객확인제도 (KYC)

<img width="2627" height="596" alt="ksnet-logo" src="https://github.com/user-attachments/assets/9da21616-86d3-4ee4-9c2f-e4cf6b5ee846" />
<img width="809" height="184" alt="KakaoTalk_Photo_2026-03-18-17-53-59 002" src="https://github.com/user-attachments/assets/9cdf73f6-75d1-4ec4-8529-54b793f2f43a" />

## 📋 프로젝트 소개

선불지갑 서비스 이용을 위한 고객확인제도(KYC) 웹 프론트엔드 프로젝트입니다.

## 🎯 주요 기능

### KYC 단계별 플로우

- 기본정보 입력 (이름, 주민등록번호, 휴대폰 본인인증)
- 추가 기본정보 (여권 영문명, 국적, 거주지 주소)
- 추가정보 (직업, 거래 자금의 원천, 거래 목적, 실소유자 여부)
- 계좌 인증 (1원 인증)
- 신분증 인증

## 📁 프로젝트 구조

```
KSNET_CDD/
│
├── server.js               # Express: 정적(public) + /api/kyc/callback + juso-popup
├── package.json
│
└── public/                 # 브라우저에 서빙되는 정적 자산
    │
    ├── index.html              # 메인 시작 화면
    ├── index.css               # 메인 화면 스타일
    ├── index.js                # 메인 화면 스크립트
    ├── favicon.svg
    │
    ├── css/                    # 전역 스타일시트
    │   ├── common.css          # 공통 스타일 (변수, 리셋, 버튼, 폼, 모달)
    │   └── module/             # 모듈별 CSS
    │       └── progress.css    # 진행 단계 표시
    │
    ├── js/                     # 전역 JavaScript
    │   ├── common.js           # 공통 유틸리티
    │   ├── api/kyc-api.js      # KSNET 호출 공통 모듈
    │   └── module/             # 모듈별 JS
    │       ├── validation.js   # 입력 유효성 검사
    │       └── timer.js        # 타이머 기능
    │
    ├── assets/                 # 이미지 등 (선택)
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

## 🛠 기술 스택

- HTML5 / CSS3
- JavaScript (Vanilla JS)

## 📂 주요 디렉토리

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

**마지막 업데이트**: 2026년 3월
