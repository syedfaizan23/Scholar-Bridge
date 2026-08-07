import React from 'react';

export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number (0-9)', test: (p: string) => /\d/.test(p) },
  { label: 'One special character (!@#$%...)', test: (p: string) => /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(p) },
];

export const isPasswordStrong = (p: string) => PASSWORD_RULES.every(r => r.test(p));

export const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  return (
    <ul className="pw-rules">
      {PASSWORD_RULES.map(rule => {
        const pass = rule.test(password);
        return (
          <li key={rule.label} className={pass ? 'pw-rule-ok' : 'pw-rule-bad'}>
            <span>{pass ? '✓' : '·'}</span> {rule.label}
          </li>
        );
      })}
    </ul>
  );
};
