
import React from 'react';

const FormCard = ({ title, icon, children, onRemove }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-100/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-100/30 transition-all duration-500">
      <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#1D63BD]">
            <i className={`fas ${icon} text-lg`}></i>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center space-x-4">
          {onRemove && (
            <button 
              type="button" 
              onClick={onRemove}
              className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          )}
          <div className="h-1.5 w-12 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );
};

export default FormCard;
