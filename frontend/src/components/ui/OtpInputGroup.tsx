import React, { useEffect, useRef } from 'react';

interface OtpInputGroupProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  status?: 'default' | 'error' | 'disabled';
  autoFocus?: boolean;
}

/**
 * A row of single-digit boxes acting as one logical OTP field. `value` and
 * `onChange` are the source of truth (fully controlled) so the parent can
 * reset/prefill it; this component only manages focus movement and paste.
 */
const OtpInputGroup: React.FC<OtpInputGroupProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  status = 'default',
  autoFocus = true,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const digits = value.split('').slice(0, length);
  while (digits.length < length) digits.push('');

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    const joined = next.join('');
    onChange(joined);
    if (joined.length === length && !joined.includes('')) {
      onComplete?.(joined);
    }
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/[^0-9]/g, '').slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(length, '').slice(0, length));
    if (pasted.length === length) {
      onComplete?.(pasted);
      inputRefs.current[length - 1]?.focus();
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const boxClass = (filled: boolean) => {
    if (status === 'error') {
      return 'otp-box w-12 h-14 sm:w-14 sm:h-16 text-center font-tabular-stat text-[26px] font-bold text-error bg-error-container/20 rounded-xl shadow-sm focus:outline-none ring-2 ring-error transition-all duration-150';
    }
    if (status === 'disabled') {
      return 'otp-box w-12 h-14 sm:w-14 sm:h-16 text-center font-tabular-stat text-[26px] font-bold text-outline bg-surface-container-high/50 rounded-xl shadow-sm focus:outline-none ring-1 ring-outline-variant transition-all duration-150';
    }
    return `otp-box w-12 h-14 sm:w-14 sm:h-16 text-center font-tabular-stat text-[26px] font-bold text-on-surface rounded-xl shadow-sm focus:outline-none transition-all duration-150 focus:shadow-md ${
      filled
        ? 'bg-surface-container-lowest ring-2 ring-primary'
        : 'bg-surface-container-low ring-1 ring-outline-variant'
    }`;
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className={boxClass(!!digit)}
          disabled={status === 'disabled'}
          inputMode="numeric"
          maxLength={1}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          placeholder="•"
          type="text"
          value={digit}
        />
      ))}
    </div>
  );
};

export default OtpInputGroup;
