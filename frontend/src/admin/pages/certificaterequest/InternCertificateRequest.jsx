import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form, ButtonGroup } from "react-bootstrap";
import { FaListAlt, FaChevronLeft, FaChevronRight, FaCheck } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import ApproveModal from "../../../components/notifications/ApproveModal"; 

const InternCertificateRequests = ({ darkMode }) => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("approved"); 
  const [completeModalShow, setCompleteModalShow] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/certificates/all-requests?status=${statusFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setRequestData(response.data.data);
      setLoading(false);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        setError(`Failed to fetch ${statusFilter} certificate requests.`);
      } else {
        setRequestData([]);
      }
      console.error("Error fetching requests:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [navigate, statusFilter]);

  const handleView = (id) => {
    navigate(`/view-certificate-request/${id}`);
  };

  const handleCompleteClick = (id) => {
    setSelectedRequestId(id);
    setCompleteModalShow(true);
  };

  const handleCompleteConfirm = async () => {
    if (!selectedRequestId) return;
    
    setCompleteLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/certificates/update-status/${selectedRequestId}`,
        { status: "completed" },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccessMessage("Certificate request marked as completed successfully!");
      setTimeout(() => {
        fetchRequests();
        setCompleteLoading(false);
        setTimeout(() => {
          setSuccessMessage("");
          setCompleteModalShow(false);
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error("Error completing request:", error);
      setError("Failed to update request status.");
      setCompleteLoading(false);
      setCompleteModalShow(false);
    }
  };

  const filteredRequests = requestData.filter(
    (request) =>
      (request.name && request.name.toLowerCase().includes(filter.toLowerCase())) ||
      (request.internId && request.internId.toLowerCase().includes(filter.toLowerCase())) ||
      (request.nic && request.nic.toLowerCase().includes(filter.toLowerCase())) ||
      (request.trainingCategory && request.trainingCategory.toLowerCase().includes(filter.toLowerCase())) ||
      (request.sectionUnit && request.sectionUnit.toLowerCase().includes(filter.toLowerCase())) ||
      (request.staffName && request.staffName.toLowerCase().includes(filter.toLowerCase()))
  );

  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const getColumns = () => {
    const baseColumns = [
      "#",
      "Name",
      "Intern ID",
      "NIC",
      "Section/Unit",
      "Training Category",
      "Staff Name",
      "Start Date",
      "End Date",
      "Status",
      "View"
    ];
    
    if (statusFilter === "approved") {
      baseColumns.push("Complete");
    }
    
    return baseColumns;
  };
  
  const columns = getColumns();

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">
          {statusFilter.toUpperCase()} CERTIFICATES
        </h3>
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
            {statusFilter === "approved" ? "Approved" : "Completed"} Certificate Records
          </h5>
        </div>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Control
            type="text"
            placeholder="Filter by Name, Intern ID, NIC, Training Category, or Staff Name"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "400px", width: "100%" }}
          />
          
          <ButtonGroup className="ms-3">
            <Button 
              variant={statusFilter === "approved" ? "primary" : "outline-primary"}
              onClick={() => setStatusFilter("approved")}
            >
              Approved
            </Button>
            <Button 
              variant={statusFilter === "completed" ? "success" : "outline-success"}
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </Button>
          </ButtonGroup>
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
                        <td>{request.staffName || "N/A"}</td>
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
                          <span className={`badge ${statusFilter === "approved" ? "bg-success" : "bg-primary"}`}>
                            {statusFilter === "approved" ? "Approved" : "Completed"}
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
                        {statusFilter === "approved" && (
                          <td className="text-center">
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleCompleteClick(request._id)}
                              title="Mark as Completed"
                              className="fw-semibold"
                            >
                              Complete
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center">
                        No {statusFilter} certificate requests found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          <span>{filteredRequests.length} {statusFilter} request(s) in total</span>
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

      {/* Complete Modal */}
      <ApproveModal
        show={completeModalShow}
        onClose={() => {
          setCompleteModalShow(false);
          setSuccessMessage("");
        }}
        onConfirm={handleCompleteConfirm}
        refNo={currentRequests.find(r => r._id === selectedRequestId)?.internId || "this certificate"}
        darkMode={darkMode}
        isLoading={completeLoading}
        successMessage={successMessage}
      />
    </div>
  );
};

export default InternCertificateRequests;