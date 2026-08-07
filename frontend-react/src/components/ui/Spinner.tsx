import React from 'react';
export const Spinner = ({ text }: { text?: string }) => (
  <div className="spinner-wrap">
    <div className="spinner" />
    {text && <p className="spinner-text">{text}</p>}
  </div>
);
