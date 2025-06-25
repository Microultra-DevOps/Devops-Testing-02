import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/schemes`;

const AddNewScheme = ({ darkMode }) => {
  const [schemeData, setSchemeData] = useState({
    schemeName: "",
    totalAllocation: "",
    onRequest: "no",
    recurring: "no",
    rotational: "no",
    perHeadAllowance: "",
    allowanceFrequency: "",
    description: "",
    minimumQualifications: "",
    schemeStartDate: "",
    schemeEndDate: "",
    totalAllocatedCount: 0,
    totalEmptyCount: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false); 
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "totalAllocation") {
      setSchemeData(prevData => ({
        ...prevData,
        [name]: value,
        totalEmptyCount: value ? Number(value) : 0
      }));
    } else {
      setSchemeData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const totalAllocation = Number(schemeData.totalAllocation);
      
      const response = await axios.post(API_BASE_URL, {
        ...schemeData,
        totalAllocation: totalAllocation,
        perHeadAllowance: Number(schemeData.perHeadAllowance),
        totalAllocatedCount: 0,
        totalEmptyCount: totalAllocation
      });
      
      setSuccessMessage("Scheme Created Successfully!");
      setShowSuccessNotification(true);

      // Reset form data
      setSchemeData({
        schemeName: "",
        totalAllocation: "",
        onRequest: "no",
        recurring: "no",
        rotational: "no",
        perHeadAllowance: "",
        allowanceFrequency: "",
        description: "",
        minimumQualifications: "",
        schemeStartDate: "",
        schemeEndDate: "",
        totalAllocatedCount: 0,
        totalEmptyCount: 0
      });

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/view-all-scheme");
      }, 3000);

    } catch (error) {
      setErrorMessage(error.response?.data?.error || "An error occurred while creating the scheme.");
      setShowErrorNotification(true);

      setTimeout(() => {
        setShowErrorNotification(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header */}
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD NEW SCHEME</h3>
      </Container>

      {/* Main Form Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Scheme Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Scheme Name */}
                  <Form.Group controlId="schemeName" className="mb-3">
                    <Form.Label>Scheme Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Scheme Name"
                      name="schemeName"
                      value={schemeData.schemeName}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Total Allocation */}
                  <Form.Group controlId="totalAllocation" className="mb-3">
                    <Form.Label>Total Allocation</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter Total Allocation"
                      name="totalAllocation"
                      value={schemeData.totalAllocation}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Radio Buttons for OnRequest, Recurring, Rotational */}
                  {["onRequest", "recurring", "rotational"].map((field) => (
                    <Form.Group key={field} controlId={field} className="mb-3">
                      <Form.Label className="font-semibold">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </Form.Label>
                      <div className="d-flex gap-4">
                        <Form.Check
                          type="radio"
                          id={`${field}-yes`}
                          label="Yes"
                          name={field}
                          value="yes"
                          checked={schemeData[field] === "yes"}
                          onChange={handleInputChange}
                          className="me-2"
                        />
                        <Form.Check
                          type="radio"
                          id={`${field}-no`}
                          label="No"
                          name={field}
                          value="no"
                          checked={schemeData[field] === "no"}
                          onChange={handleInputChange}
                          className="me-2"
                        />
                      </div>
                    </Form.Group>
                  ))}

                  {/* Scheme Start Date */}
                  <Form.Group controlId="schemeStartDate" className="mb-3">
                    <Form.Label>Scheme Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="schemeStartDate"
                      value={schemeData.schemeStartDate}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Scheme End Date */}
                  <Form.Group controlId="schemeEndDate" className="mb-3">
                    <Form.Label>Scheme End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="schemeEndDate"
                      value={schemeData.schemeEndDate}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Per Head Allowance */}
                  <Form.Group controlId="perHeadAllowance" className="mb-3">
                    <Form.Label>Per Head Allowance</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter Per Head Allowance"
                      name="perHeadAllowance"
                      value={schemeData.perHeadAllowance}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Allowance Frequency */}
                  <Form.Group controlId="allowanceFrequency" className="mb-3">
                    <Form.Label>Allowance Frequency</Form.Label>
                    <Form.Control
                      as="select"
                      name="allowanceFrequency"
                      value={schemeData.allowanceFrequency}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    >
                      <option value="">Select Frequency</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Form.Control>
                  </Form.Group>

                  {/* Minimum Qualifications */}
                  <Form.Group controlId="minimumQualifications" className="mb-3">
                    <Form.Label>Minimum Qualifications</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Minimum Qualifications"
                      name="minimumQualifications"
                      value={schemeData.minimumQualifications}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Description */}
                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      placeholder="Enter Scheme Description"
                      name="description"
                      value={schemeData.description}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Buttons */}
                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => navigate(-1)} disabled={isSubmitting}>
                      Go Back
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner animation="border" size="sm" /> : "Create Scheme"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Notification Components */}
      <Notification
        show={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        message={successMessage}
        variant="success"
      />
      <Notification
        show={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        message={errorMessage}
        variant="danger"
      />
    </div>
  );
};

AddNewScheme.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AddNewScheme;