import React from 'react';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="outreachly-demo-root"
      style={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        overflowY: 'visible',
      }}
    >
      {children}
    </div>
  );
}
