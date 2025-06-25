/* import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
 import { Container, Card, Button, Form, Alert, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiUser, FiCheck, FiX } from "react-icons/fi";
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
  showPassword, 
  togglePassword,
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

  const handleTogglePassword = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglePassword) {
      togglePassword();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [togglePassword]);

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
          type={showPassword ? "text" : "password"}
          name={name}
          value={value || ''}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
          autoComplete="new-password"
          spellCheck="false"
        />
        
        {togglePassword && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: '1rem',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={handleTogglePassword}
              onMouseDown={(e) => e.preventDefault()}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textSecondary,
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                minHeight: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? '#404040' : '#f1f5f9';
                e.currentTarget.style.color = theme.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.textSecondary;
              }}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}));

const UserProfile = ({ darkMode }) => {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationVariant, setNotificationVariant] = useState("success");
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Refs for input fields
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);


  // Theme configuration
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

  // Handle password form changes
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError("");
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: "", color: theme.textSecondary };
    if (password.length < 6) return { strength: 25, text: "Too short", color: theme.danger };
    if (password.length < 8) return { strength: 50, text: "Fair", color: "#f59e0b" };
    if (password.length < 12) return { strength: 75, text: "Good", color: theme.accentColor };
    return { strength: 100, text: "Strong", color: theme.success };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  // Handle password change submission
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPasswordError("Unauthorized: Please log in again.");
        setChangingPassword(false);
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      // Reset password visibility states
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      triggerNotification("Password changed successfully!", "success");
      
      setTimeout(() => {
        navigate(-1);
      }, 2000);

    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage = error.response?.data?.message || "Error changing password";
      setPasswordError(errorMessage);
      triggerNotification(errorMessage, "danger");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };



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


      <div style={{ position: 'relative', zIndex: 1, padding: "2rem 0" }}>
        <Container>
          <Notification 
            show={showNotification} 
            onClose={() => setShowNotification(false)} 
            message={notification} 
            variant={notificationVariant} 
          />
          

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-5"
          >
            <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
            <h3 className="mt-3">CHANGE PASSWORD</h3>
            
            <p style={{ 
              fontSize: '1.2rem',
              color: theme.textSecondary,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Update your account password to keep your profile secure
            </p>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="d-flex justify-content-center"
          >
            <div style={{ maxWidth: "600px", width: "100%" }}>
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
                    <FiLock size={40} color="white" />
                  </motion.div>
                  <h3 style={{ 
                    color: 'white',
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: '600'
                  }}>
                    Update Your Password
                  </h3>
                </div>

                <Card.Body style={{ padding: '2.5rem' }}>
                  <Form onSubmit={handleSubmitPasswordChange}>
                    {passwordError && (
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
                        <span style={{ color: theme.danger }}>{passwordError}</span>
                      </motion.div>
                    )}

                    <Form.Group className="mb-4">
                      <Form.Label style={{ 
                        color: theme.textPrimary,
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem'
                      }}>
                        Current Password
                      </Form.Label>
                      <PasswordInput
                        ref={currentPasswordRef}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        required={true}
                        icon={FiLock}
                        showPassword={showCurrentPassword}
                        togglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
                        theme={theme}
                        darkMode={darkMode}
                      />
                    </Form.Group>

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
                        ref={newPasswordRef}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        required={true}
                        icon={FiLock}
                        showPassword={showNewPassword}
                        togglePassword={() => setShowNewPassword(!showNewPassword)}
                        theme={theme}
                        darkMode={darkMode}
                      />

                      {passwordData.newPassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          style={{ marginTop: '0.75rem' }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{ 
                              fontSize: '0.875rem',
                              color: theme.textSecondary
                            }}>
                              Password Strength
                            </span>
                            <span style={{ 
                              fontSize: '0.875rem',
                              color: passwordStrength.color,
                              fontWeight: '600'
                            }}>
                              {passwordStrength.text}
                            </span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '4px',
                            background: darkMode ? '#333' : '#e2e8f0',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${passwordStrength.strength}%` }}
                              transition={{ duration: 0.3 }}
                              style={{
                                height: '100%',
                                background: passwordStrength.color,
                                borderRadius: '2px'
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                      
                      <div style={{ 
                        fontSize: '0.875rem',
                        color: theme.textSecondary,
                        marginTop: '0.5rem'
                      }}>
                        Password must be at least 6 characters long and different from your current password.
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ 
                        color: theme.textPrimary,
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem'
                      }}>
                        Confirm New Password
                      </Form.Label>
                      <PasswordInput
                        ref={confirmPasswordRef}
                        name="confirmNewPassword"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        required={true}
                        icon={FiLock}
                        showPassword={showConfirmPassword}
                        togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                        theme={theme}
                        darkMode={darkMode}
                      />
                      
     
                      {passwordData.confirmNewPassword && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          {passwordData.newPassword === passwordData.confirmNewPassword ? (
                            <>
                              <FiCheck size={16} color={theme.success} />
                              <span style={{ color: theme.success }}>Passwords match</span>
                            </>
                          ) : (
                            <>
                              <FiX size={16} color={theme.danger} />
                              <span style={{ color: theme.danger }}>Passwords do not match</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </Form.Group>

                    <div className="d-grid gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={changingPassword}
                        style={{
                          background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                          border: "none",
                          color: "white",
                          padding: '1rem 2rem',
                          borderRadius: '12px',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          cursor: changingPassword ? 'not-allowed' : 'pointer',
                          boxShadow: `0 10px 25px ${theme.accentColor}40`,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          opacity: changingPassword ? 0.8 : 1
                        }}
                      >
                        {changingPassword ? (
                          <>
                            <Spinner size="sm" animation="border" />
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <FiCheck size={20} />
                            Change Password
                          </>
                        )}
                      </motion.button>
                      
                      <Button 
                        variant="outline-secondary"
                        onClick={handleCancel}
                        disabled={changingPassword}
                        style={{
                          borderColor: theme.border,
                          color: theme.textSecondary,
                          background: 'transparent',
                          padding: '1rem 2rem',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          borderWidth: '2px'
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

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
                <FiUser size={24} color={theme.accentColor} style={{ marginBottom: '0.5rem' }} />
                <div style={{ 
                  fontSize: '0.9rem',
                  color: theme.textSecondary,
                  lineHeight: 1.5
                }}>
                  <strong style={{ color: theme.textPrimary }}>Security Note:</strong> After changing your password, you may need to log in again on other devices for security purposes.
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </div>
    </div>
  );
};

export default UserProfile; */