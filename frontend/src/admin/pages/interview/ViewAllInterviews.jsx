import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from "react-icons/fa";
import axios from "axios";
import logo from "../../../assets/logo.png";
import ConfirmDeleteModal from "../../../components/notifications/ConfirmDeleteModal";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/interviews`;

const ViewAllInterviews = ({ darkMode }) => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(""); // State for filter
  const itemsPerPage = 20;

  // Fetch all interviews from the backend
  const fetchInterviews = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setInterviews(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      setError("Failed to load interviews. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Handle delete interview
  const handleDelete = async () => {
    if (!interviewToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/${interviewToDelete}`);
      setInterviews(interviews.filter((i) => i._id !== interviewToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting interview:", error);
      setError("Failed to delete interview.");
    }
  };

  // Filtered interviews based on Interview Name (as per your backend schema)
  const filteredInterviews = interviews.filter((interview) =>
    interview.interviewName.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const indexOfLastInterview = currentPage * itemsPerPage;
  const indexOfFirstInterview = indexOfLastInterview - itemsPerPage;
  const currentInterviews = filteredInterviews.slice(
    indexOfFirstInterview,
    indexOfLastInterview
  );

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
        <h3 className="mt-3">VIEW ALL INTERVIEWS</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <h5 className="mb-3">
          <FaCalendarCheck
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          All Interviews
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Interview Name Filter and Buttons */}
        <div className="d-flex flex-wrap justify-content-between mb-3">
          {/* Filter Section */}
          <Form.Group
            className="mb-0"
            style={{ maxWidth: "300px", flex: "1 1 100%" }}
          >
            <Form.Control
              type="text"
              placeholder="Filter by Interview Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Form.Group>

          {/* Buttons for Adding and Scheduling Interviews */}
          <div className="d-flex flex-wrap justify-content-left align-items-center mt-2 mt-sm-0">
            <Button
              variant="primary"
              onClick={() => navigate("/add-new-interview")}
              className="mx-0 mb-2 mb-sm-0"
            >
              Add New Interview
            </Button>
            <Button
              variant="success"
              onClick={() => navigate("/schedule-interview")}
              className="mx-0 mb-2 mb-sm-0"
            >
              Schedule Interview
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading interviews...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
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
                <th>Interview Name</th>
                <th>Interview Date</th>
                <th>Interview Time</th>
                <th>Location</th>
                <th>View</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentInterviews.length > 0 ? (
                currentInterviews.map((interview, index) => (
                  <tr key={interview._id}>
                    <td>{indexOfFirstInterview + index + 1}</td>
                    <td>{interview.interviewName || "N/A"}</td>
                    <td>{interview.interviewDate || "N/A"}</td>
                    <td>{interview.interviewTime || "N/A"}</td>
                    <td>{interview.location || "N/A"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          navigate(`/view-interview/${interview._id}`)
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
                          navigate(`/edit-interview/${interview._id}`)
                        }
                        className="fw-semibold"
                      >
                        Edit
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          setShowDeleteModal(true);
                          setInterviewToDelete(interview._id);
                        }}
                        className="fw-semibold"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No Interviews found
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer */}
            <tfoot>
              <tr>
                <td colSpan={8} style={{ padding: "5px", fontSize: "14px" }}>
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ minHeight: "30px" }}
                  >
                    <div className="flex-grow-1 text-center">
                      <span>
                        {currentInterviews.length} of{" "}
                        {filteredInterviews.length} Interview(s) shown
                      </span>
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
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        refNo={
          interviews.find((i) => i._id === interviewToDelete)?.interviewName ||
          "N/A"
        }
        darkMode={darkMode}
      />
    </div>
  );
};

export default ViewAllInterviews;
