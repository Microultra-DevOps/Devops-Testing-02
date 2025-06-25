import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
import { FaPenFancy, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import AssignSchemeModal from "./AssignSchemeModal";

const ScheduleScheme = ({ darkMode }) => {
  const navigate = useNavigate();
  const [internData, setInternData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [internToAssign, setInternToAssign] = useState(null);
  const [batchAssign, setBatchAssign] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [token, setToken] = useState(null);

  // Initialize token on component mount
  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      navigate("/login");
      return;
    }
    setToken(authToken);
  }, [navigate]);

  // Create axios instance with proper configuration
  const api = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
  });

  // Add request interceptor to always include current token
  api.interceptors.request.use(
    (config) => {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle auth errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      return Promise.reject(error);
    }
  );

  const fetchInterns = async () => {
    if (!token) return;
    
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      // FIXED: Updated API endpoint to match backend
      const response = await api.get("/cvs/get-cvs-for-scheme-assignment");
      
      // Handle different response structures
      const internDataResponse = response.data?.data || response.data || [];
      
      if (Array.isArray(internDataResponse)) {
        setInternData(internDataResponse);
      } else {
        console.error("Unexpected intern data structure:", internDataResponse);
        setInternData([]);
        setError("Failed to load intern data: Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching interns:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to fetch intern data";
      setError(errorMessage);
      setInternData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInterns();
    }
  }, [token]);

  // FIXED: Assign scheme with proper data mapping
  const handleAssignScheme = async (schemeData) => {
    try {
      setError("");
      setSuccessMessage("");
      
      // FIXED: Prepare the request data with correct field mapping
      const requestData = {
        schemeId: schemeData.schemeId,
        managerLevel: parseInt(schemeData.managerLevel), 
        internshipPeriod: parseInt(schemeData.internshipPeriod),
        startDate: schemeData.startDate,
        forRequest: schemeData.forRequest === "yes" ? "yes" : "no", 
        milestones: schemeData.milestones || []
      };

      console.log("Request data being sent:", requestData); // Debug log

      let response;
      
      if (batchAssign) {
        // FIXED: Batch assignment endpoint
        response = await api.post(`/cvs/batch-assign-scheme`, {
          cvIds: selectedRows,
          ...requestData
        });
        
        const assignedCount = response.data?.data?.assignedCount || selectedRows.length;
        setSuccessMessage(`Successfully assigned scheme to ${assignedCount} candidate(s)`);
        
        setSelectedRows([]);
      } else {
        response = await api.post(
          `/cvs/${internToAssign._id}/assign-scheme`,
          requestData
        );
        
        setSuccessMessage(`Successfully assigned scheme to ${internToAssign.fullName}`);
      }

      await fetchInterns();
      
      return response.data;
    } catch (error) {
      console.error("Error assigning scheme:", error);
      
      let errorMessage = "Failed to assign scheme";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Add specific error context for common issues
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes("Missing required fields")) {
          errorMessage = "Please fill in all required fields before assigning the scheme.";
        } else if (error.response.data?.message?.includes("already assigned")) {
          errorMessage = "One or more selected candidates are already assigned to a scheme.";
          await fetchInterns();
        }
      } else if (error.response?.status === 404) {
        errorMessage = "The selected scheme or candidate was not found.";
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Handle row selection
  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  // Select all rows on current page
  const handleSelectAll = () => {
    const currentPageIds = currentInterns.map((intern) => intern._id);
    const allCurrentSelected = currentPageIds.every(id => selectedRows.includes(id));
    
    if (allCurrentSelected) {
      // Deselect all on current page
      setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedRows(prev => {
        const newSelected = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  // FIXED: Enhanced filter logic to handle more fields
  const filteredInterns = internData.filter(
    (intern) =>
      intern.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
      intern.nic?.toLowerCase().includes(filter.toLowerCase()) ||
      intern.emailAddress?.toLowerCase().includes(filter.toLowerCase()) ||
      intern.refNo?.toLowerCase().includes(filter.toLowerCase()) ||
      intern.selectedRole?.toLowerCase().includes(filter.toLowerCase()) ||
      intern.district?.toLowerCase().includes(filter.toLowerCase()) ||
      intern.institute?.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastIntern = currentPage * itemsPerPage;
  const indexOfFirstIntern = indexOfLastIntern - itemsPerPage;
  const currentInterns = filteredInterns.slice(
    indexOfFirstIntern,
    indexOfLastIntern
  );
  const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);

  const columns = [
    "Select",
    "Ref No",
    "NIC",
    "Full Name",
    "Intern Type",
    "Email",
    "Mobile No",
    "District",
    "Institute",
    "Assign Scheme",
  ];

  const handleModalClose = () => {
    setShowAssignModal(false);
    setBatchAssign(false);
    setInternToAssign(null);
    setSelectedCvId(null);
  };

  const handleBatchAssign = () => {
    if (selectedRows.length === 0) {
      setError("Please select at least one candidate for batch assignment.");
      return;
    }
    setError("");
    setBatchAssign(true);
    setShowAssignModal(true);
  };

  const handleSingleAssign = (intern) => {
    setError("");
    setInternToAssign(intern);
    setSelectedCvId(intern._id);
    setBatchAssign(false);
    setShowAssignModal(true);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!token) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" />
        <span className="ms-2">Loading...</span>
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
        />
        <h3 className="mt-3">SCHEME ASSIGNMENT</h3>
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
          <FaPenFancy
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          Assign Scheme to Induction Passed Candidates
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Filter Input with Batch Button */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-left mb-3">
          <div className="mb-2 mb-sm-0">
            <Form.Control
              type="text"
              placeholder="Search by Name, NIC, Email, Ref No, etc."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: "350px", width: "100%" }}
            />
          </div>
          <div className="d-flex justify-content-start flex-wrap">
            <Button
              variant="info"
              size="sm"
              onClick={handleBatchAssign}
              disabled={selectedRows.length === 0}
              style={{ marginLeft: "2px", marginTop: "5px" }}
            >
              Batch Assign Scheme {selectedRows.length > 0 && `(${selectedRows.length} selected)`}
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert 
            variant="success" 
            dismissible 
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert 
            variant="danger" 
            dismissible 
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
            <p className="mt-2">Loading candidates...</p>
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
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={
                        currentInterns.length > 0 &&
                        currentInterns.every(intern => selectedRows.includes(intern._id))
                      }
                      indeterminate={
                        currentInterns.some(intern => selectedRows.includes(intern._id)) &&
                        !currentInterns.every(intern => selectedRows.includes(intern._id))
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  {columns.slice(1).map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentInterns.length > 0 ? (
                  currentInterns.map((intern, index) => (
                    <tr key={intern._id || index}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedRows.includes(intern._id)}
                          onChange={() => handleSelectRow(intern._id)}
                        />
                      </td>
                      <td>{intern.refNo || "N/A"}</td>
                      <td>{intern.nic || "N/A"}</td>
                      <td>{intern.fullName || "N/A"}</td>
                      <td>{intern.selectedRole || "N/A"}</td>
                      <td>
                        <span 
                          title={intern.emailAddress}
                          style={{ 
                            display: 'inline-block', 
                            maxWidth: '150px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {intern.emailAddress || "N/A"}
                        </span>
                      </td>
                      <td>{intern.mobileNumber || "N/A"}</td>
                      <td>{intern.district || "N/A"}</td>
                      <td>
                        <span 
                          title={intern.institute}
                          style={{ 
                            display: 'inline-block', 
                            maxWidth: '120px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {intern.institute || "N/A"}
                        </span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => handleSingleAssign(intern)}
                          className="fw-semibold"
                        >
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center">
                      {filter ? 
                        "No candidates found matching your search criteria" : 
                        "No induction-completed candidates found for scheme assignment"
                      }
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ padding: "5px", fontSize: "14px" }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ minHeight: "30px" }}
                    >
                      <div className="flex-grow-1 text-center">
                        <span>
                          {filteredInterns.length} candidate(s) found •{" "}
                          {selectedRows.length} selected
                        </span>
                      </div>
                      {totalPages > 1 && (
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
                          <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
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
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </>
        )}
      </Container>

      {/* Assign Scheme Modal */}
      <AssignSchemeModal
        show={showAssignModal}
        onClose={handleModalClose}
        onConfirm={handleAssignScheme}
        refNo={
          batchAssign
            ? `${selectedRows.length} selected candidates`
            : internToAssign?.refNo || internToAssign?.fullName || "Selected Candidate"
        }
        darkMode={darkMode}
        isBatch={batchAssign}
        selectedCount={selectedRows.length}
      />
    </div>
  );
};

export default ScheduleScheme;