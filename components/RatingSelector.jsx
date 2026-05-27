
import React from 'react';

const RatingSelector = ({ label, value, onChange, labels }) => {
  const options = labels || ['1', '2', '3', '4', '5'];
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-sm font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded">
          {value} / 5
        </span>
      </div>
      <div className="flex justify-between items-center space-x-1">
        {[1, 2, 3, 4, 5].map((num, idx) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`flex-1 h-12 rounded-lg border flex flex-col items-center justify-center transition-all ${
              value === num
                ? 'bg-cyan-500 border-cyan-500 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-cyan-300 dark:hover:border-cyan-700'
            }`}
          >
            <span className="text-sm font-bold">{num}</span>
            {labels && (
               <span className="text-[10px] mt-0.5 opacity-80">{labels[idx]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingSelector;
