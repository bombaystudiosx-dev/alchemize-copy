import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// iOS-native spring timing (60fps optimized)
const spring = {
  type: 'spring',
  stiffness: 380,
  damping: 35,
  mass: 0.8,
};

const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
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
        transition={spring}
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