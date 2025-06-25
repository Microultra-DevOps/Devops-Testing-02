import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "../../assets/logo.png";
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authconfig';
import LoadingSpinner from './LoadingSpinner'; 
import { useNavigation, handleAuthSuccess, checkAuthAndRedirect } from '../../utils/navigationUtils';

// Icon components
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

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GoogleLoginButton = ({ onLogin, disabled }) => {
  const handleGoogleLogin = () => {
    if (!disabled) {
      onLogin();
    }
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={handleGoogleLogin}
      disabled={disabled}
      style={{
        background: disabled ? "#f5f5f5" : "white",
        color: disabled ? "#999" : "#5f6368",
        border: "1px solid #dadce0",
        padding: "0.75rem 1.5rem",
        borderRadius: "12px",
        fontSize: "1rem",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: disabled ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        opacity: disabled ? 0.6 : 1
      }}
    >
      <GoogleIcon />
      Continue with Google
    </motion.button>
  );
};

// AnimatedLogo component (keeping existing implementation)
const AnimatedLogo = ({ darkMode }) => {
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
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ 
          y: [0, -10, 0], 
          opacity: 1,
          scale: [1, 1.02, 1]
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
          fontSize: '3rem',
          fontWeight: 'bold',
          color: darkMode ? 'white' : '#1e293b',
          textAlign: 'center',
          lineHeight: 1.2
        }}
      >
        Welcome Back!
      </motion.div>
      
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
          fontSize: '1.2rem',
          fontWeight: '600',
          color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          marginTop: '1rem',
          textAlign: 'center'
        }}
      >
        Sign in to access your internship portal
      </motion.div>
      
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: ['0%', '80%', '60%', '80%'],
          opacity: 1
        }}
        transition={{ 
          width: {
            delay: 0.7,
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: { delay: 0.7, duration: 1 }
        }}
        style={{
          height: '4px',
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          marginTop: '2rem',
          borderRadius: '2px'
        }}
      />
      
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200
          }}
          animate={{ 
            opacity: [0, 0.6, 0],
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 20px ${accentColor}80`,
            pointerEvents: 'none'
          }}
        />
      ))}
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          border: `2px solid ${accentColor}`,
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
    </motion.div>
  );
};

const LoginPage = ({ darkMode: propDarkMode, toggleTheme: propToggleTheme }) => {
  const [internalDarkMode, setInternalDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("individual");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showStaffNotification, setShowStaffNotification] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const { instance } = useMsal();
  const { isNavigating, navigationMessage, navigateToUserDashboard, clearNavigation } = useNavigation();
  const darkMode = propDarkMode !== undefined ? propDarkMode : internalDarkMode;

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      const isAlreadyAuthenticated = checkAuthAndRedirect();
      if (isAlreadyAuthenticated) {
        return; 
      }

      const handleResize = () => {
        const width = window.innerWidth;
        setIsMobile(width < 768);
        setIsTablet(width >= 768 && width < 1024);
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [initialLoading]);

  useEffect(() => {
    if (window.location.state?.message) {
      setRegistrationMessage(window.location.state.message);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const redirectUserType = params.get('userType');
    const errorParam = params.get('error');
    
    if (errorParam) {
      const errorMessages = {
        'google_auth_failed': 'Google authentication failed.',
        'azure_auth_failed': 'Microsoft Azure authentication failed.',
        'oauth_individual_only': 'OAuth login is only available for individual users.',
        'unauthorized_organization': 'You are not authorized to access this system.',
        'authentication_failed': 'Authentication failed.',
        'token_generation_failed': 'Failed to generate authentication token.',
      };
      setError(errorMessages[errorParam] || 'Authentication error occurred.');
      setIsOAuthLoading(false);
      return;
    }
    
    if (token) {
      console.log('Token detected in URL, storing and redirecting');
      const response = {
        token,
        userType: redirectUserType || 'individual'
      };
      handleAuthSuccess(response, navigateToUserDashboard);
    }
  }, [navigateToUserDashboard]);

  useEffect(() => {
  let timer;
  if (accountLocked && remainingTime > 0) {
    timer = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          setAccountLocked(false);
          setFailedAttempts(0);
          setError(""); // Clear the error message when lock expires
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }
  return () => clearInterval(timer);
}, [accountLocked, remainingTime]);

  const toggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      const newDarkMode = !internalDarkMode;
      setInternalDarkMode(newDarkMode);
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (accountLocked) {
    setError(`Account locked. Please try again in ${remainingTime} seconds.`);
    return;
  }

  setLoading(true);
  setError("");

  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, userType }),
    });

    const data = await response.json();

    if (response.ok) {
      handleAuthSuccess(data, navigateToUserDashboard);
      setFailedAttempts(0);
    } else {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      if (newFailedAttempts >= 5) {
        setAccountLocked(true);
        setRemainingTime(60);
        setError("Too many failed attempts. Account locked for 1 minute.");
      } else {
        if (data.useAzureLogin) {
          setError("Staff and Executive members must use Microsoft Azure login. Please click the Azure login button below.");
        } else {
          setError(data.message || `Invalid credentials or user type. ${5 - newFailedAttempts} attempts remaining.`);
        }
      }
    }
  } catch (err) {
    console.error("Error during login:", err);
    setError("An error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = () => {
    setIsOAuthLoading(true);
    setError("");
    window.location.href = `${import.meta.env.VITE_BASE_URL}/api/auth/google`;
  };

  const handleAzureLogin = async () => {
    try {
      setIsOAuthLoading(true);
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      console.error('Azure login error', err);
      setIsOAuthLoading(false);
    }
  };
  
  const toggleStaffNotification = () => {
    setShowStaffNotification(!showStaffNotification);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const showAzureLogin = userType === "staff";
  const showGoogleLogin = userType === "individual";

  if (initialLoading) {
    return <LoadingSpinner 
      darkMode={darkMode} 
      message="Loading Login Page..." 
    />;
  }

  if (isNavigating || loading || isOAuthLoading) {
    return <LoadingSpinner 
      darkMode={darkMode} 
      message={isNavigating ? navigationMessage : (isOAuthLoading ? "Redirecting to authentication..." : "Logging in...")} 
    />;
  }

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

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navigation bar */}
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
            <div 
              onClick={handleBackToHome} 
              style={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
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
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: "transparent", 
                  color: theme.color,
                  border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backdropFilter: 'blur(10px)',
                  transition: "all 0.3s ease",
                  fontSize: '0.9rem'
                }} 
                onClick={() => window.location.href = '/register'}
              >
                Register
              </motion.button>
            </div>
          </div>
        </nav>

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
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: (isMobile || isTablet) ? "1fr" : "1fr 1fr",
            gap: isMobile ? "2rem" : "3rem",
            alignItems: "center",
            width: "100%",
            maxWidth: "1000px"
          }}>
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
                <AnimatedLogo darkMode={darkMode} />
              </motion.div>
            )}

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
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{ textAlign: "center", marginBottom: "2rem" }}
              >
                <h1 style={{ 
                  fontSize: isMobile ? "1.8rem" : "2.2rem", 
                  fontWeight: "800", 
                  color: theme.accentColor,
                  marginBottom: "0.5rem",
                  textShadow: `0 0 15px ${theme.accentColor}40`
                }}>
                  Welcome Back
                </h1>
                <p style={{ color: theme.textSecondary, fontSize: "1rem" }}>
                  Sign in to access your internship portal
                </p>
              </motion.div>

              {registrationMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: `linear-gradient(135deg, #00cc66, #00aa88)`,
                    color: "white",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    marginBottom: "1rem",
                    fontSize: "0.9rem"
                  }}
                >
                  {registrationMessage}
                </motion.div>
              )}

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
                    fontSize: "0.9rem"
                  }}
                >
                  {error}
                </motion.div>
              )}

              {showAzureLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(15, 30, 55, 0.6), rgba(20, 35, 60, 0.4))' 
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 245, 255, 0.6))',
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                  }}
                >
                  <MicrosoftIcon />
                  <h3 style={{ 
                    fontWeight: "700", 
                    marginBottom: "0.5rem", 
                    marginTop: "1rem",
                    color: theme.color 
                  }}>
                    Employee Login
                  </h3>
                 <p style={{ 
                     marginBottom: "1.5rem", 
                     color: theme.textSecondary,
                     fontSize: "0.95rem"
                     }}>
                     Staff members must use Microsoft Azure Active Directory to login with your company credentials.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAzureLogin}
                    style={{
                      background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                      color: "white",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      boxShadow: `0 8px 25px ${theme.accentColor}40`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    <MicrosoftIcon />
                    Login with Microsoft Azure
                  </motion.button>
                </motion.div>
              )}

              {!showAzureLogin && (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "0.5rem", 
                      fontWeight: "600", 
                      color: theme.color 
                    }}>
                      Select Role
                    </label>
                    <select
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      disabled={accountLocked}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                        background: darkMode 
                          ? 'rgba(15, 30, 55, 0.8)' 
                          : 'rgba(255, 255, 255, 0.8)',
                        color: theme.color,
                        fontSize: "1rem",
                        backdropFilter: 'blur(10px)',
                        transition: "all 0.3s ease",
                        opacity: accountLocked ? 0.6 : 1,
                        cursor: accountLocked ? "not-allowed" : "pointer"
                      }}
                    >
                      <option value="individual">Individual</option>
                      <option value="institute">Institute</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "0.5rem", 
                      fontWeight: "600", 
                      color: theme.color 
                    }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={accountLocked}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                        background: darkMode 
                          ? 'rgba(15, 30, 55, 0.3)' 
                          : 'rgba(255, 255, 255, 0.8)',
                        color: theme.color,
                        fontSize: "1rem",
                        backdropFilter: 'blur(10px)',
                        transition: "all 0.3s ease",
                        opacity: accountLocked ? 0.6 : 1,
                        cursor: accountLocked ? "not-allowed" : "auto"
                      }}
                      required
                      placeholder="Enter your username"
                    />
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "0.5rem", 
                      fontWeight: "600", 
                      color: theme.color 
                    }}>
                      Password
                    </label>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center",
                      position: "relative"
                    }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={accountLocked}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          borderRadius: "12px",
                          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                          background: darkMode 
                            ? 'rgba(15, 30, 55, 0.3)' 
                            : 'rgba(255, 255, 255, 0.8)',
                          color: theme.color,
                          fontSize: "1rem",
                          backdropFilter: 'blur(10px)',
                          transition: "all 0.3s ease",
                          opacity: accountLocked ? 0.6 : 1,
                          cursor: accountLocked ? "not-allowed" : "auto"
                        }}
                        required
                        placeholder="Enter your password"
                      />
                      <button
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={accountLocked}
                        style={{
                          position: "absolute",
                          right: "0.75rem",
                          background: "transparent",
                          border: "none",
                          color: theme.textSecondary,
                          cursor: accountLocked ? "not-allowed" : "pointer",
                          padding: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: accountLocked ? 0.6 : 1
                        }}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={!accountLocked ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!accountLocked ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={accountLocked}
                    style={{
                      width: "100%",
                      background: accountLocked 
                        ? "#cccccc" 
                        : `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                      color: "white",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: accountLocked ? "not-allowed" : "pointer",
                      marginBottom: "0.75rem",
                      boxShadow: accountLocked ? "none" : `0 8px 25px ${theme.accentColor}40`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      opacity: accountLocked ? 0.6 : 1
                    }}
                  >
                    {accountLocked ? `Account Locked (${remainingTime}s)` : "Login"}
                  </motion.button>

                  <div style={{ 
                    display: "flex", 
                    justifyContent: "flex-end",
                    marginBottom: "1.5rem",
                    marginTop: "0.25rem"
                  }}>
                    <a
                      href="/forgot-password/email-confirm"
                      style={{ 
                        color: theme.accentColor,
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        transition: "opacity 0.2s ease",
                        ":hover": {
                          opacity: 0.8
                        }
                      }}
                    >
                      Forgot your password?
                    </a>
                  </div>

                  {showGoogleLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      style={{
                        background: darkMode 
                          ? 'linear-gradient(135deg, rgba(15, 30, 55, 0.6), rgba(20, 35, 60, 0.4))' 
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 255, 240, 0.6))',
                        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                      }}
                    >
                      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ 
                          fontWeight: "600", 
                          marginBottom: "0.5rem",
                          color: theme.color,
                          fontSize: '1.1rem'
                        }}>
                          Quick Sign In
                        </h3>
                        <p style={{ 
                          color: theme.textSecondary,
                          fontSize: "0.9rem",
                          lineHeight: 1.4
                        }}>
                          Sign in with your Google account for faster access
                        </p>
                      </div>
                      
                      <GoogleLoginButton onLogin={handleGoogleLogin} />
                    </motion.div>
                  )}

                  <div style={{ 
                    textAlign: "center", 
                    marginTop: "1rem" 
                  }}>
                    <p style={{ 
                      color: theme.textSecondary,
                      fontSize: "0.95rem"
                    }}>
                      Don't have an account?{" "}
                      <a
                        href="/register"
                        style={{ 
                          color: theme.accentColor,
                          textDecoration: "underline",
                          fontWeight: "600"
                        }}
                      >
                        Create one
                      </a>
                    </p>
                  </div>
                </motion.form>
              )}

             {(userType === "institute" || userType === "staff") && (
               <div style={{ 
                textAlign: "center", 
                marginTop: "1.5rem" 
                }}>
             <button
               onClick={toggleStaffNotification}
               style={{ 
                background: "transparent",
                border: "none",
                color: theme.accentColor,
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500"
             }}
             >
               University/Institute login information
             </button>
           </div>
          )}
            </motion.div>
          </div>
        </div>
      </div>

      {showStaffNotification && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          backdropFilter: "blur(5px)"
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(10, 25, 47, 0.9), rgba(15, 30, 55, 0.8))' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: `0 25px 50px ${darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)'}`
            }}
          >
            <h3 style={{ 
              fontWeight: "700", 
              marginBottom: "1rem",
              color: theme.color 
            }}>
              University/Institute Login Information
            </h3>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ 
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: theme.color 
              }}>
                For University/Institute Representatives:
              </h4>
              <p style={{ 
                color: theme.textSecondary,
                fontSize: "0.95rem",
                lineHeight: 1.6
              }}>
                If you want to log in as a university or institute representative, please click the "Create one" button to register.
              </p>
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ 
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: theme.color 
              }}>
                For Company Staff & Executives:
              </h4>
              <p style={{ 
                color: theme.textSecondary,
                fontSize: "0.95rem",
                lineHeight: 1.6
              }}>
                Company staff must use Microsoft Azure Active Directory login with their corporate credentials. Select "Staff" from the role dropdown and use the Azure login button.
              </p>
            </div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "flex-end" 
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleStaffNotification}
                style={{
                  background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: `0 4px 15px ${theme.accentColor}40`,
                  transition: "all 0.3s ease"
                }}
              >
                Got it
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

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
        
        html {
          scroll-behavior: smooth;
        }
        
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

export default LoginPage;

