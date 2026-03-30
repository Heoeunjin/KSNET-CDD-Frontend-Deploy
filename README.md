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
    │   ├── config.js           # 통합 시 경로·프록시 베이스(선택)
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
    ├── agreement/              # 고객확인 약관 동의
    │   ├── index.html
    │   ├── index.js
    │   └── terms/              # 약관 상세(개인정보·고유식별)
    │       ├── privacy.html
    │       ├── unique-id.html
    │       ├── terms-detail.css
    │       └── terms-detail.js
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
| **`/agreement`**       | 고객확인 약관 동의 및 약관 상세         |
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
    └── [고객확인하기] ──→ 약관 동의 (agreement/)
                               │
                               ├── 약관 상세 (agreement/terms/)
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

## 🔗 기존 프론트·백엔드에 통합할 때

### 📌 연동 시 필수 구현 사항 (요약)

본 프로젝트는 프론트엔드(UI) 기준으로 구현되어 있으며, 운영 환경에서는 아래를 백엔드에서 구현해야 합니다. (실제 URL은 `KYC_PATH_PREFIX` 등에 따라 앞에 경로가 붙을 수 있습니다.)

1. `POST …/api/kyc/callback`
   - 프론트 요청 본문을 KSNET 콜백 API로 전달하는 프록시
   - `ksnet_svc_tkn`, `mpay_sgnt_vl` 등 민감 값은 서버에서만 생성·병합·주입 (브라우저 노출 금지)

2. `GET|POST …/juso-popup.html`
   - 주소 검색 팝업 페이지. 백엔드(또는 동등한 서버)에서 `server.js`와 같은 계약으로 맞추면 됩니다.
   - 행안부 도로명주소 연동, `confmKey` 서버 주입, 주소 선택 후 `opener.jusoCallBack()` 호출까지 포함

※ 본 레포의 `server.js`는 위 기능의 참고 구현입니다. 운영 시에는 백엔드 스택에 맞게 동일 동작을 구현하면 됩니다. 상세는 아래 절을 참고하세요.

### 스크립트 로드 순서

- `public/js/config.js`는 `public/js/api/kyc-api.js`보다 먼저 로드해야 합니다. (`kyc-api.js`가 `kycAppPath`·프록시 URL 조합에 의존합니다.)
- 본 레포의 각 단계 `index.html`은 이미 `config.js` → `common.js` → `kyc-api.js` 순으로 두었습니다. 통합 시 스크립트를 합치거나 순서를 바꿀 때 이 순서를 유지하세요.

### 운영 환경과 `server.js`

- 운영에서는 `server.js`(Node)를 사용하지 않는 것을 전제로 합니다.
- 아래 기능은 백엔드에서 `server.js`와 동일한 계약으로 구현되어야 합니다.
  - `POST /api/kyc/callback` — 브라우저가 보낸 JSON을 KSNET 콜백 URL로 그대로 프록시합니다. 루트 `.env`에 있던 토큰·서명·식별 코드 등은 서버에서만 `request_data` 등에 병합하고, 브라우저에는 노출하지 않습니다.

### 주소 검색 팝업 (`juso-popup.html`)

- 프론트는 `kycJusoPopupUrl()`로 `…/juso-popup.html`을 팝업으로 엽니다. (`KYC_PATH_PREFIX`가 있으면 그 아래 경로입니다.)
- 이 URL에 응답하는 쪽은 다음 중 하나로 맞추면 됩니다.
  - 정적 파일 + 서버 주입: 배포 경로에 `juso-popup.html`을 두되, 행안부 승인키(`confmKey`)는 서버에서만 HTML에 넣습니다. 순수 정적 파일에 키를 박아 두면 클라이언트에 노출됩니다.
  - 동적 HTML: 로컬의 `server.js`가 하는 것처럼 `GET|POST`로 같은 URL을 처리합니다. 구현 참고는 `server.js`의 `sendJusoPopup` 및 `renderJusoFirstLoad` / `renderJusoCallback` 흐름(행안부 연동 → `inputYn=Y` 시 `opener.jusoCallBack` 호출)과 동일하면 됩니다.
- 부모 페이지와 팝업은 같은 사이트(origin)에서 열리는 구성을 권장합니다(`opener` 연동).

### 그 외

- 정적 리소스: `public/` 전체를 웹 서버(또는 빌드 산출물)에 두고, 단계 간 이동은 상대 경로(`../`)를 유지하면 폴더 구조만 같게 옮기면 됩니다.
- 로컬 개발: `npm install && npm start`와 루트 `.env`는 연동·화면 확인용입니다.
- 하위 경로 배포: KYC가 `https://도메인/프리픽스/...` 아래에만 있을 때 `config.js`에서 `window.KYC_PATH_PREFIX = '/프리픽스'`(예: `'/wallet/kyc'`)를 설정합니다.
- 프록시가 다른 호스트: `window.KYC_PROXY_BASE = 'https://api.example.com'`처럼 지정하면 KSNET 호출은 해당 출처의 `…/api/kyc/callback`으로 나갑니다. (Live Server만 쓸 때는 로컬 Node 주소를 넣는 방식과 동일합니다.)

마지막 업데이트: 2026년 3월
