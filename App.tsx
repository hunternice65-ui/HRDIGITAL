
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CertificateForm } from './components/CertificateForm';
import { CertificateTable } from './components/CertificateTable';
import { StatusTracking } from './components/StatusTracking';
import { ReportView } from './components/ReportView';
import { ChatBot } from './components/ChatBot';
import { StatusBoard } from './components/StatusBoard';
import { CertificateRequest, RequestStatus, UserProfile } from './types';
import { ADMIN_CREDENTIALS, GAS_WEBAPP_URL } from './constants';

type ViewType = 'dashboard' | 'form' | 'list' | 'track' | 'report';

const App: React.FC = () => {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    internalPhone: '',
    mobilePhone: ''
  });
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(false);
  const [initialTrackId, setInitialTrackId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const pollTimerRef = useRef<number | null>(null);

  /**
   * ฟังก์ชันสื่อสารกับ Google Sheets API ผ่าน Web App URL
   */
  const callApi = useCallback(async (action: string, data?: any): Promise<any> => {
    // กรณีรันใน Apps Script Environment
    if (typeof (window as any).google !== 'undefined' && (window as any).google.script) {
      return new Promise((resolve, reject) => {
        (window as any).google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          [action](data);
      });
    }

    // กรณีรันแบบ External Web App เชื่อมต่อตรงไปที่ Google Sheets
    try {
      const response = await fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, data }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("API Connection Error:", error);
      throw error;
    }
  }, []);

  const refreshData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsSyncing(true);
    
    try {
      const data = await callApi('getRequests');
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setRequests(sorted);
        setLastUpdated(new Date());
        localStorage.setItem('cert_requests', JSON.stringify(sorted));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      const saved = localStorage.getItem('cert_requests');
      if (saved) setRequests(JSON.parse(saved));
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [callApi]);

  useEffect(() => {
    const handleFocus = () => refreshData(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshData]);

  useEffect(() => {
    if (isAdmin && (currentView === 'list' || currentView === 'report')) {
      pollTimerRef.current = window.setInterval(() => refreshData(true), 30000);
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }
    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  }, [isAdmin, currentView, refreshData]);

  useEffect(() => {
    refreshData();
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)); } catch (e) {}
    }
  }, [refreshData]);

  const navigateTo = (view: ViewType, trackId?: number) => {
    if (!isAdmin && (view === 'list' || view === 'report')) {
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentView(view);
    if (view === 'list' || view === 'report' || view === 'track' || view === 'dashboard') refreshData(true);
    if (trackId) setInitialTrackId(trackId);
    else setInitialTrackId(null);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      navigateTo('dashboard');
    } else {
      setIsLoginModalOpen(true);
      setLoginForm({ username: '', password: '' });
      setLoginError(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === ADMIN_CREDENTIALS.username && loginForm.password === ADMIN_CREDENTIALS.password) {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      navigateTo('list');
    } else {
      setLoginError(true);
    }
  };

  const handleAddRequest = async (data: Omit<CertificateRequest, 'id' | 'status' | 'submissionDate'>) => {
    setIsLoading(true);
    try {
      const newId = await callApi('saveRequestServer', data);
      alert(`✨ ส่งคำขอสำเร็จและบันทึกลง Google Sheets แล้ว!\nเลขที่คำขอของคุณคือ #${newId}`);
      await refreshData(true);
      navigateTo('track', newId);
    } catch (err) {
      alert("❌ ไม่สามารถบันทึกข้อมูลลง Google Sheets ได้ กรุณาลองใหม่ภายหลังค่ะ");
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: RequestStatus) => {
    setIsSyncing(true);
    try {
      await callApi('updateRequestStatusServer', { id, status });
      await refreshData(true);
    } catch (err) {
      console.error(err);
      setIsSyncing(false);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะใน Google Sheets");
    }
  };

  const handleUpdateReceiving = async (id: number, sign: string) => {
    setIsSyncing(true);
    try {
      await callApi('updateReceivingServer', { id, sign });
      await refreshData(true);
    } catch (err) {
      console.error(err);
      setIsSyncing(false);
      alert("เกิดข้อผิดพลาดในการบันทึกการรับเอกสาร");
    }
  };

  const handleExportExcel = () => {
    const headers = ["ID", "ชื่อ-นามสกุล", "รายการ", "สถานะ", "วันที่ยื่น"];
    const rows = requests.map(r => [r.id, r.fullName, r.selectedTypes.join(', '), r.status, r.submissionDate]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HR_DATABASE_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const executeDeleteRequest = async () => {
    if (!deleteConfirmId) return;
    setIsLoading(true);
    try {
      await callApi('deleteRequestServer', deleteConfirmId);
      setDeleteConfirmId(null);
      await refreshData(true);
    } catch (err) {
      alert("❌ การลบข้อมูลจาก Google Sheets ล้มเหลว");
      setIsLoading(false);
    }
  };

  const requestToDelete = requests.find(r => r.id === deleteConfirmId);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden selection:bg-indigo-100">
      {isLoading && (
        <div className="fixed inset-0 z-[1000] bg-white/90 backdrop-blur-2xl flex items-center justify-center p-6 text-center">
          <div className="flex flex-col items-center gap-6">
             <div className="w-24 h-24 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin shadow-2xl"></div>
             <div className="space-y-2">
                <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">กำลังสื่อสารกับ Google Sheets...</p>
                <p className="text-[10px] text-slate-400">กรุณารอสักครู่เพื่อความถูกต้องของข้อมูล</p>
             </div>
          </div>
        </div>
      )}

      <div className="no-print fixed top-0 left-0 right-0 h-1.5 z-[200] transition-all duration-1000 bg-emerald-500 shadow-[0_2px_15px_rgba(16,185,129,0.8)]"></div>

      <nav className="no-print fixed top-0 left-0 right-0 h-20 md:h-24 glass z-[100] px-4 md:px-8 border-b border-slate-200/50">
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => navigateTo('dashboard')}>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl font-black text-sm md:text-lg transform hover:scale-110 transition-transform">HR</div>
            <div className="hidden xs:block">
              <h1 className="text-base md:text-2xl font-black text-slate-900 leading-none tracking-tighter uppercase">HR DIGITAL</h1>
              <p className="text-[8px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Medicine Naresuan</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100/80 p-1 md:p-1.5 rounded-full border border-slate-200/50 shadow-inner overflow-x-auto hide-scrollbar">
            <button onClick={() => navigateTo('dashboard')} className={`whitespace-nowrap px-4 md:px-7 py-2 md:py-3.5 text-[11px] md:text-[15px] font-black rounded-full transition-all duration-300 ${currentView === 'dashboard' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>หน้าหลัก</button>
            <button onClick={() => navigateTo('form')} className={`whitespace-nowrap px-4 md:px-7 py-2 md:py-3.5 text-[11px] md:text-[15px] font-black rounded-full transition-all duration-300 ${currentView === 'form' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white'}`}>ยื่นคำขอ</button>
            <button onClick={() => navigateTo('track')} className={`whitespace-nowrap px-4 md:px-7 py-2 md:py-3.5 text-[11px] md:text-[15px] font-black rounded-full transition-all duration-300 ${currentView === 'track' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white'}`}>ติดตามสถานะ</button>
          </div>

          <button onClick={handleAdminToggle} className={`hidden sm:flex px-6 py-3.5 rounded-2xl text-[12px] font-black uppercase transition-all shadow-xl items-center gap-2.5 active:scale-95 ${isAdmin ? 'bg-gradient-to-br from-indigo-700 to-violet-900 text-white' : 'bg-slate-950 text-slate-100 hover:bg-slate-900'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span>{isAdmin ? 'ADMIN PANEL' : 'เจ้าหน้าที่'}</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-12 bg-slate-50/50">
        <div className="max-w-[1400px] mx-auto">
          {isSyncing && (
             <div className="fixed top-24 right-8 z-[200] animate-bounce">
                <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black shadow-2xl flex items-center gap-2 border border-emerald-400">
                   <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                   SYNCING...
                </div>
             </div>
          )}

          {currentView === 'dashboard' && (
             <div className="space-y-16 animate-fade-in">
                <div className="text-center max-w-4xl mx-auto space-y-8 py-10">
                   <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none uppercase">HR DIGITAL PORTAL<br/><span className="text-indigo-600 italic font-serif lowercase tracking-normal">Medicine Naresuan</span></h2>
                   <p className="text-base md:text-xl text-slate-500 font-medium px-4 leading-relaxed">ระบบทะเบียนกลางสำหรับการจัดการหนังสือรับรอง เชื่อมโยงข้อมูลผ่าน Google Sheets ซิงค์ข้อมูลข้ามเครื่องแบบ Real-time</p>
                   
                   <div className="flex flex-wrap justify-center gap-6 pt-6">
                      <button onClick={() => navigateTo('form')} className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-indigo-600 hover:-translate-y-2 transition-all flex items-center gap-4 group">
                        📝 ยื่นคำขอใหม่
                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                      <button onClick={() => navigateTo('track')} className="px-10 py-5 bg-white text-slate-900 border-4 border-slate-900 rounded-[2rem] font-black text-xl shadow-xl hover:bg-slate-50 hover:-translate-y-2 transition-all flex items-center gap-4 group">
                        🔭 ติดตามสถานะ
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </button>
                   </div>
                </div>

                <div className="pt-10">
                  <StatusBoard requests={requests} />
                </div>
             </div>
          )}

          {currentView === 'form' && <CertificateForm onSubmit={handleAddRequest} profile={profile} />}
          {currentView === 'track' && <StatusTracking requests={requests} onUpdateReceiving={handleUpdateReceiving} initialId={initialTrackId} />}

          {currentView === 'list' && isAdmin && (
            <div className="animate-fade-in space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-3 h-full bg-emerald-500"></div>
                <div>
                   <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">ศูนย์จัดการข้อมูล (Admin)</h2>
                   <div className="flex flex-wrap items-center gap-6 mt-4">
                     <p className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                       🌍 เชื่อมต่อ Google Sheets เรียบร้อย
                     </p>
                     <span className="hidden md:block text-slate-200">|</span>
                     <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString()}</p>
                   </div>
                </div>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                   <button onClick={() => refreshData()} className="flex-1 md:flex-none px-8 py-4 bg-slate-950 text-white rounded-2xl text-[12px] font-black uppercase hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50" disabled={isSyncing}>
                     <svg className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                     รีเฟรช Google Sheets
                   </button>
                </div>
              </div>
              <CertificateTable 
                requests={requests} 
                onUpdateStatus={handleUpdateStatus} 
                onUpdateReceiving={handleUpdateReceiving} 
                onDelete={(id) => setDeleteConfirmId(id)} 
                onExport={handleExportExcel}
                onViewReport={() => navigateTo('report')}
                isAdmin={isAdmin} 
              />
            </div>
          )}

          {currentView === 'report' && isAdmin && <ReportView requests={requests} onBack={() => navigateTo('list')} />}
        </div>
      </main>

      <footer className="no-print py-12 px-8 bg-slate-100/50 border-t border-slate-200 text-center">
         <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em]">NU Digital Certificate Portal</p>
            <p className="text-[10px] font-medium text-slate-400">งานทรัพยากรบุคคล คณะแพทยศาสตร์ มหาวิทยาลัยนเรศวร<br/>เชื่อมต่อข้อมูล Google Sheets แบบ Real-time</p>
         </div>
      </footer>

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setIsLoginModalOpen(false)}></div>
          <form onSubmit={handleLoginSubmit} className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-12 border border-white">
            <div className="text-center mb-10">
               <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6">NU</div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">เข้าสู่ระบบเจ้าหน้าที่</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Officer Access Only</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                 <input type="text" placeholder="ชื่อผู้ใช้งาน" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-800 transition-all" />
              </div>
              <div className="relative">
                 <input type="password" placeholder="รหัสผ่าน" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-800 transition-all" />
              </div>
              {loginError && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-shake">Username หรือ Password ไม่ถูกต้อง</p>}
              <button type="submit" className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-2xl mt-6 active:scale-95 uppercase tracking-widest">เข้าสู่ระบบ</button>
            </div>
          </form>
        </div>
      )}

      {deleteConfirmId && requestToDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-12 text-center space-y-8 shadow-2xl">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto">⚠️</div>
            <div className="space-y-3">
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">ยืนยันการลบข้อมูล?</h3>
               <p className="text-slate-500 font-medium leading-relaxed">ข้อมูลของคุณ <span className="text-slate-900 font-black">{requestToDelete.fullName}</span> (ID: #{requestToDelete.id}) จะถูกลบออกจาก Google Sheets ถาวร</p>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">ยกเลิก</button>
              <button onClick={executeDeleteRequest} className="flex-1 py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl hover:bg-red-700 transition-all active:scale-95">ยืนยันการลบถาวร</button>
            </div>
          </div>
        </div>
      )}

      <ChatBot />
    </div>
  );
};

export default App;
