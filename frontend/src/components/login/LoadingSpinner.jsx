import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  darkMode = false, 
  message = "Loading", 
  subMessage = "Please wait while we process your request",
  size = "medium" 
}) => {
  // Size variants
  const sizes = {
    small: {
      spinner: 24,
      containerPadding: "1.5rem",
      textSize: "0.9rem",
      gap: "1rem"
    },
    medium: {
      spinner: 32,
      containerPadding: "2rem",
      textSize: "1rem",
      gap: "1.5rem"
    },
    large: {
      spinner: 48,
      containerPadding: "3rem",
      textSize: "1.2rem",
      gap: "2rem"
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  // Theme configuration
  const theme = {
    accentColor: darkMode ? "#3b82f6" : "#2563eb", // More modern blue shades
    backgroundColor: darkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
    textColor: darkMode ? "#f8fafc" : "#1e293b",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    border: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backgroundColor: darkMode ? "rgba(2, 6, 23, 0.8)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)"
      }}
    >
      <motion.div
        style={{
          background: theme.backgroundColor,
          borderRadius: "16px",
          padding: currentSize.containerPadding,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: currentSize.gap,
          boxShadow: darkMode 
            ? "0 10px 30px -10px rgba(0, 0, 0, 0.3)" 
            : "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${theme.border}`,
          maxWidth: "90vw",
          width: "auto",
          minWidth: "200px"
        }}
        initial={{ scale: 0.95, y: 5 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
      >
        {/* Spinner with modern design */}
        <motion.div
          style={{
            position: "relative",
            width: currentSize.spinner,
            height: currentSize.spinner
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              width: "100%",
              height: "100%",
              border: `3px solid ${theme.accentColor}20`,
              borderTop: `3px solid ${theme.accentColor}`,
              borderRadius: "50%",
              position: "relative"
            }}
          />
          
          {/* Inner dot for better visual focus */}
          <motion.div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: currentSize.spinner / 4,
              height: currentSize.spinner / 4,
              borderRadius: "50%",
              backgroundColor: theme.accentColor,
              boxShadow: `0 0 8px ${theme.accentColor}`
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Text content */}
        <motion.div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            textAlign: "center"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.p
            style={{
              fontSize: currentSize.textSize,
              fontWeight: 600,
              color: theme.textColor,
              margin: 0
            }}
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {message}
            <motion.span
              animate={{ opacity: [0, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                repeatType: "reverse"
              }}
            >
              ...
            </motion.span>
          </motion.p>
          
          {subMessage && (
            <motion.p
              style={{
                fontSize: `calc(${currentSize.textSize} - 0.2rem)`,
                color: theme.textSecondary,
                fontWeight: 400,
                margin: 0,
                maxWidth: "300px",
                lineHeight: 1.4
              }}
            >
              {subMessage}
            </motion.p>
          )}
        </motion.div>

        {/* Progress indicator (optional) */}
        <motion.div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
            borderRadius: "2px",
            overflow: "hidden"
          }}
        >
          <motion.div
            style={{
              width: "30%",
              height: "100%",
              backgroundColor: theme.accentColor,
              borderRadius: "2px"
            }}
            initial={{ x: "-100%" }}
            animate={{ x: ["-100%", "300%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingSpinner;