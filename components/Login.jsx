import React, { useState } from 'react';
import Logo from './Logo';

const Login = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const validUsers = {
      'luis': '123',
      'caique': '123'
    };

    if (validUsers[user.toLowerCase()] === password) {
      onLogin(user);
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-100 dark:shadow-none border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <Logo className="h-16 mb-4" />
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Bem-vindo ao AutoCheck</h2>
          <p className="text-slate-400 font-medium">Acesse o sistema de inspeção premium.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Usuário</label>
            <input 
              required
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold text-slate-900 dark:text-white"
              placeholder="Ex: luis"
              value={user}
              onChange={(e) => { setUser(e.target.value); setError(''); }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Senha</label>
            <input 
              required
              type="password"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold text-slate-900 dark:text-white"
              placeholder="••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-500 text-xs font-bold rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-1">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-5 bg-[#1D63BD] hover:bg-[#154A8D] text-white font-bold rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Acessar Dashboard
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-300 dark:text-slate-700 font-medium uppercase tracking-widest">Tecnologia AutoCheck &copy; 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
