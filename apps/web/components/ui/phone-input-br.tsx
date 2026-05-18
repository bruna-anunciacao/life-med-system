"use client";

import { forwardRef } from "react";

type PhoneInputBRProps = {
  id?: string;
  value?: string;
  onChange: (e164: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const digitsOnly = (s: string) => s.replace(/\D/g, "");

const fromE164 = (val?: string) => {
  if (!val) return "";
  const digits = digitsOnly(val);
  return digits.startsWith("55") ? digits.slice(2) : digits;
};

const formatBR = (digits: string) => {
  const d = digits.slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const isValidPhoneBR = (e164?: string) => {
  const digits = fromE164(e164);
  return digits.length === 10 || digits.length === 11;
};

export const PhoneInputBR = forwardRef<HTMLInputElement, PhoneInputBRProps>(
  function PhoneInputBR(
    { id, value, onChange, onBlur, disabled, placeholder = "(71) 99999-9999", className },
    ref,
  ) {
    const displayDigits = fromE164(value);
    const display = formatBR(displayDigits);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = digitsOnly(e.target.value).slice(0, 11);
      onChange(digits ? `+55${digits}` : "");
    };

    return (
      <div
        className={
          className ??
          "w-full flex items-center border border-gray-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
        }
      >
        <span className="px-3 py-2 text-sm text-gray-600 border-r border-gray-300 bg-gray-50 select-none">
          🇧🇷 +55
        </span>
        <input
          id={id}
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={placeholder}
          value={display}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm text-gray-900 bg-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      </div>
    );
  },
);
