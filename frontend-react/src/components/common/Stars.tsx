import React from 'react';

interface StarsProps { value: number; onChange?: (v: number) => void; size?: number; }

export const Stars = ({ value, onChange, size = 16 }: StarsProps) => {
  const interactive = !!onChange;
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => onChange?.(n)}
          style={{
            fontSize: size,
            cursor: interactive ? 'pointer' : 'default',
            color: n <= value ? '#f59e0b' : '#e2e8f0',
          }}
        >★</span>
      ))}
    </span>
  );
};
