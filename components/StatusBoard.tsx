
import React, { useState, useEffect } from 'react';
import { CertificateRequest, RequestStatus } from '../types';

interface Props {
  requests: CertificateRequest[];
}

export const StatusBoard: React.FC<Props> = ({ requests }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const readyRequests = requests.filter(r => 
    (r.status === RequestStatus.RETURNED || r.status === RequestStatus.RETURNED_INTERNATIONAL) && !r.receivingSign
  ).slice(0, 6);

  const processingRequests = requests.filter(r => 
    r.status !== RequestStatus.RETURNED && 
    r.status !== RequestStatus.RETURNED_INTERNATIONAL && 
    !r.receivingSign
  ).slice(0, 8);

  const formatName = (name: string) => {
    const parts = name.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts[1] || '';
    
    const maskedFirst = firstName.length > 2 
      ? firstName.substring(0, 2) + "•".repeat(Math.min(firstName.length - 2, 4))
      : firstName;
    
    const maskedLast = lastName.length > 1
      ? lastName.substring(0, 1) + "•".repeat(Math.min(lastName.length - 1, 4))
      : "";

    return `${maskedFirst} ${maskedLast}`;
  };

  return (
    <div className="relative glass-card rounded-[3.5rem] p-8 md:p-14 overflow-hidden border border-white/50">
      {/* Background Decorator Removed as requested */}
      
      {/* Header with Icon and Clock */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-emerald-600 rounded-[2.2rem] flex items-center justify-center text-white text-3xl font-black shadow-[0_20px_40px_rgba(5,150,105,0.3)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
              </svg>
           </div>
           <div>
              <div className="flex items-center gap-3">
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter">สถานะรับเอกสาร</h3>
                 <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Digital Board</span>
              </div>
              <p className="text-emerald-600 font-bold uppercase tracking-[0.4em] text-[10px] mt-2 flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                อัตโนมัติจากฐานข้อมูล
              </p>
           </div>
        </div>
        <div className="text-center md:text-right bg-white/40 px-8 py-4 rounded-3xl border border-white/60 backdrop-blur-sm">
           <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Server Clock</div>
           <div className="text-3xl font-black text-slate-900 font-mono tracking-tighter">
             {currentTime.toLocaleTimeString('th-TH', { hour12: false })}
           </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Ready to Pickup Column */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                 </div>
                 <h4 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.3em]">
                    พร้อมรับเอกสาร (Ready)
                 </h4>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">{readyRequests.length}</span>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              {readyRequests.length > 0 ? readyRequests.map(req => (
                <div key={req.id} className="bg-white/90 p-6 rounded-[2rem] border border-emerald-100 flex justify-between items-center group hover:bg-emerald-600 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1">
                   <div className="flex items-center gap-6">
                      <span className="text-3xl font-black text-slate-300 font-mono group-hover:text-white/40 transition-colors">#{req.id}</span>
                      <div>
                         <div className="text-lg font-black text-slate-800 group-hover:text-white transition-colors">
                           {formatName(req.fullName)}
                         </div>
                         <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 group-hover:text-emerald-100 transition-colors">
                           {req.selectedTypes[0]}
                         </div>
                      </div>
                   </div>
                   <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-white/20 group-hover:text-white transition-all">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                   </div>
                </div>
              )) : (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/30">
                   <p className="text-slate-300 font-black uppercase tracking-widest text-xs">ขณะนี้ยังไม่มีเอกสารที่พร้อมรับ</p>
                </div>
              )}
           </div>
        </div>

        {/* Processing Column */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b-2 border-blue-100 pb-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <svg className="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                 </div>
                 <h4 className="text-[12px] font-black text-blue-500 uppercase tracking-[0.3em]">
                    กำลังดำเนินการ (Processing)
                 </h4>
              </div>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">{requests.filter(r => !r.receivingSign && r.status !== RequestStatus.RETURNED).length}</span>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {processingRequests.length > 0 ? processingRequests.map(req => (
                <div key={req.id} className="bg-white/40 backdrop-blur-sm p-6 rounded-[2rem] border border-white/60 flex flex-col gap-3 group hover:border-blue-300 transition-all">
                   <div className="flex justify-between items-start">
                      <span className="text-xl font-black text-slate-400 font-mono group-hover:text-blue-400 transition-colors">#{req.id}</span>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-slate-800 tracking-tight truncate">{formatName(req.fullName)}</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate mt-1">
                        {req.status}
                      </div>
                   </div>
                </div>
              )) : (
                <div className="col-span-2 py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/30">
                   <p className="text-slate-300 font-black uppercase tracking-widest text-xs">ไม่มีรายการที่กำลังดำเนินการ</p>
                </div>
              )}
           </div>
        </div>
      </div>
      
      <div className="mt-16 pt-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">NU Digital Certificate Records Portal</p>
         <div className="flex gap-4">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase">พร้อมรับ</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase">กำลังทำ</span>
            </div>
         </div>
      </div>
      <style>{`
         @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
         }
         .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
         }
      `}</style>
    </div>
  );
};
