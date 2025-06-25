import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Form,
  Modal,
  Badge,
} from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from "react-icons/fa";
import axios from "axios";
import logo from "../../../assets/logo.png";
import ConfirmDeleteModal from "../../../components/notifications/ConfirmDeleteModal";
import Dashboard from "./Dashboard";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const AllRotationalStation = ({ darkMode }) => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stationToDelete, setStationToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [showCVsModal, setShowCVsModal] = useState(false);
  const [stationCVs, setStationCVs] = useState([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [currentStationName, setCurrentStationName] = useState("");
  const itemsPerPage = 10;

  const [analytics, setAnalytics] = useState([]);

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate remaining days
  const calculateRemainingDays = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Fetch all stations and analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsResponse, analyticsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/stations/all-stations`),
          axios.get(`${API_BASE_URL}/rotational/analytics`),
        ]);

        // Log the responses to debug
        console.log("Stations Response:", stationsResponse);
        console.log("Analytics Response:", analyticsResponse);

        // Ensure stations is an array
        const stationsData = Array.isArray(stationsResponse.data)
          ? stationsResponse.data
          : stationsResponse.data.stations || stationsResponse.data.data || [];

        setStations(stationsData);
        setAnalytics(analyticsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error.response?.data?.message ||
            "Failed to load data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle station deletion
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/stations/delete/${stationToDelete}`);
      setStations(
        stations.filter((station) => station._id !== stationToDelete)
      );
      setSuccessMessage("Station deleted successfully!");
    } catch (error) {
      console.error("Error deleting station:", error);
      setError("Failed to delete station. Please try again.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Ensure filteredStations uses safe array method
  const filteredStations = Array.isArray(stations)
    ? stations.filter((station) =>
        station.stationName?.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const indexOfLastStation = currentPage * itemsPerPage;
  const indexOfFirstStation = indexOfLastStation - itemsPerPage;
  const currentStations = filteredStations.slice(
    indexOfFirstStation,
    indexOfLastStation
  );

  // Confirm delete function
  const confirmDelete = (stationId) => {
    setStationToDelete(stationId);
    setShowDeleteModal(true);
  };

  // Fetch CVs for a specific station
  const fetchCVsForStation = async (stationId, stationName) => {
    try {
      setLoadingCVs(true);
      setCurrentStationName(stationName);
      setError(null);

      // Make sure this URL matches your backend route
      const response = await axios.get(
        `${API_BASE_URL}/rotational/get-cvs/${stationId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to fetch CVs");
      }

      const transformedCVs = response.data.data.map((cv) => ({
        ...cv,
        startDate: cv.startDate ? new Date(cv.startDate) : null,
        endDate: cv.endDate ? new Date(cv.endDate) : null,
        remainingDays: cv.remainingDays || calculateRemainingDays(cv.endDate),
      }));

      setStationCVs(transformedCVs);
      setShowCVsModal(true);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to load CVs for this station."
      );
    } finally {
      setLoadingCVs(false);
    }
  };
  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      <Container className="text-center mt-4 mb-3">
        <img
          src={logo}
          alt="SLT Mobitel Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">ALL ROTATIONAL STATIONS</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <Dashboard stationAnalytics={analytics} darkMode={darkMode} />

        <h5 className="mb-3">
          <FaCalendarCheck
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          All Rotational Stations
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        <div className="d-flex flex-wrap justify-content-between mb-3">
          <Form.Group
            className="mb-0"
            style={{ maxWidth: "300px", flex: "1 1 100%" }}
          >
            <Form.Control
              type="text"
              placeholder="Filter by Rotational Station Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={darkMode ? "bg-dark text-white" : ""}
            />
          </Form.Group>

          <div className="d-flex flex-wrap justify-content-end align-items-center mt-2 mt-sm-0">
            <Button
              variant="primary"
              onClick={() => navigate("/add-new-station")}
              className="mx-0 mb-2 mb-sm-0"
            >
              Add New Station
            </Button>
            <Button
              variant="success"
              onClick={() => navigate("/schedule-rotations")}
              className="mx-2 mb-2 mb-sm-0"
            >
              Schedule CVs
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading stations...</p>
          </div>
        ) : (
          <>
            <Table
              striped
              bordered
              hover
              variant={darkMode ? "dark" : "light"}
              responsive
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Station Name</th>
                  <th>Display Name</th>
                  <th>Priority</th>
                  <th>Maximum Students</th>
                  <th>Time Period (Weeks)</th>
                  <th>Active Status</th>
                  <th>View</th>
                  <th>Edit</th>
                  <th>View CVs</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentStations.length > 0 ? (
                  currentStations.map((station, index) => (
                    <tr key={station._id}>
                      <td>{indexOfFirstStation + index + 1}</td>
                      <td>{station.stationName || "N/A"}</td>
                      <td>{station.displayName || "N/A"}</td>
                      <td>{station.priority || "N/A"}</td>
                      <td>{station.maxStudents || "N/A"}</td>
                      <td>{station.timePeriod || "N/A"}</td>
                      <td>{station.activeStatus ? "Active" : "Inactive"}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            navigate(`/view-rotational-stations/${station._id}`)
                          }
                          className="fw-semibold"
                        >
                          View
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            navigate(`/edit-rotational-stations/${station._id}`)
                          }
                          className="fw-semibold"
                        >
                          Edit
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() =>
                            fetchCVsForStation(station._id, station.stationName)
                          }
                          className="fw-semibold"
                        >
                          View CVs
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => confirmDelete(station._id)}
                          className="fw-semibold"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center">
                      No Rotational Stations found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={11} style={{ padding: "5px", fontSize: "14px" }}>
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ minHeight: "30px" }}
                    >
                      <div className="flex-grow-1 text-center">
                        {currentStations.length} of {filteredStations.length}{" "}
                        Rotational Station(s) shown
                      </div>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          style={{
                            color: darkMode ? "white" : "black",
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          <FaChevronLeft />
                          <FaChevronLeft />
                        </Button>
                        <span className="mx-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          style={{
                            color: darkMode ? "white" : "black",
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          <FaChevronRight />
                          <FaChevronRight />
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </>
        )}
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
          closeVariant={darkMode ? "white" : undefined}
          className={darkMode ? "bg-dark text-white" : ""}
        >
          <Modal.Title>CVs Assigned to: {currentStationName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
          {loadingCVs ? (
            <div className="text-center">
              <Spinner
                animation="border"
                variant={darkMode ? "light" : "dark"}
              />
              <p>Loading CVs...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : stationCVs.length > 0 ? (
            <div className="table-responsive">
              <Table
                striped
                bordered
                hover
                variant={darkMode ? "dark" : "light"}
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ref No</th>
                    <th>Full Name</th>
                    <th>NIC</th>
                    <th>Role</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days Remaining</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stationCVs.map((cv, index) => {
                    const daysRemaining = cv.remainingDays;
                    const isExpired = daysRemaining <= 0;

                    return (
                      <tr key={cv._id}>
                        <td>{index + 1}</td>
                        <td>{cv.refNo || "N/A"}</td>
                        <td>{cv.fullName}</td>
                        <td>{cv.nic}</td>
                        <td>{cv.selectedRole}</td>
                        <td>{formatDate(cv.startDate)}</td>
                        <td>{formatDate(cv.endDate)}</td>
                        <td>
                          <Badge
                            bg={
                              isExpired
                                ? "danger"
                                : daysRemaining <= 7
                                ? "warning"
                                : "success"
                            }
                          >
                            {isExpired ? "Expired" : `${daysRemaining} days`}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={isExpired ? "secondary" : "primary"}>
                            {isExpired ? "Completed" : "Active"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              No CVs currently assigned to this station.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark text-white" : ""}>
          <Button
            variant={darkMode ? "outline-light" : "secondary"}
            onClick={() => setShowCVsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={
          stations.find((station) => station._id === stationToDelete)
            ?.stationName || "N/A"
        }
        darkMode={darkMode}
      />
    </div>
  );
};

export default AllRotationalStation;
