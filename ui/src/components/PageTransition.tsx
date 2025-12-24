import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    x: 20,
    scale: 0.98,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Fade in animation for cards and elements
export const FadeIn = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  className = ""
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Stagger children animation
export const StaggerContainer = ({ 
  children,
  className = "",
  staggerDelay = 0.1
}: { 
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ 
  children,
  className = ""
}: { 
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.4,
          ease: "easeOut"
        }
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale animation for buttons and interactive elements
export const ScaleOnHover = ({ 
  children,
  className = ""
}: { 
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Reveal animation for results
export const RevealAnimation = ({ 
  children,
  isRevealing = false,
  className = ""
}: { 
  children: ReactNode;
  isRevealing?: boolean;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
    animate={isRevealing ? {
      opacity: [0, 1, 1],
      scale: [0.8, 1.1, 1],
      filter: ["blur(10px)", "blur(0px)", "blur(0px)"],
    } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
    transition={{ 
      duration: 0.8, 
      ease: "easeOut",
      times: [0, 0.6, 1]
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Confetti-like celebration animation
export const CelebrationBurst = ({ show }: { show: boolean }) => {
  if (!show) return null;
  
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `hsl(${185 + i * 15}, 70%, 50%)`,
            left: "50%",
            top: "50%",
          }}
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: Math.cos((i * 30 * Math.PI) / 180) * 100,
            y: Math.sin((i * 30 * Math.PI) / 180) * 100,
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: i * 0.02,
          }}
        />
      ))}
    </motion.div>
  );
};
