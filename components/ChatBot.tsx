
import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/gemini';
import { ChatMessage } from '../types';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'สวัสดีค่ะ หนูชื่อ "สาวน้อย" ยินดีที่ได้รู้จักนะคะ มีอะไรให้ช่วยเกี่ยวกับระบบทะเบียนหนังสือรับรอง หรืออยากทราบขั้นตอนการขอเอกสาร สอบถามรายละเอียดได้เลยค่ะ!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // แสดงข้อความเชิญชวนหลังจากโหลดหน้าเว็บ 2 วินาที
    const timer = setTimeout(() => {
      setShowInvite(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getChatResponse(userMsg, history);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setShowInvite(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[550px] rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-pink-500 p-6 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-900/20">
                  👩‍💼
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="text-lg font-black leading-tight tracking-tight">สาวน้อย AI Support</h3>
                <div className="flex items-center gap-1.5 opacity-90">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">พร้อมช่วยเหลือค่ะ</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-2xl transition-colors relative z-10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-sm transition-all ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 text-slate-400 px-6 py-3.5 rounded-3xl rounded-tl-none text-xs font-bold flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  สาวน้อยกำลังพิมพ์...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-5 bg-white border-t border-slate-50">
            <div className="flex gap-3 bg-slate-100 p-2 rounded-3xl group-focus-within:bg-white group-focus-within:ring-2 ring-indigo-500/10 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="ถามสาวน้อยได้เลยค่ะ..."
                className="flex-1 bg-transparent border-none rounded-full px-4 py-2 text-sm focus:ring-0 outline-none text-slate-700 font-medium placeholder:text-slate-400"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-pink-500 transition-all duration-300 disabled:opacity-30 shadow-lg shadow-indigo-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Invite Bubble */}
          {showInvite && (
            <div className="absolute -top-20 right-0 animate-bounce-gentle">
              <div className="relative bg-white text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-indigo-100 whitespace-nowrap flex flex-col items-center">
                <span className="text-[11px] font-black uppercase tracking-tighter text-indigo-600 leading-none mb-1">สาวน้อย AI</span>
                <span className="text-[13px] font-bold text-slate-700">สอบถามรายละเอียดได้เลยค่ะ ✨</span>
                {/* Tail */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-indigo-100 rotate-45"></div>
              </div>
            </div>
          )}

          <button 
            onClick={toggleChat}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-white text-indigo-600 p-5 rounded-full shadow-xl transition-all hover:scale-110 active:scale-90 border border-slate-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 text-2xl">👩‍💼</div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 border-2 border-white rounded-full"></div>
            </div>
          </button>
        </div>
      )}
      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
