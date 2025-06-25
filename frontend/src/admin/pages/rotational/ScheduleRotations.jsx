import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Dropdown,
  Modal,
  Badge,
  Tooltip,
  OverlayTrigger,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";
import logo from "../../../assets/logo.png";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const ScheduleRotations = ({ darkMode }) => {
  const navigate = useNavigate();
  const [CVs, setCVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [view, setView] = useState("all"); 
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stations, setStations] = useState([]);
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [currentCV, setCurrentCV] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stationHistory, setStationHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Effect hooks
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (showNoSelectionAlert) {
      const timer = setTimeout(() => setShowNoSelectionAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNoSelectionAlert]);

  useEffect(() => {
    fetchData();
  }, [view]);

  // Helper functions
  const formatDate = (dateString, format = "local") => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    if (format === "ddmmyyyy") {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return date.toLocaleDateString();
  };

  const formatDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set both dates to midnight to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate difference in days (inclusive of both dates)
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;

    return [
      weeks > 0 && `${weeks} week${weeks !== 1 ? "s" : ""}`,
      remainingDays > 0 &&
        `${remainingDays} day${remainingDays !== 1 ? "s" : ""}`,
    ]
      .filter(Boolean)
      .join(" and ");
  };

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      let endpoint;

      switch (view) {
        case "all":
          endpoint = "/rotational/all-rotational";
          break;
        case "pending":
        case "unassigned":
        case "assigned":
          endpoint = `/rotational/${view}-rotational`;
          break;
        default:
          endpoint = "/rotational/all-rotational";
      }

      const [cvResponse, stationsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}${endpoint}`),
        axios.get(`${API_BASE_URL}/stations/all-stations`),
      ]);

      const processCV = (cv) => {
        const currentAssignment =
          cv.rotationalAssignment?.assignedStations?.find((as) => as.isCurrent);

        return {
          ...cv,
          currentAssignment,
          hasPreviousAssignments:
            cv.rotationalAssignment?.assignedStations?.length > 0,
          isPending: cv.rotationalAssignment?.status === "station-not-assigned",
          isUnassigned:
            !currentAssignment &&
            cv.rotationalAssignment?.status === "station-assigned",
        };
      };

      setCVs(cvResponse.data.map(processCV));
      setStations(stationsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleCVSelection = (cvId) => {
    setSelectedCVs((prev) =>
      prev.includes(cvId) ? prev.filter((id) => id !== cvId) : [...prev, cvId]
    );
  };

  const handleAssignButtonClick = () => {
    if (selectedCVs.length === 0) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowAssignModal(true);
  };

  const handleRotateCVs = () => {
    if (selectedCVs.length === 0) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowReassignModal(true);
    setCurrentCV(null); // Indicates this is a bulk operation
  };

  const handleDeleteCV = async (cvId) => {
    if (window.confirm("Are you sure you want to delete this CV?")) {
      try {
        await axios.delete(`${API_BASE_URL}/cvs/${cvId}`);
        setSuccessMessage("CV deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting CV:", error);
        setError("Failed to delete CV. Please try again.");
      }
    }
  };

  const handleStartDateChange = (e) => {
    const selectedStartDate = e.target.value;
    setStartDate(selectedStartDate);

    if (selectedStation) {
      const selectedStationData = stations.find(
        (station) => station._id === selectedStation
      );
      if (selectedStationData?.timePeriod) {
        const start = new Date(selectedStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + selectedStationData.timePeriod * 7 - 1);
        const endDateStr = end.toISOString().split("T")[0];
        setEndDate(endDateStr);
      }
    }
  };

  const handleStationSelection = (stationId) => {
    const selectedStationData = stations.find(
      (station) => station._id === stationId
    );
    if (selectedStationData) {
      setSelectedStation(stationId);
      if (startDate && selectedStationData.timePeriod) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + selectedStationData.timePeriod * 7 - 1);
        const endDateStr = end.toISOString().split("T")[0];
        setEndDate(endDateStr);
      }
    }
  };

  const handleAssignCV = (cv) => {
    setCurrentCV(cv);
    setShowAssignModal(true);
    setSelectedStation("");
    setStartDate("");
    setEndDate("");
    setError("");
    setSuccessMessage("");
  };

  const handleAssignCVs = async () => {
    if (!selectedStation || !startDate || !endDate) {
      setError("Please select a station and valid dates.");
      return;
    }

    try {
      const assigningCVs = currentCV ? [currentCV._id] : selectedCVs;
      if (assigningCVs.length === 0) {
        setError("No CVs selected for assignment");
        return;
      }

      setAssigning(true);
      setError("");
      setSuccessMessage("");

      const response = await axios.post(
        `${API_BASE_URL}/rotational/assign-to-station`,
        {
          cvIds: assigningCVs,
          stationId: selectedStation,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status: "station-assigned",
        }
      );

      setSuccessMessage(
        `Successfully assigned ${assigningCVs.length} CV${
          assigningCVs.length > 1 ? "s" : ""
        } to station`
      );

      // Refresh data immediately
      await fetchData();

      // Close modal and reset states after slight delay
      setTimeout(() => {
        setShowAssignModal(false);
        setAssigning(false);
        resetAssignmentForm();
      }, 1000);
    } catch (error) {
      setAssigning(false);
      console.error("Assignment Error:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to complete assignment. Please try again.";

      setError(errorMessage);
    }
  };

  const handleReassignCV = async () => {
    if (!selectedStation || !startDate || !endDate) {
      setError("All fields are required.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccessMessage("");

      // Determine if we're doing bulk or single reassignment
      const cvIds = currentCV ? [currentCV._id] : selectedCVs;

      // First remove from current stations
      const currentDate = new Date().toISOString().split("T")[0];
      await Promise.all(
        cvIds.map((cvId) =>
          axios.delete(
            `${API_BASE_URL}/rotational/remove-from-station/${cvId}`,
            { data: { endDate: currentDate } }
          )
        )
      );

      // Then assign to new station
      const response = await axios.post(
        `${API_BASE_URL}/rotational/assign-to-station`,
        {
          cvIds,
          stationId: selectedStation,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status: "station-assigned",
        }
      );

      setSuccessMessage(
        `Successfully rotated ${cvIds.length} CV${
          cvIds.length > 1 ? "s" : ""
        } to new station`
      );

      // Refresh data and reset states
      await fetchData();
      setShowReassignModal(false);
      setSelectedCVs([]);
      resetAssignmentForm();
    } catch (error) {
      setAssigning(false);
      console.error("Error rotating CVs:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to rotate CVs. Please try again."
      );
    } finally {
      setAssigning(false);
    }
  };
  // Helper function to reset form
  const resetAssignmentForm = () => {
    setSelectedStation("");
    setStartDate("");
    setEndDate("");
    setCurrentCV(null);
    if (!currentCV) {
      setSelectedCVs([]);
    }
  };

  const handleRemoveFromStation = async (cvId) => {
    try {
      if (
        !window.confirm(
          "Are you sure you want to remove this CV from its current station?"
        )
      ) {
        return;
      }

      const currentDate = new Date().toISOString();
      const response = await axios.delete(
        `${API_BASE_URL}/rotational/remove-from-station/${cvId}`,
        { data: { endDate: currentDate } }
      );

      setSuccessMessage(
        response.data.message || "CV removed from station successfully!"
      );

      // Force a complete refresh of the data
      setLoading(true);
      await fetchData();
      setLoading(false);
    } catch (error) {
      console.error("Error removing CV:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.details ||
          "Failed to remove CV from station. Please try again."
      );
    }
  };
  // Helper function to format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleSubmitReassignment = async () => {
    if (!currentCV || !selectedStation || !startDate || !endDate) {
      setError("All fields are required.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/rotational/reassign-cv`, {
        cvId: currentCV._id,
        newStationId: selectedStation,
        newStartDate: startDate,
        newEndDate: endDate,
      });
      setSuccessMessage("CV reassigned successfully!");
      fetchData();
      setShowReassignModal(false);
      setCurrentCV(null);
    } catch (error) {
      console.error("Error reassigning CV:", error);
      setError(error.response?.data?.error || "Failed to reassign CV.");
    }
  };

  const handleViewHistory = async (cvId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/rotational/assignment-history/${cvId}`
      );

      // Process the response data to match what your frontend expects
      const history = response.data.map((assignment, index, arr) => {
        const isCurrent = assignment.isCurrent || false;
        return {
          station: assignment.station,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          isCurrent,
          duration: formatDuration(assignment.startDate, assignment.endDate),
        };
      });

      setStationHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to load station history. Please try again.");
    }
  };

  const renderStationsTooltip = (cv) => {
    if (
      !cv.rotationalAssignment?.assignedStations ||
      cv.rotationalAssignment.assignedStations.length === 0
    ) {
      return "No station history available";
    }

    const assignmentsToShow = cv.currentAssignment
      ? cv.rotationalAssignment.assignedStations.filter((as) => !as.isCurrent)
      : cv.rotationalAssignment.assignedStations;

    if (assignmentsToShow.length === 0) {
      return cv.currentAssignment
        ? "Currently assigned (no previous stations)"
        : "No station history";
    }

    return (
      <div>
        {assignmentsToShow.map((assignment, index) => (
          <div key={index}>
            <strong>
              {assignment.station?.stationName || "Unknown Station"}
            </strong>
            <br />
            Dates: {formatDate(assignment.startDate, "ddmmyyyy")} -{" "}
            {formatDate(assignment.endDate, "ddmmyyyy")}
            <br />
            Duration: {formatDuration(assignment.startDate, assignment.endDate)}
            <br />
            Status: <Badge bg="secondary">Past</Badge>
            {index < assignmentsToShow.length - 1 && <hr />}
          </div>
        ))}
      </div>
    );
  };
  const processCV = (cv) => {
    const currentAssignment = cv.rotationalAssignment?.assignedStations?.find(
      (as) => as.isCurrent
    );

    return {
      ...cv,
      currentAssignment,

      hasPreviousAssignments:
        cv.rotationalAssignment?.assignedStations?.length > 0,
      isPending: cv.rotationalAssignment?.status === "station-not-assigned",
      isUnassigned:
        !currentAssignment &&
        cv.rotationalAssignment?.status === "station-assigned", // This will be true after removal
    };
  };
  // Filter CVs based on search term
  const filteredCVs = CVs.filter((cv) => {
    const matchesSearch =
      (cv.nic && cv.nic.toLowerCase().includes(searchTerm)) ||
      (cv.fullName && cv.fullName.toLowerCase().includes(searchTerm));

    if (view === "pending") {
      return matchesSearch && cv.isPending;
    } else if (view === "unassigned") {
      return matchesSearch && cv.isUnassigned;
    } else if (view === "assigned") {
      return matchesSearch && cv.currentAssignment;
    }
    return matchesSearch;
  });

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      <Container className="text-center mt-4 mb-3">
        <img
          src={logo}
          alt="Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">SCHEDULE ROTATIONS</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <div className="d-flex align-items-center">
            <Dropdown className="me-3">
              <Dropdown.Toggle variant="primary">
                {view === "all"
                  ? "All Rotational CVs"
                  : view === "pending"
                  ? "Pending CVs"
                  : view === "unassigned"
                  ? "Unassigned CVs"
                  : "Assigned CVs"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setView("all")}>
                  All Rotational CVs
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setView("pending")}>
                  Pending CVs (Never Assigned)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setView("unassigned")}>
                  Unassigned CVs (Currently Available)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setView("assigned")}>
                  Currently Assigned CVs
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Form.Control
              type="text"
              placeholder="Search by NIC or Name"
              value={searchTerm}
              onChange={handleSearch}
              className={darkMode ? "bg-dark text-white border-secondary" : ""}
              style={{ width: "150px",fontSize:"12px" }}
            />
          </div>
          <div className="d-flex">
            {(view === "unassigned" || view === "pending") && (
              <Button
                variant="success"
                onClick={handleAssignButtonClick}
                className="me-2"
              >
                Assign Selected CVs
              </Button>
            )}
            {view === "assigned" && (
              <Button variant="primary" onClick={handleRotateCVs}>
                Rotate Selected CVs
              </Button>
            )}
          </div>
        </div>

        {showNoSelectionAlert && (
          <Alert
            variant="warning"
            dismissible
            onClose={() => setShowNoSelectionAlert(false)}
          >
            Please select at least one CV.
          </Alert>
        )}
        {successMessage && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <div className="table-responsive">
          <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
            <thead>
              <tr>
                {/* Select column for all views except 'all' */}
                {view !== "all" && <th>Select</th>}
                <th>Ref. No.</th>
                <th>NIC</th>
                <th>Full Name</th>
                <th>Intern Type</th>
                <th>Current Station</th>
                {view === "assigned" && (
                  <>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </>
                )}
                <th>Previous Stations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={view === "assigned" ? 10 : view !== "all" ? 9 : 7}
                    className="text-center"
                  >
                    <Spinner animation="border" /> Loading...
                  </td>
                </tr>
              ) : filteredCVs.length > 0 ? (
                filteredCVs.map((cv) => (
                  <tr key={cv._id}>
                    {/* Select checkbox for all views except 'all' */}
                    {view !== "all" && (
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedCVs.includes(cv._id)}
                          onChange={() => handleCVSelection(cv._id)}
                        />
                      </td>
                    )}

                    <td>{cv.refNo || "N/A"}</td>
                    <td>{cv.nic || "N/A"}</td>
                    <td>{cv.fullName || "N/A"}</td>
                    <td>{cv.selectedRole || "N/A"}</td>
                    <td>
                      {cv.currentAssignment?.station?.stationName ||
                        "Not Assigned"}
                    </td>

                    {view === "assigned" && (
                      <>
                        <td>
                          {cv.currentAssignment?.startDate
                            ? formatDate(cv.currentAssignment.startDate)
                            : "N/A"}
                        </td>
                        <td>
                          {cv.currentAssignment?.endDate
                            ? formatDate(cv.currentAssignment.endDate)
                            : "N/A"}
                        </td>
                      </>
                    )}

                    <td>
                      {cv.hasPreviousAssignments ? (
                        <OverlayTrigger
                          placement="left"
                          overlay={
                            <Tooltip id={`tooltip-${cv._id}`}>
                              {renderStationsTooltip(cv)}
                            </Tooltip>
                          }
                        >
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleViewHistory(cv._id)}
                          >
                            View History
                          </Button>
                        </OverlayTrigger>
                      ) : (
                        "None"
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/view-cv/${cv._id}`)}
                        >
                          View/Edit
                        </Button>
                        {view !== "assigned" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCV(cv._id)}
                          >
                            Delete
                          </Button>
                        )}
                        {view === "assigned" && (
                          <>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleReassignCV(cv)}
                            >
                              Reassign
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveFromStation(cv._id)}
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={view === "assigned" ? 10 : view !== "all" ? 9 : 7}
                    className="text-center"
                  >
                    No CVs found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Container>

      {/* Assign CVs Modal */}
      <Modal
        show={showAssignModal}
        onHide={() => {
          if (!assigning) {
            setShowAssignModal(false);
            setError("");
          }
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentCV
              ? `Assign CV (${currentCV.fullName})`
              : view === "assigned"
              ? `Rotate ${selectedCVs.length} CVs`
              : `Assign ${selectedCVs.length} CVs`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage && (
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

          <Form.Group>
            <Form.Label>Select Station</Form.Label>
            <Form.Control
              as="select"
              value={selectedStation}
              onChange={(e) => handleStationSelection(e.target.value)}
            >
              <option value="">Select a station</option>
              {stations.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.stationName} ({station.timePeriod} weeks)
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split("T")[0]}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control type="date" value={endDate} readOnly />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAssignModal(false)}
            disabled={assigning}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignCVs}
            disabled={assigning || !selectedStation}
          >
            {assigning ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" />
                <span className="ms-2">
                  {view === "assigned" ? "Rotating..." : "Assigning..."}
                </span>
              </>
            ) : view === "assigned" ? (
              "Rotate"
            ) : (
              "Assign"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reassign CV Modal */}
      <Modal
        show={showReassignModal}
        onHide={() => {
          setShowReassignModal(false);
          setError("");
          setCurrentCV(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reassign CV to New Station</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

          {currentCV && (
            <div className="mb-3">
              <h6>CV Details:</h6>
              <p className="mb-1">
                <strong>Name:</strong> {currentCV.fullName}
              </p>
              <p className="mb-1">
                <strong>NIC:</strong> {currentCV.nic}
              </p>
              <p className="mb-1">
                <strong>Current Station:</strong>{" "}
                {currentCV.currentAssignment?.station?.stationName || "N/A"}
              </p>
            </div>
          )}

          <Form.Group>
            <Form.Label>Select New Station</Form.Label>
            <Form.Control
              as="select"
              value={selectedStation}
              onChange={(e) => handleStationSelection(e.target.value)}
            >
              <option value="">Select a station</option>
              {stations.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.stationName} ({station.timePeriod} weeks)
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control type="date" value={endDate} readOnly />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowReassignModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitReassignment}>
            Reassign
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Station History Modal */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Station Assignment History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Station</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stationHistory.map((assignment, index) => (
                <tr
                  key={index}
                  style={
                    assignment.isCurrent
                      ? {
                          backgroundColor: darkMode ? "#2a6b9e" : "#cfe8ff",
                          fontWeight: "bold",
                        }
                      : {}
                  }
                >
                  <td>{index + 1}</td>
                  <td>
                    {assignment.station?.stationName || "Unknown Station"}
                  </td>
                  <td>{formatDate(assignment.startDate, "ddmmyyyy")}</td>
                  <td>{formatDate(assignment.endDate, "ddmmyyyy")}</td>
                  <td>{assignment.duration}</td>
                  <td>
                    <Badge bg={assignment.isCurrent ? "success" : "secondary"}>
                      {assignment.isCurrent ? "Current" : "Past"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {stationHistory.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">
                    No assignment history found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowHistoryModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScheduleRotations;
