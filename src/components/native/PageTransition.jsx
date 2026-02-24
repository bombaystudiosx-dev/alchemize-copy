import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
};

export default function PageTransition({ children, pageKey }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}