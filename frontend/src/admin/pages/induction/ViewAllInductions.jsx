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

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/inductions`;

const ViewAllInductions = ({ darkMode }) => {
  const navigate = useNavigate();
  const [inductions, setInductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inductionToDelete, setInductionToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const itemsPerPage = 20;

  const fetchInductions = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setInductions(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inductions:", error);
      setError("Failed to load inductions. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInductions();
  }, []);

  // Handle confirm delete modal
  const confirmDelete = (inductionId) => {
    setInductionToDelete(inductionId);
    setShowDeleteModal(true);
  };

  // Handle cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setInductionToDelete(null);
  };

  // Handle delete induction
  const handleDelete = async () => {
    if (!inductionToDelete) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/${inductionToDelete}`);

      // Update the state after successful deletion
      setInductions(inductions.filter((i) => i._id !== inductionToDelete));
      setShowDeleteModal(false);
      setInductionToDelete(null);
      setLoading(false);
    } catch (error) {
      console.error("Error deleting induction:", error);
      setError("Failed to delete induction. Please try again.");
      setLoading(false);
    }
  };

  // Filter inductions based on Induction Name
  const filteredInductions = inductions.filter((induction) =>
    induction.induction.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredInductions.length / itemsPerPage);
  const indexOfLastInduction = currentPage * itemsPerPage;
  const indexOfFirstInduction = indexOfLastInduction - itemsPerPage;
  const currentInductions = filteredInductions.slice(
    indexOfFirstInduction,
    indexOfLastInduction
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
        <h3 className="mt-3">VIEW ALL INDUCTIONS</h3>
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
          All Inductions
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Induction Name Filter and Buttons */}
        <div className="d-flex flex-wrap justify-content-between mb-3">
          {/* Filter Section */}
          <Form.Group
            className="mb-0"
            style={{ maxWidth: "300px", flex: "1 1 100%" }}
          >
            <Form.Control
              type="text"
              placeholder="Filter by Induction Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Form.Group>

          {/* Buttons for Adding and Scheduling Inductions */}
          <div className="d-flex flex-wrap justify-left align-items-center mt-2 mt-sm-0">
            <Button
              variant="primary"
              onClick={() => navigate("/add-new-induction")}
              className="mx-1 mb-2 mb-sm-0"
            >
              Add New Induction
            </Button>
            <Button
              variant="success"
              onClick={() => navigate("/induction-results")}
              className="mx-1 mb-2 mb-sm-0"
            >
              Induction Results
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading inductions...</p>
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
                <th>Induction Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Location</th>
                <th>View</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentInductions.length > 0 ? (
                currentInductions.map((induction, index) => (
                  <tr key={induction._id}>
                    <td>{indexOfFirstInduction + index + 1}</td>
                    <td>{induction.induction || "N/A"}</td>
                    <td>{induction.startDate || "N/A"}</td>
                    <td>{induction.endDate || "N/A"}</td>
                    <td>{induction.location || "N/A"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          navigate(`/view-induction/${induction._id}`)
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
                          navigate(`/edit-induction/${induction._id}`)
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
                        onClick={() => confirmDelete(induction._id)}
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
                    No Inductions found
                  </td>
                </tr>
              )}
            </tbody>

            {/* Pagination Footer */}
            <tfoot>
              <tr>
                <td colSpan={8} style={{ padding: "5px", fontSize: "14px" }}>
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ minHeight: "30px" }}
                  >
                    <div className="flex-grow-1 text-center">
                      {currentInductions.length} of {filteredInductions.length}{" "}
                      Induction(s) shown
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
          inductions.find((i) => i._id === inductionToDelete)?.induction ||
          "N/A"
        }
        darkMode={darkMode}
      />
    </div>
  );
};

export default ViewAllInductions;
