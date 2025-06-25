import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/interncertificates`;

const AddCertificate = ({ darkMode }) => {
  const [certificateData, setCertificateData] = useState({
    certificateName: "Training Completion Certificate", // Added required certificateName field
    label1: "TRAINING COMPLETION CERTIFICATE",
    label2: "This Certificate is awarded to (...............)",
    label3: "on Successful completion of",
    label4: "Six month intern program",
    label5: "as",
    label6: "",
    label7: "from (...............)",
    label8: "to (...........)",
    label9: "at",
    label10: "Sri Lanka Telecom PLC",
    label11: "Awarded on: ............",
    label12: "Certificate No: .............",
    label13: "Engineer/Talent Development",
    label14: "",
    label15: "",
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
    setCertificateData({
      ...certificateData,
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
      console.log("Request payload:", certificateData);

      const response = await axios.post(API_BASE_URL, certificateData);
      console.log("Response:", response.data);

      setSuccessMessage("Certificate Created Successfully!");
      setShowSuccessNotification(true);

      // Reset form data
      setCertificateData({
        certificateName: "Training Completion Certificate", 
        label1: "TRAINING COMPLETION CERTIFICATE",
        label2: "This Certificate is awarded to (...............)",
        label3: "on Successful completion of",
        label4: "Six month intern program",
        label5: "as",
        label6: "",
        label7: "from (...............)",
        label8: "to (...........)",
        label9: "at",
        label10: "Sri Lanka Telecom PLC",
        label11: "Awarded on: ............",
        label12: "Certificate No: .............",
        label13: "Engineer/Talent Development",
        label14: "",
        label15: "",
      });

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/all-certificate", { state: { refresh: true } });
      }, 3000);

    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.response?.data?.error || "An error occurred while creating the certificate.");
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
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">CREATE NEW CERTIFICATE</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Certificate Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Added certificateName field */}
                  <Form.Group controlId="certificateName" className="mb-3">
                    <Form.Label>Certificate Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="certificateName"
                      value={certificateData.certificateName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  {Array.from({ length: 15 }, (_, i) => (
                    <Form.Group key={`label${i + 1}`} controlId={`label${i + 1}`} className="mb-3">
                      <Form.Label>Line {i + 1}</Form.Label>
                      <Form.Control
                        type="text"
                        name={`label${i + 1}`}
                        value={certificateData[`label${i + 1}`]}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  ))}

                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => navigate(-1)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner animation="border" size="sm" /> : "Create Certificate"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Notification show={showSuccessNotification} onClose={() => setShowSuccessNotification(false)} message={successMessage} variant="success" />
      <Notification show={showErrorNotification} onClose={() => setShowErrorNotification(false)} message={errorMessage} variant="danger" />
    </div>
  );
};

AddCertificate.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AddCertificate;



