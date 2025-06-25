import React, { useEffect } from "react";
import { Alert } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const EnhancedSuccessAlert = ({ 
  message, 
  onClose, 
  darkMode,
  showCount = true
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Extract count from message if available
  const extractCount = () => {
    const match = message.match(/(\d+)\s+CV/);
    return match ? match[1] : null;
  };

  const count = showCount ? extractCount() : null;

  return (
    <Alert
      variant="success"
      className="position-relative text-center mb-3 overflow-hidden"
      onClose={onClose}
      dismissible
      style={{
        backgroundColor: darkMode ? "#28a74520" : "#d4edda",
        color: darkMode ? "#ffffff" : "#155724",
        border: "1px solid #c3e6cb",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <div className="d-flex flex-column align-items-center py-2">
        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.6
          }}
          className="mb-3"
        >
          <div
            style={{
              backgroundColor: "rgba(40, 167, 69, 0.15)",
              borderRadius: "50%",
              width: "70px",
              height: "70px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            <FaCheckCircle 
              color="#28a745" 
              size={40} 
            />
          </div>
        </motion.div>
        
        {/* Animated Count (if available) */}
        {count && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-2"
          >
            <span 
              className="fw-bold" 
              style={{ 
                fontSize: "2rem",
                color: darkMode ? "#28a745" : "#218838"
              }}
            >
              {count}
            </span>
          </motion.div>
        )}
        
        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="mb-0 fw-semibold" style={{ fontSize: "1.1rem" }}>
            {message}
          </p>
        </motion.div>
      </div>
      
      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ delay: 0.8, duration: 1 }}
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          zIndex: 0,
          overflow: "hidden"
        }}
      >
        <FaCheckCircle size={100} color={darkMode ? "#ffffff" : "#000000"} />
      </motion.div>
    </Alert>
  );
};

export default EnhancedSuccessAlert;