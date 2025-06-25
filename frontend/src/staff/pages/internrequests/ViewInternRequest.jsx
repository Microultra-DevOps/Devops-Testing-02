import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import axios from "axios";
import Notification from "../../../components/notifications/Notification";

const ViewInternRequest = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internRequest, setInternRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");

  useEffect(() => {
    const fetchInternRequest = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError("Authentication required. Please login again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/internRequest/intern-requests/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setInternRequest(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching intern request:", error);
        
        if (error.response) {
          setError(error.response.data.message || "Error fetching the intern request details.");
        } else if (error.request) {
          setError("No response from server. Please check your connection.");
        } else {
          setError("Error fetching the intern request details.");
        }
        
        setLoading(false);
      }
    };

    fetchInternRequest();
  }, [id]);

  if (loading) {
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
        <h3 className="mt-3">INTERN REQUEST DETAILS</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Intern Request Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form>
                  {/* Intern Type Radio Buttons */}
                  <Form.Group className="mb-3">
                    <Form.Label>Intern Type</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        label="Internship"
                        checked={internRequest.internType === "internship"}
                        className={darkMode ? "text-white" : "text-dark"}
                        disabled
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="Data Entry"
                        checked={internRequest.internType === "dataEntry"}
                        className={darkMode ? "text-white" : "text-dark"}
                        disabled
                      />
                    </div>
                  </Form.Group>

                  {/* District Dropdown */}
                  <Form.Group controlId="district" className="mb-3">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      type="text"
                      value={internRequest.district}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      disabled
                    />
                  </Form.Group>

                  {/* Scheme Dropdown */}
                  <Form.Group controlId="scheme" className="mb-3">
                    <Form.Label>Scheme</Form.Label>
                    <Form.Control
                      type="text"
                      value={internRequest.scheme}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      disabled
                    />
                  </Form.Group>

                  {/* Required Number of Interns */}
                  <Form.Group controlId="requiredInterns" className="mb-3">
                    <Form.Label>Required Number of Interns</Form.Label>
                    <Form.Control
                      type="number"
                      value={internRequest.requiredInterns}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      disabled
                    />
                  </Form.Group>

                  {/* Status Field */}
                  <Form.Group controlId="status" className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <div>
                      <span className={`badge ${
                        internRequest.adminApproved === "Approved" ? "bg-success" :
                        internRequest.adminApproved === "Rejected" ? "bg-danger" :
                        internRequest.adminApproved === "Pending" ? "bg-warning" : "bg-secondary"
                      }`}>
                        {internRequest.adminApproved || "Pending"}
                      </span>
                    </div>
                  </Form.Group>

                  {/* Justification */}
                  <Form.Group controlId="justification" className="mb-3">
                    <Form.Label>Justification for Request</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={internRequest.justification}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      disabled
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
                          value={internRequest.periodFrom.split('T')[0]}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                          disabled
                        />
                      </Col>
                      <Col>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={internRequest.periodTo.split('T')[0]}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                          disabled
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
                      value={internRequest.workScope}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      disabled
                    />
                  </Form.Group>

                  {/* Proposed Intern NIC */}
                  <Form.Group controlId="proposedInternNIC" className="mb-3">
                    <Form.Label>Proposed Intern NIC Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={internRequest.proposedInternNIC || ""}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      disabled
                    />
                  </Form.Group>

                  {/* Category Selection */}
                  <Form.Group controlId="category" className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      value={internRequest.category}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      disabled
                    />
                  </Form.Group>

                  {/* Note */}
                  <Form.Group controlId="note" className="mb-3">
                    <Form.Label>Additional Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={internRequest.note || ""}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      disabled
                    />
                  </Form.Group>

                  {/* Reviewer Comments */}
                  {internRequest.reviewer && (
                    <Form.Group controlId="reviewerComments" className="mb-3">
                      <Form.Label>Reviewer Comments</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={internRequest.reviewerComments || "No comments provided"}
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        disabled
                      />
                    </Form.Group>
                  )}

                  {/* Back Button */}
                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => navigate("/view-my-requests")}>
                      Back
                    </Button>
                    {internRequest.status === "Approved" && (
                      <Button variant="success">
                        Print Approval
                      </Button>
                    )}
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

ViewInternRequest.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewInternRequest;