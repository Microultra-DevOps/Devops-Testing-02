import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification"; 


const EditInduction = ({ darkMode }) => {
  const { id } = useParams(); 
  const [inductionData, setInductionData] = useState({
    induction: "",
    startDate: "",
    endDate: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(""); 
  const [notificationVariant, setNotificationVariant] = useState("success"); 
  const navigate = useNavigate();

  // Fetch existing induction data
  useEffect(() => {
    const fetchInduction = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/inductions/${id}`);
        setInductionData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load induction details.");
      } finally {
        setLoading(false);
      }
    };

    fetchInduction();
  }, [id]);

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
    setIsSaving(true);

    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/api/inductions/${id}`, inductionData);
      setIsSaving(false);

      // Show success notification
      setNotificationMessage("Induction updated successfully!");
      setNotificationVariant("success");
      setShowNotification(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        setShowNotification(false);
        navigate("/view-all-inductions");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update induction.");
      setIsSaving(false);

      // Show error notification
      setNotificationMessage("Failed to update induction.");
      setNotificationVariant("danger");
      setShowNotification(true);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header */}
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">EDIT INDUCTION DETAILS</h3>
      </Container>

      {/* Main Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" size="lg" />
                    <p>Loading induction details...</p>
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    {/* Induction Name */}
                    <Form.Group controlId="induction" className="mb-3">
                      <Form.Label>Induction Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="induction"
                        value={inductionData.induction}
                        onChange={handleInputChange}
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        required
                      />
                    </Form.Group>

                    {/* Start Date */}
                    <Form.Group controlId="startDate" className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={inductionData.startDate}
                        onChange={handleInputChange}
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        required
                      />
                    </Form.Group>

                    {/* End Date */}
                    <Form.Group controlId="endDate" className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={inductionData.endDate}
                        onChange={handleInputChange}
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        required
                      />
                    </Form.Group>

                    {/* Location */}
                    <Form.Group controlId="location" className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={inductionData.location}
                        onChange={handleInputChange}
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        required
                      />
                    </Form.Group>

                    {/* Save and Cancel Buttons */}
                    <div className="d-flex justify-content-between mt-3">
                      <Button variant="danger" onClick={() => navigate(-1)} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button variant="success" type="submit" disabled={isSaving}>
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

EditInduction.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default EditInduction;
