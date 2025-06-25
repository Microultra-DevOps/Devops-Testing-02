import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Container, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft, FiSend, FiX, FiCheck } from "react-icons/fi";
import axios from "axios";
import logo from "../../assets/logo.png";
import Notification from "../notifications/Notification";
import LoadingSpinner from './LoadingSpinner';

const EmailInput = React.memo(React.forwardRef(({ 
  type, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required, 
  icon: Icon,
  theme,
  darkMode
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const internalRef = useRef(null);
  const inputRef = ref || internalRef;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const containerStyle = useMemo(() => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: theme.inputBackground,
    border: `2px solid ${isFocused ? theme.accentColor : theme.inputBorder}`,
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: isFocused ? `0 0 0 3px ${theme.accentColor}20` : 'none',
    cursor: 'text'
  }), [isFocused, theme]);

  const inputStyle = useMemo(() => ({
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '1rem',
    color: theme.textPrimary,
    fontFamily: 'inherit',
    padding: '0.75rem 0.5rem',
    margin: 0,
    minWidth: 0,
    width: '100%',
    height: 'auto',
    lineHeight: '1.5'
  }), [theme.textPrimary]);

  return (
    <div className="position-relative mb-3">
      <div 
        style={containerStyle}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1rem',
          flexShrink: 0,
          pointerEvents: 'none'
        }}>
          <Icon size={20} color={isFocused ? theme.accentColor : theme.textSecondary} />
        </div>
        
        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
          autoComplete="email"
          spellCheck="false"
        />
      </div>
    </div>
  );
}));

EmailInput.displayName = 'EmailInput';

const EmailConfirmPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationVariant, setNotificationVariant] = useState("success");
  const [success, setSuccess] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const emailRef = useRef(null);

  const theme = useMemo(() => ({
    backgroundColor: darkMode ? "#000000" : "#f8fafc",
    cardBackground: darkMode ? "#1E1E1E" : "rgba(255, 255, 255, 0.4)",
    accentColor: darkMode ? "#2563eb" : "#10b981", 
    textPrimary: darkMode ? "#E1E1E1" : "#1e293b",
    textSecondary: darkMode ? "#A0A0A0" : "#64748b",
    border: darkMode ? "#333333" : "rgba(0, 0, 0, 0.1)",
    gradientStart: darkMode ? "#2563eb" : "#10b981",
    gradientEnd: darkMode ? "#1e40af" : "#059669", 
    buttonHover: darkMode ? "#1d4ed8" : "#047857",
    inputBackground: darkMode ? "#2d2d2d" : "#ffffff",
    inputBorder: darkMode ? "#404040" : "#e2e8f0",
    danger: darkMode ? "#ef4444" : "#dc3545",
    success: darkMode ? "#10b981" : "#198754"
  }), [darkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Function to trigger notifications
  const triggerNotification = useCallback((message, variant = "success") => {
    setNotification(message);
    setNotificationVariant(variant);
    setShowNotification(true);
  }, []);

  // Handle email input change
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value.trim());
    if (error) setError("");
    if (success) setSuccess("");
  }, [error, success]);

  // Email validation
  const isValidEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate email before sending
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log('Submitting email:', email); 
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/request-password-reset-otp`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, 
        }
      );

      console.log('Response:', response.data);
      
      if (response.status === 200) {
        triggerNotification("Password reset code sent to your email!", "success");
        setSuccess("Password reset code sent to your email!");
        
        // Log OTP in development mode
        if (response.data.debug && response.data.debug.otp) {
          console.log('Development OTP:', response.data.debug.otp);
        }
        
        setTimeout(() => {
          navigate(`/forgot-password/verify-otp?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Email confirmation error:", err);
      
      if (err.response) {
        const errorMessage = err.response.data?.message || "Failed to send reset code";
        setError(errorMessage);
        triggerNotification(errorMessage, "error");
      } else if (err.request) {
        const errorMsg = "No response from server. Please check your connection.";
        setError(errorMsg);
        triggerNotification(errorMsg, "error");
      } else {
        const errorMsg = "An unexpected error occurred. Please try again.";
        setError(errorMsg);  
        triggerNotification(errorMsg, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [email, isValidEmail, triggerNotification, navigate]);

  const handleBackToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  if (pageLoading) {
    return (
      <LoadingSpinner 
        darkMode={darkMode}
        message="Loading Reset Password"
        subMessage="Setting up your password reset form..."
        size="medium"
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textPrimary,
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        transition: 'background-color 0.3s ease'
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
        opacity: darkMode ? 0.05 : 0.1,
        pointerEvents: 'none',
        background: darkMode 
          ? 'radial-gradient(circle at 20% 50%, #0ea5e9 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1d4ed8 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, #00cc66 0%, transparent 50%), radial-gradient(circle at 80% 20%, #00aa88 0%, transparent 50%)'
      }} />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: "2rem 0" }}>
        <Container>
          <Notification 
            show={showNotification} 
            onClose={() => setShowNotification(false)} 
            message={notification} 
            variant={notificationVariant} 
          />
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-5"
          >
            <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
            <h3 className="mt-3">RESET PASSWORD</h3>
            
            <p style={{ 
              fontSize: '1.2rem',
              color: theme.textSecondary,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Enter your email address and we'll send you a verification code
            </p>
          </motion.div>

          {/* Email Confirmation Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="d-flex justify-content-center"
          >
            <div style={{ maxWidth: "500px", width: "100%" }}>
              <Card
                style={{
                  border: "none",
                  borderRadius: "24px",
                  background: theme.cardBackground,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 20px 40px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                  overflow: 'hidden'
                }}
              >
                {/* Card Header */}
                <div style={{
                  background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <FiMail size={40} color="white" />
                  </motion.div>
                  <h3 style={{ 
                    color: 'white',
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: '600'
                  }}>
                    Email Verification
                  </h3>
                </div>

                <Card.Body style={{ padding: '2.5rem' }}>
                  <Form onSubmit={handleSubmit}>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: `${theme.danger}20`,
                          border: `1px solid ${theme.danger}`,
                          borderRadius: '12px',
                          padding: '1rem',
                          marginBottom: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FiX size={20} color={theme.danger} />
                        <span style={{ color: theme.danger }}>{error}</span>
                      </motion.div>
                    )}

                    <Form.Group className="mb-4">
                      <Form.Label style={{ 
                        color: theme.textPrimary,
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem'
                      }}>
                        Email Address
                      </Form.Label>
                      <EmailInput
                        ref={emailRef}
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email address"
                        required={true}
                        icon={FiMail}
                        theme={theme}
                        darkMode={darkMode}
                      />
                      
                      <div style={{ 
                        fontSize: '0.875rem',
                        color: theme.textSecondary,
                        marginTop: '0.5rem'
                      }}>
                        We'll send a verification code to this email address.
                      </div>
                    </Form.Group>

                    <div className="d-grid gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{
                          background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                          border: "none",
                          color: "white",
                          padding: '1rem 2rem',
                          borderRadius: '12px',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          boxShadow: `0 10px 25px ${theme.accentColor}40`,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          opacity: loading ? 0.8 : 1
                        }}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" animation="border" />
                            Sending Code...
                          </>
                        ) : (
                          <>
                            <FiSend size={20} />
                            Send Verification Code
                          </>
                        )}
                      </motion.button>
                      
                      <Button 
                        variant="outline-secondary"
                        onClick={handleBackToLogin}
                        disabled={loading}
                        style={{
                          borderColor: theme.border,
                          color: theme.textSecondary,
                          background: 'transparent',
                          padding: '1rem 2rem',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          borderWidth: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FiArrowLeft size={18} />
                        Back to Login
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Security Note */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  background: theme.cardBackground,
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginTop: '2rem',
                  border: `1px solid ${theme.border}`,
                  textAlign: 'center'
                }}
              >
                <FiCheck size={24} color={theme.accentColor} style={{ marginBottom: '0.5rem' }} />
                <div style={{ 
                  fontSize: '0.9rem',
                  color: theme.textSecondary,
                  lineHeight: 1.5
                }}>
                  <strong style={{ color: theme.textPrimary }}>Secure Process:</strong> The verification code will expire in 3 minutes for your security. Check your spam folder if you don't receive it.
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </div>
    </div>
  );
};

export default EmailConfirmPage