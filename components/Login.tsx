
import React, { useState } from 'react';
import { ConnectifyrIcon } from './Icon';

interface LoginProps {
  onLogin: (email: string, name: string, remember: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Name is required!");
    if (!email.includes('@')) return setError("Valid email required!");
    if (!agreedToTerms) return setError("Must agree to terms!");
    onLogin(email.toLowerCase(), name, rememberMe);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FFDEE9] bg-gradient-to-tr from-[#FF9A9E] to-[#FAD0C4] p-4 md:p-10">
      <div className={`w-full max-w-md bg-white border-4 md:border-8 border-black rounded-[30px] md:rounded-[40px] shadow-[12px_12px_0px_#000] md:shadow-[20px_20px_0px_#000] p-6 md:p-10 space-y-6 md:space-y-8 relative overflow-hidden transition-transform`}>
        
        <div className="text-center relative z-10">
          <div className="flex justify-center mb-4 md:mb-6 floating-icon">
            <ConnectifyrIcon className="w-16 h-16 md:w-24 md:h-24" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-black italic uppercase tracking-tighter leading-none">CONNECTIFYR</h1>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest mt-2 opacity-60">Anime Messaging Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-black uppercase tracking-widest">Nakama Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-gray-50 border-4 border-black rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition-all font-bold shadow-[4px_4px_0px_#000]"
              placeholder="Display Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-black uppercase tracking-widest">Digital Address (Email)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 md:px-5 py-3 md:py-4 bg-gray-50 border-4 border-black rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition-all font-bold shadow-[4px_4px_0px_#000]"
              placeholder="user@example.com"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer no-select group">
              <input type="checkbox" className="sr-only peer" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              <div className="w-6 h-6 md:w-8 md:h-8 bg-white border-4 border-black rounded-lg peer-checked:bg-indigo-500 transition-colors flex items-center justify-center">
                {rememberMe && <i className="fas fa-check text-white text-xs md:text-sm"></i>}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">Stay Signed In</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer no-select group">
              <input type="checkbox" className="sr-only peer" checked={agreedToTerms} onChange={() => setAgreedToTerms(!agreedToTerms)} />
              <div className="w-6 h-6 md:w-8 md:h-8 bg-white border-4 border-black rounded-lg peer-checked:bg-pink-500 transition-colors flex items-center justify-center">
                {agreedToTerms && <i className="fas fa-check text-white text-xs md:text-sm"></i>}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">Accept Nakama Agreement</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-500 text-white border-4 border-black p-3 rounded-xl font-black text-[10px] uppercase shadow-[4px_4px_0px_#000] animate-bounce">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white font-black py-4 md:py-5 rounded-2xl md:rounded-3xl border-4 border-black hover:bg-indigo-600 shadow-[8px_8px_0px_#000] active:translate-y-2 active:shadow-none uppercase italic text-lg md:text-xl transition-all"
          >
            Join the Squad
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
