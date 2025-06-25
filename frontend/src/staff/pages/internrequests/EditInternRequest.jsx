import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import axios from "axios";
import Notification from "../../../components/notifications/Notification";

const EditInternRequest = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internRequest, setInternRequest] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState({
    internRequest: true,
    districts: true,
    schemes: true,
  });
  const [error, setError] = useState("");

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/districts");
        setDistricts(response.data);
        setLoading((prevState) => ({ ...prevState, districts: false }));
      } catch (error) {
        console.error("Error fetching districts:", error);
        setError("Failed to load districts. Please refresh the page.");
        setLoading((prevState) => ({ ...prevState, districts: false }));
      }
    };

    const fetchSchemes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/schemes");
        setSchemes(response.data);
        setLoading((prevState) => ({ ...prevState, schemes: false }));
      } catch (error) {
        console.error("Error fetching schemes:", error);
        setError("Failed to load schemes. Please refresh the page.");
        setLoading((prevState) => ({ ...prevState, schemes: false }));
      }
    };

    const fetchInternRequest = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication required. Please login again.");
          setLoading((prevState) => ({ ...prevState, internRequest: false }));
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/internRequest/intern-requests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setInternRequest(response.data);
        setLoading((prevState) => ({ ...prevState, internRequest: false }));
      } catch (error) {
        console.error("Error fetching intern request:", error);

        if (error.response) {
          setError(error.response.data.message || "Error fetching the intern request details.");
        } else if (error.request) {
          setError("No response from server. Please check your connection.");
        } else {
          setError("Error fetching the intern request details.");
        }

        setLoading((prevState) => ({ ...prevState, internRequest: false }));
      }
    };

    fetchDistricts();
    fetchSchemes();
    fetchInternRequest();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInternRequest({
      ...internRequest,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/internRequest/intern-requests/${id}`,
        internRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNotificationMessage("Intern request updated successfully!");
      setNotificationVariant("success");
      setShowNotification(true);
      setTimeout(() => navigate("/view-my-requests"), 2000);
    } catch (error) {
      console.error("Error updating intern request:", error);

      if (error.response) {
        setError(error.response.data.message || "Error updating the intern request details.");
      } else if (error.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Error updating the intern request details.");
      }

      setNotificationMessage("Error updating the intern request details.");
      setNotificationVariant("danger");
      setShowNotification(true);
    }
  };

  if (loading.internRequest || loading.districts || loading.schemes) {
    return (
      <div className={`d-flex flex-column justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Spinner animation="border" />
        <p className="mt-3">Loading intern request details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`d-flex flex-column justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <div className="text-center">
          <h4>Error</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate("/view-my-requests")}>
            Back to Requests
          </Button>
        </div>
      </div>
    );
  }

  if (!internRequest) {
    return (
      <div className={`d-flex flex-column justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <div className="text-center">
          <h4>Intern Request Not Found</h4>
          <Button variant="primary" onClick={() => navigate("/view-my-requests")}>
            Back to Requests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">EDIT INTERN REQUEST DETAILS</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Intern Request Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Intern Type Radio Buttons */}
                  <Form.Group className="mb-3">
                    <Form.Label>Intern Type</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        label="Internship"
                        name="internType"
                        value="internship"
                        checked={internRequest.internType === "internship"}
                        onChange={handleInputChange}
                        className={darkMode ? "text-white" : "text-dark"}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="Data Entry"
                        name="internType"
                        value="dataEntry"
                        checked={internRequest.internType === "dataEntry"}
                        onChange={handleInputChange}
                        className={darkMode ? "text-white" : "text-dark"}
                      />
                    </div>
                  </Form.Group>

                  {/* District Dropdown */}
                  <Form.Group controlId="district" className="mb-3">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      as="select"
                      name="district"
                      value={internRequest.district}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                      disabled={loading.districts}
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district._id} value={district.district_name}>
                          {district.district_name}
                        </option>
                      ))}
                    </Form.Control>
                    {loading.districts && <small className="text-muted">Loading districts...</small>}
                  </Form.Group>

                  {/* Scheme Dropdown */}
                  <Form.Group controlId="scheme" className="mb-3">
                        <Form.Label>Scheme</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="scheme"
                                    value={internRequest.scheme}
                                    onChange={handleInputChange}
                                    className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                                    required
                                    disabled={loading.schemes}
                                    >
                                    <option value="">Select Scheme</option>
                                {schemes.map(scheme => (
                                    <option key={scheme._id} value={scheme.schemeName}>
                                {scheme.schemeName}
                                </option>
                               ))}
                             </Form.Control>
                        {loading.schemes && <small className="text-muted">Loading schemes...</small>}
                     </Form.Group>
                  

                  {/* Required Number of Interns */}
                  <Form.Group controlId="requiredInterns" className="mb-3">
                    <Form.Label>Required Number of Interns</Form.Label>
                    <Form.Control
                      type="number"
                      name="requiredInterns"
                      value={internRequest.requiredInterns}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Justification */}
                  <Form.Group controlId="justification" className="mb-3">
                    <Form.Label>Justification for Request</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="justification"
                      value={internRequest.justification}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Expected Period */}
                  <Form.Group className="mb-3">
                    <Form.Label>Expected Period</Form.Label>
                    <Row>
                      <Col>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="periodFrom"
                          value={internRequest.periodFrom.split('T')[0]}
                          onChange={handleInputChange}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        />
                      </Col>
                      <Col>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="periodTo"
                          value={internRequest.periodTo.split('T')[0]}
                          onChange={handleInputChange}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  {/* Work Scope */}
                  <Form.Group controlId="workScope" className="mb-3">
                    <Form.Label>Work Scope of Intern</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="workScope"
                      value={internRequest.workScope}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Proposed Intern NIC */}
                  <Form.Group controlId="proposedInternNIC" className="mb-3">
                    <Form.Label>Proposed Intern NIC Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="proposedInternNIC"
                      value={internRequest.proposedInternNIC || ""}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Category Selection */}
                  <Form.Group controlId="category" className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      value={internRequest.category}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Note */}
                  <Form.Group controlId="note" className="mb-3">
                    <Form.Label>Additional Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="note"
                      value={internRequest.note || ""}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Back Button */}
                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => navigate("/view-my-requests")}>
                      Back
                    </Button>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </Form>
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

EditInternRequest.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default EditInternRequest;