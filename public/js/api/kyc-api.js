/**
 * =============================================================================
 * KSNET KYC API 공통 모듈 (프론트엔드 전용)
 * =============================================================================
 * 기준 문서: 2026.03.18_KSNET_KYC_API_Spec_front V2
 * 엔드포인트: 단일 POST, tr_cd(거래코드)로 업무 구분
 *
 * -----------------------------------------------------------------------------
 * ★ 유지보수 안내 ★
 * -----------------------------------------------------------------------------
 * 1) KSNET과 통신하는 프론트 코드는 이 파일에만 둡니다.
 * 2) 거래코드·필드명 변경 → 해당 메서드만 수정.
 * 3) 통신사·은행 코드 → CARRIER_MAP / BANK_CODE_MAP.
 * 4) 비밀키·토큰·서명 → 서버 프록시(server.js) + .env (브라우저에 두지 않음).
 * 5) 신규 gubun → call()로 메서드 추가.
 *
 * 프록시가 .env → request_data 에 넣을 키 (명세 화면 상단과 동일):
 *   KSNET_LWRN_USNS_CD→lwrn_usns_cd, KSNET_MERCH_NO→merch_no, KSNET_MPAY_MSALT→mpay_msalt
 *   KSNET_SVC_TKN→ksnet_svc_tkn, KSNET_MPAY_SGNT_VL→mpay_sgnt_vl
 *   URL: KSNET_API_BASE_URL + KSNET_API_PATH
 *
 * -----------------------------------------------------------------------------
 * 전체 호출 흐름 표 (명세 V2) — 거래코드는 이 표만 기준으로 둠
 * -----------------------------------------------------------------------------
 * 순서 | 단계              | gubun | tr_cd
 * -----|-------------------|-------|------------------
 *  1   | 토큰 검증(인입)   |  —    | S0KSCCOB01I401
 *  2   | SMS 인증번호 발송 |  1    | S0KSCCOB04I001
 *  3   | SMS 인증번호 확인 |  2    | S0KSCCOB04I201
 *  4   | SMS 재발송        |  3    | S0KSCCOB04I001 (동일)
 *  5   | 추가정보 저장     |  5    | S0KSCCOB05I101
 *  6   | 1원 계좌 요청     |  6    | S0KSCCOB05I201
 *  7   | 1원 계좌 확인     |  7    | S0KSCCOB05I301
 *  8   | 신분증·KYC 완료   |  8    | S0KSCCOB05I401
 *
 * 명세 개정 시 → 아래 TR_CD 상수만 수정.
 *
 * -----------------------------------------------------------------------------
 * 응답: response_header.result_code === '0' 정상
 * -----------------------------------------------------------------------------
 */

const KYC_API = {
    /**
     * 기본: 동일 출처 `/api/kyc/callback` (npm start 로 같은 포트에서 띄울 때)
     * Live Server 등 다른 포트만 쓸 때: js/config.js 에서 window.KYC_PROXY_BASE 설정
     */
    get PROXY_URL() {
        const base = typeof window !== 'undefined' && window.KYC_PROXY_BASE;
        return base
            ? `${String(base).replace(/\/$/, '')}/api/kyc/callback`
            : '/api/kyc/callback';
    },
    CONTENT_TYPE: 'application/json; charset=UTF-8',

    /** 전체 호출 흐름 표의 tr_cd (단일 출처) */
    TR_CD: {
        TOKEN_VERIFY: 'S0KSCCOB01I401',
        SMS_SEND: 'S0KSCCOB04I001',
        SMS_VERIFY: 'S0KSCCOB04I201',
        SAVE_ADDITIONAL: 'S0KSCCOB05I101',
        ACCOUNT_SEND: 'S0KSCCOB05I201',
        ACCOUNT_CONFIRM: 'S0KSCCOB05I301',
        ID_SUBMIT: 'S0KSCCOB05I401'
    },

    REQUEST_HEADER: {
        scrn_id: '0000000000',
        rqs_tpcd: '1',
        rqs_trm_dscd: 'S',
        nocer_tr_yn: 'Y'
    },

    CARRIER_MAP: {
        SKT: 'SKT', KT: 'KT', LGU: 'LGU',
        SKT_MVNO: 'MVNO_SKT', KT_MVNO: 'MVNO_KT', LGU_MVNO: 'MVNO_LGU'
    },

    /**
     * account-verify 화면 code → KSNET bnk_cd (3자리).
     * 증권·미기재 기관은 명세 확정 전 임시 매핑 — 운영 전 KSNET 코드표와 재대조.
     */
    BANK_CODE_MAP: {
        KB: '004', IBK: '003', NH: '011', KDB: '002', SUHYUP: '007',
        SHINHAN: '088', WOORI: '020', POST: '071', HANA: '081', CITI: '027',
        SC: '023', KAKAO: '090', KBANK: '089', TOSS: '092', GYEONGNAM: '039',
        GWANGJU: '034', IAMBANK: '031', BUSAN: '032', JEONBUK: '037', JEJU: '035',
        SAVINGS: '050', FOREST: '064', SEMAUL: '045', CREDIT: '048',
        KB_SEC: '004', KYOBO: '088', DAESHIN: '088', MERITZ: '088', MIRAE: '088',
        BUGUK: '088', SAMSUNG: '088', SANGSANGIN: '088', SINYOUNG: '088',
        SHINHAN_SEC: '088', YUANTA: '088', EUGENE: '088', LS: '088',
        KAKAOPAY: '090', CAPE: '088', KIWOOM: '088', TOSS_SEC: '092',
        HANA_SEC: '081', KIS: '088', HANWHA: '088', HYUNDAI: '088',
        BNK_SEC: '032', IAM_SEC: '031', WOORI_SEC: '020'
    },

    async call(trCd, requestData) {
        const payload = {
            request_header: { ...this.REQUEST_HEADER, tr_cd: trCd },
            request_data: requestData
        };
        const res = await fetch(this.PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': this.CONTENT_TYPE },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        return res.json();
    },

    /**
     * 인입 · 토큰 검증 (명세 순서 1)
     * request_data는 프록시가 .env·세션으로 채움. 추가 필드만 인자로 전달.
     */
    async verifyToken(extraRequestData = {}) {
        return this.call(this.TR_CD.TOKEN_VERIFY, { ...extraRequestData });
    },

    /** gubun=1 · SMS 발송 */
    async sendSms(data) {
        return this.call(this.TR_CD.SMS_SEND, {
            cer_tr_uky_us_dscd: 'M01',
            usr_nm: data.usr_nm,
            usr_inf: data.usr_inf,
            usr_sex: data.usr_sex,
            cmm_comp_dscd: this.CARRIER_MAP[data.carrier] || data.carrier,
            mbtl_no: data.mbtl_no.replace(/\D/g, '')
        });
    },

    /** gubun=2 · SMS 확인 */
    async verifySms(data) {
        return this.call(this.TR_CD.SMS_VERIFY, {
            cer_tr_uky: data.cer_tr_uky,
            rqs_unq_no: data.rqs_unq_no,
            rspd_unq_no: data.rspd_unq_no,
            cer_no: data.cer_no,
            mbtl_no: data.mbtl_no.replace(/\D/g, '')
        });
    },

    /** gubun=3 · SMS 재발송 (동일 tr_cd, 응답 키는 새 값으로 교체) */
    async resendSms(data) {
        return this.sendSms(data);
    },

    /** gubun=5 · 추가정보 */
    async saveAdditionalInfo(data) {
        return this.call(this.TR_CD.SAVE_ADDITIONAL, { ...data, cur_step: '05' });
    },

    /** gubun=6 · 1원 요청 */
    async requestAccountVerify(data) {
        let bnkCd = this.BANK_CODE_MAP[data.bankCode] || data.bankCode;
        bnkCd = String(bnkCd).replace(/\D/g, '');
        if (!bnkCd) bnkCd = '004';
        bnkCd = bnkCd.padStart(3, '0').slice(0, 3);
        return this.call(this.TR_CD.ACCOUNT_SEND, {
            cer_tr_uky: data.cer_tr_uky,
            acno: (data.acno || '').replace(/\D/g, ''),
            acntNm: data.acntNm || '',
            bnk_cd: bnkCd
        });
    },

    /** gubun=7 · 1원 확인 */
    async confirmAccountVerify(data) {
        return this.call(this.TR_CD.ACCOUNT_CONFIRM, {
            cer_tr_uky: data.cer_tr_uky,
            acn_cer_tr_uky: data.acn_cer_tr_uky,
            // KSNET 개발 모듈: 적요(입금자명 숫자) 3자리 (V3 안내 기준)
            synp_cer_no: (data.synp_cer_no || '').replace(/\D/g, '').slice(0, 3)
        });
    },

    /**
     * gubun=8 · 신분증·완료
     * 명세 선택 필드: uploadFileName, savedFileName, uploadFileSize (미사용 시 공백)
     */
    async submitIdCard(data) {
        const idFields = data.idFields || {};
        return this.call(this.TR_CD.ID_SUBMIT, {
            cer_tr_uky: data.cer_tr_uky,
            acn_cer_tr_uky: data.acn_cer_tr_uky,
            selIdTypeVal: data.selIdTypeVal || 'RRN',
            uploadFileName: data.uploadFileName != null ? data.uploadFileName : '',
            savedFileName: data.savedFileName != null ? data.savedFileName : '',
            uploadFileSize: data.uploadFileSize != null ? data.uploadFileSize : '0',
            ...idFields
        });
    }
};
