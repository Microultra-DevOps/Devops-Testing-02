import React, { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiAlertCircle, FiInfo } from "react-icons/fi";

const Notification = ({
  show,
  onClose,
  message,
  variant = "success",
  duration = 4000,
  darkMode = false
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);

    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); 
  };

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <FiCheck size={20} />;
      case "danger":
      case "error":
        return <FiX size={20} />;
      case "warning":
        return <FiAlertCircle size={20} />;
      case "info":
        return <FiInfo size={20} />;
      default:
        return <FiCheck size={20} />;
    }
  };

  const getThemeColors = () => {
    const baseColors = {
      success: {
        bg: darkMode ? "#065f46" : "#10b981",
        border: darkMode ? "#047857" : "#059669",
        text: "#ffffff"
      },
      danger: {
        bg: darkMode ? "#7f1d1d" : "#ef4444",
        border: darkMode ? "#991b1b" : "#dc2626",
        text: "#ffffff"
      },
      error: {
        bg: darkMode ? "#7f1d1d" : "#ef4444",
        border: darkMode ? "#991b1b" : "#dc2626",
        text: "#ffffff"
      },
      warning: {
        bg: darkMode ? "#92400e" : "#f59e0b",
        border: darkMode ? "#b45309" : "#d97706",
        text: "#ffffff"
      },
      info: {
        bg: darkMode ? "#1e3a8a" : "#3b82f6",
        border: darkMode ? "#1e40af" : "#2563eb",
        text: "#ffffff"
      }
    };

    return baseColors[variant] || baseColors.success;
  };

  const themeColors = getThemeColors();

  // Responsive toast styles
  const toastStyle = {
    background: `linear-gradient(135deg, ${themeColors.bg}, ${themeColors.border})`,
    border: `1px solid ${themeColors.border}`,
    borderRadius: "12px",
    boxShadow: darkMode
      ? "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
      : "0 10px 25px rgba(0, 0, 0, 0.15)",
    backdropFilter: "blur(10px)",
    width: "100%",
    maxWidth: "400px",
    minWidth: "280px"
  };

  const bodyStyle = {
    color: themeColors.text,
    padding: "1rem 1.25rem",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    fontSize: "0.95rem",
    fontWeight: "500",
    lineHeight: "1.4"
  };

  const closeButtonStyle = {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    borderRadius: "6px",
    color: themeColors.text,
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginLeft: "auto",
    flexShrink: 0,
    marginTop: "2px" 
  };

  // Mobile-specific container positioning
  const getContainerStyle = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      return {
        top: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        right: "auto",
        width: "calc(100vw - 40px)",
        maxWidth: "400px",
        zIndex: 1050
      };
    }
    
    return {
      top: "80px",
      right: "20px",
      maxWidth: "400px",
      zIndex: 1050
    };
  };

  // Mobile animation variants
  const getMobileAnimationProps = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      return {
        initial: { opacity: 0, y: -50, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -50, scale: 0.95 }
      };
    }
    
    return {
      initial: { opacity: 0, x: 100, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: 100, scale: 0.95 }
    };
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Enhanced backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="d-md-none position-fixed"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(1px)",
              zIndex: 1049
            }}
            onClick={handleClose}
          />

          <ToastContainer
            className="position-fixed"
            style={{
              ...getContainerStyle(),
              padding: window.innerWidth <= 768 ? "0 20px" : "1rem"
            }}
          >
            <motion.div
              {...getMobileAnimationProps()}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.3 
              }}
            >
              <Toast 
                show={true} 
                onClose={handleClose} 
                style={toastStyle}
                className="w-100"
              >
                <Toast.Body style={bodyStyle}>
                  {/* Icon */}
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>
                    {getIcon()}
                  </div>

                  {/* Message - responsive text wrapping */}
                  <div 
                    style={{ 
                      flex: 1, 
                      wordWrap: "break-word",
                      wordBreak: "break-word",
                      hyphens: "auto"
                    }}
                  >
                    {message}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    style={closeButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                    aria-label="Close notification"
                  >
                    <FiX size={16} />
                  </button>
                </Toast.Body>
              </Toast>
            </motion.div>
          </ToastContainer>
        </>
      )}
    </AnimatePresence>
  );
};

// Enhanced Notification Hook with mobile detection
const useNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
    duration: 4000
  });

  const showNotification = React.useCallback((message, variant = "success", duration = 4000) => {
    const isMobile = window.innerWidth <= 768;
    const adjustedDuration = isMobile && duration === 4000 ? 5000 : duration;
    
    setNotification({
      show: true,
      message,
      variant,
      duration: adjustedDuration
    });
  }, []);

  const hideNotification = React.useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  const NotificationComponent = React.useCallback(({ darkMode = false }) => (
    <Notification
      show={notification.show}
      onClose={hideNotification}
      message={notification.message}
      variant={notification.variant}
      duration={notification.duration}
      darkMode={darkMode}
    />
  ), [notification, hideNotification]);

  return {
    showNotification,
    hideNotification,
    NotificationComponent
  };
};

export { useNotification };

export default Notification;