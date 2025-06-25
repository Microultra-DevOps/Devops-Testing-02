import { useState, useEffect } from "react";
import { Card, Row, Col, Container, Form, Button } from "react-bootstrap";
import { FiFileText, FiUserCheck, FiUpload, FiMail, FiSend } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import RecommendationPopup from "../../../components/notifications/RecommendationPopup";
import logo from "../../../assets/logo.png";
import Notification from "../../../components/notifications/Notification";

const InstituteHome = ({ darkMode }) => {
  const [email, setEmail] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
  });

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
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setNotification({ 
        show: true, 
        message: "Email address cannot be empty", 
        variant: "danger" 
      });
      return;
    }
    
    const parts = email.split('@');
    if (parts.length !== 2) {
      setNotification({ 
        show: true, 
        message: "Email must contain exactly one @ symbol", 
        variant: "danger" 
      });
      return;
    }
    
    const [localPart, domainPart] = parts;
    
    if (!localPart || localPart.length === 0) {
      setNotification({ 
        show: true, 
        message: "Email username cannot be empty", 
        variant: "danger" 
      });
      return;
    }
    
    if (!domainPart || domainPart.length === 0) {
      setNotification({ 
        show: true, 
        message: "Email domain cannot be empty", 
        variant: "danger" 
      });
      return;
    }
    
    if (!domainPart.includes('.')) {
      setNotification({ 
        show: true, 
        message: "Email domain must include a dot (e.g., .com, .org)", 
        variant: "danger" 
      });
      return;
    }
    
    if (domainPart.startsWith('.') || domainPart.endsWith('.') || 
        domainPart.startsWith('-') || domainPart.endsWith('-')) {
      setNotification({ 
        show: true, 
        message: "Email domain cannot start or end with a dot or hyphen", 
        variant: "danger" 
      });
      return;
    }
    
    const invalidDomainChars = domainPart.replace(/[a-zA-Z0-9.-]/g, '');
    if (invalidDomainChars.length > 0) {
      setNotification({ 
        show: true, 
        message: `Email domain contains invalid characters: ${invalidDomainChars}`, 
        variant: "danger" 
      });
      return;
    }
    
    const tld = domainPart.split('.').pop().toLowerCase();
    const allowedTlds = ['com', 'org', 'lk'];
    if (!allowedTlds.includes(tld)) {
      setNotification({ 
        show: true, 
        message: "Only .com, .org, and .lk domains are accepted", 
        variant: "danger" 
      });
      return;
    }
    
    const allowedDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'aol.com',
      'protonmail.com',
      'mail.com',
      'icloud.com',
      'zoho.com',
      'yandex.com'
    ];
    
    if (!allowedDomains.includes(domainPart.toLowerCase())) {
      setNotification({ 
        show: true, 
        message: "Only emails from supported providers are accepted", 
        variant: "danger" 
      });
      return;
    }
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/emails/register`, { email });
      setNotification({ 
        show: true, 
        message: response.data.message, 
        variant: "success" 
      });
      setEmail("");
    } catch (error) {
      console.error("Error submitting email:", error);
      
      if (error.response) {
        if (error.response.status === 409) {
          setNotification({ 
            show: true, 
            message: "You're already subscribed with this email address.", 
            variant: "info"
          });
        } else if (error.response.data && error.response.data.alreadyRegistered) {
          setNotification({ 
            show: true, 
            message: "You're already subscribed with this email address.", 
            variant: "info"
          });
        } else if (error.response.data && error.response.data.message) {
          setNotification({ 
            show: true, 
            message: error.response.data.message, 
            variant: "danger" 
          });
        } else {
          setNotification({ 
            show: true, 
            message: `Server error (${error.response.status}). Please try again later.`, 
            variant: "danger" 
          });
        }
      } else if (error.request) {
        setNotification({ 
          show: true, 
          message: "Network error. Please check your connection and try again.", 
          variant: "danger" 
        });
      } else {
        setNotification({ 
          show: true, 
          message: "Failed to send your request. Please try again later.", 
          variant: "danger" 
        });
      }
    }
  };

  const saveUserRating = async (rating) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotification({ show: true, message: "Please log in to submit your rating.", variant: "danger" });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/recommendations`,
        { userId: "YOUR_USER_ID_HERE", rating },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotification({ show: true, message: response.data.message, variant: "success" });
    } catch (error) {
      console.error("Error saving rating:", error);
      setNotification({ show: true, message: "An error occurred while saving your rating.", variant: "danger" });
    }
  };

  useEffect(() => {
    const lastPopupTime = localStorage.getItem("lastPopupTime");
    const currentTime = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (!lastPopupTime || currentTime - lastPopupTime > oneWeek) {
      setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem("lastPopupTime", currentTime.toString());
      }, 60000);
    }
  }, []);

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
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-5"
          >
            <img 
              src={logo} 
              alt="Company Logo" 
              style={{ 
                height: '80px', 
                width: 'auto',
                filter: darkMode ? 'brightness(1.2) contrast(0.9)' : 'brightness(1)'
              }} 
            />
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-5"
          >
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 800,
              backgroundImage: `linear-gradient(135deg, ${theme.accentColor}, ${theme.gradientEnd})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem',
              textShadow: darkMode 
                ? `0 0 20px ${theme.accentColor}60` 
                : `0 0 30px ${theme.accentColor}40`
            }}>
              INSTITUTE DASHBOARD
            </h1>

            <p style={{ 
              fontSize: '1.2rem',
              color: theme.textSecondary,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Manage internship applications, upload bulk CVs, and track student progress with our comprehensive portal
            </p>
          </motion.div>

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Row className="justify-content-center g-4 mb-5">
              {[
                { 
                  title: "Request an Internship", 
                  icon: FiFileText, 
                  route: "/institute-add-cv", 
                  key: "request-internship",
                  description: "Submit internship applications for students"
                },
                { 
                  title: "Add Bulk CVs", 
                  icon: FiUpload, 
                  route: "/bulk-cv-upload", 
                  key: "bulk-cv-upload",
                  description: "Upload multiple student applications at once"
                },
                { 
                  title: "All Applications", 
                  icon: FiUserCheck, 
                  route: "/institute-all-aplications", 
                  key: "all-applications",
                  description: "View and manage all submitted applications"
                }
              ].map((card, index) => (
                <Col md={4} key={card.key}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => navigate(card.route)}
                      onMouseEnter={() => setHoveredCard(card.key)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "20px",
                        height: "200px",
                        background: theme.cardBackground,
                        backdropFilter: 'blur(20px)',
                        boxShadow: hoveredCard === card.key 
                          ? `0 20px 40px ${darkMode ? 'rgba(14, 165, 233, 0.2)' : 'rgba(0, 204, 102, 0.2)'}, 0 0 0 1px ${theme.accentColor}40`
                          : `0 10px 30px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: hoveredCard === card.key 
                          ? `linear-gradient(135deg, ${theme.accentColor}10, ${theme.gradientEnd}10)`
                          : 'transparent',
                        transition: 'all 0.3s ease'
                      }} />
                      
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center h-100 position-relative">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            boxShadow: `0 10px 25px ${darkMode ? 'rgba(14, 165, 233, 0.4)' : 'rgba(0, 204, 102, 0.4)'}`
                          }}
                        >
                          <card.icon size={32} color="white" />
                        </motion.div>
                        
                        <Card.Title style={{ 
                          color: theme.textPrimary,
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          marginBottom: '0.5rem'
                        }}>
                          {card.title}
                        </Card.Title>
                        
                        <p style={{ 
                          color: theme.textSecondary,
                          fontSize: '0.9rem',
                          margin: 0,
                          lineHeight: 1.4
                        }}>
                          {card.description}
                        </p>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              background: theme.cardBackground,
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '3rem',
              marginBottom: '4rem',
              border: `1px solid ${theme.border}`,
              boxShadow: `0 20px 40px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`
            }}
          >
            <h2 style={{ 
              textAlign: 'center',
              marginBottom: '2rem',
              color: theme.textPrimary,
              fontSize: '2.5rem',
              fontWeight: '700'
            }}>
              ABOUT{" "}
              <span style={{ 
                backgroundImage: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent'
              }}>
                SLT TRAINING PROGRAM
              </span>
            </h2>

            <p style={{ 
              textAlign: "justify",
              color: theme.textSecondary,
              fontSize: '1.1rem',
              lineHeight: 1.8,
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              The SLT Training Program is a comprehensive initiative designed to empower individuals with the skills and knowledge required to excel in the telecommunications industry. This program focuses on developing technical expertise, problem-solving abilities, and customer service skills through hands-on training and real-world scenarios. Participants will gain insights into cutting-edge technologies, network infrastructure, and incident management processes. With a blend of theoretical knowledge and practical experience, the program equips trainees to handle challenges effectively while fostering innovation and teamwork. By completing the SLT Training Program, individuals can unlock opportunities for professional growth and contribute significantly to the organization's success.
            </p>
          </motion.div>

          {/* Email Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mb-5"
          >
            <div style={{
              marginBottom: '6rem',
            }}>
              <div className="text-center">
                <FiMail size={48} color={theme.accentColor} style={{ marginBottom: '1.5rem' }} />
                
                <h4 style={{ 
                  color: theme.textPrimary,
                  marginBottom: '1rem',
                  fontSize: '1.75rem',
                  fontWeight: '600'
                }}>
                  Stay Updated on Internship Programs
                </h4>
                
                <p style={{ 
                  color: theme.textSecondary,
                  marginBottom: '2rem',
                  fontSize: '1.1rem',
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  Get the latest information and updates about internship opportunities and programs
                </p>
              </div>
              
              <Form onSubmit={(e) => { e.preventDefault(); handleEmailSubmit(); }}>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  background: darkMode ? 'rgba(23, 42, 69, 0.7)' : 'white',
                  border: `2px solid ${theme.accentColor}`,
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      border: "none",
                      background: "transparent",
                      boxShadow: "none",
                      outline: "none",
                      fontSize: "1rem",
                      color: theme.textPrimary,
                      flex: 1,
                      '&::placeholder': {
                        color: theme.textSecondary
                      }
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: theme.buttonHover }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                      border: "none",
                      color: "white",
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: `0 8px 25px ${darkMode ? 'rgba(14, 165, 233, 0.4)' : 'rgba(0, 204, 102, 0.4)'}`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FiSend size={16} />
                    Send
                  </motion.button>
                </div>
              </Form>
            </div>
          </motion.div>
        </Container>

        <RecommendationPopup
          show={showPopup}
          onClose={() => setShowPopup(false)}
          darkMode={darkMode}
          onSaveRating={saveUserRating}
        />

        <Notification
          show={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
          message={notification.message}
          variant={notification.variant}
        />
      </div>
    </div>
  );
};

export default InstituteHome;