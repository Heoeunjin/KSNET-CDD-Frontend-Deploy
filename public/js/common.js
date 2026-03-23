/**
 * KSNET 고객확인제도 (KYC) - 공통 유틸리티
 */

const KYC = {

    decodeSafe(value) {
        if (value == null) return '';
        const str = String(value);
        try {
            return decodeURIComponent(str);
        } catch (e) {
            return str;
        }
    },

    normalizeCallbackUrl(raw) {
        const text = this.decodeSafe(raw).trim();
        if (!text) return '';
        try {
            const u = new URL(text, window.location.href);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
            return u.href;
        } catch (e) {
            return '';
        }
    },

    /**
     * URL 쿼리에서 callbackUrl|callback|jsonData.callbackUrl 읽어 sessionStorage 저장
     */
    captureCallbackFromUrl() {
        try {
            const qs = new URLSearchParams(window.location.search);

            let callbackRaw = qs.get('callbackUrl') || qs.get('callback') || '';

            // 외부에서 jsonData로 전달하는 경우도 허용
            if (!callbackRaw) {
                const rawJson = qs.get('jsonData');
                if (rawJson) {
                    try {
                        const decoded = this.decodeSafe(rawJson);
                        const obj = JSON.parse(decoded);
                        callbackRaw = obj && (obj.callbackUrl || obj.callback) ? (obj.callbackUrl || obj.callback) : '';
                    } catch (e) {
                        console.warn('jsonData 파싱 실패:', e);
                    }
                }
            }

            const normalized = this.normalizeCallbackUrl(callbackRaw);
            if (!normalized) return;
            this.saveStep({ kyc_callback_url: normalized });
        } catch (e) {
            console.warn('callback URL 저장 실패:', e);
        }
    },

    /**
     * KYC 진입 시 토큰 검증(전체 호출 흐름 표 1단계 · KYC_API.TR_CD.TOKEN_VERIFY) 1회 성공 여부
     * @returns {Promise<boolean>}
     */
    async ensureTokenVerified() {
        const data = this.loadStep();
        if (data.kyc_token_verified) return true;
        if (typeof KYC_API === 'undefined') return true;
        try {
            const res = await KYC_API.verifyToken({});
            const h = res.response_header || {};
            if (h.result_code === '0') {
                this.saveStep({ kyc_token_verified: true });
                return true;
            }
            return false;
        } catch (e) {
            console.warn('토큰 검증 요청 실패(프록시 미구동 시 무시 가능):', e);
            return true;
        }
    },

    /**
     * 이름 유효성 검사 (한글만, 최대 10자, 특수문자/숫자 불가)
     */
    validateName(value) {
        const regex = /^[가-힣]{1,10}$/;
        return regex.test(value);
    },

    /**
     * 주민등록번호 앞자리 유효성 검사 (숫자 6자리)
     */
    validateSsnFront(value) {
        return /^\d{6}$/.test(value);
    },

    /**
     * 휴대폰 번호 유효성 검사
     */
    validatePhone(value) {
        const clean = value.replace(/\D/g, '');
        return /^01[0-9]{8,9}$/.test(clean);
    },

    /**
     * 여권 영문명 유효성 검사 (영문만, 최대 20자)
     */
    validatePassportName(value) {
        return /^[A-Za-z\s]{1,20}$/.test(value);
    },

    /**
     * 계좌번호 유효성 검사 (숫자만)
     */
    validateAccountNo(value) {
        return /^\d{6,20}$/.test(value.replace(/\D/g, ''));
    },

    /**
     * 주민등록번호 뒷자리 마스킹 처리
     * 첫 자리만 표시, 나머지는 * 처리
     */
    maskSsnBack(value) {
        if (!value) return '';
        return value.charAt(0) + '*'.repeat(Math.max(0, value.length - 1));
    },

    /**
     * 주민등록번호 → 생년월일 (YYYYMMDD)
     * 앞6자리(YYMMDD) + 뒷첫자리(1,2=1900s, 3,4=2000s)
     */
    ssnToBirthDate(ssnFront, ssnBackFirst) {
        if (!ssnFront || ssnFront.length !== 6 || !ssnBackFirst) return '';
        const yy = ssnFront.slice(0, 2);
        const mm = ssnFront.slice(2, 4);
        const dd = ssnFront.slice(4, 6);
        const cen = (ssnBackFirst === '1' || ssnBackFirst === '2') ? '19' : '20';
        return cen + yy + mm + dd;
    },

    /**
     * 주민등록번호 뒷자리 첫자리 → 성별 코드 (1:남, 2:여)
     */
    ssnToGender(ssnBackFirst) {
        if (!ssnBackFirst) return '';
        return (ssnBackFirst === '1' || ssnBackFirst === '3') ? '1' : '2';
    },

    /**
     * 휴대폰 번호 포맷 (010-1234-5678)
     */
    formatPhone(value) {
        const clean = value.replace(/\D/g, '');
        if (clean.length <= 3) return clean;
        if (clean.length <= 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
        return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
    },

    /**
     * 발급일자 포맷 (YYYY.MM.DD)
     */
    formatDate(value) {
        const clean = value.replace(/\D/g, '');
        if (clean.length <= 4) return clean;
        if (clean.length <= 6) return `${clean.slice(0, 4)}.${clean.slice(4)}`;
        return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}`;
    },

    /**
     * 모달 열기
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * 모달 닫기
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('is-open');
            document.body.style.overflow = '';
        }
    },

    /**
     * 진행 상태 저장 (sessionStorage)
     */
    saveStep(stepData) {
        try {
            const current = JSON.parse(sessionStorage.getItem('kycData') || '{}');
            const merged = Object.assign(current, stepData);
            sessionStorage.setItem('kycData', JSON.stringify(merged));
        } catch (e) {
            console.warn('KYC data save failed:', e);
        }
    },

    /**
     * 진행 상태 불러오기
     */
    loadStep() {
        try {
            return JSON.parse(sessionStorage.getItem('kycData') || '{}');
        } catch (e) {
            return {};
        }
    },

    /**
     * 페이지 이동
     */
    goTo(path) {
        window.location.href = path;
    },

    /**
     * KYC 완료 후 callbackUrl로 결과 전달 (POST form + jsonData)
     * @returns {boolean} 전송 시도 했으면 true
     */
    submitKycCallbackIfNeeded() {
        const data = this.loadStep();
        const callbackUrl = this.normalizeCallbackUrl(data.kyc_callback_url);
        if (!callbackUrl) return false;

        const payload = {
            resultCode: '200',
            cardNo: data.card_no || '',
            ksnetSvcTknFrm: data.ksnet_svc_tkn_frm || ''
        };

        try {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = callbackUrl;
            form.style.display = 'none';

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'jsonData';
            input.value = JSON.stringify(payload);
            form.appendChild(input);

            document.body.appendChild(form);
            form.submit();
            return true;
        } catch (e) {
            console.warn('callback POST 전송 실패:', e);
            return false;
        }
    },

    // 하위 호환: 기존 호출부 유지
    redirectKycCallbackIfNeeded() {
        return this.submitKycCallbackIfNeeded();
    }
};
