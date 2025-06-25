import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaPenFancy, FaChevronLeft, FaChevronRight } from "react-icons/fa"; 
import logo from "../../../assets/logo.png";

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const InstituteAllApplications = ({ darkMode }) => {
  const [cvData, setCvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Refetch function
  const fetchUserCVs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const decodedToken = decodeToken(token);
      if (!decodedToken || !decodedToken.id) {
        setError("Invalid token. Please login again.");
        navigate("/login");
        return;
      }
      const currentUserId = decodedToken.id;
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/cvs/user/${currentUserId}/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setCvData(response.data);
        setError("");
      } else {
        setCvData([]);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setCvData([]);
        setError("");
      } else {
        setError("Failed to fetch CV data.");
        setCvData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserCVs();

    // Listen for bulk upload success event
    const handleUploadSuccess = () => {
      fetchUserCVs();
    };
    window.addEventListener("cvUploadSuccess", handleUploadSuccess);

    // Cleanup
    return () => {
      window.removeEventListener("cvUploadSuccess", handleUploadSuccess);
    };
  }, [fetchUserCVs, navigate]);

  const handleView = (cvId) => {
    navigate(`/view-cv/${cvId}`);
  };

  const handleEdit = (cvId) => {
    navigate(`/edit-cv/${cvId}`);
  };

  const handleNewCV = () => {
    navigate("/institute-add-cv");
  };

  // Helper function to check if CV can be edited
  const canEditCV = (status) => {
    return status === "cv-submitted";
  };

  // Helper function to get status badge classes
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-info";
      case "cv-submitted":
        return "bg-secondary";
      case "cv-approved":
        return "bg-success";
      case "cv-rejected":
        return "bg-danger";
      case "interview-scheduled":
      case "interview-re-scheduled":
        return "bg-warning text-dark";
      case "interview-passed":
        return "bg-success";
      case "interview-failed":
        return "bg-danger";
      case "induction-scheduled":
      case "induction-re-scheduled":
        return "bg-warning text-dark";
      case "induction-passed":
      case "induction-assigned":
        return "bg-success";
      case "induction-failed":
        return "bg-danger";
      case "schema-assigned":
        return "bg-info";
      case "schema-completed":
        return "bg-success";
      case "terminated":
        return "bg-dark";
      default:
        return "bg-secondary";
    }
  };

  // Helper function to format status display text
  const formatStatusText = (status) => {
    if (!status) return "Draft";
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredCvs = cvData?.filter(
    (cv) =>
      cv.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
      cv.nic?.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  const indexOfLastCv = currentPage * itemsPerPage;
  const indexOfFirstCv = indexOfLastCv - itemsPerPage;
  const currentCvs = filteredCvs.slice(indexOfFirstCv, indexOfLastCv);
  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage);

  const columns = [
    "#",
    "Application Ref. No.",
    "Full Name",
    "NIC",
    "Intern Type",
    "Application Status",
    "View",
    "Edit",
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`} style={{ paddingBottom: "40px" }}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ALL CV APPLICATIONS</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded mb-5"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <h5 className="mb-3">
          <FaPenFancy className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
          All Internship Applications
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Filter Input and New CV Button */}
        <div className="d-flex flex-wrap gap-2  justify-content-between align-items-center mb-3">
          <Form.Control
            type="text"
            placeholder="Filter by Full Name or NIC"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "250px", width: "100%" }}
          />

          <Button variant="primary" onClick={handleNewCV}>
            Add New CV
          </Button>
        </div>

        {loading ? (
          <div className="text-center mb-4">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center mb-4">{error}</Alert>
        ) : (
          <>
            <div className="mb-4">
              <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive className="mb-0">
                <thead>
                  <tr>
                    {columns.map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentCvs.length > 0 ? (
                    currentCvs.map((cv, index) => (
                      <tr key={cv._id || index}>
                        <td>{indexOfFirstCv + index + 1}</td>
                        <td>{cv.refNo || "N/A"}</td>
                        <td>{cv.fullName || "N/A"}</td>
                        <td>{cv.nic || "N/A"}</td>
                        <td>{cv.selectedRole || "N/A"}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(cv.currentStatus)}`}>
                            {formatStatusText(cv.currentStatus)}
                          </span>
                        </td>

                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            onClick={() => handleView(cv._id)} 
                            className="fw-semibold"
                          >
                            View
                          </Button>
                        </td>
                        <td>
                          {canEditCV(cv.currentStatus) && (
                            <Button 
                              size="sm" 
                              variant="outline-success" 
                              onClick={() => handleEdit(cv._id)} 
                              className="fw-semibold"
                            >
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No CVs found for this user
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          <span>{filteredCvs.length} application(s) in total</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
                          >
                            <FaChevronLeft /><FaChevronLeft />
                          </Button>
                          <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
                          >
                            <FaChevronRight /><FaChevronRight />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default InstituteAllApplications;