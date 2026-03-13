/**
 * KSNET KYC - 추가 기본정보 입력 스크립트
 */

/* --- 이전 단계 정보 불러와서 표시 --- */
(function loadPrevData() {
    const data = KYC.loadStep();
    document.getElementById('displayName').textContent = data.name || '-';
    document.getElementById('displayPhone').textContent = data.phone || '-';
})();

/* --- 여권 영문명 (영문만 허용) --- */
document.getElementById('inputPassportLastName').addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, '').toUpperCase();
    checkNextBtn();
});

document.getElementById('inputPassportFirstName').addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, '').toUpperCase();
    checkNextBtn();
});

/* --- 국적 선택 --- */
document.getElementById('selectNationality').addEventListener('change', function () {
    checkNextBtn();
});

/* --- 상세주소 입력 --- */
document.getElementById('inputAddressDetail').addEventListener('input', function () {
    checkNextBtn();
});

/* --- 주소 검색 (다음 우편번호 서비스 연동) --- */
function searchAddress() {
    // TODO: 실제 서비스 시 다음(카카오) 우편번호 서비스 API 연동
    // new daum.Postcode({ ... }).open();

    // 개발 임시 처리
    const mockAddress = '서울특별시 강남구 테헤란로 152';
    document.getElementById('inputAddress').value = mockAddress;
    document.getElementById('addressDetailBox').style.display = 'flex';
    document.getElementById('inputAddressDetail').focus();
    checkNextBtn();
}

/* --- 다음 버튼 활성화 조건 --- */
function checkNextBtn() {
    const lastName = document.getElementById('inputPassportLastName').value.trim();
    const firstName = document.getElementById('inputPassportFirstName').value.trim();
    const nationality = document.getElementById('selectNationality').value;
    const address = document.getElementById('inputAddress').value.trim();
    const detail = document.getElementById('inputAddressDetail').value.trim();

    const isValid = lastName.length > 0
        && firstName.length > 0
        && nationality !== ''
        && address.length > 0
        && detail.length > 0;

    document.getElementById('btnNext').disabled = !isValid;
}

/* --- 다음 페이지 이동 --- */
function goNext() {
    KYC.saveStep({
        passportName: `${document.getElementById('inputPassportLastName').value} ${document.getElementById('inputPassportFirstName').value}`.trim(),
        nationality: document.getElementById('selectNationality').value,
        address: document.getElementById('inputAddress').value,
        addressDetail: document.getElementById('inputAddressDetail').value
    });
    KYC.goTo('../additional-info/index.html');
}
