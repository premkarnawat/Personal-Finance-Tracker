import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in') // 'in' | 'hold' | 'out'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('out'), 2200)
    const t3 = setTimeout(() => onDone(), 2900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'out' ? 0 : 1 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f1117]"
          onAnimationComplete={() => { if (phase === 'out') setPhase('done') }}
        >
          {/* Gold shimmer line top */}
          <motion.div
            className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a843] to-transparent"
            initial={{ width: '0%', left: '50%' }}
            animate={{ width: '100%', left: '0%' }}
            transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
          />

          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* F lettermark SVG */}
            <div className="relative">
              <svg width="80" height="96" viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Top bar */}
                <motion.polygon
                  points="10,8 72,8 80,20 10,20"
                  fill="#1e2535"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
                {/* Middle bar with arrow */}
                <motion.polygon
                  points="10,38 55,38 63,50 10,50"
                  fill="#1e2535"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                />
                {/* Left vertical stem */}
                <motion.rect
                  x="10" y="8" width="14" height="80"
                  fill="#1e2535"
                  initial={{ scaleY: 0, originY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
                {/* Gold accent line on F */}
                <motion.line
                  x1="10" y1="20" x2="10" y2="88"
                  stroke="#d4a843"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                />
              </svg>

              {/* Gold glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 1.5, delay: 0.8, repeat: 0 }}
                style={{ boxShadow: '0 0 40px 10px rgba(212,168,67,0.3)' }}
              />
            </div>

            {/* Brand name */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h1 className="text-4xl font-black tracking-[0.25em] text-white" style={{ fontFamily: 'system-ui' }}>
                FINTRA
              </h1>
              <p className="text-xs tracking-[0.3em] text-[#d4a843] mt-2 font-medium">
                TRACK YOUR FINANCE
              </p>
            </motion.div>
          </motion.div>

          {/* Gold shimmer line bottom */}
          <motion.div
            className="absolute bottom-0 right-0 h-[2px] bg-gradient-to-l from-transparent via-[#d4a843] to-transparent"
            initial={{ width: '0%', right: '50%' }}
            animate={{ width: '100%', right: '0%' }}
            transition={{ duration: 1.1, delay: 0.4, ease: 'easeOut' }}
          />

          {/* Corner accents */}
          <motion.div
            className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#d4a843]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          />
          <motion.div
            className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#d4a843]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
