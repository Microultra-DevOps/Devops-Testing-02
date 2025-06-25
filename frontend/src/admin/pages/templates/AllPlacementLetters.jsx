import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/logo.png";
import { Container, Form, Button, Table, Spinner, Alert } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from "react-icons/fa";
import axios from "axios";
import DeleteModal from "../../../components/notifications/DeleteModal";
import Notification from "../../../components/notifications/Notification";

const AllPlacementLetters = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [letters, setLetters] = useState([]);
  const lettersPerPage = 5;

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Fetch placement letter data
  const refetchLetters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/letters`);
      console.log("Fetched Placement Letters:", response.data);
      setLetters(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch letters");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    refetchLetters();
  }, [location.state?.refresh]);

  // Handle delete letters
  const handleDeleteClick = (letter) => {
    setLetterToDelete(letter);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!letterToDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/letters/${letterToDelete._id}`);
      setShowDeleteModal(false);

      // Show success notification
      setNotificationMessage("Placement Letter deleted successfully");
      setNotificationType("success");
      setShowNotification(true);

      // Refresh placement letter list
      refetchLetters();

      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error("Error deleting letter:", error);

      // Show error notification
      setNotificationMessage(error.response?.data?.error || "Failed to delete letter");
      setNotificationType("danger");
      setShowNotification(true);

      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };

  // Filter placement letter based on search text
  const filteredLetters = letters.filter((letter) =>
    letter.letterName?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredLetters.length / lettersPerPage);
  const indexOfLastLetter = currentPage * lettersPerPage;
  const indexOfFirstLetter = indexOfLastLetter - lettersPerPage;
  const currentLetters = filteredLetters.slice(indexOfFirstLetter, indexOfLastLetter);

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ALL PLACEMENT LETTERS</h3>
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
          <FaCalendarCheck className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
          All Placement Letters
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        <div className="d-flex flex-wrap justify-content-between mb-3">
          {/* Filter Section */}
          <Form.Group className="mb-0" style={{ maxWidth: "300px", flex: "1 1 100%" }}>
            <Form.Control
              type="text"
              placeholder="Filter by Name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex flex-wrap justify-content-end align-items-center mt-2 mt-sm-0">
            <Button variant="primary" onClick={() => navigate("/add-new-placement-letter")} className="mx-0 mb-2 mb-sm-0">
              New Letter
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading data(s)...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Letter Name</th>
                <th>View</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentLetters.length > 0 ? (
                currentLetters.map((letter, index) => (
                  <tr key={letter._id}>
                    <td>{index + 1}</td>
                    <td>{letter.letterName || "N/A"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/view-placement-letter/${letter._id}`)}
                        className="fw-semibold"
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/edit-placement-letter/${letter._id}`)}
                        className="fw-semibold"
                      >
                        Edit
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(letter)}
                        className="fw-semibold"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="20" className="text-center">
                    No Placement Letter(s) found
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer */}
            <tfoot>
              <tr>
                <td colSpan={20} style={{ padding: "5px", fontSize: "14px" }}>
                  <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                    <div className="flex-grow-1 text-center">
                      <span>
                        {currentLetters.length} of {filteredLetters.length} Placement Letter(s) shown
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
                      >
                        <FaChevronLeft />
                        <FaChevronLeft />
                      </Button>
                      <span className="mx-2">Page {currentPage} of {totalPages}</span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
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

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteConfirm}
        itemName={letterToDelete?.letterName || "this letter"}
        darkMode={darkMode}
      />

      {/* Notification */}
      <Notification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        message={notificationMessage}
        variant={notificationType}
      />
    </div>
  );
};

export default AllPlacementLetters;