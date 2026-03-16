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

/* --- 신분증 자동 인식 (촬영/업로드 + OCR API 연동용) --- */
(function initIdCapture() {
    const residentBtn = document.getElementById('btnResidentCapture');
    const residentInput = document.getElementById('residentCaptureInput');
    const licenseBtn = document.getElementById('btnLicenseCapture');
    const licenseInput = document.getElementById('licenseCaptureInput');
    const residentRetake = document.getElementById('btnResidentRetake');
    const licenseRetake = document.getElementById('btnLicenseRetake');

    if (residentBtn && residentInput) {
        residentBtn.addEventListener('click', function () {
            residentInput.click();
        });

        residentInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                handleIdOcr('resident', this.files[0]);
                // 파일 참조는 즉시 제거
                this.value = '';
            }
        });

        if (residentRetake) {
            residentRetake.addEventListener('click', function () {
                residentInput.click();
            });
        }
    }

    if (licenseBtn && licenseInput) {
        licenseBtn.addEventListener('click', function () {
            licenseInput.click();
        });

        licenseInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                handleIdOcr('license', this.files[0]);
                this.value = '';
            }
        });

        if (licenseRetake) {
            licenseRetake.addEventListener('click', function () {
                licenseInput.click();
            });
        }
    }
})();

/**
 * 신분증 OCR 처리 (현재는 미리보기만, 실제 OCR API 없음)
 * type: 'resident' | 'license'
 */
function handleIdOcr(type, file) {
    // 선택한 이미지 미리보기 업데이트만 수행
    const url = URL.createObjectURL(file);
    if (type === 'resident') {
        const card = document.getElementById('residentPreviewCard');
        const actions = document.getElementById('residentPreviewActions');
        const img = document.getElementById('residentPreview');
        const captureGroup = document.getElementById('residentCaptureGroup');
        if (img) img.src = url;
        if (card) card.style.display = 'block';
        if (actions) actions.style.display = 'flex';
        if (captureGroup) captureGroup.style.display = 'none';
    } else {
        const card = document.getElementById('licensePreviewCard');
        const actions = document.getElementById('licensePreviewActions');
        const img = document.getElementById('licensePreview');
        const captureGroup = document.getElementById('licenseCaptureGroup');
        if (img) img.src = url;
        if (card) card.style.display = 'block';
        if (actions) actions.style.display = 'flex';
        if (captureGroup) captureGroup.style.display = 'none';
    }

    // TODO: 실제 OCR API 연동 시
    // 1) 여기서 FormData 생성 + 서버 호출
    // 2) 서버에서 OCR 처리 후 원본 이미지는 즉시 삭제
    // 3) 응답 데이터는 applyOcrResult(type, data) 형태로 전달
}

/**
 * OCR 결과를 폼 필드에 반영
 * data 예시 (서버에서 이 형태로 맞춰주면 됨):
 *  주민등록증: { name, ssnFront, ssnBack, issueDate }
 *  운전면허증: { name, ssnFront, ssnBack, licenseNo, serial, issueDate }
 * 현재는 실제 OCR API가 없으므로 사용되지 않음.
 * 추후 백엔드 연동 시 호출 지점만 추가하면 됨.
 */
function applyOcrResult(type, data) {
    if (!data) return;

    if (type === 'resident') {
        if (data.name) {
            const el = document.getElementById('inputResidentName');
            el.value = data.name;
            el.dispatchEvent(new Event('input'));
        }
        if (data.ssnFront) {
            const el = document.getElementById('inputResidentSsnFront');
            el.value = data.ssnFront;
            el.dispatchEvent(new Event('input'));
        }
        if (data.ssnBack) {
            const el = document.getElementById('inputResidentSsnBack');
            el.value = data.ssnBack;
            el.dispatchEvent(new Event('input'));
        }
        if (data.issueDate) {
            const el = document.getElementById('inputResidentIssueDate');
            el.value = KYC.formatDate(data.issueDate.replace(/\D/g, ''));
            el.dispatchEvent(new Event('input'));
        }
    } else {
        if (data.name) {
            const el = document.getElementById('inputLicenseName');
            el.value = data.name;
            el.dispatchEvent(new Event('input'));
        }
        if (data.ssnFront) {
            const el = document.getElementById('inputLicenseSsnFront');
            el.value = data.ssnFront;
            el.dispatchEvent(new Event('input'));
        }
        if (data.ssnBack) {
            const el = document.getElementById('inputLicenseSsnBack');
            el.value = data.ssnBack;
            el.dispatchEvent(new Event('input'));
        }
        if (data.licenseNo) {
            const el = document.getElementById('inputLicenseNo');
            el.value = data.licenseNo;
            el.dispatchEvent(new Event('input'));
        }
        if (data.serial) {
            const el = document.getElementById('inputLicenseSerial');
            el.value = data.serial;
            el.dispatchEvent(new Event('input'));
        }
        if (data.issueDate) {
            // 운전면허증 발급일자도 필요하면 여기에 필드 추가 후 적용
        }
    }

    checkNextBtn();
}

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
