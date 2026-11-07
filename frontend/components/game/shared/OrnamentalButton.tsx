'use client';

import React from 'react';

interface OrnamentalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'bronze' | 'dark' | 'green' | 'red' | 'icon' | 'textual';
  children: React.ReactNode;
}

export default function OrnamentalButton({
  variant = 'gold',
  className = '',
  children,
  ...props
}: OrnamentalButtonProps) {
  if (variant === 'textual') {
    return (
      <button
        type="button"
        className={`gate-button textual ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  const variantAttr = variant === 'gold' ? undefined : variant;

  return (
    <button
      className={`rw-btn ${className}`}
      data-variant={variantAttr}
      {...props}
    >
      {children}
    </button>
  );
}

