import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fast snappy transitions
const transition = {
  duration: 0.15,
  ease: [0.25, 0.1, 0.25, 1],
};

const variants = {
  initial: { opacity: 0.6 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

function PageTransition({ children, pageKey }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        style={{
          background: '#0a0118',
          minHeight: '100dvh',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(PageTransition);