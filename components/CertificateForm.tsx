
import React, { useState, useEffect } from 'react';
import { CertificateRequest, CertificateType, UserProfile } from '../types';
import { CERT_TYPES } from '../constants';

interface Props {
  onSubmit: (data: Omit<CertificateRequest, 'id' | 'status' | 'submissionDate'>) => void;
  profile?: UserProfile;
}

export const CertificateForm: React.FC<Props> = ({ onSubmit, profile }) => {
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [selectedTypes, setSelectedTypes] = useState<CertificateType[]>([]);
  const [submissionSign, setSubmissionSign] = useState(profile?.fullName || '');
  const [internalPhone, setInternalPhone] = useState(profile?.internalPhone || '');
  const [mobilePhone, setMobilePhone] = useState(profile?.mobilePhone || '');
  const [targetCountry, setTargetCountry] = useState('');

  // Update form if profile changes
  useEffect(() => {
    if (profile) {
      if (!fullName) setFullName(profile.fullName);
      if (!email) setEmail(profile.email);
      if (!internalPhone) setInternalPhone(profile.internalPhone);
      if (!mobilePhone) setMobilePhone(profile.mobilePhone);
      if (!submissionSign) setSubmissionSign(profile.fullName);
    }
  }, [profile]);

  const handleCheckboxChange = (type: CertificateType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const isVisaSelected = selectedTypes.includes('รับรองภาษาอังกฤษเพื่อขอวีซ่า');

  const getBankStyle = (bank: CertificateType) => {
    switch (bank) {
      case 'ออมสิน':
        return {
          activeBg: 'bg-pink-50',
          activeBorder: 'border-pink-500',
          activeText: 'text-pink-700',
          iconBg: 'bg-pink-500',
          icon: (
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M50 25c-13.8 0-25 11.2-25 25s11.2 25 25 25 25-11.2 25-25-11.2-25-25-25zm0 40c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z" />
              <circle cx="50" cy="50" r="8" />
            </svg>
          )
        };
      case 'ธอส.':
        return {
          activeBg: 'bg-orange-50',
          activeBorder: 'border-orange-500',
          activeText: 'text-orange-700',
          iconBg: 'bg-orange-500',
          icon: (
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 15L15 45v40h70V45L50 15zm25 65H25V48l25-22 25 22v32z" />
            </svg>
          )
        };
      case 'กรุงไทย':
        return {
          activeBg: 'bg-sky-50',
          activeBorder: 'border-sky-500',
          activeText: 'text-sky-700',
          iconBg: 'bg-sky-500',
          icon: (
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 20c-8 0-25 10-35 35 20-5 30-5 35-5s15 0 35 5c-10-25-27-35-35-35z" />
            </svg>
          )
        };
      case 'อิสลาม':
        return {
          activeBg: 'bg-emerald-50',
          activeBorder: 'border-emerald-600',
          activeText: 'text-emerald-700',
          iconBg: 'bg-emerald-600',
          icon: (
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 5L10 25v50l40 20 40-20V25L50 5z" />
            </svg>
          )
        };
      default:
        return { activeBg: 'bg-slate-50', activeBorder: 'border-slate-500', activeText: 'text-slate-700', iconBg: 'bg-slate-500', icon: null };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || selectedTypes.length === 0 || !submissionSign || !email) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน รวมถึงอีเมลและชื่อผู้ลงนามส่งด้วยค่ะ');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('กรุณากรอกรูปแบบอีเมลที่ถูกต้องค่ะ');
      return;
    }
    if (isVisaSelected && !targetCountry.trim()) {
      alert('กรุณาระบุประเทศที่ต้องการขอวีซ่าด้วยค่ะ');
      return;
    }
    onSubmit({
      fullName,
      email,
      selectedTypes,
      submissionSign,
      internalPhone,
      mobilePhone,
      targetCountry: isVisaSelected ? targetCountry : undefined
    });
    // Don't reset everything if user has profile, just clear specific request fields
    setSelectedTypes([]);
    setTargetCountry('');
    // Optionally keep other fields if from profile
  };

  const renderSection = (title: string, groupName: string, accentColor: string, icon: React.ReactNode, cols: string = "grid-cols-1") => {
    const items = CERT_TYPES.filter(t => t.group === groupName);
    if (items.length === 0) return null;

    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6 h-fit">
        <div className={`${accentColor} px-6 py-4 border-b border-slate-100 flex items-center gap-3`}>
          <div className="opacity-80 scale-90">{icon}</div>
          <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
        </div>
        <div className={`p-4 grid gap-3 ${cols}`}>
          {items.map(type => (
            <div 
              key={type.value}
              onClick={() => handleCheckboxChange(type.value)}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                selectedTypes.includes(type.value) 
                  ? 'bg-blue-50 border-blue-500 shadow-md scale-[1.02]' 
                  : 'bg-white border-slate-50 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-6 h-6 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                selectedTypes.includes(type.value) ? 'bg-blue-500 border-blue-500 text-white shadow-sm' : 'border-slate-300 bg-white'
              }`}>
                {selectedTypes.includes(type.value) && (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 01.414 0z" clipRule="evenodd" /></svg>
                )}
              </div>
              <span className={`text-[13px] font-black leading-tight ${selectedTypes.includes(type.value) ? 'text-blue-700' : 'text-slate-600'}`}>{type.label}</span>
            </div>
          ))}
        </div>
        {groupName === 'english' && isVisaSelected && (
          <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <label className="block text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 ml-1">กรุณาระบุประเทศ (สำหรับขอวีซ่า)</label>
              <input 
                type="text"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                placeholder="ระบุประเทศที่ต้องการไป..."
                className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all font-bold text-black text-sm"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="relative bg-white/80 backdrop-blur-lg rounded-[2.5rem] shadow-xl border border-white p-6 md:p-10 overflow-hidden">
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                ชื่อ - นามสกุล ผู้ขอ
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all duration-300 shadow-sm text-black font-bold"
                placeholder="ชื่อ-นามสกุล"
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                อีเมล (สำหรับรับแจ้งสถานะ)
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all duration-300 shadow-sm text-black font-bold"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              ข้อมูลการติดต่อ
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                value={internalPhone}
                onChange={(e) => setInternalPhone(e.target.value)}
                className="sm:w-1/3 px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all shadow-sm text-black font-bold"
                placeholder="เบอร์ภายใน"
              />
              <input 
                type="text" 
                value={mobilePhone}
                onChange={(e) => setMobilePhone(e.target.value)}
                className="flex-grow px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all shadow-sm text-black font-bold"
                placeholder="เบอร์มือถือ"
              />
            </div>
          </div>

          <div className="mb-10">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-6 ml-1">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              รายการที่ต้องการขอ แบ่งตามหน่วยงาน
            </label>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: International Affairs */}
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl mb-2">
                   <h4 className="text-purple-700 font-black text-sm flex items-center gap-2">
                     <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                     กองต่างประเทศ
                   </h4>
                </div>
                {renderSection('หนังสือรับรองภาษาอังกฤษ', 'english', 'bg-purple-100/50 text-purple-700', (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ))}
              </div>

              {/* Right Column: Human Resources - NEW NAME */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-2">
                   <h4 className="text-blue-700 font-black text-sm flex items-center gap-2">
                     <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                     งานทรัพยากรบุคคล
                   </h4>
                </div>
                {renderSection('บัธรพนักงาน', 'id-card', 'bg-emerald-100/50 text-emerald-700', (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6a2 2 0 114 0 2 2 0 01-4 0zM7 20a5 5 0 0110 0M5 8h14M5 12h14M5 16h14"/></svg>
                ))}
                
                {renderSection('หนังสือรับรองทั่วไป', 'general', 'bg-blue-100/50 text-blue-700', (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ))}
                
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                  <div className="bg-amber-100/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="text-amber-600 scale-90">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1"/></svg>
                    </div>
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">หนังสือรับรองผ่านสิทธิ์สถาบันการเงิน</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {CERT_TYPES.filter(t => t.group === 'bank').map(type => {
                      const bankStyle = getBankStyle(type.value);
                      const isActive = selectedTypes.includes(type.value);
                      return (
                        <div 
                          key={type.value}
                          onClick={() => handleCheckboxChange(type.value)}
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isActive ? `${bankStyle.activeBg} ${bankStyle.activeBorder} shadow-lg scale-105 z-10` : 'bg-white border-slate-50 hover:border-slate-200'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? `${bankStyle.iconBg} text-white` : 'bg-slate-50 text-slate-400'}`}>
                            {bankStyle.icon}
                          </div>
                          <span className={`text-[11px] font-black leading-tight ${isActive ? bankStyle.activeText : 'text-slate-500'}`}>{type.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 ml-1">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              ผู้เซ็นส่งเอกสาร (กรุณาระบุชื่อจริงเพื่อลงนามส่งคำขอเข้าระบบ)
            </label>
            <input 
              type="text" 
              value={submissionSign}
              onChange={(e) => setSubmissionSign(e.target.value)}
              className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all shadow-sm italic font-black text-black text-lg"
              placeholder="ระบุชื่อจริงสำหรับการลงนามส่งคำขอ..."
            />
          </div>

          <button 
            type="submit"
            className="group relative w-full h-20 overflow-hidden rounded-[2rem] bg-slate-900 text-white font-black text-xl shadow-2xl transition-all active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-4">
              <span>ยืนยันข้อมูลและส่งคำขอเข้าระบบ</span>
              <svg className="w-7 h-7 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
