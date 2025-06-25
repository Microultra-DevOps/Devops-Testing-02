import { useState, useEffect } from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import { FiFileText, FiUserCheck, FiUser, FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../../assets/logo.png";

const StaffHome = ({ darkMode }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
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
              fontSize: '2.5rem', 
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
              STAFF DASHBOARD
            </h1>

            <p style={{ 
              fontSize: '1.1rem',
              color: theme.textSecondary,
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Welcome to staff dashboard, where you can efficiently manage interns, interviews, schemes, and requests. Use the tools below to streamline your workflow and oversee all aspects of the internship program.
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
                  title: "Request Intern", 
                  icon: FiFileText, 
                  route: "/create-intern-request", 
                  key: "request-intern",
                  description: "Create and manage requests for interns"
                },
                { 
                  title: "My Requests", 
                  icon: FiUserCheck, 
                  route: "/view-my-requests", 
                  key: "my-requests",
                  description: "View and manage your own requests"
                },
                { 
                  title: "My Certificate Request", 
                  icon: FiAward, 
                  route: "/my-certificate-request", 
                  key: "my-certificate-request",
                  description: "Search and view detailed profiles of interns"
                }
              ].map((card, index) => (
                <Col xs={12} sm={6} lg={4} key={card.key}>
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
                        borderRadius: "16px",
                        height: "280px",
                        minWidth: "100%",
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
                      
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center h-100 p-4 position-relative">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            boxShadow: `0 10px 25px ${darkMode ? 'rgba(14, 165, 233, 0.4)' : 'rgba(0, 204, 102, 0.4)'}`
                          }}
                        >
                          <card.icon size={36} color="white" />
                        </motion.div>

                        <Card.Title style={{ 
                          color: theme.textPrimary,
                          fontSize: '1.4rem',
                          fontWeight: '700',
                          marginBottom: '0.75rem'
                        }}>
                          {card.title}
                        </Card.Title>
                        
                        <p style={{ 
                          color: theme.textSecondary,
                          fontSize: '1rem',
                          margin: 0,
                          lineHeight: 1.5
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

export default StaffHome;