import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

let _globalToast = null;
export function setGlobalToast(fn) { _globalToast = fn; }
export function toast(msg, type = 'success') { _globalToast?.(msg, type); }

export function AppToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // Register globally
  React.useEffect(() => { setGlobalToast(show); return () => setGlobalToast(null); }, [show]);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg pointer-events-auto ${
                t.type === 'error'
                  ? 'bg-red-900/90 border border-red-500/40'
                  : 'bg-[#1a0a2e]/95 border border-purple-500/40'
              }`}
            >
              {t.type === 'error'
                ? <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                : <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              }
              <p className="text-white text-sm flex-1">{t.msg}</p>
              <button onClick={() => dismiss(t.id)} className="text-white/40 hover:text-white/70">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}