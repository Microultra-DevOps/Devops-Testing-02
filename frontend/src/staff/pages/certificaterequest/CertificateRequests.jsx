import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaListAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ApproveModal from "../../../components/notifications/ApproveModal";
import DeclineModal from "../../../components/notifications/DeclineModal";
import logo from "../../../assets/logo.png";

const MyCertificateRequests = ({ darkMode }) => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      
      // Modified endpoint to get only requests assigned to this staff
      const response = await axios.get('http://localhost:5000/api/certificates/staff-certificates', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Filter only pending requests
      const pendingRequests = response.data.data.filter(
        request => request.certificateRequestStatus === 'pending'
      );
      
      setRequestData(pendingRequests);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch certificate requests.");
      console.error("Error fetching requests:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [navigate]);

  const handleView = (id) => {
    navigate(`/view-certificate-request/${id}`);
  };

  const handleApprove = (id) => {
    setSelectedRequestId(id);
    setShowApproveModal(true);
  };

  const handleDecline = (id) => {
    setSelectedRequestId(id);
    setShowDeclineModal(true);
  };

  const confirmApprove = async () => {
    try {
      await axios.put(`http://localhost:5000/api/certificates/update-status/${selectedRequestId}`, 
        { status: 'approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Remove the approved request from the list and refresh
      setRequestData(prevData => prevData.filter(item => item._id !== selectedRequestId));
      setShowApproveModal(false);
      fetchRequests(); // Refresh the data
    } catch (error) {
      setError("Failed to approve certificate request.");
      console.error("Approval error:", error);
    }
  };

  const confirmDecline = async () => {
    try {
      await axios.put(`http://localhost:5000/api/certificates/update-status/${selectedRequestId}`, 
        { status: 'declined' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Remove the declined request from the list and refresh
      setRequestData(prevData => prevData.filter(item => item._id !== selectedRequestId));
      setShowDeclineModal(false);
      fetchRequests(); // Refresh the data
    } catch (error) {
      setError("Failed to decline certificate request.");
      console.error("Decline error:", error);
    }
  };

  const filteredRequests = requestData.filter(
    (request) =>
      (request.name && request.name.toLowerCase().includes(filter.toLowerCase())) ||
      (request.internId && request.internId.toLowerCase().includes(filter.toLowerCase())) ||
      (request.nic && request.nic.toLowerCase().includes(filter.toLowerCase())) ||
      (request.trainingCategory && request.trainingCategory.toLowerCase().includes(filter.toLowerCase())) ||
      (request.sectionUnit && request.sectionUnit.toLowerCase().includes(filter.toLowerCase()))
  );

  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const columns = [
    "#",
    "Name",
    "Intern ID",
    "NIC",
    "Section/Unit",
    "Training Category",
    "Start Date",
    "End Date",
    "Status",
    "View",
    "Action"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">PENDING CERTIFICATE REQUESTS</h3>
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
            Pending Certificate Request Records
          </h5>
        </div>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        
        <div className="mb-3">
          <Form.Control
            type="text"
            placeholder="Filter by Name, Intern ID, NIC, or Training Category"
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
                        <td>{request.name || "N/A"}</td>
                        <td>{request.internId || "N/A"}</td>
                        <td>{request.nic || "N/A"}</td>
                        <td>{request.sectionUnit || "N/A"}</td>
                        <td>{request.trainingCategory || "N/A"}</td>
                        <td>
                          {request.periodFrom ? 
                            new Date(request.periodFrom).toLocaleDateString() : 
                            "N/A"}
                        </td>
                        <td>
                          {request.periodTo ? 
                            new Date(request.periodTo).toLocaleDateString() : 
                            "N/A"}
                        </td>
                        <td>
                          <span className="badge bg-warning">
                            Pending
                          </span>
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleView(request._id)}
                            title="View Request"
                            className="fw-semibold"
                          >
                            View
                          </Button>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleApprove(request._id)}
                              title="Approve Request"
                              className="fw-semibold"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDecline(request._id)}
                              title="Decline Request"
                              className="fw-semibold"
                            >
                              Decline
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center">
                        No pending certificate requests found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          <span>{filteredRequests.length} pending request(s) in total</span>
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
                          <span className="mx-2">{`Page ${currentPage} of ${totalPages || 1}`}</span>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
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

      <ApproveModal
        show={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={confirmApprove}
        refNo={selectedRequestId}
        darkMode={darkMode}
      />

      <DeclineModal
        show={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onConfirm={confirmDecline}
        refNo={selectedRequestId}
        darkMode={darkMode}
      />
    </div>
  );
};

export default MyCertificateRequests;