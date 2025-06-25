import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaPenFancy, FaChevronLeft, FaChevronRight, FaFileAlt } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import ApproveModal from "../../../components/notifications/ApproveModal";
import DeclineModal from "../../../components/notifications/DeclineModal";

const InternPendingRequests = ({ darkMode }) => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [internToApprove, setInternToApprove] = useState(null);
  const [internToDecline, setInternToDecline] = useState(null);
  const [batchApproval, setBatchApproval] = useState(false);
  const [batchDecline, setBatchDecline] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Axios instance with authentication
  const api = axios.create({
    baseURL: "http://localhost:5000/api/intern-requests",
    headers: { Authorization: `Bearer ${token}` }
  });

  // Mock data for demonstration purposes
  const mockData = [
    {
      _id: "1",
      nic: "995678123V",
      schemeName: "Technical Support",
      schemeAssignDate: "2025-03-01",
      startDate: "2025-04-01",
      period: 6,
      status: "Pending",
      cvLink: "http://example.com/cv/1.pdf"
    },
    {
      _id: "2",
      nic: "987654321V",
      schemeName: "Marketing",
      schemeAssignDate: "2025-03-05",
      startDate: "2025-04-15",
      period: 3,
      status: "Pending",
      cvLink: "http://example.com/cv/2.pdf"
    },
    {
      _id: "3",
      nic: "945612378V",
      schemeName: "Administration",
      schemeAssignDate: "2025-03-10",
      startDate: "2025-05-01",
      period: 4,
      status: "Pending",
      cvLink: "http://example.com/cv/3.pdf"
    }
  ];

  const fetchInterns = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      
      setTimeout(() => {
        setRequestData(mockData);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      setError("Failed to fetch intern requests.");
      console.error("Error fetching interns:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, [navigate]);

  const handleApprove = async () => {
    setError("");
    try {
      if (batchApproval) {
        console.log("Batch approving:", selectedRows);
      } else if (internToApprove) {
        console.log("Approving single intern:", internToApprove._id);
      }
      setShowApproveModal(false);
      setBatchApproval(false);
      setInternToApprove(null);
      setSelectedRows([]);
      fetchInterns();
    } catch (error) {
      console.error("Error approving intern:", error.message);
      setError(`Failed to approve intern(s): ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDecline = async () => {
    setError("");
    try {
      if (batchDecline) {
        console.log("Batch declining:", selectedRows);
      } else if (internToDecline) {
        console.log("Declining single intern:", internToDecline._id);
      }
      setShowDeclineModal(false);
      setBatchDecline(false);
      setInternToDecline(null);
      setSelectedRows([]);
      fetchInterns();
    } catch (error) {
      console.error("Error declining intern:", error.message);
      setError(`Failed to decline intern(s): ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((rowId) => rowId !== id) : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows(selectedRows.length === currentRequests.length ? [] : currentRequests.map((req) => req._id));
  };

  const handleViewCV = (cvLink) => {
    window.open(cvLink, '_blank');
  };

  const filteredRequests = requestData.filter(
    (request) =>
      request.nic?.toLowerCase().includes(filter.toLowerCase()) ||
      request.schemeName?.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const columns = [
    "Select",
    "NIC",
    "Scheme Name",
    "Scheme Assign Date",
    "Start Date",
    "Period (Months)",
    "View CV",
    "Approve",
    "Decline"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">INTERN PENDING REQUESTS</h3>
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
          <FaPenFancy className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
          Manage Intern Pending Requests
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        
        {/* Filter Input with Batch Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-3">
          <div className="mb-2 mb-sm-0">
            <Form.Control
              type="text"
              placeholder="Filter by NIC or Scheme Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: "250px", width: "100%" }}
            />
          </div>
          <div className="d-flex justify-content-start flex-wrap">
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                setBatchApproval(true);
                setBatchDecline(false);
                setShowApproveModal(true);
              }}
              disabled={selectedRows.length === 0}
              style={{ marginLeft: "10px", marginTop: "5px" }}
            >
              Batch Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setBatchDecline(true);
                setBatchApproval(false);
                setShowDeclineModal(true);
              }}
              disabled={selectedRows.length === 0}
              style={{ marginLeft: "10px", marginTop: "5px" }}
            >
              Batch Decline
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="text-center mb-3" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectedRows.length === currentRequests.length && currentRequests.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    {columns.slice(1).map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.length > 0 ? (
                    currentRequests.map((intern, index) => (
                      <tr key={intern._id || index}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedRows.includes(intern._id)}
                            onChange={() => handleSelectRow(intern._id)}
                          />
                        </td>
                        <td>{intern.nic || "N/A"}</td>
                        <td>{intern.schemeName || "N/A"}</td>
                        <td>{intern.schemeAssignDate ? new Date(intern.schemeAssignDate).toLocaleDateString() : "N/A"}</td>
                        <td>{intern.startDate ? new Date(intern.startDate).toLocaleDateString() : "N/A"}</td>
                        <td>{intern.period || "N/A"}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => handleViewCV(intern.cvLink)}
                            className="fw-semibold"
                          >
                            <FaFileAlt className="me-1" /> View CV
                          </Button>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => {
                              setInternToApprove(intern);
                              setBatchApproval(false);
                              setShowApproveModal(true);
                            }}
                            className="fw-semibold"
                          >
                            Approve
                          </Button>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => {
                              setInternToDecline(intern);
                              setBatchDecline(false);
                              setShowDeclineModal(true);
                            }}
                            className="fw-semibold"
                          >
                             Decline
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center">
                        No pending intern requests found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          <span>{filteredRequests.length} request(s) in total • {selectedRows.length} selected</span>
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
                          <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
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
            </div>
          </>
        )}
      </Container>

      {/* Approve Modal */}
      <ApproveModal
        show={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setBatchApproval(false);
          setInternToApprove(null);
        }}
        onConfirm={handleApprove}
        refNo={batchApproval ? `${selectedRows.length} selected requests` : internToApprove?.nic}
        darkMode={darkMode}
      />

      {/* Decline Modal */}
      <DeclineModal
        show={showDeclineModal}
        onClose={() => {
          setShowDeclineModal(false);
          setBatchDecline(false);
          setInternToDecline(null);
        }}
        onConfirm={handleDecline}
        refNo={batchDecline ? `${selectedRows.length} selected requests` : internToDecline?.nic}
        darkMode={darkMode}
      />
    </div>
  );
};

export default InternPendingRequests;