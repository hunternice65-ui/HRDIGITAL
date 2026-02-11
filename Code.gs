
/**
 * HR DIGITAL DATABASE SCRIPT
 * ระบบจัดการฐานข้อมูลหนังสือรับรองออนไลน์
 * คณะแพทยศาสตร์ มหาวิทยาลัยนเรศวร
 */

const SHEET_NAME = "Certificates";

/**
 * ฟังก์ชันหลักเมื่อมีการเรียก Web App (GET)
 */
function doGet(e) {
  return HtmlService.createHtmlOutput("HR Digital API is Running")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ฟังก์ชันหลักเมื่อมีการส่งข้อมูลมาที่ Web App (POST)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // ป้องกันข้อมูลชนกัน
    
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const data = params.data;
    let result;

    switch (action) {
      case 'getRequests':
        result = getRequests();
        break;
      case 'saveRequestServer':
        result = saveRequestServer(data);
        break;
      case 'updateRequestStatusServer':
        result = updateRequestStatusServer(data.id, data.status);
        break;
      case 'updateReceivingServer':
        result = updateReceivingServer(data.id, data.sign);
        break;
      case 'deleteRequestServer':
        result = deleteRequestServer(data);
        break;
      case 'sendEmailNotification':
        result = sendEmailNotification(data);
        break;
      default:
        result = { error: 'Unknown action' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * ดึงแผ่นงานหรือสร้างใหม่หากยังไม่มี
 */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      "id", "fullName", "email", "selectedTypes", "submissionSign", 
      "submissionDate", "receivingSign", "receivingDate", 
      "internalPhone", "mobilePhone", "status", "targetCountry", "lastEmailStatus"
    ];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#0f172a").setFontColor("#ffffff").setFontWeight("bold");
  }
  return sheet;
}

/**
 * ดึงรายการทั้งหมด
 */
function getRequests() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      // แปลง JSON string กลับเป็น array สำหรับรายการเอกสาร
      if (h === 'selectedTypes' && typeof val === 'string' && val.startsWith('[')) {
        try { val = JSON.parse(val); } catch(e) { val = [val]; }
      }
      obj[h] = val;
    });
    return obj;
  });
}

/**
 * บันทึกคำขอใหม่
 */
function saveRequestServer(requestData) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  let nextId = 1001;
  
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    nextId = Math.max(...ids.map(Number)) + 1;
  }
  
  const timestamp = new Date().toLocaleString('th-TH');
  const row = [
    nextId,
    requestData.fullName,
    requestData.email,
    JSON.stringify(requestData.selectedTypes),
    requestData.submissionSign,
    timestamp,
    "", // receivingSign
    "", // receivingDate
    requestData.internalPhone,
    requestData.mobilePhone,
    "อยู่ทีงานทรัพยากรบุคคล",
    requestData.targetCountry || "",
    "ยังไม่ได้ส่ง"
  ];
  
  sheet.appendRow(row);
  return nextId;
}

/**
 * อัปเดตสถานะเอกสาร
 */
function updateRequestStatusServer(id, status) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 11).setValue(status);
      
      // ส่งเมลอัตโนมัติหากสถานะคือเรียบร้อยแล้ว
      if (status.includes("เรียบร้อย") || status.includes("กลับจาก")) {
        sendEmailNotification(id);
      }
      return true;
    }
  }
  return false;
}

/**
 * ลงนามรับเอกสาร
 */
function updateReceivingServer(id, sign) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const date = new Date().toLocaleString('th-TH');
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 7).setValue(sign);
      sheet.getRange(i + 1, 8).setValue(date);
      sheet.getRange(i + 1, 11).setValue("ดำเนินการเรียบร้อยแล้ว");
      return { sign, date };
    }
  }
  return null;
}

/**
 * ลบคำขอ
 */
function deleteRequestServer(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

/**
 * ระบบแจ้งเตือนผ่าน Gmail
 */
function sendEmailNotification(requestId) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    let rowIndex = -1;
    let req = null;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == requestId) {
        rowIndex = i + 1;
        req = {};
        headers.forEach((h, j) => req[h] = data[i][j]);
        break;
      }
    }
    
    if (!req || !req.email) return "No Email Found";

    const subject = `[HR DIGITAL] แจ้งสถานะเอกสาร #${req.id}`;
    const htmlBody = `
      <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px; color: #1e293b;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">แจ้งอัปเดตสถานะเอกสารของคุณ</h2>
        <p>เรียนคุณ <b>${req.fullName}</b>,</p>
        <p>ขณะนี้คำขอเลขที่ <b>#${req.id}</b> มีความคืบหน้าดังนี้:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #6366f1;">สถานะปัจจุบัน: ${req.status}</p>
        </div>
        <p>หากสถานะเป็น <b>"ดำเนินการเรียบร้อยแล้ว"</b> คุณสามารถติดต่อรับเอกสารได้ที่งานทรัพยากรบุคคล ในวันและเวลาราชการค่ะ</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">นี่เป็นข้อความอัตโนมัติจากระบบ HR DIGITAL คณะแพทยศาสตร์ มหาวิทยาลัยนเรศวร</p>
      </div>
    `;

    MailApp.sendEmail({
      to: req.email,
      subject: subject,
      htmlBody: htmlBody,
      name: "HR DIGITAL MEDNU"
    });

    sheet.getRange(rowIndex, 13).setValue("ส่งแล้วเมื่อ " + new Date().toLocaleDateString('th-TH'));
    return "Notification Sent";
  } catch (e) {
    return "Error: " + e.toString();
  }
}
