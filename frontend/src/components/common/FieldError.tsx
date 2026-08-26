import React from 'react';

interface FieldErrorProps {
  error?: string | string[];
}

export const FieldError: React.FC<FieldErrorProps> = ({ error }) => {
  if (!error) return null;

  const messages = Array.isArray(error) ? error : [error];
  if (messages.length === 0) return null;

  return (
    <div className="mt-1 space-y-0.5 animate-fadeIn">
      {messages.map((msg, index) => (
        <p key={index} className="text-[11px] text-rose-400 font-medium leading-tight">
          {msg}
        </p>
      ))}
    </div>
  );
};
