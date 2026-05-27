
import React from 'react';

const Logo = ({ className = "h-12" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 400 450" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M200 420C200 420 360 350 360 120V60L200 20L40 60V120C40 350 200 420 200 420Z" fill="#1D63BD" />
        <path d="M200 20V420C200 420 360 350 360 120V60L200 20Z" fill="#154A8D" />
        <path d="M120 180H280" stroke="white" strokeWidth="12" strokeLinecap="round" />
        <path d="M120 230H280" stroke="white" strokeWidth="12" strokeLinecap="round" />
        <path d="M150 130C150 130 160 110 200 110C240 110 250 130 250 130H280C290 130 300 140 300 150V180H100V150C100 140 110 130 120 130H150Z" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="150" cy="235" r="22" stroke="white" strokeWidth="12" />
        <circle cx="250" cy="235" r="22" stroke="white" strokeWidth="12" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">AutoCheck</span>
      </div>
    </div>
  );
};

export default Logo;
