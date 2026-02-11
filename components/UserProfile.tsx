
import React, { useState, useMemo } from 'react';
import { CertificateRequest } from '../types';

interface Props {
  requests: CertificateRequest[];
  onDeleteUser: (email: string) => void;
  onSendEmail: (requestId: number) => void;
}

export const UserProfile: React.FC<Props> = ({ requests, onDeleteUser, onSendEmail }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Group requests by email to identify unique users and their requested item types
  const uniqueUsers = useMemo(() => {
    const usersMap = new Map<string, {
      fullName: string;
      email: string;
      internalPhone: string;
      mobilePhone: string;
      requestCount: number;
      lastRequestDate: string;
      latestRequestId: number;
      lastEmailStatus: string;
      allRequestedTypes: Set<string>;
    }>();

    requests.forEach(req => {
      const email = req.email.toLowerCase().trim();
      if (!usersMap.has(email)) {
        usersMap.set(email, {
          fullName: req.fullName,
          email: req.email,
          internalPhone: req.internalPhone,
          mobilePhone: req.mobilePhone,
          requestCount: 1,
          lastRequestDate: req.submissionDate,
          latestRequestId: req.id,
          lastEmailStatus: req.lastEmailStatus || 'ยังไม่เคยส่ง',
          allRequestedTypes: new Set(req.selectedTypes)
        });
      } else {
        const existing = usersMap.get(email)!;
        existing.requestCount += 1;
        req.selectedTypes.forEach(type => existing.allRequestedTypes.add(type));
        
        // Keep the most recent info including email status
        if (new Date(req.submissionDate) > new Date(existing.lastRequestDate)) {
          existing.fullName = req.fullName;
          existing.lastRequestDate = req.submissionDate;
          existing.latestRequestId = req.id;
          existing.lastEmailStatus = req.lastEmailStatus || 'ยังไม่เคยส่ง';
        }
      }
    });

    return Array.from(usersMap.values()).filter(user => 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [requests, searchQuery]);

  const handleDelete = (user: any) => {
    if (window.confirm(`🚨 ยืนยันการลบข้อมูลของ "${user.fullName}"?\nการดำเนินการนี้จะลบรายการคำขอทั้งหมด (${user.requestCount} รายการ) ของอีเมลนี้ออกจากฐานข้อมูล Google Sheets ถาวร`)) {
      onDeleteUser(user.email);
    }
  };

  const getEmailStatusBadge = (status: string) => {
    if (status === 'ส่งแล้ว') {
      return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[9px] font-black uppercase">ส่งแล้ว</span>;
    }
    if (status.startsWith('ส่งไม่ได้')) {
      return <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded text-[9px] font-black uppercase" title={status}>ส่งไม่ได้</span>;
    }
    return <span className="px-2 py-0.5 bg-slate-100 text-slate-400 border border-slate-200 rounded text-[9px] font-black uppercase">รอดำเนินการ</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">ฐานข้อมูลผู้ยื่นคำขอ</h2>
          <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px] mt-1">Requester Database Management (Live Connect)</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ หรือ อีเมล..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all font-bold"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueUsers.map((user) => (
          <div key={user.email} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 hover:-translate-y-1 transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                👤
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onSendEmail(user.latestRequestId)}
                  title="ส่งอีเมลแจ้งเตือนล่าสุด"
                  className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"/></svg>
                </button>
                <button 
                  onClick={() => handleDelete(user)}
                  title="ลบข้อมูลผู้ใช้และรายการคำขอทั้งหมดออกจากฐานข้อมูลจริง"
                  className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="text-xl font-black text-slate-800 leading-tight">{user.fullName}</h4>
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight mt-1 truncate max-w-[150px]">{user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] font-black text-slate-300 uppercase">Email Status</span>
                  {getEmailStatusBadge(user.lastEmailStatus)}
                </div>
              </div>

              <div className="py-4 border-y border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">รายการที่เคยขอ ({user.requestCount} ครั้ง)</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(user.allRequestedTypes).map(type => (
                    <span key={type} className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tight">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  มือถือ: {user.mobilePhone || '-'}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  ล่าสุด: {user.lastRequestDate.split(',')[0]} (ID: #{user.latestRequestId})
                </div>
              </div>
            </div>
          </div>
        ))}

        {uniqueUsers.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="text-6xl mb-6 grayscale">👥</div>
            <p className="text-slate-400 font-black uppercase tracking-widest">ไม่พบข้อมูลผู้ยื่นคำขอในระบบ</p>
          </div>
        )}
      </div>
    </div>
  );
};
