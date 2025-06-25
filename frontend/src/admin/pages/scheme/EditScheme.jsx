import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/schemes`;

const EditScheme = ({ darkMode }) => {
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const { schemeId } = useParams();

  // Fetch scheme details when component mounts
  useEffect(() => {
    const fetchSchemeDetails = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        
        const response = await axios.get(`${API_BASE_URL}/${schemeId}`);
        
        const scheme = response.data.data || response.data;
        
        if (!scheme) {
          throw new Error("Invalid response format from server");
        }

        // Format dates properly
        const formatDate = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          } catch (error) {
            console.error('Date formatting error:', error);
            return '';
          }
        };

        setSchemeData({
          schemeName: scheme.schemeName || "",
          totalAllocation: scheme.totalAllocation?.toString() || "",
          onRequest: scheme.onRequest || "no",
          recurring: scheme.recurring || "no",
          rotational: scheme.rotational || "no",
          perHeadAllowance: scheme.perHeadAllowance?.toString() || "",
          allowanceFrequency: scheme.allowanceFrequency || "",
          description: scheme.description || "",
          minimumQualifications: scheme.minimumQualifications || "",
          schemeStartDate: formatDate(scheme.schemeStartDate),
          schemeEndDate: formatDate(scheme.schemeEndDate),
        });
        
      } catch (error) {
        console.error('Fetch scheme error:', error);
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Failed to fetch scheme details";
        setErrorMessage(errorMsg);
        setShowErrorNotification(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (schemeId) {
      fetchSchemeDetails();
    }
  }, [schemeId]);

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Required field validation
    if (!schemeData.schemeName.trim()) {
      errors.schemeName = "Scheme name is required";
    }
    
    if (!schemeData.totalAllocation || parseInt(schemeData.totalAllocation) <= 0) {
      errors.totalAllocation = "Total allocation must be greater than 0";
    }
    
    if (!schemeData.perHeadAllowance || parseFloat(schemeData.perHeadAllowance) < 0) {
      errors.perHeadAllowance = "Per head allowance must be 0 or greater";
    }
    
    if (!schemeData.allowanceFrequency) {
      errors.allowanceFrequency = "Allowance frequency is required";
    }
    
    if (!schemeData.minimumQualifications.trim()) {
      errors.minimumQualifications = "Minimum qualifications are required";
    }
    
    if (!schemeData.schemeStartDate) {
      errors.schemeStartDate = "Scheme start date is required";
    }
    
    if (!schemeData.schemeEndDate) {
      errors.schemeEndDate = "Scheme end date is required";
    }
    
    // Date validation
    if (schemeData.schemeStartDate && schemeData.schemeEndDate) {
      const startDate = new Date(schemeData.schemeStartDate);
      const endDate = new Date(schemeData.schemeEndDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Reset time for comparison
      
      if (startDate >= endDate) {
        errors.schemeEndDate = "End date must be after start date";
      }
    
    }
    
    // Numeric validation
    if (schemeData.totalAllocation && parseInt(schemeData.totalAllocation) > 10000) {
      errors.totalAllocation = "Total allocation seems unusually high";
    }
    
    if (schemeData.perHeadAllowance && parseFloat(schemeData.perHeadAllowance) > 100000) {
      errors.perHeadAllowance = "Per head allowance seems unusually high";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Handle numeric inputs
    if (name === 'totalAllocation' || name === 'perHeadAllowance') {
      if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
        setSchemeData(prevData => ({
          ...prevData,
          [name]: value,
        }));
      }
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
    
    // Validate form
    if (!validateForm()) {
      setErrorMessage("Please fix the validation errors before submitting");
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Prepare data for submission
      const submitData = {
        ...schemeData,
        totalAllocation: parseInt(schemeData.totalAllocation),
        perHeadAllowance: parseFloat(schemeData.perHeadAllowance)
      };
      
      const response = await axios.put(`${API_BASE_URL}/${schemeId}`, submitData);
      
      // Handle success response
      const responseData = response.data;
      const message = responseData.message || "Scheme updated successfully!";
      
      setSuccessMessage(message);
      setShowSuccessNotification(true);

      // Navigate after short delay
      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/view-all-scheme");
      }, 2000);

    } catch (error) {
      console.error('Update scheme error:', error);
      
      let errorMsg = "An error occurred while updating the scheme.";
      
      if (error.response?.data) {
        errorMsg = error.response.data.message || 
                   error.response.data.error || 
                   errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorNotification(true);

      setTimeout(() => {
        setShowErrorNotification(false);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle navigation back
  const handleGoBack = () => {
    if (window.confirm("Are you sure you want to go back? Any unsaved changes will be lost.")) {
      navigate(-1);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading scheme details...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header */}
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">EDIT SCHEME</h3>
        <p className="text-muted">Update scheme information</p>
      </Container>

      {/* Main Form Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Scheme Details</h4>
              {schemeId && (
                <small className="text-muted">ID: {schemeId}</small>
              )}
            </div>
            <hr className={darkMode ? "border-light" : "border-dark"} />

            <Card className={darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit} noValidate>
                  <Row>
                    {/* Scheme Name */}
                    <Col md={6}>
                      <Form.Group controlId="schemeName" className="mb-3">
                        <Form.Label>
                          Scheme Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Scheme Name"
                          name="schemeName"
                          value={schemeData.schemeName}
                          onChange={handleInputChange}
                          className={`${darkMode ? "bg-secondary text-white border-secondary" : "bg-white text-dark"} ${validationErrors.schemeName ? 'is-invalid' : ''}`}
                          required
                        />
                        {validationErrors.schemeName && (
                          <div className="invalid-feedback">{validationErrors.schemeName}</div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Total Allocation */}
                    <Col md={6}>
                      <Form.Group controlId="totalAllocation" className="mb-3">
                        <Form.Label>
                          Total Allocation <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter Total Allocation"
                          name="totalAllocation"
                          value={schemeData.totalAllocation}
                          onChange={handleInputChange}
                          className={`${darkMode ? "bg-secondary text-white border-secondary" : "bg-white text-dark"} ${validationErrors.totalAllocation ? 'is-invalid' : ''}`}
                          min="1"
                          required
                        />
                        {validationErrors.totalAllocation && (
                          <div className="invalid-feedback">{validationErrors.totalAllocation}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    {/* Per Head Allowance */}
                    <Col md={6}>
                      <Form.Group controlId="perHeadAllowance" className="mb-3">
                        <Form.Label>
                          Per Head Allowance <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          placeholder="Enter Per Head Allowance"
                          name="perHeadAllowance"
                          value={schemeData.perHeadAllowance}
                          onChange={handleInputChange}
                          className={`${darkMode ? "bg-secondary text-white border-secondary" : "bg-white text-dark"} ${validationErrors.perHeadAllowance ? 'is-invalid' : ''}`}
                          min="0"
                          required
                        />
                        {validationErrors.perHeadAllowance && (
                          <div className="invalid-feedback">{validationErrors.perHeadAllowance}</div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Allowance Frequency */}
                    <Col md={6}>
                      <Form.Group controlId="allowanceFrequency" className="mb-3">
                        <Form.Label>
                          Allowance Frequency <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="select"
                          name="allowanceFrequency"
                          value={schemeData.allowanceFrequency}
                          onChange={handleInputChange}
                          className={`${darkMode ? "bg-secondary text-white border-secondary" : "bg-white text-dark"} ${validationErrors.allowanceFrequency ? 'is-invalid' : ''}`}
                          required
                        >
                          <option value="">Select Frequency</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </Form.Control>
                        {validationErrors.allowanceFrequency && (
                          <div className="invalid-feedback">{validationErrors.allowanceFrequency}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    {/* Scheme Start Date */}
                    <Col md={6}>
                      <Form.Group controlId="schemeStartDate" className="mb-3">
                        <Form.Label>
                          Scheme Start Date <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="schemeStartDate"
                          value={schemeData.schemeStartDate}
                          onChange={handleInputChange}
                          className={`${darkMode ? "bg-secondary text-white border-secondary" : "bg-white text-dark"} ${validationErrors.schemeStartDate ? 'is-invalid' : ''}`}
                          required
                        />
                        {validationErrors.schemeStartDate && (
                          <div className="invalid-feedback">{validationErrors.schemeStartDate}</div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Scheme End Date */}
                    <Col md={6}>
                      <Form.Group controlId="schemeEndDate" className="mb-3">
                        <Form.Label>
                          Scheme End Date <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="schemeEndDate"
                          value={schemeData.schemeEndDate}
                          onChange={handleInputChange}
                          className={`${darkMode ? "bg-secondary text-white border-secondary" : "bg-white text-dark"} ${validationErrors.schemeEndDate ? 'is-invalid' : ''}`}
                          required
                        />
                        {validationErrors.schemeEndDate && (
                          <div className="invalid-feedback">{validationErrors.schemeEndDate}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Radio Buttons for OnRequest, Recurring, Rotational */}
                  <Row>
                    {["onRequest", "recurring", "rotational"].map((field) => (
                      <Col md={4} key={field}>
                        <Form.Group controlId={field} className="mb-3">
                          <Form.Label className="font-weight-bold">
                            {field === "onRequest" ? "On Request" : 
                             field.charAt(0).toUpperCase() + field.slice(1)}
                          </Form.Label>
                          <div className="d-flex gap-3">
                            <Form.Check
                              type="radio"
                              id={`${field}-yes`}
                              label="Yes"
                              name={field}
                              value="yes"
                              checked={schemeData[field] === "yes"}
                              onChange={handleInputChange}
                            />
                            <Form.Check
                              type="radio"
                              id={`${field}-no`}
                              label="No"
                              name={field}
                              value="no"
                              checked={schemeData[field] === "no"}
                              onChange={handleInputChange}
                            />
                          </div>
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>

                  {/* Minimum Qualifications */}
                  <Form.Group controlId="minimumQualifications" className="mb-3">
                    <Form.Label>
                      Minimum Qualifications <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Minimum Qualifications"
                      name="minimumQualifications"
                      value={schemeData.minimumQualifications}
                      onChange={handleInputChange}
                      className={`${darkMode ? "bg-secondary text-white border-secondary" : "bg-white text-dark"} ${validationErrors.minimumQualifications ? 'is-invalid' : ''}`}
                      required
                    />
                    {validationErrors.minimumQualifications && (
                      <div className="invalid-feedback">{validationErrors.minimumQualifications}</div>
                    )}
                  </Form.Group>

                  {/* Description */}
                  <Form.Group controlId="description" className="mb-4">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter Scheme Description (Optional)"
                      name="description"
                      value={schemeData.description}
                      onChange={handleInputChange}
                      className={`${darkMode ? "bg-secondary text-white border-secondary" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Display validation summary if there are errors */}
                  {Object.keys(validationErrors).length > 0 && (
                    <Alert variant="danger" className="mb-3">
                      <Alert.Heading>Please fix the following errors:</Alert.Heading>
                      <ul className="mb-0">
                        {Object.values(validationErrors).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  {/* Buttons */}
                  <div className="d-flex justify-content-between mt-4">
                    <Button 
                      variant={darkMode ? "outline-light" : "secondary"} 
                      onClick={handleGoBack} 
                      disabled={isSubmitting}
                    >
                      Go Back
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          Update Scheme
                        </>
                      )}
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

EditScheme.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default EditScheme;