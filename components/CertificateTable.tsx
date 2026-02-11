
import React, { useState, useMemo } from 'react';
import { CertificateRequest, RequestStatus } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface Props {
  requests: CertificateRequest[];
  onUpdateStatus: (id: number, status: RequestStatus) => void;
  onUpdateReceiving: (id: number, sign: string) => void;
  onDelete?: (id: number) => void;
  onExport: () => void;
  onViewReport?: () => void;
  isAdmin?: boolean;
}

export const CertificateTable: React.FC<Props> = ({ requests, onUpdateStatus, onUpdateReceiving, onDelete, onExport, onViewReport, isAdmin = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifying, setIsNotifying] = useState<number | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => 
      req.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toString().includes(searchQuery) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [requests, searchQuery]);

  const handleSendEmailNotify = async (req: CertificateRequest) => {
    setIsNotifying(req.id);
    if (typeof (window as any).google !== 'undefined') {
      (window as any).google.script.run
        .withSuccessHandler((result: string) => {
          setIsNotifying(null);
          alert(result);
        })
        .sendEmailNotification(req.id);
    } else {
      await new Promise(r => setTimeout(r, 1000));
      alert(`[Sim] ส่งเมลถึง ${req.email} แล้ว`);
      setIsNotifying(null);
    }
  };

  const getStatusStyle = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.AT_HR: return 'bg-slate-100 text-slate-600 border-slate-200';
      case RequestStatus.SENT_HR_ADMIN: return 'bg-orange-100 text-orange-700 border-orange-200';
      case RequestStatus.SENT_INTERNATIONAL: return 'bg-pink-100 text-pink-700 border-pink-200';
      case RequestStatus.RETURNED_HR_ADMIN: return 'bg-blue-100 text-blue-700 border-blue-200';
      case RequestStatus.RETURNED_INTERNATIONAL: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case RequestStatus.RETURNED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* Controls */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
         <div className="relative group w-full lg:w-96">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นชื่อ, ID หรือ อีเมล..."
              className="w-full pl-10 md:pl-12 pr-4 md:pr-6 py-3 md:py-3.5 bg-white border border-slate-200 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 shadow-sm text-sm"
            />
            <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
         </div>
         <div className="flex flex-row items-center gap-2 overflow-x-auto hide-scrollbar">
            <button onClick={onExport} className="flex-shrink-0 px-4 md:px-5 py-2.5 md:py-3 bg-emerald-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2">
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              CSV
            </button>
            <button onClick={onViewReport} className="flex-shrink-0 px-4 md:px-5 py-2.5 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md flex items-center gap-2">
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              PDF
            </button>
         </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="relative overflow-x-auto">
        {/* Subtle shadow indicators for scroll */}
        <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-slate-100/30 to-transparent pointer-events-none md:hidden"></div>
        <div className="absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-l from-slate-100/30 to-transparent pointer-events-none md:hidden"></div>
        
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[9px] md:text-[10px] uppercase font-black tracking-[0.15em] md:tracking-[0.2em]">
              <th className="px-6 md:px-8 py-4 md:py-5 text-center w-20">ID</th>
              <th className="px-6 md:px-8 py-4 md:py-5">ข้อมูลผู้ขอ</th>
              <th className="px-6 md:px-8 py-4 md:py-5">เอกสาร</th>
              <th className="px-6 md:px-8 py-4 md:py-5 text-center">สถานะ</th>
              <th className="px-6 md:px-8 py-4 md:py-5 text-center">รับแล้ว</th>
              {isAdmin && <th className="px-6 md:px-8 py-4 md:py-5 text-right">จัดการ</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.map((req) => (
              <tr key={req.id} className="transition-all hover:bg-slate-50/50">
                <td className="px-6 md:px-8 py-5 md:py-6 text-center">
                  <span className="font-black text-slate-400 text-xs md:text-sm">#{req.id}</span>
                </td>
                <td className="px-6 md:px-8 py-5 md:py-6">
                  <div className="font-black text-slate-800 text-sm md:text-base leading-tight">{req.fullName}</div>
                  <div className="text-[9px] md:text-[10px] font-bold text-emerald-600 mt-0.5 truncate max-w-[120px] md:max-w-none">{req.email}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">โทร: {req.mobilePhone || req.internalPhone || '-'}</div>
                </td>
                <td className="px-6 md:px-8 py-5 md:py-6">
                  <div className="flex flex-wrap gap-1">
                    {req.selectedTypes.slice(0, 2).map(t => (
                      <span key={t} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded-md text-[8px] font-black uppercase truncate max-w-[80px]">{t}</span>
                    ))}
                    {req.selectedTypes.length > 2 && <span className="text-[8px] font-bold text-slate-300">+{req.selectedTypes.length - 2}</span>}
                  </div>
                </td>
                <td className="px-6 md:px-8 py-5 md:py-6 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black border uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 md:px-8 py-5 md:py-6 text-center">
                   {req.receivingSign ? (
                     <div className="flex flex-col items-center">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-0.5"><svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg></div>
                        <div className="text-[8px] md:text-[9px] font-black text-emerald-700 uppercase truncate max-w-[60px]">{req.receivingSign}</div>
                     </div>
                   ) : (
                     <span className="text-slate-300 text-[8px] md:text-[10px] font-bold italic">รอ</span>
                   )}
                </td>
                {isAdmin && (
                  <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onDelete && onDelete(req.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                        <select value={req.status} onChange={(e) => onUpdateStatus(req.id, e.target.value as RequestStatus)} className="px-2 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[8px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-200">
                          {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <button 
                        onClick={() => handleSendEmailNotify(req)} 
                        disabled={isNotifying === req.id} 
                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all shadow-sm ${isNotifying === req.id ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white active:scale-95'}`}
                      >
                        {isNotifying === req.id ? 'Sending...' : 'Notify Email'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredRequests.length === 0 && (
        <div className="py-20 text-center">
           <p className="text-slate-300 font-black uppercase tracking-widest text-xs">ไม่พบข้อมูลในเงื่อนไขที่ค้นหา</p>
        </div>
      )}
    </div>
  );
};
