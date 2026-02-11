
export enum RequestStatus {
  AT_HR = 'อยู่ทีงานทรัพยากรบุคคล',
  SENT_HR_ADMIN = 'ส่งกองการบริหารงานบุคคลแล้ว',
  SENT_INTERNATIONAL = 'ส่งกองต่างประเทศแล้ว',
  RETURNED_HR_ADMIN = 'กลับจากกองการบริหารงานบุคคลแล้ว',
  RETURNED_INTERNATIONAL = 'กลับจากกองต่างประเทศแล้ว',
  RETURNED = 'ดำเนินการเรียบร้อยแล้ว'
}

export type CertificateType = 
  | 'รับรองเงินเดือน' 
  | 'รับรองปฏิบัติงาน' 
  | 'ออมสิน' 
  | 'ธอส.' 
  | 'กรุงไทย' 
  | 'อิสลาม'
  | 'บัตรพนักงานมหาวิทยาลัย'
  | 'บัตรพนักงานราชการ'
  | 'บัตรข้าราชการ'
  | 'หนังสือรับรองภาษาอังกฤษ (เงินเดือน/ปฏิบัติงาน)'
  | 'รับรองภาษาอังกฤษเพื่อขอวีซ่า';

export interface CertificateRequest {
  id: number;
  fullName: string;
  email: string;
  selectedTypes: CertificateType[];
  submissionSign: string;
  submissionDate: string;
  receivingSign?: string;
  receivingDate?: string;
  internalPhone: string;
  mobilePhone: string;
  status: RequestStatus;
  targetCountry?: string;
  lastEmailStatus?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  internalPhone: string;
  mobilePhone: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
