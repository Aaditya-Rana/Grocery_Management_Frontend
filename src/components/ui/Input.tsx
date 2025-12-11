import React from 'react';
import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon: Icon,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-5 relative">
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`
            peer w-full bg-white/50 dark:bg-gray-800/50 border 
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'}
            rounded-xl py-3.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4 pt-5 pb-2
            text-gray-900 dark:text-white placeholder-transparent
            focus:outline-none focus:ring-2 focus:ring-opacity-20
            transition-all duration-200 outline-none
            ${className}
          `}
          {...props}
          placeholder=" " // Force space for :placeholder-shown to work reliably
        />
        <label
          className={`
            absolute ${Icon ? 'left-10' : 'left-4'} 
            text-gray-500 dark:text-gray-400
            transition-all duration-200 pointer-events-none
            
            /* Floating State (Default/Focus/Value) */
            top-1 text-xs font-semibold text-primary
            
            /* Resting State (Placeholder Shown) */
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
            peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-500
            
            /* Focus State (Must override resting state if empty) */
            peer-focus:top-1! peer-focus:translate-y-0! peer-focus:text-xs! peer-focus:font-semibold! peer-focus:text-primary!
          `}
        >
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};
