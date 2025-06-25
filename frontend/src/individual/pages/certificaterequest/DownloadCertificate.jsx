import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../../assets/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faDownload, faSearch, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import PropTypes from "prop-types";
import { motion } from 'framer-motion';
import Notification from "../../../components/notifications/Notification";

const DownloadCertificate = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");


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
        fetchCertificates(token);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUnauthorized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCertificates = async (token) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/certificates`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCertificates(response.data);
      setFilteredCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setErrorMessage("Failed to load certificates. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    const filtered = certificates.filter(cert => 
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.internId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.nic.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredCertificates(filtered);
    setIsSearching(false);
  };

  const handleDownload = async (certificateId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/certificates/download/${certificateId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      
      setNotificationMessage("Certificate Downloaded Successfully!");
      setNotificationVariant("success");
      setShowNotification(true);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      setErrorMessage("Failed to download certificate. Please try again later.");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredCertificates(certificates);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            <h3 className="mt-3">DOWNLOAD TRAINING CERTIFICATE</h3>
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
        show={showNotification}
        onClose={handleNotificationClose}
        message={notificationMessage}
        variant={notificationVariant}
      />
      
      {/* Info Banner */}
      <div className={`alert ${darkMode ? "alert-info" : "alert-warning"} text-center`} role="alert">
        Download your approved training certificates here.
      </div>

      {/* Header */}
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">DOWNLOAD TRAINING CERTIFICATE</h3>
      </Container>

      {/* Main Content Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Available Certificates</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                {/* Search Form */}
                <Form onSubmit={handleSearch} className="mb-4">
                  <Row className="align-items-end">
                    <Col md={8}>
                      <Form.Group controlId="searchQuery">
                        <Form.Label>Search Certificates</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search by name, intern ID, or NIC"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex justify-content-end">
                      <Button type="submit" className="me-2" disabled={isSearching}>
                        <FontAwesomeIcon icon={faSearch} className="me-1" /> Search
                      </Button>
                      <Button variant="secondary" onClick={handleClearSearch}>
                        Clear
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                {filteredCertificates.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    <FontAwesomeIcon icon={faFileAlt} size="2x" className="mb-3" />
                    <p className="mb-0">No certificates found. If you've recently requested a certificate, it may still be pending approval.</p>
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Intern ID</th>
                          <th>Training Category</th>
                          <th>Period</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCertificates.map((certificate) => (
                          <tr key={certificate._id}>
                            <td>{certificate.name}</td>
                            <td>{certificate.internId}</td>
                            <td>{certificate.trainingCategory}</td>
                            <td>{formatDate(certificate.periodFrom)} - {formatDate(certificate.periodTo)}</td>
                            <td>
                              <span className={`badge ${certificate.status === 'approved' ? 'bg-success' : certificate.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                                {certificate.status === 'approved' ? 'Approved' : certificate.status === 'pending' ? 'Pending' : 'Rejected'}
                              </span>
                            </td>
                            <td>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleDownload(certificate._id)}
                                disabled={certificate.status !== 'approved'}
                              >
                                <FontAwesomeIcon icon={faDownload} className="me-1" /> Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-3">
                  <Button variant="danger" onClick={() => window.history.back()}>Go Back</Button>
                  <Button variant="success" onClick={() => navigate('/request-certificate')}>
                    Request New Certificate
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

DownloadCertificate.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default DownloadCertificate;