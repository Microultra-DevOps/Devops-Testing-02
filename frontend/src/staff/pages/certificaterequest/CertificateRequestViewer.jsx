import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Alert, Badge, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../../assets/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faFileAlt, faSignature } from '@fortawesome/free-solid-svg-icons';
import PropTypes from "prop-types";
import { motion } from 'framer-motion';

const CertificateRequestViewer = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams(); // Get certificate ID from URL

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUnauthorized(true);
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      fetchCertificateDetails(token, id);
    } catch (error) {
      console.error("Invalid token:", error);
      setUnauthorized(true);
      setIsLoading(false);
    }
  }, [id]);

  // Fetch certificate details
  const fetchCertificateDetails = async (token, certificateId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/certificates/${certificateId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCertificate(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      setErrorMessage("Failed to load certificate details. Please try again later.");
      setIsLoading(false);
    }
  };

  // Function to open signature in new tab
  const viewSignature = () => {
    if (certificate && certificate.traineeSignature) {
      window.open(`http://localhost:5000/${certificate.traineeSignature}`, '_blank');
    }
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  // Show unauthorized message
  if (unauthorized) {
    return (
      <Container className={`mt-5 text-center ${darkMode ? "text-white" : "text-dark"}`}>
        <div>
          <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
          <h3 className="mt-2 mb-5">CERTIFICATE REQUEST DETAILS</h3>
        </div>
        <div className="mt-5 mb-5">
          <Alert variant={darkMode ? "dark" : "light"} className={`rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark border border-secondary"}`}>
            <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
              <FontAwesomeIcon icon={faLock} size="8x" className="mt-3 mb-5" />
            </motion.div>
            <h1 className="mb-3">Access Denied</h1>
            <p style={{ fontSize: '20px' }}>You do not have permission to access this page. Please contact the administrator if you believe this is a mistake.</p>
            <Button variant="link" onClick={() => navigate('/individual-home')}>Return Home</Button>
          </Alert>
        </div>
      </Container>
    );
  }

  // Show error message
  if (errorMessage) {
    return (
      <Container className={`mt-5 text-center ${darkMode ? "text-white" : "text-dark"}`}>
        <div>
          <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
          <h3 className="mt-2 mb-5">CERTIFICATE REQUEST DETAILS</h3>
        </div>
        <Alert variant="danger">
          <h5>{errorMessage}</h5>
          <Button variant="outline-primary" onClick={() => window.history.back()} className="mt-3">
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  // No certificate found
  if (!certificate) {
    return (
      <Container className={`mt-5 text-center ${darkMode ? "text-white" : "text-dark"}`}>
        <div>
          <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
          <h3 className="mt-2 mb-5">CERTIFICATE REQUEST DETAILS</h3>
        </div>
        <Alert variant="warning">
          <h5>Certificate request not found</h5>
          <Button variant="outline-primary" onClick={() => window.history.back()} className="mt-3">
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'declined':
        return <Badge bg="danger">Declined</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Info Banner */}
      <div className={`alert ${darkMode ? "alert-info" : "alert-warning"} text-center`} role="alert">
        Viewing certificate request details
      </div>

      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">CERTIFICATE REQUEST DETAILS</h3>
        <div className="mt-2">
          {getStatusBadge(certificate.certificateRequestStatus)}
        </div>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                <span>
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Certificate Request Information
                </span>
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col md={6}>
                    <h5>Trainee Details</h5>
                    <Table striped bordered responsive className={darkMode ? "table-dark" : ""}>
                      <tbody>
                        <tr>
                          <th style={{width: "30%"}}>Name</th>
                          <td>{certificate.name}</td>
                        </tr>
                        <tr>
                          <th>Intern ID</th>
                          <td>{certificate.internId}</td>
                        </tr>
                        <tr>
                          <th>NIC</th>
                          <td>{certificate.nic}</td>
                        </tr>
                        <tr>
                          <th>Contact Number</th>
                          <td>{certificate.contactNumber}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                  <Col md={6}>
                    <h5>Training Details</h5>
                    <Table striped bordered responsive className={darkMode ? "table-dark" : ""}>
                      <tbody>
                        <tr>
                          <th style={{width: "30%"}}>Section/Unit</th>
                          <td>{certificate.sectionUnit}</td>
                        </tr>
                        <tr>
                          <th>Training Category</th>
                          <td>{certificate.trainingCategory}</td>
                        </tr>
                        <tr>
                          <th>Period From</th>
                          <td>{formatDate(certificate.periodFrom)}</td>
                        </tr>
                        <tr>
                          <th>Period To</th>
                          <td>{formatDate(certificate.periodTo)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
                
                <Row className="mb-4">
                  <Col md={12}>
                    <h5>Work Attended</h5>
                    <Table striped bordered responsive className={darkMode ? "table-dark" : ""}>
                      <tbody>
                        <tr>
                          <th style={{width: "15%"}}>Work A</th>
                          <td>{certificate.workAttended?.A}</td>
                        </tr>
                        <tr>
                          <th>Work B</th>
                          <td>{certificate.workAttended?.B}</td>
                        </tr>
                        <tr>
                          <th>Work C</th>
                          <td>{certificate.workAttended?.C}</td>
                        </tr>
                        <tr>
                          <th>Work D</th>
                          <td>{certificate.workAttended?.D}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6}>
                    <h5>Staff Information</h5>
                    <Table striped bordered responsive className={darkMode ? "table-dark" : ""}>
                      <tbody>
                        <tr>
                          <th style={{width: "30%"}}>Staff Name</th>
                          <td>{certificate.staffName || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                  <Col md={6}>
                    <h5>Signature</h5>
                    <Button 
                      variant="primary" 
                      onClick={viewSignature}
                      className="d-flex align-items-center"
                    >
                      <FontAwesomeIcon icon={faSignature} className="me-2" />
                      View Signature
                    </Button>
                  </Col>
                </Row>

                <Row className="mt-3">
                <Col xs={12} md={8}>
                   <small className={darkMode ? "text-light" : "text-muted"}>
                   Request created: {new Date(certificate.createdAt).toLocaleString()}
                   </small>
                </Col>
                <Col xs={12} md={4} className="d-flex justify-content-md-end mt-3 mt-md-0">
                     <Button 
                         variant={darkMode ? "outline-light" : "outline-dark"} 
                         size="sm"
                         onClick={() => window.history.back()}
                         className="px-4"
                     >
                       Back
                     </Button>
                </Col>
               </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

CertificateRequestViewer.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default CertificateRequestViewer;