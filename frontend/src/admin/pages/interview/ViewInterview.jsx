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

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/interviews`;

const ViewInterview = ({ darkMode }) => {
  const { id } = useParams();
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        <h3 className="mt-3">VIEW INTERVIEW DETAILS</h3>
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
                  <Form>
                    {/* Interview Label */}
                    <Form.Group controlId="interviewLabel" className="mb-3">
                      <Form.Label>Interview Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={interviewData.interviewName}
                        readOnly
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
                        value={interviewData.interviewDate}
                        readOnly
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
                        value={interviewData.interviewTime}
                        readOnly
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
                        value={interviewData.location}
                        readOnly
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
                        value={interviewData.note || "No additional notes"}
                        readOnly
                        rows={3}
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>
                  </Form>
                )}

                {/* Go Back Button */}
                <div className="d-flex justify-content-between mt-3">
                  <Button
                    variant="danger"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Go Back
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

ViewInterview.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewInterview;
