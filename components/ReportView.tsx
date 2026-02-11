
import React from 'react';
import { CertificateRequest, RequestStatus } from '../types';

interface Props {
  requests: CertificateRequest[];
  onBack: () => void;
}

export const ReportView: React.FC<Props> = ({ requests, onBack }) => {
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status !== RequestStatus.RETURNED && r.status !== RequestStatus.RETURNED_INTERNATIONAL).length,
    completed: requests.filter(r => r.receivingSign).length,
    returned: requests.filter(r => r.status === RequestStatus.RETURNED || r.status === RequestStatus.RETURNED_INTERNATIONAL).length
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Action Header - Hidden on Print */}
      <div className="print:hidden flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-black text-sm transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          กลับหน้าหลัก
        </button>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            สั่งพิมพ์ / บันทึกเป็น PDF
          </button>
        </div>
      </div>

      {/* Report Document Style */}
      <div className="bg-white rounded-none md:rounded-[2.5rem] shadow-2xl md:border md:border-slate-100 p-8 md:p-16 print:shadow-none print:border-none print:p-0 min-h-[297mm]">
        {/* Document Header */}
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-2 print:border print:border-slate-900">
            NU
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">รายงานทะเบียนรับ - ส่ง หนังสือรับรอง</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">งานทรัพยากรบุคคล มหาวิทยาลัยนเรศวร</p>
          <div className="w-32 h-1 bg-emerald-500 rounded-full mx-auto"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] pt-2">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        {/* Stats Grid - Optional for Print but good for Online */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 print:mb-8">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ทั้งหมด</p>
             <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 text-center">
             <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">รอดำเนินการ</p>
             <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
          </div>
          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center">
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">กลับจากหน่วยงาน</p>
             <p className="text-3xl font-black text-blue-600">{stats.returned}</p>
          </div>
          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">รับแล้ว</p>
             <p className="text-3xl font-black text-emerald-600">{stats.completed}</p>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-hidden">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="border border-slate-200 px-4 py-3 text-center w-12">ลำดับ</th>
                <th className="border border-slate-200 px-4 py-3">ชื่อ-นามสกุล / อีเมล</th>
                <th className="border border-slate-200 px-4 py-3">รายการเอกสาร</th>
                <th className="border border-slate-200 px-4 py-3 text-center">วันที่ยื่น</th>
                <th className="border border-slate-200 px-4 py-3 text-center">สถานะ</th>
                <th className="border border-slate-200 px-4 py-3">ผู้รับ / วันที่รับ</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {requests.length > 0 ? requests.map((req, idx) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-slate-200 px-4 py-4 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="border border-slate-200 px-4 py-4">
                    <div className="font-black text-slate-800">{req.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{req.email}</div>
                  </td>
                  <td className="border border-slate-200 px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {req.selectedTypes.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600 uppercase">
                          {t}
                        </span>
                      ))}
                      {req.targetCountry && (
                        <span className="px-2 py-0.5 bg-purple-50 rounded text-[9px] font-bold text-purple-600 uppercase">
                          ✈️ {req.targetCountry}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border border-slate-200 px-4 py-4 text-center text-slate-500 font-medium">
                    {req.submissionDate.split(',')[0]}
                  </td>
                  <td className="border border-slate-200 px-4 py-4 text-center">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">
                      {req.status}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-4 py-4">
                    {req.receivingSign ? (
                      <div>
                        <div className="font-black text-emerald-600">{req.receivingSign}</div>
                        <div className="text-[9px] text-slate-400">{req.receivingDate}</div>
                      </div>
                    ) : (
                      <span className="text-slate-300 italic font-medium">รอดำเนินการ</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="border border-slate-200 px-4 py-20 text-center text-slate-300 font-black uppercase tracking-widest">ไม่มีข้อมูลในทะเบียน</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Document Footer Signature - Shown only on print */}
        <div className="hidden print:grid grid-cols-2 gap-20 mt-32 text-center">
           <div className="space-y-20">
              <div className="border-b border-slate-400 w-full mx-auto"></div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-widest">ลงชื่อผู้ตรวจสอบข้อมูล</p>
           </div>
           <div className="space-y-20">
              <div className="border-b border-slate-400 w-full mx-auto"></div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-widest">ลงชื่อเจ้าหน้าที่งานทรัพยากรบุคคล</p>
           </div>
        </div>

        <div className="mt-20 text-center opacity-30 text-[9px] font-bold uppercase tracking-[0.5em] print:mt-10">
          Generated by Digital Certificate Registration System • งานทรัพยากรบุคคล มหาวิทยาลัยนเรศวร
        </div>
      </div>
    </div>
  );
};
