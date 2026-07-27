
import React from 'react';
import Logo from './Logo';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Logo className="h-10" />
        
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right mr-2">
            <p className="text-xs font-bold text-slate-800">Oficina Premium</p>
            <p className="text-[10px] text-slate-400">Plano Pro Ativo</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1D63BD] to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
            OP
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
