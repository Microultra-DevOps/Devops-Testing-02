/* import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../../assets/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons'; 
import PropTypes from "prop-types";
import { motion } from 'framer-motion';
import Notification from "../../../components/notifications/Notification"; 

const ReportInternshipPlacement = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [placementReport, setPlacementReport] = useState({
    internId: "",
    fullName: "",
    nic: "",
    startDate: "",
    endDate: "",
    supervisorName: "",
    status: "",
    reportCategory: "",
    note: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlacementReport({
      ...placementReport,
      [name]: value,
    });
  };

  const validateNIC = (nic) => {
    const nicPattern = /^[0-9]{9}[VvXx]?$|^[0-9]{12}$/; 
    return nicPattern.test(nic);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateNIC(placementReport.nic)) {
      setIsSubmitting(false);
      setErrorMessage("Invalid NIC format. Please enter a valid NIC.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/placement/report", placementReport);
      
      // Show notification instead of setting success message
      setNotificationMessage("Internship Placement Report Submitted Successfully!");
      setNotificationVariant("success");
      setShowNotification(true);
      
      // Reset form
      setPlacementReport({
        internId: "",
        fullName: "",
        nic: "",
        startDate: "",
        endDate: "",
        supervisorName: "",
        status: "",
        reportCategory: "",
        note: "",
      });
      
      setTimeout(() => {
        navigate('/individual-home');
      }, 3000); 
      
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "An error occurred while submitting the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    navigate('/individual-home');
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (unauthorized) {
    return (
      <Container className={`mt-5 text-center ${darkMode ? "text-white" : "text-dark"}`}>
        <div>
          <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
          <h3 className="mt-2 mb-5">REPORT INTERNSHIP PLACEMENT</h3>
        </div>
        <div className="mt-5 mb-5">
          <Alert variant={darkMode ? "dark" : "light"} className={`rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark border border-secondary"}`}>
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
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

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Notification 
        show={showNotification}
        onClose={handleNotificationClose}
        message={notificationMessage}
        variant={notificationVariant}
      />
      

      <div className={`alert ${darkMode ? "alert-info" : "alert-warning"} text-center`} role="alert">
        This page is for authorized users only.
      </div>

      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">REPORT INTERNSHIP PLACEMENT</h3>
      </Container>


      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Internship Placement Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
  
                  <Form.Group controlId="internId" className="mb-3">
                    <Form.Label>Intern ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Intern ID"
                      name="internId"
                      value={placementReport.internId}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="fullName" className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter full name"
                      name="fullName"
                      value={placementReport.fullName}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="nic" className="mb-3">
                    <Form.Label>NIC</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter NIC"
                      name="nic"
                      value={placementReport.nic}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="startDate" className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={placementReport.startDate}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="endDate" className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={placementReport.endDate}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="supervisorName" className="mb-3">
                    <Form.Label>Supervisor's Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter supervisor's name"
                      name="supervisorName"
                      value={placementReport.supervisorName}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="status" className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Control
                      as="select"
                      name="status"
                      value={placementReport.status}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group controlId="reportCategory" className="mb-3">
                    <Form.Label>Report Category</Form.Label>
                    <Form.Control
                      as="select"
                      name="reportCategory"
                      value={placementReport.reportCategory}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    >
                      <option value="">Select Report Category</option>
                      <option value="Daily Report">Daily Report</option>
                      <option value="Weekly Report">Weekly Report</option>
                      <option value="Monthly Report">Monthly Report</option>
                      <option value="Final Report">Final Report</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group controlId="note" className="mb-3">
                    <Form.Label>Note</Form.Label>
                    <Form.Control
                      as="textarea"
                      placeholder="Enter any additional notes"
                      name="note"
                      value={placementReport.note}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      rows={3}
                    />
                  </Form.Group>

                  {successMessage && <Alert variant="success">{successMessage}</Alert>}
                  {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => window.history.back()}>Go Back</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

ReportInternshipPlacement.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ReportInternshipPlacement; */