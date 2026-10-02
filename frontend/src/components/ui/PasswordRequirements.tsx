import React from 'react';

export interface PasswordCriteria {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
}

export function evaluatePassword(value: string): PasswordCriteria {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
  };
}

const RULES: { key: keyof PasswordCriteria; label: string }[] = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'upper', label: 'At least one uppercase letter' },
  { key: 'lower', label: 'At least one lowercase letter' },
  { key: 'number', label: 'At least one number' },
];

interface PasswordRequirementsProps {
  criteria: PasswordCriteria;
}

/**
 * Progressive password requirements checklist. Mirrors the server-side
 * rules in apps/accounts/validators.py (ComplexityValidator) plus Django's
 * built-in MinimumLengthValidator(8) — keep these in sync if either changes.
 */
const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ criteria }) => {
  return (
    <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
        Password Requirements:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {RULES.map((rule) => {
          const met = criteria[rule.key];
          return (
            <div
              key={rule.key}
              className={`flex items-center gap-2 transition-colors ${
                met ? 'text-secondary font-medium' : 'text-outline'
              }`}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: `"FILL" ${met ? 1 : 0}` }}
              >
                {met ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordRequirements;
