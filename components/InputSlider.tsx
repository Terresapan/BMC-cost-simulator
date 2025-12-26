import React from 'react';

interface InputSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
    icon?: React.FC<{ size?: number; className?: string }>;
}

export const InputSlider: React.FC<InputSliderProps> = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step, 
    unit = "", 
    icon: Icon 
}) => {
    return (
        <div className="mb-5 group">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                    {Icon && <Icon size={16} className="mr-2 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />}
                    {label}
                </div>
                <div className="text-sm font-bold text-slate-200 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-right tabular-nums min-w-[60px]">
                    {unit === "%" ? Math.round(value * 100) : value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    <span className="text-slate-500 text-xs ml-1 font-normal">{unit}</span>
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 hover:accent-fuchsia-400 transition-all focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-opacity-50"
            />
        </div>
    );
};