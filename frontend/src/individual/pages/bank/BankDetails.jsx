import React, { useState, useEffect } from "react";
import { Container, Button, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../../assets/logo.png";
import BankDetailsForm from "../bank/BankDetailsForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import Notification from "../../../components/notifications/Notification";

const BankDetails = ({ darkMode }) => {
  const defaultBankData = {
    nic: "",
    internId: "",
    accountHolderName: "",
    bankName: "",
    branch: "",
    accountNumber: "",
  };

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [bankData, setBankData] = useState(defaultBankData);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success"
  });
  const navigate = useNavigate();

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
    inputBackground: darkMode ? "#2A2A2A" : "#ffffff",
    inputBorder: darkMode ? "#404040" : "#e2e8f0",
    inputFocus: darkMode ? "#2563eb" : "#10b981"
  };

  // Authentication Check
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUnauthorized(true);
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded.currentStatus || decoded.currentStatus === "pending") {
        setUnauthorized(true);
      } else {
        setUser(decoded);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUnauthorized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "accountNumber") {
      let numericValue = value.replace(/\D/g, "").slice(0, 16);
      const formattedValue = numericValue.replace(/(\d{4})/g, "$1 ").trim();

      setBankData((prevState) => ({
        ...prevState,
        [name]: formattedValue,
      }));
      return;
    }

    setBankData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedData = { ...bankData, accountNumber: bankData.accountNumber.replace(/\s/g, "") };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/bankDetails`, formattedData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Bank Details Saved:", response.data);
      
      // Show success notification
      setNotification({
        show: true,
        message: "Bank details successfully saved!",
        variant: "success"
      });
      
      // Reset form data
      setBankData(defaultBankData);
      
      setTimeout(() => {
        navigate("/individual-home");
      }, 3000);
      
    } catch (error) {
      console.error("Error Saving Bank Details:", error.response?.data || error.message);
      setNotification({
        show: true,
        message: `Submission Failed: ${error.response?.data?.message || error.message}`,
        variant: "danger"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({...notification, show: false});
    
    if (notification.variant === "success") {
      navigate("/individual-home");
    }
  };

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: theme.backgroundColor,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.textPrimary
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: "40px",
            height: "40px",
            border: `3px solid ${theme.border}`,
            borderTop: `3px solid ${theme.accentColor}`,
            borderRadius: "50%"
          }}
        />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textPrimary,
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
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
            ? 'radial-gradient(circle at 20% 50%, #ef4444 0%, transparent 50%), radial-gradient(circle at 80% 20%, #dc2626 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, #ef4444 0%, transparent 50%), radial-gradient(circle at 80% 20%, #dc2626 0%, transparent 50%)'
        }} />

        <Container className="text-center" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem' }}>
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <img 
              src={logo} 
              alt="Company Logo" 
              style={{ 
                height: '60px', 
                width: 'auto',
                filter: darkMode ? 'brightness(1.2) contrast(0.9)' : 'brightness(1)'
              }} 
            />
            <h3 className="mt-3">ADD BANK DETAILS</h3>
          </motion.div>

          {/* Unauthorized Access Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              marginTop: '3rem'
            }}
          >
            <Card style={{
              background: theme.cardBackground,
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '3rem 2rem',
              border: `1px solid ${theme.border}`,
              boxShadow: `0 20px 40px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
              textAlign: 'center'
            }}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                style={{ marginBottom: '2rem' }}
              >
                <FontAwesomeIcon 
                  icon={faLock} 
                  size="4x" 
                  style={{ 
                    color: '#ef4444',
                    filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))'
                  }} 
                />
              </motion.div>
              
              <h1 style={{ 
                color: theme.textPrimary,
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem'
              }}>
                Access Denied
              </h1>
              
              <p style={{ 
                color: theme.textSecondary,
                fontSize: '1.1rem',
                marginBottom: '2rem',
                lineHeight: 1.6
              }}>
                You do not have permission to access this page. Please contact the administrator if you believe this is a mistake.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/individual-home')}
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                  border: "none",
                  color: "white",
                  padding: '0.75rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: `0 8px 25px ${theme.accentColor}40`,
                  transition: 'all 0.3s ease'
                }}
              >
                Return Home
              </motion.button>
            </Card>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Notification Component */}
      <Notification 
        show={notification.show}
        onClose={handleCloseNotification}
        message={notification.message}
        variant={notification.variant}
      />

      {/* Info Banner */}
      <div className={`alert ${darkMode ? "alert-info" : "alert-warning"} text-center`} role="alert">
        This is currently for use only by authorized users and data entry operators who are assigned to SLT Mobitel services.
      </div>

      {/* Header */}
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD BANK DETAILS</h3>
      </Container>

      {/* Main Content Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <h2 className="text-start">Bank Details</h2>
          <p className="text-start">Please fill in your bank details for payment processing.</p>
          <hr />

          {/* Bank Details Form Component */}
          <BankDetailsForm
            bankData={bankData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            darkMode={darkMode}
            loading={loading}
          />
        </div>
      </Container>
    </div>
  );
};

export default BankDetails;