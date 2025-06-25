import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaListAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ApproveModal from "../../../components/notifications/ApproveModal";
import DeclineModal from "../../../components/notifications/DeclineModal";
import logo from "../../../assets/logo.png";

const StaffInternRequests = ({ darkMode }) => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [requestToDecline, setRequestToDecline] = useState(null);
  const [batchApproval, setBatchApproval] = useState(false);
  const [batchDecline, setBatchDecline] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/internRequest/all-intern-requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRequestData(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch intern requests.");
      console.error("Error fetching requests:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [navigate]);

  const handleApprove = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/api/internRequest/intern-requests/${requestToApprove._id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedData = requestData.map(item => 
        item._id === requestToApprove._id ? { ...item, adminApproved: 'Yes' } : item
      );
      setRequestData(updatedData);
      setShowApproveModal(false);
    } catch (error) {
      setError("Failed to approve intern request.");
      console.error("Approve error:", error);
    }
  };

  const handleDecline = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/api/internRequest/intern-requests/${requestToDecline._id}/decline`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedData = requestData.map(item => 
        item._id === requestToDecline._id ? { ...item, adminApproved: 'No' } : item
      );
      setRequestData(updatedData);
      setShowDeclineModal(false);
    } catch (error) {
      setError("Failed to decline intern request.");
      console.error("Decline error:", error);
    }
  };

  const displayableRequests = requestData.filter(request => 
    request.adminApproved !== 'No' && 
    !(request.internAssignedCount === request.requiredInterns)
  );

  const filteredRequests = displayableRequests.filter(
    (request) =>
      request.scheme?.toLowerCase().includes(filter.toLowerCase()) ||
      request.district?.toLowerCase().includes(filter.toLowerCase()) ||
      request.internType?.toLowerCase().includes(filter.toLowerCase()) ||
      request.category?.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const columns = [
    "#",
    "Intern Type",
    "Category",
    "District",
    "Scheme",
    "Required Interns",
    "Period",
    "Admin Approved",
    "Intern Assigned",
    "Approve",
    "Decline"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">STAFF INTERN REQUESTS</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>
            <FaListAlt className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
            Staff Intern Request Records
          </h5>
        </div>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        
        {/* Filter Input */}
        <div className="mb-3">
          <Form.Control
            type="text"
            placeholder="Filter by Scheme, District, or Intern Type"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "300px", width: "100%" }}
          />
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
                    {columns.map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.length > 0 ? (
                    currentRequests.map((request, index) => (
                      <tr key={request._id || index}>
                        <td>{indexOfFirstRequest + index + 1}</td>
                        <td>{request.internType || "N/A"}</td>
                        <td>{request.category || "N/A"}</td>
                        <td>{request.district || "N/A"}</td>
                        <td>{request.scheme || "N/A"}</td>
                        <td>{request.requiredInterns || "N/A"}</td>
                        <td>
                          {request.periodFrom && request.periodTo ? 
                            `${new Date(request.periodFrom).toLocaleDateString()} - ${new Date(request.periodTo).toLocaleDateString()}` : 
                            "N/A"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              request.adminApproved === 'Pending'
                              ? 'bg-warning'
                              : request.adminApproved === 'Yes'
                              ? 'bg-success'
                              : 'bg-danger'
                              }`}
                              >
                              {request.adminApproved}
                           </span>
                        </td>
                        <td>
                          <span className={`badge ${request.internAssignedCount === request.requiredInterns ? "bg-success" : "bg-info"}`}>
                            {request.internAssignedCount}/{request.requiredInterns}
                          </span>
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => {
                              setRequestToApprove(request);
                              setShowApproveModal(true);
                            }}
                            title="Approve Request"
                            className="fw-semibold"
                            disabled={request.adminApproved === 'Yes'}
                          >
                            Approve
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => {
                              setRequestToDecline(request);
                              setShowDeclineModal(true);
                            }}
                            title="Decline Request"
                            className="fw-semibold"
                            disabled={request.adminApproved === 'Yes'}
                          >
                            Decline
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center">
                        No intern requests found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          <span>{filteredRequests.length} request(s) in total</span>
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
          setRequestToApprove(null);
        }}
        onConfirm={handleApprove}
        refNo={batchApproval ? `${selectedRows.length} selected requests` : requestToApprove?.scheme}
        darkMode={darkMode}
      />

      {/* Decline Modal */}
      <DeclineModal
        show={showDeclineModal}
        onClose={() => {
          setShowDeclineModal(false);
          setBatchDecline(false);
          setRequestToDecline(null);
        }}
        onConfirm={handleDecline}
        refNo={batchDecline ? `${selectedRows.length} selected requests` : requestToDecline?.scheme}
        darkMode={darkMode}
      />
    </div>
  );
};

export default StaffInternRequests;