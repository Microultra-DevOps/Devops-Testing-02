import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import logo from "../../../assets/logo.png";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const EditStation = ({ darkMode }) => {
  const navigate = useNavigate();
  const [stationData, setStationData] = useState({
    stationName: "",
    displayName: "",
    priority: "",
    maxStudents: "",
    timePeriod: "", // New field for time period
    activeStatus: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const { id } = useParams(); 

  // Fetch station data by ID
  useEffect(() => {
    const fetchStation = async () => {
      if (!id) {
        console.error("Station ID is undefined");
        setErrorMessage("Station ID is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/stations/get-station/${id}`
        );

        setStationData(response.data);
      } catch (error) {
        console.error("Error fetching station:", error);
        setErrorMessage("Failed to load station details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStation();
  }, [id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStationData({
      ...stationData,
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
      await axios.put(
        `${API_BASE_URL}/stations/edit-station/${id}`,
        stationData
      );

      console.log("Station ID from URL:", id);
      setSuccessMessage("Station updated successfully!");
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/all-rotational-stations");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "An error occurred while updating the station."
      );
      setShowErrorNotification(true);

      setTimeout(() => {
        setShowErrorNotification(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status" />
        <p>Loading station details...</p>
      </div>
    );
  }

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
        <h3 className="mt-3">EDIT STATION</h3>
      </Container>

      {/* Main Form Section */}
      <Container
        className={`p-4 rounded shadow ${
          darkMode ? "bg-secondary text-white" : "bg-white text-dark"
        } mb-5`}
      >
        <Row>
          <Col md={12}>
            <h4>Station Details</h4>
            <Card
              className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
            >
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Form Fields */}
                  <Form.Group controlId="stationName" className="mb-3">
                    <Form.Label>Station Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Station Name"
                      name="stationName"
                      value={stationData.stationName}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="displayName" className="mb-3">
                    <Form.Label>Display Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Display Name"
                      name="displayName"
                      value={stationData.displayName}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="priority" className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Control
                      as="select"
                      name="priority"
                      value={stationData.priority}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    >
                      <option value="">Select Priority</option>
                      <option value="1">1 (Highest)</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5 (Lowest)</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group controlId="maxStudents" className="mb-3">
                    <Form.Label>Maximum Students</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter Maximum Students"
                      name="maxStudents"
                      value={stationData.maxStudents}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  {/* New Field: Time Period */}
                  <Form.Group controlId="timePeriod" className="mb-3">
                    <Form.Label>Time Period (Weeks)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter Time Period in Weeks"
                      name="timePeriod"
                      value={stationData.timePeriod}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="activeStatus" className="mb-3">
                    <Form.Label>Active Status</Form.Label>
                    <Form.Control
                      as="select"
                      name="activeStatus"
                      value={stationData.activeStatus}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="true">Active</option>
                      <option value="false">Not Active</option>
                    </Form.Control>
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
                        "Update Station"
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

export default EditStation;
