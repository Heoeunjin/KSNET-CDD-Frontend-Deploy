/**
 * KSNET 고객확인제도 (KYC) - 공통 유틸리티
 */

const KYC = {

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
    }
};
