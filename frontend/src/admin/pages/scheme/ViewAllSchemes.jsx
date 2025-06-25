import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Form, Spinner, Alert } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from "react-icons/fa";
import axios from "axios"; 
import logo from "../../../assets/logo.png";
import ConfirmDeleteModal from "../../../components/notifications/ConfirmDeleteModal";

const ViewAllSchemes = ({ darkMode }) => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  // Fetch schemes from backend
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/schemes`);
        console.log("API Response:", response.data);
        
        // Handle the API response structure based on your backend
        if (response.data && response.data.success) {
          setSchemes(response.data.data || []);
        } else if (Array.isArray(response.data)) {
          setSchemes(response.data);
        } else {
          setSchemes([]);
          console.warn("Unexpected API response structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching schemes:", error);
        
        if (error.response) {
          // Server responded with an error status
          const errorMessage = error.response.data?.message || error.response.data?.error || "Server error occurred";
          setError(`Failed to load schemes: ${errorMessage}`);
        } else if (error.request) {
          setError("Network error: Unable to connect to server. Please check your connection.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
        
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  // Handle delete scheme
  const handleDelete = async () => {
    if (!schemeToDelete) return;
    
    try {
      setDeleting(true);
      setError(null);

      const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/schemes/${schemeToDelete}`);
      console.log("Delete response:", response.data);
    
      setSchemes(prevSchemes => prevSchemes.filter((scheme) => scheme._id !== schemeToDelete));
      
      
    } catch (error) {
      console.error("Error deleting scheme:", error);
      
      // More detailed error handling for delete
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || "Failed to delete scheme";
        setError(errorMessage);
      } else if (error.request) {
        setError("Network error: Unable to delete scheme. Please check your connection.");
      } else {
        setError("An unexpected error occurred while deleting. Please try again.");
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSchemeToDelete(null);
    }
  };

  // Filter schemes based on scheme name
  const filteredSchemes = schemes.filter((scheme) => {
    if (!scheme || !scheme.schemeName) return false;
    return scheme.schemeName.toLowerCase().includes(filter.toLowerCase());
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const indexOfLastScheme = currentPage * itemsPerPage;
  const indexOfFirstScheme = indexOfLastScheme - itemsPerPage;
  const currentSchemes = filteredSchemes.slice(indexOfFirstScheme, indexOfLastScheme);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">VIEW ALL SCHEMES</h3>
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
          All Schemes
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Filter and Add Scheme Button */}
        <div className="d-flex flex-wrap justify-content-between mb-3">
          <Form.Group className="mb-0" style={{ maxWidth: "300px", flex: "1 1 100%" }}>
            <Form.Control
              type="text"
              placeholder="Filter by Scheme Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <div className="d-flex flex-wrap justify-content-end align-items-center mt-2 mt-sm-0">
            <Button 
              variant="primary" 
              onClick={() => navigate("/add-new-scheme")} 
              className="mx-2 mb-2 mb-sm-0"
              disabled={loading}
            >
              Add New Scheme
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Error</Alert.Heading>
            {error}
            <hr />
            <div className="d-flex justify-content-end">
              <Button
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                variant="outline-danger"
                size="sm"
              >
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" className="mb-3" />
            <p>Loading schemes...</p>
          </div>
        ) : (
          <>
            {/* Summary Information */}
            <div className="mb-3">
              <small className="text-muted">
                {filter ? `Showing ${filteredSchemes.length} of ${schemes.length} schemes` : `Total ${schemes.length} schemes`}
              </small>
            </div>

            <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Scheme Name</th>
                  <th>Total Allocations</th>
                  <th>Recurring</th>
                  <th>View</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentSchemes.length > 0 ? (
                  currentSchemes.map((scheme, index) => (
                    <tr key={scheme._id || index}>
                      <td>{indexOfFirstScheme + index + 1}</td>
                      <td>{scheme.schemeName || "N/A"}</td>
                      <td>{scheme.totalAllocation || 0}</td>
                      <td>
                        <span className={`badge ${scheme.recurring === 'yes' ? 'bg-success' : 'bg-secondary'}`}>
                          {scheme.recurring === 'yes' ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/view-scheme/${scheme._id}`)}
                          className="fw-semibold"
                        >
                          View
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/edit-scheme/${scheme._id}`)}
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
                            setSchemeToDelete(scheme._id);
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
                    <td colSpan="7" className="text-center py-4">
                      {filter ? (
                        <>
                          <p className="mb-2">No schemes found matching "{filter}"</p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setFilter("")}
                          >
                            Clear filter
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="mb-2">No schemes found</p>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/add-new-scheme")}
                          >
                            Add First Scheme
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <tfoot>
                  <tr>
                    <td colSpan={7} style={{ padding: "10px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          Showing {indexOfFirstScheme + 1} to {Math.min(indexOfLastScheme, filteredSchemes.length)} of {filteredSchemes.length} scheme(s)
                        </div>
                        <div className="d-flex align-items-center">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{ color: darkMode ? "white" : "black", padding: "0 5px" }}
                            title="Previous Page"
                          >
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
                            style={{ color: darkMode ? "white" : "black", padding: "0 5px" }}
                            title="Next Page"
                          >
                            <FaChevronRight />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </Table>
          </>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => {
          if (!deleting) {
            setShowDeleteModal(false);
            setSchemeToDelete(null);
          }
        }}
        onConfirm={handleDelete}
        refNo={schemes.find((scheme) => scheme._id === schemeToDelete)?.schemeName || "N/A"}
        darkMode={darkMode}
        loading={deleting}
      />
    </div>
  );
};

export default ViewAllSchemes;