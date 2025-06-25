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
  Table,
  Badge,
  Modal,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const ViewRotationalStation = ({ darkMode }) => {
  const { id } = useParams();
  const [stationData, setStationData] = useState(null);
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [showCVsModal, setShowCVsModal] = useState(false);
  const [stationCVs, setStationCVs] = useState([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [cvsError, setCvsError] = useState("");
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return "N/A";
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : "Expired";
  };

  const fetchCVsForStation = async () => {
    try {
      setLoadingCVs(true);
      setCvsError("");
      const response = await axios.get(
        `${API_BASE_URL}/stations/get-cvs/${id}`
      );
      setStationCVs(response.data.data);
    } catch (err) {
      setCvsError(
        err.response?.data?.error || "Failed to load CVs for this station."
      );
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleViewCVs = () => {
    setShowCVsModal(true);
    fetchCVsForStation();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingAssignments(true);

        const stationResponse = await axios.get(
          `${API_BASE_URL}/stations/get-station/${id}`
        );
        setStationData(stationResponse.data);

        const assignmentsResponse = await axios.get(
          `${API_BASE_URL}/stations/current-assignments/${id}`
        );
        setCurrentAssignments(assignmentsResponse.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load station details."
        );
      } finally {
        setLoading(false);
        setLoadingAssignments(false);
      }
    };

    fetchData();
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
        <h3 className="mt-3">STATION DETAILS</h3>
      </Container>

      {/* Main Section */}
      <Container
        className={`p-4 rounded shadow ${
          darkMode ? "bg-secondary text-white" : "bg-white text-dark"
        } mb-5`}
      >
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" size="lg" />
            <p>Loading station details...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            <Row>
              <Col md={6}>
                <Card className={`mb-4 ${darkMode ? "bg-dark" : ""}`}>
                  <Card.Header
                    className={darkMode ? "bg-secondary" : "bg-light"}
                  >
                    <h5>Station Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>{/* ... existing station info form ... */}</Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className={`mb-4 ${darkMode ? "bg-dark" : ""}`}>
                  <Card.Header
                    className={darkMode ? "bg-secondary" : "bg-light"}
                  >
                    <h5>Utilization</h5>
                  </Card.Header>
                  <Card.Body>
                    {/* ... existing utilization content ... */}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Card className={darkMode ? "bg-dark" : ""}>
                  <Card.Header
                    className={darkMode ? "bg-secondary" : "bg-light"}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Current Assignments</h5>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={handleViewCVs}
                        disabled={loadingAssignments}
                      >
                        View All CVs
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {loadingAssignments ? (
                      <div className="text-center">
                        <Spinner animation="border" size="sm" />
                        <p>Loading assignments...</p>
                      </div>
                    ) : currentAssignments.length === 0 ? (
                      <Alert variant="info">
                        No current assignments for this station
                      </Alert>
                    ) : (
                      <div className="table-responsive">
                        <Table
                          striped
                          bordered
                          hover
                          variant={darkMode ? "dark" : "light"}
                        >
                          <thead>
                            <tr>
                              <th>Ref No</th>
                              <th>Name</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Days Remaining</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentAssignments.map((assignment) => (
                              <tr key={assignment._id}>
                                <td>{assignment.refNo}</td>
                                <td>{assignment.fullName}</td>
                                <td>{formatDate(assignment.startDate)}</td>
                                <td>{formatDate(assignment.endDate)}</td>
                                <td>
                                  <Badge
                                    bg={
                                      calculateDaysRemaining(
                                        assignment.endDate
                                      ) === "Expired"
                                        ? "danger"
                                        : parseInt(
                                            calculateDaysRemaining(
                                              assignment.endDate
                                            )
                                          ) <= 7
                                        ? "warning"
                                        : "success"
                                    }
                                  >
                                    {calculateDaysRemaining(assignment.endDate)}
                                  </Badge>
                                </td>
                                <td>
                                  <Badge bg="primary">Active</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Back to Stations
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/edit-station/${id}`)}
            disabled={loading}
          >
            Edit Station
          </Button>
        </div>
      </Container>

      {/* CVs Modal */}
      <Modal
        show={showCVsModal}
        onHide={() => setShowCVsModal(false)}
        size="xl"
        centered
        className={darkMode ? "dark-modal" : ""}
      >
        <Modal.Header
          closeButton
          className={darkMode ? "bg-dark text-white" : ""}
        >
          <Modal.Title>CVs Assigned to {stationData?.stationName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
          {loadingCVs ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Loading CVs...</p>
            </div>
          ) : cvsError ? (
            <Alert variant="danger">{cvsError}</Alert>
          ) : stationCVs.length === 0 ? (
            <Alert variant="info">No CVs found for this station</Alert>
          ) : (
            <div className="table-responsive">
              <Table
                striped
                bordered
                hover
                variant={darkMode ? "dark" : "light"}
              >
                <thead>
                  <tr>
                    <th>NIC</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {stationCVs.map((cv) => (
                    <tr key={cv._id}>
                      <td>{cv.nic}</td>
                      <td>{cv.fullName}</td>
                      <td>{cv.selectedRole}</td>
                      <td>{formatDate(cv.startDate)}</td>
                      <td>{formatDate(cv.endDate)}</td>
                      <td>
                        <Badge
                          bg={
                            cv.remainingDays <= 0
                              ? "danger"
                              : cv.remainingDays <= 7
                              ? "warning"
                              : "success"
                          }
                        >
                          {cv.remainingDays <= 0
                            ? "Expired"
                            : `${cv.remainingDays} days`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark text-white" : ""}>
          <Button variant="secondary" onClick={() => setShowCVsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

ViewRotationalStation.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewRotationalStation;
