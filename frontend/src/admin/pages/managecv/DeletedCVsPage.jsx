import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {Table, Button, Container, Spinner, Alert, Form, Row, Col, Modal, Badge, Card,} from "react-bootstrap";
import { FaChevronLeft,  FaChevronRight,  FaTrash,  FaUndo,  FaEye, FaExclamationTriangle, FaInfoCircle} from "react-icons/fa";
import logo from "../../../assets/logo.png";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const DeletedCVsPage = ({ darkMode = false }) => {
  const [deletedCVs, setDeletedCVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  // Modal states
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  // Validate MongoDB ObjectId
  const isValidMongoId = (id) => {
    return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Fetch deleted CVs from API
  const fetchDeletedCVs = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/cvs/deleted/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: page,
            limit: itemsPerPage,
          },
        }
      );

      if (response.status === 200) {
        const { deletedCVs: cvs, pagination } = response.data;
        setDeletedCVs(Array.isArray(cvs) ? cvs : []);
        setTotalPages(pagination?.totalPages || 1);
        setTotalItems(pagination?.totalItems || 0);
        setCurrentPage(pagination?.currentPage || 1);
        setError("");
      } else {
        setError("Unexpected response format from the server.");
      }
    } catch (error) {
      console.error("Error fetching deleted CVs:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(error.response?.data?.message || "Failed to fetch deleted CVs. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedCVs(currentPage);
  }, [currentPage]);

  // Filter CVs based on search term
  const filteredCVs = deletedCVs.filter((cv) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (cv.fullName || "").toLowerCase().includes(searchLower) ||
      (cv.refNo || "").toLowerCase().includes(searchLower) ||
      (cv.nic || "").toLowerCase().includes(searchLower) ||
      (cv.deletionInfo?.adminName || "").toLowerCase().includes(searchLower) ||
      (cv.deletionInfo?.deletionReason || "").toLowerCase().includes(searchLower)
    );
  });

  // Handle restore CV
  const handleRestore = async () => {
    if (!selectedCV || !isValidMongoId(selectedCV._id)) {
      alert("Invalid CV selected for restoration");
      return;
    }

    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/cvs/deleted/${selectedCV._id}/restore`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        // Remove the restored CV from the list
        setDeletedCVs(prevCVs => prevCVs.filter(cv => cv._id !== selectedCV._id));
        setTotalItems(prev => prev - 1);
        
        alert(`CV restored successfully!

Restored CV Details:
- Ref No: ${response.data.restoredCV?.refNo || selectedCV.refNo || 'N/A'}
- Name: ${response.data.restoredCV?.fullName || selectedCV.fullName || 'N/A'}

The CV has been restored and is now available in the main CV list.`);
        
        // Refresh the page if we're on the last page and it becomes empty
        if (filteredCVs.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchDeletedCVs(currentPage);
        }
      } else {
        alert("Failed to restore CV. Please try again.");
      }
    } catch (error) {
      console.error("Error restoring CV:", error);
      
      let errorMessage = "Failed to restore CV. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "CV not found or may have already been restored.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(false);
      setShowRestoreModal(false);
      setSelectedCV(null);
    }
  };

  // Handle permanent delete
  const handlePermanentDelete = async () => {
    if (!selectedCV || !isValidMongoId(selectedCV._id)) {
      alert("Invalid CV selected for deletion");
      return;
    }

    if (confirmText !== "PERMANENTLY_DELETE") {
      alert("Please type 'PERMANENTLY_DELETE' to confirm");
      return;
    }

    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/cvs/deleted/${selectedCV._id}/permanent`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            confirmDelete: "PERMANENTLY_DELETE"
          }
        }
      );

      if (response.status === 200) {
        // Remove the permanently deleted CV from the list
        setDeletedCVs(prevCVs => prevCVs.filter(cv => cv._id !== selectedCV._id));
        setTotalItems(prev => prev - 1);
        
        alert(`CV permanently deleted!

Deleted CV Details:
- Ref No: ${response.data.deletedCV?.refNo || selectedCV.refNo || 'N/A'}
- Name: ${response.data.deletedCV?.fullName || selectedCV.fullName || 'N/A'}

⚠️ This action cannot be undone. The CV has been permanently removed from the system.`);
        
        // Refresh the page if we're on the last page and it becomes empty
        if (filteredCVs.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchDeletedCVs(currentPage);
        }
      } else {
        alert("Failed to permanently delete CV. Please try again.");
      }
    } catch (error) {
      console.error("Error permanently deleting CV:", error);
      
      let errorMessage = "Failed to permanently delete CV. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "CV not found or may have already been permanently deleted.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(false);
      setShowPermanentDeleteModal(false);
      setSelectedCV(null);
      setConfirmText("");
    }
  };

  // Format deletion reason for display
  const formatDeletionReason = (reason) => {
    if (!reason) return "N/A";
    return reason.replace(/_/g, ' ').toUpperCase();
  };

  // Get deletion reason badge class
  const getDeletionReasonBadgeClass = (reason) => {
    switch (reason?.toLowerCase()) {
      case "duplicate_entry":
        return "bg-warning";
      case "incorrect_information":
        return "bg-info";
      case "request_by_applicant":
        return "bg-primary";
      case "admin_decision":
        return "bg-secondary";
      case "system_cleanup":
        return "bg-dark";
      default:
        return "bg-light text-dark";
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Render main content
  if (loading) {
    return (
      <div
        className={`d-flex flex-column min-vh-100 justify-content-center align-items-center ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
        <p className="mt-3">Loading deleted CVs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`d-flex flex-column min-vh-100 ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <Container className="text-center mt-4">
          <Alert variant="danger">
            <h5>Error Loading Deleted CVs</h5>
            <p>{error}</p>
            <Button 
              variant="outline-danger" 
              onClick={() => fetchDeletedCVs(currentPage)}
            >
              Retry
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

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
                onError={(e) => {
                e.target.style.display = 'none';
                }}
            />
         <h3 className="mt-3">DELETED CVs REVIEW</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        {/* Header with info */}
        <Card className={`mb-4 ${darkMode ? 'bg-secondary text-white' : 'bg-light'}`}>
          <Card.Body>
            <div className="d-flex align-items-center">
              <div>
                <h6 className="mb-1">Deleted CVs Management</h6>
                <small className="text-muted">
                  Review and manage soft-deleted CVs. You can restore CVs back to the main system or permanently delete them.
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Search and Navigation */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="searchInput">
              <Form.Label>Search Deleted CVs</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by name, ref no, NIC, admin name, or deletion reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-end justify-content-end">
            <Button
              variant="outline-primary"
              onClick={() => navigate("/view-all-cvs")}
              className="me-2"
            >
              <FaEye className="me-1" />
              View Active CVs
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => fetchDeletedCVs(currentPage)}
            >
              Refresh
            </Button>
          </Col>
        </Row>

        {/* Summary */}
        <Row className="mb-3">
          <Col>
            <Alert variant={darkMode ? "dark" : "light"} className="border">
              <strong>Summary:</strong> {totalItems} deleted CV(s) found
              {searchTerm && ` (${filteredCVs.length} matching search)`}
            </Alert>
          </Col>
        </Row>

        {/* CVs Table */}
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
                <th>Deleted Date</th>
                <th>Deleted By</th>
                <th>Employee ID</th>
                <th>Deletion Reason</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCVs.length > 0 ? (
                filteredCVs.map((cv, index) => (
                  <tr key={cv._id || index}>
                    <td>{((currentPage - 1) * itemsPerPage) + index + 1}</td>
                    <td>{cv.refNo || "N/A"}</td>
                    <td className="fw-semibold">{cv.fullName || "N/A"}</td>
                    <td>{cv.nic || "N/A"}</td>
                    <td>
                      {cv.deletionInfo?.deletedDate
                        ? new Date(cv.deletionInfo.deletedDate).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>{cv.deletionInfo?.adminName || "N/A"}</td>
                    <td>{cv.deletionInfo?.employeeId || "N/A"}
                    </td>
                    <td>
                      <Badge 
                        className={getDeletionReasonBadgeClass(cv.deletionInfo?.deletionReason)}
                      >
                        {formatDeletionReason(cv.deletionInfo?.deletionReason)}
                      </Badge>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: "150px" }}>
                      {cv.deletionInfo?.deletionComments || "-"}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => {
                            setSelectedCV(cv);
                            setShowRestoreModal(true);
                          }}
                          title="Restore CV"
                        >
                          <FaUndo />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            setSelectedCV(cv);
                            setShowPermanentDeleteModal(true);
                          }}
                          title="Permanently Delete CV"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    {searchTerm 
                      ? "No deleted CVs found matching your search criteria" 
                      : "No deleted CVs found"}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="10" style={{ padding: "5px", fontSize: "14px" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1 text-center">
                      <span>
                        Showing {filteredCVs.length} of {totalItems} deleted CV(s)
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
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
                        onClick={() => handlePageChange(currentPage + 1)}
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
        </div>
      </Container>

      {/* Restore Confirmation Modal */}
      <Modal
        show={showRestoreModal}
        onHide={() => {
          setShowRestoreModal(false);
          setSelectedCV(null);
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className={darkMode ? "bg-dark text-white" : ""}>
          <Modal.Title>
            <FaUndo className="me-2 text-success" />
            Restore CV
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
          {selectedCV && (
            <div>
              <Alert variant="info">
                <FaInfoCircle className="me-2" />
                <strong>Restore CV Confirmation</strong>
              </Alert>
              
              <p>Are you sure you want to restore the following CV?</p>
              
              <Card className="mb-3">
                <Card.Body>
                  <Row>
                    <Col><strong>Ref No:</strong></Col>
                    <Col>{selectedCV.refNo || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col><strong>Name:</strong></Col>
                    <Col>{selectedCV.fullName || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col><strong>NIC:</strong></Col>
                    <Col>{selectedCV.nic || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col><strong>Deleted Date:</strong></Col>
                    <Col>
                      {selectedCV.deletionInfo?.deletedDate
                        ? new Date(selectedCV.deletionInfo.deletedDate).toLocaleString()
                        : "N/A"}
                    </Col>
                  </Row>
                  <Row>
                    <Col><strong>Deletion Reason:</strong></Col>
                    <Col>
                      <Badge className={getDeletionReasonBadgeClass(selectedCV.deletionInfo?.deletionReason)}>
                        {formatDeletionReason(selectedCV.deletionInfo?.deletionReason)}
                      </Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <p className="text-success">
                The CV will be restored and become available in the main CV list again.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark" : ""}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowRestoreModal(false);
              setSelectedCV(null);
            }}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleRestore}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Restoring...
              </>
            ) : (
              <>
                <FaUndo className="me-2" />
                Restore CV
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permanent Delete Confirmation Modal */}
      <Modal
        show={showPermanentDeleteModal}
        onHide={() => {
          setShowPermanentDeleteModal(false);
          setSelectedCV(null);
          setConfirmText("");
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className={darkMode ? "bg-dark text-white" : ""}>
          <Modal.Title>
            <FaExclamationTriangle className="me-2 text-danger" />
            Permanent Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
          {selectedCV && (
            <div>
              <Alert variant="danger">
                <FaExclamationTriangle className="me-2" />
                <strong>⚠️ DANGER: Permanent Deletion</strong>
              </Alert>
              
              <p className="text-danger fw-bold">
                This action CANNOT be undone! The CV will be permanently removed from the system.
              </p>
              
              <Card className="mb-3">
                <Card.Body>
                  <Row>
                    <Col><strong>Ref No:</strong></Col>
                    <Col>{selectedCV.refNo || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col><strong>Name:</strong></Col>
                    <Col>{selectedCV.fullName || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col><strong>NIC:</strong></Col>
                    <Col>{selectedCV.nic || "N/A"}</Col>
                  </Row>
                  <Row>
                    <Col><strong>Deleted Date:</strong></Col>
                    <Col>
                      {selectedCV.deletionInfo?.deletedDate
                        ? new Date(selectedCV.deletionInfo.deletedDate).toLocaleString()
                        : "N/A"}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  Type "PERMANENTLY_DELETE" to confirm:
                </Form.Label>
                <Form.Control
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="PERMANENTLY_DELETE"
                  className={confirmText === "PERMANENTLY_DELETE" ? "border-success" : "border-danger"}
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark" : ""}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowPermanentDeleteModal(false);
              setSelectedCV(null);
              setConfirmText("");
            }}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handlePermanentDelete}
            disabled={actionLoading || confirmText !== "PERMANENTLY_DELETE"}
          >
            {actionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Permanently Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeletedCVsPage;