import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import { Toast, ToastContainer } from "react-bootstrap";

const Notification = ({ show, onClose, message, variant = "success" }) => {
  return (
    <>
      {show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(5px)",
            zIndex: 1049,
          }}
        />
      )}
      
      <ToastContainer
        className="position-fixed start-50 top-50 translate-middle p-3"
        style={{ zIndex: 1050 }}
      >
        <Toast onClose={onClose} show={show} delay={3000} autohide bg={variant}>
          <Toast.Body className="text-white text-center">{message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/letters`;

const EditPlacementLetter = ({ darkMode }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [letterData, setLetterData] = useState({
    letterName: "",
    label1: "",  
    label2: "",
    label3: "",
    label4: "",
    label5: "",
    label6: "",
    label7: "",
    label8: "",
    label9: "",
    label10: "",
    label11: "",
    label12: "",
    label13: "",
    label14: "",
    label15: "",
    label16: "",
    label17: "",
    label18: "",
    label19: "",
    label20: "",
    label21: "",
    label22: "",
    label23: "",
    label24: "",
    label25: "",
    label26: "",
    label27: "",
    label28: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        setLetterData(response.data);
      } catch (error) {
        console.error("Error fetching placement letter:", error);
        setErrorMessage(error.response?.data?.error || "Failed to fetch letter data");
        setShowErrorNotification(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLetter();
  }, [id]);

  // Handle input field changes
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
    console.log("Sending update request to:", `${API_BASE_URL}/${id}`);
    console.log("Request payload:", letterData);

    const response = await axios.put(`${API_BASE_URL}/${id}`, letterData);
    console.log("Response:", response.data);

    setSuccessMessage("Placement Letter Updated Successfully!");
    setShowSuccessNotification(true);

    // Delay navigation to allow the notification to display
    setTimeout(() => {
      navigate("/all-placement-letters", { state: { refresh: true } });
    }, 2000); // 2 seconds delay

  } catch (error) {
    console.error("Error:", error);
    setErrorMessage(error.response?.data?.error || "An error occurred while updating the letter.");
    setShowErrorNotification(true);

    setTimeout(() => {
      setShowErrorNotification(false);
    }, 3000);
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading) {
    return (
      <div className={`d-flex flex-column justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Spinner animation="border" />
        <p className="mt-3">Loading placement letter data...</p>
      </div>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">EDIT PLACEMENT LETTER</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Placement Letter Details</h4>
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
                    />
                  </Form.Group>

                  {Array.from({ length: 28 }, (_, i) => (
                    <Form.Group key={`label${i + 1}`} controlId={`label${i + 1}`} className="mb-3">
                      <Form.Label>Line {i + 1}</Form.Label>
                      <Form.Control
                        type="text"
                        name={`label${i + 1}`}
                        value={letterData[`label${i + 1}`]}
                        onChange={handleInputChange}
                        {...(i + 1 === 14 ? {} : { required: true })}
                      />
                    </Form.Group>
                  ))}

                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => navigate(-1)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="success" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner animation="border" size="sm" /> : "Update letter"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

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

EditPlacementLetter.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default EditPlacementLetter;