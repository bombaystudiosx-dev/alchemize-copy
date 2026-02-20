import React from 'react';

// Simplified — no AnimatePresence wrapping every page change.
// CSS handles the fade-in via a lightweight class instead of JS layout thrash.
export default function PageTransition({ children, pageKey }) {
  return (
    <div key={pageKey} className="animate-page-in">
      {children}
    </div>
  );
}