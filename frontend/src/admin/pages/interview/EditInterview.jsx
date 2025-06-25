import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components//notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/interviews`;

const EditInterview = ({ darkMode }) => {
  const { id } = useParams(); // Get interview ID from URL
  const [interviewData, setInterviewData] = useState({
    interviewName: "",
    interviewDate: "",
    interviewTime: "",
    location: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        setInterviewData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load interview details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id]);

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInterviewData({
      ...interviewData,
      [name]: value,
    });
  };

  // Handle form submission for updating interview
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, interviewData);
      setIsSaving(false);

      // Show notification on successful update
      setNotificationMessage("Interview updated successfully!");
      setNotificationVariant("success");
      setShowNotification(true);

      setTimeout(() => {
        setShowNotification(false);
        navigate("/view-all-interviews");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update interview.");
      setIsSaving(false);

      // Show error notification
      setNotificationMessage("Failed to update interview.");
      setNotificationVariant("danger");
      setShowNotification(true);
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
        <h3 className="mt-3">EDIT INTERVIEW DETAILS</h3>
      </Container>

      {/* Main Section */}
      <Container
        className={`p-4 rounded shadow ${
          darkMode ? "bg-secondary text-white" : "bg-white text-dark"
        } mb-5`}
      >
        <Row>
          <Col md={12}>
            <Card
              className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
            >
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" size="lg" />
                    <p>Loading interview details...</p>
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    {/* Interview Label */}
                    <Form.Group controlId="interviewName" className="mb-3">
                      <Form.Label>Interview Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="interviewName"
                        value={interviewData.interviewName}
                        onChange={handleInputChange}
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Interview Date */}
                    <Form.Group controlId="interviewDate" className="mb-3">
                      <Form.Label>Interview Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="interviewDate"
                        value={interviewData.interviewDate}
                        onChange={handleInputChange}
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Interview Time */}
                    <Form.Group controlId="interviewTime" className="mb-3">
                      <Form.Label>Interview Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="interviewTime"
                        value={interviewData.interviewTime}
                        onChange={handleInputChange}
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Location */}
                    <Form.Group controlId="location" className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={interviewData.location}
                        onChange={handleInputChange}
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Note */}
                    <Form.Group controlId="note" className="mb-3">
                      <Form.Label>Note</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="note"
                        value={interviewData.note || ""}
                        onChange={handleInputChange}
                        rows={3}
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Save and Cancel Buttons */}
                    <div className="d-flex justify-content-between mt-3">
                      <Button
                        variant="danger"
                        onClick={() => navigate(-1)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="success"
                        type="submit"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Notification Component */}
      <Notification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        message={notificationMessage}
        variant={notificationVariant}
      />
    </div>
  );
};

EditInterview.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default EditInterview;
