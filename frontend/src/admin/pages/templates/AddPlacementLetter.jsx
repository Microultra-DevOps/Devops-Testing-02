import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/letters`;

const AddPlacementLetter = ({ darkMode }) => {
  const [letterData, setLetterData] = useState({
    letterName: "Placement Letter", // Added required letterName field
        label1: "Talent Development Section",  
        label2: "7th Floor, Head Office, Lotus Road, Colombo 01",
        label3: "Our/My Ref:.......................",
        label4: "Your Ref:......................",
        label5: "Telephone: 011-2021359",
        label6: "Fax: 011-2478627",
        label7: "Email: hiroshim@slt.com",
        label8: "To: Security Staff",
        label9: "From: Engineer Talent Development",
        label10: "Date: 2025-02-17",
        label11: "Subject - Assignment of Internship",
        label12: "Following student from (.....Uni/Institute....) has been assigned to",
        label13: "you to undergo the Intern Program under your supervision from (......) to (.....)",
        label14: "",
        label15: "Please arrage to accommodate the Intern. Please note that the induction programme is",
        label16: "compulsory for all interns.",
        label17: "Please arrange to release the interns for the next induction programme which will be held on undefined",
        label18: "Please do not expose any confidential information to the Intern and strictly follow the information",
        label19: "Security guideline currently prevailing at SLT when assigning duties to the Intern.",
        label20: "Details of the Intern as follows:",
        label21: "Name: ...........",
        label22: "NIC:...............",
        label23: "Scheme Name:...........",
        label24: "Intern has signed the following documents - Police report, Duration check, Aggrement, and NDA",
        label25: "...........................",
        label26: "Engineer/Talent Development",
        label27: ".................",
        label28: "Signature",
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

      const response = await axios.post(API_BASE_URL, letterData);
      console.log("Response:", response.data);

      setSuccessMessage("Placement Letter Created Successfully!");
      setShowSuccessNotification(true);

      // Reset form data
      setLetterData({
        letterName: "Placement Letter", 
        label1: "Talent Development Section",  
        label2: "7th Floor, Head Office, Lotus Road, Colombo 01",
        label3: "Our/My Ref:.......................",
        label4: "Your Ref:......................",
        label5: "Telephone: 011-2021359",
        label6: "Fax: 011-2478627",
        label7: "Email: hiroshim@slt.com",
        label8: "To: Security Staff",
        label9: "From: Engineer Talent Development",
        label10: "Date: 2025-02-17",
        label11: "Subject - Assignment of Internship",
        label12: "Following student from (.....Uni/Institute....) has been assigned to",
        label13: "you to undergo the Intern Program under your supervision from (......) to (.....)",
        label14: "",
        label15: "Please arrage to accommodate the Intern. Please note that the induction programme is",
        label16: "compulsory for all interns.",
        label17: "Please arrange to release the interns for the next induction programme which will be held on undefined",
        label18: "Please do not expose any confidential information to the Intern and strictly follow the information",
        label19: "Security guideline currently prevailing at SLT when assigning duties to the Intern.",
        label20: "Details of the Intern as follows:",
        label21: "Name: ...........",
        label22: "NIC:...............",
        label23: "Scheme Name:...........",
        label24: "Intern has signed the following documents - Police report, Duration check, Aggrement, and NDA",
        label25: "...........................",
        label26: "Engineer/Talent Development",
        label27: ".................",
        label28: "Signature",
      });

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/all-placement-letters", { state: { refresh: true } });
      }, 3000);

    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.response?.data?.error || "An error occurred while creating the letter.");
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
        <h3 className="mt-3">CREATE NEW PLACEMENT LETTER</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Placement Letter Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
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
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner animation="border" size="sm" /> : "Create Letter"}
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

AddPlacementLetter.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AddPlacementLetter;



