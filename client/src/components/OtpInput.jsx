import React, { useRef, useEffect } from 'react';

export default function OtpInput({ value = '', onChange, onComplete, disabled = false, autoFocus = true }) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      // Clear this digit
      const newDigits = [...digits];
      newDigits[index] = '';
      const newOtp = newDigits.join('');
      onChange(newOtp);
      return;
    }

    const char = val[val.length - 1]; // take latest typed digit
    const newDigits = [...digits];
    newDigits[index] = char;
    const newOtp = newDigits.join('');
    onChange(newOtp);

    // Auto-advance to next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
      inputRefs.current[index + 1].select();
    }

    if (newOtp.length === 6 && onComplete) {
      onComplete(newOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    onChange(pastedData);

    const targetIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[targetIndex]) {
      inputRefs.current[targetIndex].focus();
    }

    if (pastedData.length === 6 && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[index]}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl border transition-all outline-none ${
            digits[index]
              ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-md shadow-sky-500/10'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      ))}
    </div>
  );
}
