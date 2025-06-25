import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import LoadingSpinner from './LoadingSpinner';

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

const RegisterPage = ({ darkMode: propDarkMode, toggleTheme: propToggleTheme }) => {
  const navigate = useNavigate();
  const [internalDarkMode, setInternalDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("individual");
  const [error, setError] = useState("");
  const [institutes, setInstitutes] = useState([]);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    contactNumber: "",
    nic: "",
    password: "",
    confirmPassword: "",
    instituteContactNumber: "",
    instituteContactEmail: "",
    instituteName: "",
    department: "",
    instituteType: "",
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/institutes`);
        const sortedInstitutes = (response.data.institutes || []).sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setInstitutes(sortedInstitutes);
      } catch (error) {
        console.error("Error fetching institutes:", error);
        setError("Failed to load institutes");
      }
    };

    fetchInstitutes();
  }, []);

  // NIC validation function
  const validateNIC = (nic) => {
    const cleanedNIC = nic.trim().toUpperCase();
    const oldFormat = /^[0-9]{9}[VX]$/.test(cleanedNIC);
    const newFormat = /^[0-9]{12}$/.test(cleanedNIC);
    return oldFormat || newFormat;
  };

  const validateContactNumber = (number) => {
    // Sri Lankan phone number validation (10 digits starting with 0)
    return /^0[0-9]{9}$/.test(number.trim());
  };

  // Theme toggle function
  const toggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      const newDarkMode = !internalDarkMode;
      setInternalDarkMode(newDarkMode);
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRegistrationMessage("");

    // Validate required fields
    if (!formData.username || !formData.email || !formData.password || !formData.nic || !formData.fullName || !formData.contactNumber) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Validate NIC format
    if (!validateNIC(formData.nic)) {
      setError("Please enter a valid NIC number (old format: 123456789V or new format: 123456789012)");
      setLoading(false);
      return;
    }
// Validate contact number
    if (!validateContactNumber(formData.contactNumber)) {
      setError("Please enter a valid Sri Lankan phone number (10 digits starting with 0)");
      setLoading(false);
      return;
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength (optional)
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    const formDataWithUserType = {
      ...formData,
      userType,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/register`,
        formDataWithUserType,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setLoading(false);

      if (response.data.requiresVerification) {
        localStorage.setItem("registerEmail", formData.email);
        setRegistrationMessage(response.data.message);

        setTimeout(() => {
          navigate("/email-verification");
        }, 2000);
      } else {
        navigate("/login", {
          state: {
            message: "Registration successful. Please login.",
          },
        });
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        console.error("Server Error:", err.response.data);
        setError(err.response.data.message || "Registration failed");
      } else {
        console.error("Error:", err);
        setError("Server Error. Please try again.");
      }
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      {pageLoading ? (
        <LoadingSpinner 
          darkMode={darkMode}
          message="Loading Registration..."
          subMessage="Please wait while we process your request"
          size="medium"
        />
      ) : (
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
            {/* Navbar */}
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
                    onClick={() => navigate('/login')}
                  >
                    Login
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
                  maxWidth: "1400px", 
                  margin: "0 auto",
                  padding: isMobile ? "80px 1rem 2rem" : "80px 3rem 2rem" 
              }}>
              {/* Register Form Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(10, 25, 47, 0.6), rgba(15, 30, 55, 0.4))' 
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.6))',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '24px',
                  padding: isMobile ? '2rem' : window.innerWidth > 1200 ? '4rem' : '3rem', 
                  boxShadow: `0 25px 50px ${darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)'}`,
                  width: '100%',
                  maxWidth: window.innerWidth > 1400 ? '1400px' : '1000px'
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
                      Processing registration...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      style={{ textAlign: "center", marginBottom: "2rem" }}
                    >
                      <img
                        src={Logo}
                        alt="Logo"
                        style={{ maxWidth: "130px", marginBottom: "1rem" }}
                      />
                      <h1 style={{ 
                        fontSize: isMobile ? "1.8rem" : "2.2rem", 
                        fontWeight: "800", 
                        color: theme.accentColor,
                        marginBottom: "0.5rem",
                        textShadow: `0 0 15px ${theme.accentColor}40`
                      }}>
                        INTERNSHIP MANAGEMENT SYSTEM
                      </h1>
                      <p style={{ color: theme.textSecondary, fontSize: "1rem" }}>
                        Fill the form below to create a new account.
                      </p>
                    </motion.div>

                    {/* Alert Messages */}
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

                    {userType === "institute" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: darkMode 
                            ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.2))'
                            : 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
                          border: `1px solid ${darkMode ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`,
                          color: darkMode ? '#ffc107' : '#ff9800',
                          padding: "0.75rem 1rem",
                          borderRadius: "12px",
                          marginBottom: "1rem",
                          fontSize: "0.9rem",
                          textAlign: "center"
                        }}
                      >
                        <strong>Note:</strong> This form is for university/institute staff only.
                      </motion.div>
                    )}

                    {/* Registration Form */}
                    <motion.form
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {/* User Type Selection */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "0.5rem", 
                          fontWeight: "600", 
                          color: theme.color 
                        }}>
                          Select User Type
                        </label>
                        <select
                          value={userType}
                          onChange={(e) => setUserType(e.target.value)}
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
                            transition: "all 0.3s ease"
                          }}
                        >
                          <option value="individual">Individual</option>
                          <option value="institute">Institute</option>
                        </select>
                      </div>

                      {/* Username and Email */}
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
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
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Enter username"
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
                              transition: "all 0.3s ease"
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ 
                            display: "block", 
                            marginBottom: "0.5rem", 
                            fontWeight: "600", 
                            color: theme.color 
                          }}>
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter email"
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
                              transition: "all 0.3s ease"
                            }}
                          />
                        </div>
                      </div>

                      {/* Full Name */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <div>
                          <label style={{ 
                            display: "block", 
                            marginBottom: "0.5rem", 
                            fontWeight: "600", 
                            color: theme.color 
                          }}>
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="Enter full name"
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
                              transition: "all 0.3s ease"
                            }}
                          />
                        </div>
                      </div>

                      {/* Contact Number and NIC */}
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                          <label style={{ 
                            display: "block", 
                            marginBottom: "0.5rem", 
                            fontWeight: "600", 
                            color: theme.color 
                          }}>
                            Contact Number
                          </label>
                         <input
  type="tel"
  name="contactNumber"
  value={formData.contactNumber}
  onChange={handleChange}
  required
  placeholder="Enter contact number"
  style={{
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: `1px solid ${
      formData.contactNumber && !validateContactNumber(formData.contactNumber) 
        ? '#ff4444' 
        : darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
    }`,
    background: darkMode 
      ? 'rgba(15, 30, 55, 0.3)' 
      : 'rgba(255, 255, 255, 0.8)',
    color: theme.color,
    fontSize: "1rem",
    backdropFilter: 'blur(10px)',
    transition: "all 0.3s ease"
  }}
/>
                          {formData.contactNumber && !validateContactNumber(formData.contactNumber) && (
        <p style={{
          color: '#ff4444',
          fontSize: '0.8rem',
          marginTop: '0.25rem'
        }}>
          Please enter a valid phone number (10 digits starting with 0)
        </p>
      )}
                        </div>
                        <div>
                          <label style={{ 
                            display: "block", 
                            marginBottom: "0.5rem", 
                            fontWeight: "600", 
                            color: theme.color 
                          }}>
                            NIC
                          </label>
                          <input
                            type="text"
                            name="nic"
                            value={formData.nic}
                            onChange={handleChange}
                            required
                            placeholder="Enter NIC number (e.g., 123456789V or 123456789012)"
                            style={{
                              width: "100%",
                              padding: "0.75rem 1rem",
                              borderRadius: "12px",
                              border: `1px solid ${
                                formData.nic && !validateNIC(formData.nic) 
                                  ? '#ff4444' 
                                  : darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                              }`,
                              background: darkMode 
                                ? 'rgba(15, 30, 55, 0.3)' 
                                : 'rgba(255, 255, 255, 0.8)',
                              color: theme.color,
                              fontSize: "1rem",
                              backdropFilter: 'blur(10px)',
                              transition: "all 0.3s ease"
                            }}
                          />
                          {formData.nic && !validateNIC(formData.nic) && (
                            <p style={{
                              color: '#ff4444',
                              fontSize: '0.8rem',
                              marginTop: '0.25rem'
                            }}>
                              Please enter a valid NIC (old format: 123456789V or new format: 123456789012)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Institute-specific fields */}
                      {userType === "institute" && (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                              <label style={{ 
                                display: "block", 
                                marginBottom: "0.5rem", 
                                fontWeight: "600", 
                                color: theme.color 
                              }}>
                                Institute Contact Number
                              </label>
                              <input
                                type="tel"
                                name="instituteContactNumber"
                                value={formData.instituteContactNumber}
                                onChange={handleChange}
                                required
                                placeholder="Enter institute contact number"
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
                                  transition: "all 0.3s ease"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ 
                                display: "block", 
                                marginBottom: "0.5rem", 
                                fontWeight: "600", 
                                color: theme.color 
                              }}>
                                Institute Contact Email
                              </label>
                              <input
                                type="email"
                                name="instituteContactEmail"
                                value={formData.instituteContactEmail}
                                onChange={handleChange}
                                required
                                placeholder="Enter institute email"
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
                                  transition: "all 0.3s ease"
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                              <label style={{ 
                                display: "block", 
                                marginBottom: "0.5rem", 
                                fontWeight: "600", 
                                color: theme.color 
                              }}>
                                Department / Faculty
                              </label>
                              <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                placeholder="Enter department or faculty"
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
                                  transition: "all 0.3s ease"
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ 
                                display: "block", 
                                marginBottom: "0.5rem", 
                                fontWeight: "600", 
                                color: theme.color 
                              }}>
                                Institute Type
                              </label>
                              <select
                                name="instituteType"
                                value={formData.instituteType}
                                onChange={handleChange}
                                required
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
                                  transition: "all 0.3s ease"
                                }}
                              >
                                <option value="">Select Institute Type</option>
                                <option value="Government University">Government University</option>
                                <option value="Private University">Private University</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ 
                              display: "block", 
                              marginBottom: "0.5rem", 
                              fontWeight: "600", 
                              color: theme.color 
                            }}>
                              Institute
                            </label>
                            <select
                              name="instituteName"
                              value={formData.instituteName}
                              onChange={handleChange}
                              required
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
                                transition: "all 0.3s ease"
                              }}
                            >
                              <option value="">Select Institute</option>
                              {institutes.map((institute, index) => (
                                <option
                                  key={institute.id || index}
                                  value={institute.name}
                                >
                                  {institute.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    {/* Password and Confirm Password */}
<div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
  {/* Password Field */}
  <div>
    <label style={{ 
      display: "block", 
      marginBottom: "0.5rem", 
      fontWeight: "600", 
      color: theme.color 
    }}>
      Password
    </label>
    <div style={{ position: "relative" }}>
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        placeholder="Enter password"
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
          transition: "all 0.3s ease"
        }}
      />
      <button
        type="button" 
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: "absolute",
          right: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          color: theme.textSecondary,
          cursor: "pointer",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  </div>

  {/* Confirm Password Field */}
  <div>
    <label style={{ 
      display: "block", 
      marginBottom: "0.5rem", 
      fontWeight: "600", 
      color: theme.color 
    }}>
      Confirm Password
    </label>
    <div style={{ position: "relative" }}>
      <input
        type={showPassword ? "text" : "password"}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        placeholder="Confirm password"
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
          transition: "all 0.3s ease"
        }}
      />
      <button
        type="button" 
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: "absolute",
          right: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          color: theme.textSecondary,
          cursor: "pointer",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  </div>
</div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      style={{
                        width: "100%",
                        background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        marginBottom: "1.5rem",
                        boxShadow: `0 8px 25px ${theme.accentColor}40`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      }}
                    >
                      Register
                    </motion.button>

                    {/* Login Link */}
                    <div style={{ 
                      textAlign: "center", 
                      marginTop: "1rem" 
                    }}>
                      <p style={{ 
                        color: theme.textSecondary,
                        fontSize: "0.95rem"
                      }}>
                        Already have an account?{" "}
                        <a
                          href="/login"
                          style={{ 
                            color: theme.accentColor,
                            textDecoration: "none",
                            fontWeight: "600"
                          }}
                        >
                          Login
                        </a>
                      </p>
                    </div>
                  </motion.form>
                </>
              )}
            </motion.div>
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
    )}
  </>
  );
};

export default RegisterPage;