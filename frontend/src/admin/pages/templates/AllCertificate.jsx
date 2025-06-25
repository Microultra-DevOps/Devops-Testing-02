import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/logo.png";
import { Container, Form, Button, Table, Spinner, Alert } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from "react-icons/fa";
import axios from "axios";
import DeleteModal from "../../../components/notifications/DeleteModal";
import Notification from "../../../components/notifications/Notification";

const AllCertificate = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [certificates, setCertificates] = useState([]);
  const certificatesPerPage = 5;
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Fetch certificates data
  const refetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/interncertificates`);
      console.log("Fetched Certificates:", response.data);
      setCertificates(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchCertificates();
  }, [location.state?.refresh]);

  // Handle delete certificate
  const handleDeleteClick = (certificate) => {
    setCertificateToDelete(certificate);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!certificateToDelete) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/interncertificates/${certificateToDelete._id}`);
      setShowDeleteModal(false);
      
      // Show success notification
      setNotificationMessage("Certificate deleted successfully");
      setNotificationType("success");
      setShowNotification(true);
      
      // Refresh certificate list
      refetchCertificates();
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error("Error deleting certificate:", error);
      
      // Show error notification
      setNotificationMessage(error.response?.data?.error || "Failed to delete certificate");
      setNotificationType("danger");
      setShowNotification(true);
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };

  // Filter certificates based on search text
  const filteredCertificates = certificates.filter((certificate) =>
    certificate.certificateName?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCertificates.length / certificatesPerPage);
  const indexOfLastCertificate = currentPage * certificatesPerPage;
  const indexOfFirstCertificate = indexOfLastCertificate - certificatesPerPage;
  const currentCertificates = filteredCertificates.slice(
    indexOfFirstCertificate,
    indexOfLastCertificate
  );

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ALL CERTIFICATES</h3>
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
          All Certificates
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        <div className="d-flex flex-wrap justify-content-between mb-3">
          {/* Search Section */}
          <Form.Group className="mb-0" style={{ maxWidth: "300px", flex: "1 1 100%" }}>
            <Form.Control
              type="text"
              placeholder="Search by Name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex flex-wrap justify-content-end align-items-center mt-2 mt-sm-0">
            <Button variant="primary" onClick={() => navigate("/add-certificate")} className="mx-0 mb-2 mb-sm-0">
              New Certificate
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
                <th>Certificate Name</th>
                <th>View</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentCertificates.length > 0 ? (
                currentCertificates.map((certificate, index) => (
                  <tr key={certificate._id}>
                    <td>{index + 1}</td>
                    <td>{certificate.certificateName || "N/A"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/view-certificate/${certificate._id}`)}
                        className="fw-semibold"
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/edit-certificate/${certificate._id}`)}
                        className="fw-semibold"
                      >
                        Edit
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(certificate)}
                        className="fw-semibold"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Certificate(s) found
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer */}
            <tfoot>
              <tr>
                <td colSpan={5} style={{ padding: "5px", fontSize: "14px" }}>
                  <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                    <div className="flex-grow-1 text-center">
                      <span>
                        {currentCertificates.length} of {filteredCertificates.length} Certificate(s) shown
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
        itemName={certificateToDelete?.certificateName || "this certificate"}
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

export default AllCertificate;
