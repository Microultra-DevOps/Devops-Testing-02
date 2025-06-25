import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const AddNewInduction = ({ darkMode }) => {
  const [inductionData, setInductionData] = useState({
    induction: "",
    startDate: "",
    endDate: "",
    location: "",
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
    setInductionData({
      ...inductionData,
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
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/inductions`, inductionData);
      setSuccessMessage("Induction Created Successfully!");

      setShowSuccessNotification(true);

      setInductionData({
        induction: "",
        startDate: "",
        endDate: "",
        location: "",
      });

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/view-all-inductions");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "An error occurred while scheduling the induction."
      );

      setShowErrorNotification(true);

      setTimeout(() => {
        setShowErrorNotification(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      {/* Header */}
      <Container className="text-center mt-4 mb-3">
        <img
          src={logo}
          alt="Company Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">ADD NEW INDUCTION</h3>
      </Container>

      {/* Main Form Section */}
      <Container
        className={`p-4 rounded shadow ${
          darkMode ? "bg-secondary text-white" : "bg-white text-dark"
        } mb-5`}
      >
        <Row>
          <Col md={12}>
            <h4>Induction Details</h4>
            <Card
              className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
            >
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Form Fields */}
                  <Form.Group controlId="induction" className="mb-3">
                    <Form.Label>Induction Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Induction Name"
                      name="induction"
                      value={inductionData.induction}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="startDate" className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={inductionData.startDate}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="endDate" className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={inductionData.endDate}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="location" className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Induction Location"
                      name="location"
                      value={inductionData.location}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  {/* Buttons */}
                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="danger"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                    >
                      Go Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Create Induction"
                      )}
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

AddNewInduction.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AddNewInduction;
