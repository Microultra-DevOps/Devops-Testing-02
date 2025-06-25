import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaListAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import DeleteModal from "../../../components/notifications/DeleteModal"; 
import logo from "../../../assets/logo.png";

const MyInternRequests = ({ darkMode }) => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemName, setDeleteItemName] = useState("");

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      
      // Make API call to get intern requests for the current user
      const response = await axios.get('http://localhost:5000/api/internRequest/user-intern-requests', {
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

  const handleView = (id) => {
    navigate(`/view-intern-request/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/edit-intern-request/${id}`);
  };

  const handleDelete = (id, name) => {
    setDeleteItemId(id);
    setDeleteItemName(name);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Make API call to delete the intern request
      await axios.delete(`http://localhost:5000/api/internRequest/intern-requests/${deleteItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the local state after successful deletion
      const updatedData = requestData.filter(item => item._id !== deleteItemId);
      setRequestData(updatedData);
      setShowDeleteModal(false);
    } catch (error) {
      setError("Failed to delete intern request.");
      console.error("Delete error:", error);
    }
  };

  const filteredRequests = requestData.filter(
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
    "View",
    "Edit",
    "Delete"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">MY INTERN REQUESTS</h3>
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
            My Intern Request Records
          </h5>
          <Button 
            variant="primary" 
            onClick={() => navigate('/create-intern-request')}
          >
            Create New Request
          </Button>
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
                            variant="outline-primary"
                            onClick={() => handleView(request._id)}
                            title="View Request"
                            className="fw-semibold"
                          >
                            View
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handleEdit(request._id)}
                            title="Edit Request"
                            className="fw-semibold"
                          >
                            Edit
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(request._id, request.scheme)}
                            title="Delete Request"
                            className="fw-semibold"
                          >
                            Delete
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

      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={confirmDelete}
        itemName={deleteItemName}
        darkMode={darkMode}
      />
    </div>
  );
};

export default MyInternRequests;