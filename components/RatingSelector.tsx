
import React from 'react';

interface Props {
  label: string;
  value: number;
  onChange: (val: number) => void;
  labels?: string[];
}

const RatingSelector: React.FC<Props> = ({ label, value, onChange, labels }) => {
  const defaultLabels = ['1', '2', '3', '4', '5'];
  const options = (labels && labels.length > 0) ? labels : defaultLabels;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
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
                : 'bg-white border-slate-200 text-slate-400 hover:border-cyan-300'
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
