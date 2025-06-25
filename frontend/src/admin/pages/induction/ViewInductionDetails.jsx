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

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/inductions`;

const ViewInductionDetails = ({ darkMode }) => {
  const { id } = useParams();
  const [inductionData, setInductionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInduction = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        setInductionData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load induction details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInduction();
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
        <h3 className="mt-3">VIEW INDUCTION DETAILS</h3>
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
                    <p>Loading induction details...</p>
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : (
                  <Form>
                    {/* Induction Label */}
                    <Form.Group controlId="inductionLabel" className="mb-3">
                      <Form.Label>Induction Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={inductionData.induction}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Start Date */}
                    <Form.Group controlId="startDate" className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={inductionData.startDate}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Start Date */}
                    <Form.Group controlId="endDate" className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={inductionData.endDate}
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
                        value={inductionData.location}
                        readOnly
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

ViewInductionDetails.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewInductionDetails;
