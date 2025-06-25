import React, { useState, useRef, useCallback, useMemo } from "react";
import { Container, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiArrowLeft, FiSave, FiX, FiCheck, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import axios from "axios";
import logo from "../../assets/logo.png";
import Notification from "../notifications/Notification";

const PasswordInput = React.memo(React.forwardRef(({ 
  type, 
  name,
  value, 
  onChange, 
  placeholder, 
  required, 
  icon: Icon,
  theme,
  darkMode,
  showPassword,
  onTogglePassword
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
          type={showPassword ? 'text' : type}
          name={name}
          value={value || ''}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
          autoComplete={name === 'password' ? 'new-password' : 'new-password'}
          spellCheck="false"
        />

        {type === 'password' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: '1rem',
            cursor: 'pointer'
          }}
          onClick={onTogglePassword}
          >
            {showPassword ? 
              <FiEyeOff size={20} color={theme.textSecondary} /> : 
              <FiEye size={20} color={theme.textSecondary} />
            }
          </div>
        )}
      </div>
    </div>
  );
}));

const ForgotPasswordPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationVariant, setNotificationVariant] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);


  // Extract token from URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  
  const theme = {
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
  };

  // Function to trigger notifications
  const triggerNotification = (message, variant = "success") => {
    setNotification(message);
    setNotificationVariant(variant);
    setShowNotification(true);
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError("");
  };

  // Password validation
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate token
    if (!token) {
      setError("Invalid or missing reset token");
      triggerNotification("Invalid reset link", "danger");
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword: password,
      });

      triggerNotification("Password successfully reset! Redirecting to login...", "success");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      console.error("Password reset error:", err);
      const errorMessage = err.response?.data?.message || "Error resetting password";
      setError(errorMessage);
      triggerNotification(errorMessage, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

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
              Create a new secure password for your account
            </p>
          </motion.div>

          {/* Password Reset Form */}
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
                    <FiShield size={40} color="white" />
                  </motion.div>
                  <h3 style={{ 
                    color: 'white',
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: '600'
                  }}>
                    New Password
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
                        New Password
                      </Form.Label>
                      <PasswordInput
                        ref={passwordRef}
                        type="password"
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        required={true}
                        icon={FiLock}
                        theme={theme}
                        darkMode={darkMode}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                      />
                      
                      {/* Password Strength Indicator */}
                      {password && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{
                            display: 'flex',
                            gap: '4px',
                            marginBottom: '0.5rem'
                          }}>
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                style={{
                                  flex: 1,
                                  height: '4px',
                                  borderRadius: '2px',
                                  background: level <= passwordStrength ? strengthColors[passwordStrength - 1] : theme.inputBorder,
                                  transition: 'background-color 0.3s ease'
                                }}
                              />
                            ))}
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : theme.textSecondary
                          }}>
                            Password strength: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter password'}
                          </div>
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ 
                        color: theme.textPrimary,
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem'
                      }}>
                        Confirm Password
                      </Form.Label>
                      <PasswordInput
                        ref={confirmPasswordRef}
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        placeholder="Confirm your new password"
                        required={true}
                        icon={FiLock}
                        theme={theme}
                        darkMode={darkMode}
                        showPassword={showConfirmPassword}
                        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                      
                      {/* Password Match Indicator */}
                      {confirmPassword && (
                        <div style={{
                          fontSize: '0.875rem',
                          color: password === confirmPassword ? theme.success : theme.danger,
                          marginTop: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {password === confirmPassword ? 
                            <><FiCheck size={16} /> Passwords match</> :
                            <><FiX size={16} /> Passwords do not match</>
                          }
                        </div>
                      )}
                    </Form.Group>

                    <div className="d-grid gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                        style={{
                          background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                          border: "none",
                          color: "white",
                          padding: '1rem 2rem',
                          borderRadius: '12px',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          cursor: (loading || !password || !confirmPassword || password !== confirmPassword) ? 'not-allowed' : 'pointer',
                          boxShadow: `0 10px 25px ${theme.accentColor}40`,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          opacity: (loading || !password || !confirmPassword || password !== confirmPassword) ? 0.6 : 1
                        }}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" animation="border" />
                            Resetting Password...
                          </>
                        ) : (
                          <>
                            <FiSave size={20} />
                            Reset Password
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

              {/* Security Requirements */}
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
                  border: `1px solid ${theme.border}`
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <FiShield size={20} color={theme.accentColor} />
                  <strong style={{ color: theme.textPrimary }}>Password Requirements:</strong>
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: theme.textSecondary,
                  lineHeight: 1.5
                }}>
                  • At least 8 characters long<br/>
                  • Contains uppercase and lowercase letters<br/>
                  • Contains at least one number<br/>
                  • Special characters recommended for extra security
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;