/**
 * KSNET KYC - 신분증 인증 스크립트
 */

let currentTab = 'resident';

/* --- 탭 전환 --- */
function switchTab(tab) {
    currentTab = tab;

    document.getElementById('tabResident').classList.toggle('is-active', tab === 'resident');
    document.getElementById('tabLicense').classList.toggle('is-active', tab === 'license');

    document.getElementById('formResident').style.display = tab === 'resident' ? 'block' : 'none';
    document.getElementById('formLicense').style.display = tab === 'license' ? 'block' : 'none';

    checkNextBtn();
}

/* --- 주민등록증 폼 이벤트 --- */
document.getElementById('inputResidentName').addEventListener('input', function () {
    this.value = this.value.replace(/[^가-힣]/g, '');
    checkNextBtn();
});

document.getElementById('inputResidentSsnFront').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    checkNextBtn();
});

document.getElementById('inputResidentSsnBack').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    checkNextBtn();
});

document.getElementById('inputResidentIssueDate').addEventListener('input', function () {
    this.value = KYC.formatDate(this.value);
    checkNextBtn();
});

/* --- 운전면허증 폼 이벤트 --- */
document.getElementById('inputLicenseName').addEventListener('input', function () {
    this.value = this.value.replace(/[^가-힣]/g, '');
    checkNextBtn();
});

document.getElementById('inputLicenseSsnFront').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    checkNextBtn();
});

document.getElementById('inputLicenseSsnBack').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    checkNextBtn();
});

document.getElementById('inputLicenseNo').addEventListener('input', function () {
    // 면허번호 포맷: 00-00-000000-00
    let val = this.value.replace(/[^0-9]/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
    if (val.length > 12) val = val.slice(0, 12) + '-' + val.slice(12, 14);
    this.value = val;
    checkNextBtn();
});

document.getElementById('inputLicenseSerial').addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    checkNextBtn();
});

/* --- 다음 버튼 활성화 조건 --- */
function checkNextBtn() {
    let isValid = false;

    if (currentTab === 'resident') {
        const name = document.getElementById('inputResidentName').value;
        const ssnFront = document.getElementById('inputResidentSsnFront').value;
        const ssnBack = document.getElementById('inputResidentSsnBack').value;
        const issueDate = document.getElementById('inputResidentIssueDate').value;
        isValid = name.length > 0
            && ssnFront.length === 6
            && ssnBack.length === 7
            && issueDate.length === 10;
    } else {
        const name = document.getElementById('inputLicenseName').value;
        const ssnFront = document.getElementById('inputLicenseSsnFront').value;
        const ssnBack = document.getElementById('inputLicenseSsnBack').value;
        const licenseNo = document.getElementById('inputLicenseNo').value;
        const serial = document.getElementById('inputLicenseSerial').value;
        isValid = name.length > 0
            && ssnFront.length === 6
            && ssnBack.length === 7
            && licenseNo.length >= 13
            && serial.length > 0;
    }

    document.getElementById('btnNext').disabled = !isValid;
}

/* --- 다음 페이지 이동 (실제 서버 검증 후 이동) --- */
function goNext() {
    // TODO: 서버 API 연동으로 신분증 정보 검증
    // 검증 실패 시: KYC.openModal('modalIdError');

    KYC.saveStep({
        idType: currentTab
    });
    KYC.goTo('../account-verify/index.html');
}
