import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "../../assets/logo.png";

// Fixed Icons as React components
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2"/>
    <path d="M12 21v2"/>
    <path d="M4.22 4.22l1.42 1.42"/>
    <path d="M18.36 18.36l1.42 1.42"/>
    <path d="M1 12h2"/>
    <path d="M21 12h2"/>
    <path d="M4.22 19.78l1.42-1.42"/>
    <path d="M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/>
    <path d="m21 2-9.6 9.6"/>
    <circle cx="7.5" cy="15.5" r="5.5"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

const MailIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

// Enhanced Animated Verification Icon Component
const AnimatedVerificationIcon = ({ darkMode }) => {
  const accentColor = darkMode ? "#00aaff" : "#00cc66";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {/* Main Email Icon with floating animation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ 
          y: [0, -10, 0], 
          opacity: 1,
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: { delay: 0.3, duration: 0.8 }
        }}
        style={{
          color: accentColor,
          marginBottom: '2rem'
        }}
      >
        <MailIcon />
      </motion.div>
      
      {/* Title with gentle animation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          y: { delay: 0.5, duration: 0.8 },
          opacity: {
            delay: 0.5,
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: darkMode ? 'white' : '#1e293b',
          textAlign: 'center',
          marginBottom: '1rem'
        }}
      >
        Check Your Email
      </motion.div>
      
      {/* Subtitle */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        style={{
          fontSize: '1.1rem',
          fontWeight: '500',
          color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          textAlign: 'center',
          lineHeight: 1.5
        }}
      >
        We've sent a 6-digit verification code
        <br />
        to your email address
      </motion.div>
      
      {/* Animated gradient line */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: ['0%', '60%', '40%', '60%'],
          opacity: 1
        }}
        transition={{ 
          width: {
            delay: 0.9,
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: { delay: 0.9, duration: 1 }
        }}
        style={{
          height: '3px',
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          marginTop: '2rem',
          borderRadius: '2px'
        }}
      />
      
      {/* Floating particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            x: Math.random() * 300 - 150,
            y: Math.random() * 300 - 150
          }}
          animate={{ 
            opacity: [0, 0.4, 0],
            x: Math.random() * 300 - 150,
            y: Math.random() * 300 - 150,
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: 5 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 15px ${accentColor}60`,
            pointerEvents: 'none'
          }}
        />
      ))}
    </motion.div>
  );
};

const EmailVerification = ({ darkMode: propDarkMode, toggleTheme: propToggleTheme }) => {
  const [internalDarkMode, setInternalDarkMode] = useState(() => {
    const savedTheme = window.localStorage?.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const darkMode = propDarkMode !== undefined ? propDarkMode : internalDarkMode;

  // Theme configurations
  const darkTheme = {
    backgroundColor: "#0a192f",
    color: "white",
    accentColor: "#00aaff",
    textSecondary: "#94a3b8",
    darkMode: true,
  };

  const lightTheme = {
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    accentColor: "#00cc66",
    textSecondary: "#64748b",
    darkMode: false,
  };

  const theme = darkMode ? darkTheme : lightTheme;

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      const newDarkMode = !internalDarkMode;
      setInternalDarkMode(newDarkMode);
      if (window.localStorage) {
        window.localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
      }
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Simulate API call - replace with your actual API endpoint
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Email verified successfully! Redirecting to login...");
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.message || "Verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    window.location.href = '/register';
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Simulate API call - replace with your actual resend endpoint
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Verification code resent successfully!");
      } else {
        setError(data.message || "Failed to resend code.");
      }
    } catch (err) {
      setError("Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.color,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      {/* Background Effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.1,
        pointerEvents: 'none',
        background: darkMode 
          ? 'radial-gradient(circle at 20% 50%, #00aaff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0066ff 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, #00cc66 0%, transparent 50%), radial-gradient(circle at 80% 20%, #00aa88 0%, transparent 50%)'
      }} />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Enhanced Navbar */}
        <nav style={{ 
                  background: "transparent", 
                  position: "fixed", 
                  top: 0,
                  width: "100%",
                  padding: isMobile ? "1rem" : "1rem 2rem",
                  zIndex: 10,
                  backdropFilter: 'blur(20px)',
                  borderBottom: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    maxWidth: "1200px",
                    margin: "0 auto"
                  }}>
                    <div>
                      <img 
                        src={Logo} 
                        alt="Logo" 
                        style={{ height: '40px', width: 'auto' }} 
                      />
                    </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                style={{ 
                  background: "transparent",
                  border: "none",
                  color: theme.color,
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "50%",
                  transition: "all 0.3s ease",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {darkMode ? <SunIcon /> : <MoonIcon />}
              </motion.button>
              
            </div>
          </div>
        </nav>

        {/* Main Content Container */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: '100vh', 
          paddingTop: '80px',
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "80px 1rem 2rem" : "80px 2rem 2rem"
        }}>
          {/* Verification Container */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: (isMobile || isTablet) ? "1fr" : "1fr 1fr",
            gap: isMobile ? "2rem" : "3rem",
            alignItems: "center",
            width: "100%",
            maxWidth: "900px"
          }}>
            {/* Left Content - Animated Verification Icon */}
            {!isMobile && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                style={{
                  width: '100%',
                  height: '500px',
                  overflow: 'hidden',
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AnimatedVerificationIcon darkMode={darkMode} />
              </motion.div>
            )}

            {/* Right Content - Verification Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(10, 25, 47, 0.6), rgba(15, 30, 55, 0.4))' 
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.6))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '24px',
                padding: isMobile ? '2rem' : '3rem',
                boxShadow: `0 25px 50px ${darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)'}`,
                width: '100%'
              }}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "300px"
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: "3rem",
                      height: "3rem",
                      border: `3px solid ${theme.accentColor}30`,
                      borderTop: `3px solid ${theme.accentColor}`,
                      borderRadius: "50%"
                    }}
                  />
                  <p style={{ marginTop: "1rem", fontSize: "1.1rem", color: theme.textSecondary }}>
                    Processing verification...
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    style={{ textAlign: "center", marginBottom: "2rem" }}
                  >
                    <div style={{
                      color: theme.accentColor,
                      marginBottom: "1rem",
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                    </div>
                    <h1 style={{ 
                      fontSize: isMobile ? "1.8rem" : "2.2rem", 
                      fontWeight: "800", 
                      color: theme.accentColor,
                      marginBottom: "0.5rem",
                      textShadow: `0 0 15px ${theme.accentColor}40`
                    }}>
                      Email Verification
                    </h1>
                    <p style={{ color: theme.textSecondary, fontSize: "1rem", lineHeight: 1.5 }}>
                      Enter the 6-digit verification code<br />sent to your email address
                    </p>
                  </motion.div>

                  {/* Success message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: `linear-gradient(135deg, #00cc66, #00aa88)`,
                        color: "white",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                        fontSize: "0.9rem",
                        textAlign: "center"
                      }}
                    >
                      {success}
                    </motion.div>
                  )}

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: `linear-gradient(135deg, #ff4444, #cc3333)`,
                        color: "white",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                        fontSize: "0.9rem",
                        textAlign: "center"
                      }}
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Verification Form */}
                  <motion.form
                    onSubmit={handleVerification}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {/* Verification Code Field */}
                    <div style={{ marginBottom: "2rem" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "0.75rem", 
                        fontWeight: "600", 
                        color: theme.color,
                        fontSize: "1rem"
                      }}>
                        Verification Code
                      </label>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center",
                        position: "relative"
                      }}>
                        <div style={{
                          position: "absolute",
                          left: "1rem",
                          color: theme.textSecondary,
                          display: "flex",
                          alignItems: "center",
                          zIndex: 2
                        }}>
                          <KeyIcon />
                        </div>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setVerificationCode(value);
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem 0.75rem 3rem",
                            borderRadius: "12px",
                            border: `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                            background: darkMode 
                              ? 'rgba(15, 30, 55, 0.3)' 
                              : 'rgba(255, 255, 255, 0.8)',
                            color: theme.color,
                            fontSize: "1.2rem",
                            fontWeight: "600",
                            textAlign: "center",
                            letterSpacing: "0.5rem",
                            backdropFilter: 'blur(10px)',
                            transition: "all 0.3s ease",
                            outline: "none"
                          }}
                          onFocus={(e) => {
                            e.target.style.border = `2px solid ${theme.accentColor}`;
                            e.target.style.boxShadow = `0 0 20px ${theme.accentColor}40`;
                          }}
                          onBlur={(e) => {
                            e.target.style.border = `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`;
                            e.target.style.boxShadow = 'none';
                          }}
                          required
                          placeholder="000000"
                          maxLength="6"
                        />
                      </div>
                      <p style={{ 
                        fontSize: "0.85rem", 
                        color: theme.textSecondary, 
                        marginTop: "0.5rem",
                        textAlign: "center"
                      }}>
                        Enter the 6-digit code sent to your email
                      </p>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={verificationCode.length !== 6}
                      style={{
                        width: "100%",
                        background: verificationCode.length === 6 
                          ? `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`
                          : `linear-gradient(135deg, ${theme.textSecondary}, ${theme.textSecondary})`,
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: "600",
                        cursor: verificationCode.length === 6 ? "pointer" : "not-allowed",
                        marginBottom: "1.5rem",
                        boxShadow: verificationCode.length === 6 
                          ? `0 8px 25px ${theme.accentColor}40`
                          : 'none',
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: verificationCode.length === 6 ? 1 : 0.6
                      }}
                    >
                      Verify Email
                    </motion.button>

                    {/* Resend Code Button */}
                    <div style={{ 
                      textAlign: "center", 
                      marginBottom: "1.5rem" 
                    }}>
                      <p style={{ 
                        color: theme.textSecondary,
                        fontSize: "0.9rem",
                        marginBottom: "0.5rem"
                      }}>
                        Didn't receive the code?
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleResendCode}
                        style={{
                          background: "transparent",
                          color: theme.accentColor,
                          border: `1px solid ${theme.accentColor}40`,
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                      >
                        Resend Code
                      </motion.button>
                    </div>

                    {/* Back to Register Link */}
                    <div style={{ 
                      textAlign: "center" 
                    }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleBackToRegister}
                        style={{
                          background: "transparent",
                          color: theme.color,
                          border: "none",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          margin: "0 auto",
                          padding: "0.5rem",
                          borderRadius: "8px",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <ArrowLeftIcon />
                        Back to Register
                      </motion.button>
                    </div>
                  </motion.form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      
      {/* Enhanced Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body {
          overflow-x: hidden;
        }
        
        button:hover {
          transform: translateY(-1px);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#0a192f' : '#f1f5f9'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme.accentColor};
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default EmailVerification;