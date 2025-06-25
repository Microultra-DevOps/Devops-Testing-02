import { useState, useEffect } from "react";
import { Card, Row, Col, Container, Form, Button } from "react-bootstrap";
import { FiFileText, FiUserCheck, FiUsers, FiUpload,FiSearch, FiLayers, FiMail, FiHome, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import logo from "../../../assets/logo.png";



const AdminHome = ({ darkMode }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Define dark and light mode colors
  const backgroundColor = darkMode ? "#1a1a1a" : "#f4f4f4";
  const textColor = darkMode ? "white" : "#333";
  const subTextColor = darkMode ? "lightgray" : "#666";



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
              ADMIN DASHBOARD
            </h1>

            <p style={{ 
              fontSize: '1.2rem',
              color: theme.textSecondary,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Manage interns, placements and track student progress with our comprehensive portal
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
                  title: "Manage CVs", 
                  icon: FiFileText, 
                  route: "/view-all-cvs", 
                  key: "manage-cvs",
                  description: "Upload, review, and manage CVs of interns"
                },
                { 
                  title: "Interviews", 
                  icon: FiUserCheck, 
                  route: "/view-all-interviews", 
                  key: "interviews",
                  description: "Manage and schedule interviews with candidates"
                },
                { 
                  title: "Inductions", 
                  icon: FiUsers, 
                  route: "/view-all-inductions", 
                  key: "inductions",
                  description: "organize and manage induction sessions for new interns"
                },
                { 
                  title: "Find Interns Profile", 
                  icon: FiSearch, 
                  route: "/life-cycle", 
                  key: "life-cycle",
                  description: "Search and view detailed profiles of interns"
                }
                
              ].map((card, index) => (
                <Col md={3} key={card.key}>
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

{/* Secondary Heading */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.4 }}
  className="text-center mb-5 mt-5"
>
  <h3 style={{ 
    fontSize: '2rem', 
    fontWeight: 700,
    backgroundImage: `linear-gradient(135deg, ${theme.accentColor}, ${theme.gradientEnd})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
    textShadow: darkMode 
      ? `0 0 15px ${theme.accentColor}60` 
      : `0 0 20px ${theme.accentColor}40`
  }}>
    SCHEMES, MANAGERS, AND REQUESTS
  </h3>

  <h4 style={{ 
    fontSize: '1.5rem',
    color: theme.textSecondary,
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
    fontWeight: 500
  }}>
    Manage the Schemes and Requests
  </h4>
</motion.div>

       
          {/* Action Cards 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Row className="justify-content-center g-4 mb-5">
              {[
                { 
                  title: "Schemes", 
                  icon: FiLayers, 
                  route: "/view-all-scheme", 
                  key: "schemes",
                  description: "Manage and view all schemes available for interns"
                },
                { 
                  title: "Requests", 
                  icon: FiMail, 
                  route: "/staff-intern-request", 
                  key: "requests",
                  description: "Manage requests from staff and interns"
                },
                { 
                  title: "Institute Manage", 
                  icon: FiHome, 
                  route: "/view-all-institute", 
                  key: "institutes",
                  description: "Manage and view all institutes associated with the portal"
                },
                { 
                  title: "Rotation Map", 
                  icon: FiMapPin, 
                  route: "/all-rotational-stations", 
                  key: "rotation-map",
                  description: "View and manage the rotation map for interns"
                }
                
              ].map((card, index) => (
                <Col md={3} key={card.key}>
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


          </Container>
          </div>
          </div>
  );
};

export default AdminHome;
