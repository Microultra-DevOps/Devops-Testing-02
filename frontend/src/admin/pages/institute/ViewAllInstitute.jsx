import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaUniversity, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import DeleteModal from "../../../components/notifications/DeleteModal"; 
import logo from "../../../assets/logo.png";

const ViewAllInstitute = ({ darkMode }) => {
  const [instituteData, setInstituteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutes = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/universities`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const approvedInstitutes = data.filter(institute => institute.approveRequest);
        setInstituteData(approvedInstitutes);
      } catch (error) {
        setError("Failed to fetch institute users.");
        console.error("Error fetching institutes:", error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInstitutes();
  }, []);

  const handleView = (universityId) => {
    navigate(`/view-institute-details/${universityId}`);
  };

  const handleAddNewInstitute = () => {
    navigate("/approve-institute");
  };

  const handleEditClick = (universityId) => {
    navigate(`/edit-institute/${universityId}`);
  };

  const handleDeleteClick = (institute) => {
    setSelectedInstitute(institute);
    setShowDeleteModal(true); 
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInstitute) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/universities/${selectedInstitute._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInstituteData(prevData => prevData.filter(institute => institute._id !== selectedInstitute._id));
      setShowDeleteModal(false);
      setSelectedInstitute(null);
    } catch (error) {
      console.error("Error deleting institute:", error.message);
    }
  };

  const filteredInstitutes = instituteData.filter((institute) =>
    institute.instituteName.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastInstitute = currentPage * itemsPerPage;
  const indexOfFirstInstitute = indexOfLastInstitute - itemsPerPage;
  const currentInstitutes = filteredInstitutes.slice(indexOfFirstInstitute, indexOfLastInstitute);
  const totalPages = Math.ceil(filteredInstitutes.length / itemsPerPage);

  const columns = [
    "#",
    "Institute Name",
    "Institute Contact Email",
    "Department",
    "Institute Type",
    "Contact Person Full Name",
    "Institute Contact Number",
    "View",
    "Edit",
    "Delete"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">All APPROVED INSTITUTIONS</h3>
      </Container>

      <Container 
        className="mt-4 p-4 rounded" 
        style={{ 
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da"
        }}
      >
        <h5 className="mb-3">
          <FaUniversity className="me-2" style={{ fontSize: '1.2rem', color: darkMode ? 'white' : 'black' }} />
          Institute Registration Details
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        <div className="d-flex flex-wrap gap-1 justify-content-between align-items-center mb-3">
          <Form.Group controlId="filterInput" className="mb-0 me-2" style={{ flexGrow: 1 }}>
            <Form.Control
              type="text"
              placeholder="Filter by Institute Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: '250px', width: '100%' }} 
            />
          </Form.Group>
          <Button variant="primary" onClick={handleAddNewInstitute}>
            Pending Approvals
          </Button>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">{error}</Alert>
        ) : (
          <>
            <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentInstitutes.length > 0 ? (
                  currentInstitutes.map((institute, index) => (
                    <tr key={institute._id || index}>
                      <td>{indexOfFirstInstitute + index + 1}</td>
                      <td>{institute.instituteName || "N/A"}</td>
                      <td>{institute.instituteContactEmail || "N/A"}</td>
                      <td>{institute.department || "N/A"}</td>
                      <td>{institute.instituteType || "N/A"}</td>
                      <td>{institute.fullName || "N/A"}</td>
                      <td>{institute.instituteContactNumber || "N/A"}</td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          onClick={() => handleView(institute._id)}
                          className="fw-semibold" 
                        >
                          View
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleEditClick(institute._id)}
                          className="fw-semibold" 
                        >
                          Edit
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDeleteClick(institute)} 
                          className="fw-semibold" 
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center">No approved institutes found.</td>
                  </tr>
                )}
              </tbody>
              {/* Table Footer with Pagination */}
              <tfoot>
                <tr>
                  <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                      <div className="flex-grow-1 text-center">
                        <span>{filteredInstitutes.length} application(s) in total</span>
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
          </>
        )}
      </Container>

      {/* Delete Modal */}
      <DeleteModal 
        show={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onDelete={handleDeleteConfirm} 
        itemName={selectedInstitute?.instituteName || ""} 
        darkMode={darkMode} 
      />
    </div>
  );
};

export default ViewAllInstitute;

