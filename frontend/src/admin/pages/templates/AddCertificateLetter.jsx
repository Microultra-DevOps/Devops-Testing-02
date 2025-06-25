import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/certificate-letters`;

const AddCertificateLetter = ({ darkMode }) => {
  const [letterData, setLetterData] = useState({
    letterName: "Certificate Letter",
    label1: "Sri Lanka Telecom PLC",  
    label2: "Lotus Road, P.O.Box 503, Colombo 01, Sri Lanka.",
    label3: " Colombo 01, Sri Lanka.",
    label4: "Date",
    label5: "To whom it may concern",
    label6: "As per the requirement of (Degree name and institute or uni), (name) ",
    label7: "has successfully completed her/his internship programme at Sri Lanka Telecom PLC ",
    label8: "from (date) to (date).",
    label9: "During the above period she has performed well as an intern,",
    label10: "We wish her/his success in all future endeavors.",
    label11: "Engineer/Talent Development",
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
    setLetterData({
      ...letterData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("Sending request to:", API_BASE_URL);
      console.log("Request payload:", letterData);

      const response = await axios.post(API_BASE_URL, letterData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Response:", response.data);

      setSuccessMessage("Certificate Letter Created Successfully!");
      setShowSuccessNotification(true);

      // Reset form to default values
      setLetterData({
        letterName: "Certificate Letter",
        label1: "Sri Lanka Telecom PLC",  
    label2: "Lotus Road, P.O.Box 503, Colombo 01, Sri Lanka.",
    label3: " Colombo 01, Sri Lanka.",
    label4: "Date",
    label5: "To whom it may concern",
    label6: "As per the requirement of (Degree name and institute or uni), (name) ",
    label7: "has successfully completed her/his internship programme at Sri Lanka Telecom PLC ",
    label8: "from (date) to (date).",
    label9: "During the above period she has performed well as an intern,",
    label10: "We wish her/his success in all future endeavors.",
    label11: "Engineer/Talent Development",
      });

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/all-certificate-letters", { state: { refresh: true } });
      }, 3000);

    } catch (error) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      "An error occurred while creating the letter.";
      setErrorMessage(errorMsg);
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
        <h3 className="mt-3">CREATE NEW CERTIFICATE LETTER</h3>
      </Container>

      {/* Main Form Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Certificate Letter Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Letter Name field */}
                  <Form.Group controlId="letterName" className="mb-3">
                    <Form.Label>Letter Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="letterName"
                      value={letterData.letterName}
                      onChange={handleInputChange}
                      required
                      readOnly
                    />
                  </Form.Group>

                  {Array.from({ length: 11 }, (_, i) => (
                    <Form.Group key={`label${i + 1}`} controlId={`label${i + 1}`} className="mb-3">
                      <Form.Label>Line {i + 1}</Form.Label>
                      <Form.Control
                        as={i === 1 || i === 2 ? "textarea" : "input"} // Use textarea for address lines
                        rows={i === 1 || i === 2 ? 2 : 1}
                        name={`label${i + 1}`}
                        value={letterData[`label${i + 1}`]}
                        onChange={handleInputChange}
                        required={i < 4} // Make first few fields required
                      />
                    </Form.Group>
                  ))}

                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => navigate(-1)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner animation="border" size="sm" /> : "Create Letter"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Notification Component for Success and Error */}
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

AddCertificateLetter.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AddCertificateLetter;

