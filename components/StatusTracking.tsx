
import React, { useState, useMemo, useEffect } from 'react';
import { CertificateRequest, RequestStatus } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface Props {
  requests: CertificateRequest[];
  onUpdateReceiving: (id: number, sign: string) => void;
  initialId?: number | null;
}

export const StatusTracking: React.FC<Props> = ({ requests, onUpdateReceiving, initialId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [signingRequest, setSigningRequest] = useState<CertificateRequest | null>(null);
  const [recipientName, setRecipientName] = useState('');

  // Handle direct links
  useEffect(() => {
    if (initialId) {
      setSearchQuery(initialId.toString());
    }
  }, [initialId]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return requests.filter(req => 
      req.fullName.toLowerCase().includes(q) || 
      req.id.toString() === q
    );
  }, [requests, searchQuery]);

  const handleOpenSignModal = (req: CertificateRequest) => {
    const isReady = req.status === RequestStatus.RETURNED || 
                   req.status === RequestStatus.RETURNED_INTERNATIONAL || 
                   req.status === RequestStatus.RETURNED_HR_ADMIN;
    if (!isReady && !req.receivingSign) {
      alert(`ขณะนี้สถานะ: ${req.status}\nกรุณารอจนกว่าเอกสารจะดำเนินการเสร็จสมบูรณ์นะคะ`);
      return;
    }
    setSigningRequest(req);
    setRecipientName(req.receivingSign || '');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Dynamic Search */}
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500 rounded-[2rem] blur-xl opacity-10 group-focus-within:opacity-30 transition-all duration-500"></div>
        <div className="relative bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm flex items-center p-3 group-focus-within:border-blue-400 transition-all">
          <div className="pl-6 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="พิมพ์ ชื่อ-นามสกุล หรือ เลข ID 100x เพื่อติดตาม..."
            className="w-full px-6 py-4 bg-transparent outline-none text-xl font-black text-slate-800 placeholder:text-slate-300"
          />
        </div>
      </div>

      {searchQuery.trim() === '' ? (
        <div className="py-32 text-center opacity-30 select-none">
          <div className="text-8xl mb-8">🔭</div>
          <p className="text-xl font-black text-slate-400 uppercase tracking-[0.3em]">กรุณาระบุข้อมูลเพื่อค้นหา</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-24 text-center animate-fade-in">
          <div className="text-7xl mb-6 grayscale">🏝️</div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">ไม่พบข้อมูลในระบบ</p>
          <p className="text-slate-400 mt-2 font-medium">กรุณาตรวจสอบเลข ID หรือการสะกดชื่ออีกครั้งนะคะ</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">พบทั้งหมด {filteredRequests.length} รายการในทะเบียน</p>
          
          {filteredRequests.map(req => {
            const isReady = req.status === RequestStatus.RETURNED || 
                           req.status === RequestStatus.RETURNED_INTERNATIONAL || 
                           req.status === RequestStatus.RETURNED_HR_ADMIN;
            const progressIndex = STATUS_OPTIONS.indexOf(req.status);
            
            return (
              <div key={req.id} className="bg-white rounded-[3rem] shadow-2xl border border-white p-8 md:p-12 hover:shadow-blue-100 transition-all relative overflow-hidden group">
                <div className="flex flex-col lg:flex-row justify-between gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner">📄</div>
                      <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Tracking ID: #{req.id}</span>
                        <h3 className="text-3xl font-black text-slate-900 leading-tight">{req.fullName}</h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {req.selectedTypes.map(t => (
                        <span key={t} className="px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-tight">{t}</span>
                      ))}
                    </div>

                    {/* Stepper Progress */}
                    <div className="space-y-5 pt-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ความคืบหน้า</span>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-tight">{req.status}</span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1 p-1">
                        {STATUS_OPTIONS.map((_, idx) => (
                          <div key={idx} className={`h-full flex-1 rounded-full transition-all duration-700 ${idx <= progressIndex ? 'bg-blue-500' : 'bg-slate-200'}`}/>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-64 flex flex-col gap-3 justify-center">
                    <button 
                      onClick={() => handleOpenSignModal(req)}
                      className={`w-full py-5 rounded-[1.5rem] font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-3 ${
                        req.receivingSign 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : (isReady 
                            ? 'bg-slate-900 text-white shadow-xl hover:bg-blue-600 animate-pulse' 
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed')
                      }`}
                    >
                      {req.receivingSign ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                          รับเอกสารเรียบร้อย
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          ลงนามรับเอกสาร
                        </>
                      )}
                    </button>
                    {req.receivingSign && (
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase">ผู้รับ: {req.receivingSign}</p>
                          <p className="text-[8px] font-bold text-slate-300 italic">{req.receivingDate}</p>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Signing Modal */}
      {signingRequest && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSigningRequest(null)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 overflow-hidden border border-white">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🖋️</div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">เซ็นรับเอกสารเข้าระบบ</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: #{signingRequest.id}</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">ชื่อ-นามสกุล ผู้มารับเอกสาร</label>
                <input 
                  type="text" 
                  autoFocus 
                  value={recipientName} 
                  onChange={(e) => setRecipientName(e.target.value)} 
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-blue-500 outline-none transition-all text-2xl font-black text-slate-800" 
                  placeholder="กรอกชื่อ-นามสกุล..." 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setSigningRequest(null)} className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-500 font-black">ยกเลิก</button>
                <button 
                  onClick={() => { if (recipientName.trim()) { onUpdateReceiving(signingRequest.id, recipientName.trim()); setSigningRequest(null); } }} 
                  disabled={!recipientName.trim()} 
                  className="flex-[2] py-5 rounded-2xl bg-slate-900 text-white font-black hover:bg-blue-600 transition-all shadow-xl"
                >
                  ยืนยันและบันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
