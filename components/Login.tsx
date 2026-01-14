
import React, { useState } from 'react';
import { ConnectifyrIcon } from './Icon';

interface LoginProps {
  onLogin: (email: string, name: string, remember: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Hero name cannot be empty!");
      return;
    }

    if (!validateEmail(email)) {
      setError("BAKA! That's not a valid digital address!");
      return;
    }

    onLogin(email, name, rememberMe);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFDEE9] bg-gradient-to-tr from-[#FF9A9E] to-[#FAD0C4] p-6">
      <div className={`w-full max-w-md bg-white border-8 border-black rounded-[40px] shadow-[20px_20px_0px_#000] p-10 space-y-8 relative overflow-hidden transition-transform ${error ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        <div className="absolute top-4 left-4 text-yellow-400 text-3xl opacity-50 rotate-12"><i className="fas fa-star"></i></div>
        <div className="absolute bottom-10 right-4 text-pink-400 text-5xl opacity-30 -rotate-12"><i className="fas fa-heart"></i></div>
        
        <div className="text-center relative z-10">
          <div className="flex justify-center mb-6 floating-icon">
            <ConnectifyrIcon className="w-24 h-24" />
          </div>
          <h1 className="text-5xl font-black text-black italic uppercase tracking-tighter">CONNECTIFYR</h1>
          <div className="bg-yellow-300 border-2 border-black px-4 py-1 inline-block -rotate-1 rounded-lg shadow-[3px_3px_0px_#000] mb-2">
            <p className="text-black font-black uppercase text-xs tracking-widest">Join the Nakama Network!</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Character Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full px-5 py-4 bg-gray-50 border-4 border-black rounded-2xl focus:bg-white focus:outline-none transition-all font-bold placeholder:text-gray-300 shadow-[4px_4px_0px_#000] ${error && !name ? 'border-red-500' : ''}`}
              placeholder="Naruto Uzumaki"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">Digital Address (Email)</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full px-5 py-4 bg-gray-50 border-4 border-black rounded-2xl focus:bg-white focus:outline-none transition-all font-bold placeholder:text-gray-300 shadow-[4px_4px_0px_#000] ${error && error.includes('BAKA') ? 'border-red-500 bg-red-50' : ''}`}
              placeholder="hokage@leaf.village"
            />
          </div>

          <div className="flex items-center gap-3 no-select">
            <label className="relative flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <div className="w-8 h-8 bg-white border-4 border-black rounded-lg shadow-[3px_3px_0px_#000] peer-checked:bg-pink-500 transition-colors flex items-center justify-center">
                {rememberMe && <i className="fas fa-check text-white text-sm"></i>}
              </div>
              <span className="ml-3 text-xs font-black text-black uppercase tracking-widest italic">Remember my Legend!</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-500 text-white border-4 border-black p-3 rounded-xl font-black text-[10px] uppercase tracking-wider animate-bounce flex items-center gap-2">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white font-black py-5 rounded-3xl border-4 border-black hover:bg-indigo-600 transition-all shadow-[8px_8px_0px_#000] active:translate-y-2 active:shadow-none uppercase italic text-xl tracking-tighter"
          >
            IKE! ENTER THE WORLD!
          </button>
        </form>

        <p className="text-center font-black text-[10px] text-gray-400 uppercase tracking-widest relative z-10">
          POWERED BY GEMINI-CHAN
        </p>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Login;
