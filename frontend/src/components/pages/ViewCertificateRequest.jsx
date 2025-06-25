import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Form, Button, Spinner, Alert, Card } from "react-bootstrap";
import { FaArrowLeft, FaCheckCircle, FaEdit, FaUser, FaCalendarAlt, FaListAlt, FaUserTie } from "react-icons/fa";
import logo from "../../assets/logo.png";

const ViewCertificateRequest = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    const fetchCertificateRequest = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/certificates/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCertificate(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching certificate request:", err);
        setError("Failed to load certificate request details.");
        setLoading(false);
      }
    };

    fetchCertificateRequest();
  }, [id, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-success";
      case "declined":
        return "bg-danger";
      case "completed":
        return "bg-primary";
      default:
        return "bg-warning";
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCompleteRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/certificates/update-status/${id}`,
        { status: "completed" },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh certificate data
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/certificates/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCertificate(response.data.data);
      setShowCompleteModal(false);
    } catch (err) {
      console.error("Error completing certificate request:", err);
      setError("Failed to mark certificate as completed.");
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">VIEW CERTIFICATE REQUEST</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded mb-4 position-relative"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)"
        }}
      >
        <div className="d-flex justify-content-end mb-4">
          {certificate && certificate.certificateRequestStatus === "approved" && (
            <Button 
              variant="success"
              onClick={() => setShowCompleteModal(true)}
              className="d-flex align-items-center"
            >
              <FaCheckCircle className="me-2" /> Mark as Completed
            </Button>
          )}
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
            <p className="mt-3">Loading certificate request details...</p>
          </div>
        ) : certificate ? (
          <>
            <Card
              className="mb-4"
              bg={darkMode ? "dark" : "light"}
              text={darkMode ? "white" : "dark"}
              border={darkMode ? "secondary" : "primary"}
            >
              <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                <span>Request Status</span>
                <span className={`badge ${getStatusBadgeClass(certificate.certificateRequestStatus)}`}>
                  {certificate.certificateRequestStatus.toUpperCase()}
                </span>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p className="mb-1"><strong>Requested On:</strong></p>
                    <p>{formatDate(certificate.createdAt)}</p>
                  </Col>
                  {certificate.certificateRequestStatus === "completed" && (
                    <Col md={6}>
                      <p className="mb-1"><strong>Completed On:</strong></p>
                      <p>{formatDate(certificate.updatedAt)}</p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Trainee Information Section */}
            <Card
              className="mb-4"
              bg={darkMode ? "dark" : "light"}
              text={darkMode ? "white" : "dark"}
              border={darkMode ? "secondary" : "primary"}
            >
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaUser className="me-2" /> Trainee Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={certificate.name || ""}
                          readOnly
                          className={`${darkMode ? "bg-dark text-white" : ""}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Internship ID</Form.Label>
                        <Form.Control
                          type="text"
                          value={certificate.internId || ""}
                          readOnly
                          className={`${darkMode ? "bg-dark text-white" : ""}`}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>NIC Number</Form.Label>
                        <Form.Control
                          type="text"
                          value={certificate.nic || ""}
                          readOnly
                          className={`${darkMode ? "bg-dark text-white" : ""}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                          type="text"
                          value={certificate.contactNumber || ""}
                          readOnly
                          className={`${darkMode ? "bg-dark text-white" : ""}`}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Training Details Section */}
            <Card
              className="mb-4"
              bg={darkMode ? "dark" : "light"}
              text={darkMode ? "white" : "dark"}
              border={darkMode ? "secondary" : "primary"}
            >
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaCalendarAlt className="me-2" /> Training Details
                </h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Section/Unit</Form.Label>
                        <Form.Control
                          type="text"
                          value={certificate.sectionUnit || ""}
                          readOnly
                          className={`${darkMode ? "bg-dark text-white" : ""}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Training Category</Form.Label>
                        <Form.Control
                          type="text"
                          value={certificate.trainingCategory || ""}
                          readOnly
                          className={`${darkMode ? "bg-dark text-white" : ""}`}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Period From</Form.Label>
                        <Form.Control
                          type="text"
                          value={formatDate(certificate.periodFrom)}
                          readOnly
                          className={`${darkMode ? "bg-dark text-white" : ""}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Period To</Form.Label>
                        <Form.Control
                          type="text"
                          value={formatDate(certificate.periodTo)}
                          readOnly
                          className={`${darkMode ? "bg-dark text-white" : ""}`}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Work Attended Section */}
            <Card
              className="mb-4"
              bg={darkMode ? "dark" : "light"}
              text={darkMode ? "white" : "dark"}
              border={darkMode ? "secondary" : "primary"}
            >
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaListAlt className="me-2" /> Work Attended
                </h5>
              </Card.Header>
              <Card.Body>
                {certificate.workAttended && (
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Area A</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={certificate.workAttended.A || ""}
                            readOnly
                            className={`${darkMode ? "bg-dark text-white" : ""}`}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Area B</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={certificate.workAttended.B || ""}
                            readOnly
                            className={`${darkMode ? "bg-dark text-white" : ""}`}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Area C</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={certificate.workAttended.C || ""}
                            readOnly
                            className={`${darkMode ? "bg-dark text-white" : ""}`}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Area D</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={certificate.workAttended.D || ""}
                            readOnly
                            className={`${darkMode ? "bg-dark text-white" : ""}`}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Card.Body>
            </Card>

            {/* Staff Information Section */}
            <Card
              className="mb-4"
              bg={darkMode ? "dark" : "light"}
              text={darkMode ? "white" : "dark"}
              border={darkMode ? "secondary" : "primary"}
            >
              <Card.Header className="bg-secondary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaUserTie className="me-2" /> Staff Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Staff Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={certificate.staffName || "Not Assigned"}
                          readOnly
                          className={`${darkMode ? "bg-dark text-white" : ""}`}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {/* Trainee Signature Section */}
            {certificate.traineeSignature && (
              <Card 
                className="mb-4"
                bg={darkMode ? "dark" : "light"}
                text={darkMode ? "white" : "dark"}
                border={darkMode ? "secondary" : "primary"}
              >
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaEdit className="me-2" /> Trainee Signature
                  </h5>
                </Card.Header>
                <Card.Body className="text-center">
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}/${certificate.traineeSignature}`}
                    alt="Trainee Signature"
                    className="img-fluid border p-2 rounded"
                    style={{ maxHeight: "200px", background: "white" }}
                  />
                </Card.Body>
              </Card>
            )}
            
            {/* Back button positioned at the bottom left */}
            <div className="d-flex justify-content-start mt-4">
              <Button
                variant={darkMode ? "outline-light" : "outline-dark"}
                onClick={handleGoBack}
                className="d-flex align-items-center"
              >
                <FaArrowLeft className="me-2" /> Back to List
              </Button>
            </div>
          </>
        ) : (
          <Alert variant="warning">Certificate request not found.</Alert>
        )}
      </Container>

      {/* Complete Confirmation Modal */}
      {showCompleteModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className={`modal-content ${darkMode ? "bg-dark text-white" : ""}`}>
              <div className="modal-header">
                <h5 className="modal-title">Confirm Completion</h5>
                <button type="button" className="btn-close" onClick={() => setShowCompleteModal(false)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to mark this certificate request as completed?</p>
                <p><strong>Intern ID:</strong> {certificate?.internId}</p>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleCompleteRequest}>
                  <FaCheckCircle className="me-2" /> Mark as Completed
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCertificateRequest;