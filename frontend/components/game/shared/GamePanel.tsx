'use client';

import React from 'react';

interface GamePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  drawer?: boolean;
}

export default function GamePanel({
  children,
  drawer = false,
  className = '',
  ...props
}: GamePanelProps) {
  return (
    <div
      className={`rw-panel ${drawer ? 'rw-drawer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

