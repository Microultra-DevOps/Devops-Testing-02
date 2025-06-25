import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaUniversity, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ApproveModal from "./InstituteApproveModal"; 
import DeclineModal from "./InstituteDeclineModal"; 
import logo from "../../../assets/logo.png";

const ApproveInstitute = ({ darkMode }) => {
  const [instituteData, setInstituteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false); 
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
        const pendingInstitutes = data.filter(institute => !institute.approveRequest);
        setInstituteData(pendingInstitutes);
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
    navigate("/add-new-institute");
  };

  const handleApproveClick = (institute) => {
    setSelectedInstitute(institute);
    setShowApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedInstitute) return;

    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/api/universities/${selectedInstitute._id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInstituteData(prevData => prevData.filter(institute => institute._id !== selectedInstitute._id));
      setShowApproveModal(false);
      setSelectedInstitute(null);
    } catch (error) {
      console.error("Error approving institute:", error.message);
    }
  };

  const handleDeclineClick = (institute) => {
    setSelectedInstitute(institute);
    setShowDeclineModal(true); 
  };

  const handleDeclineConfirm = async () => {
    if (!selectedInstitute) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/universities/${selectedInstitute._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInstituteData(prevData => prevData.filter(institute => institute._id !== selectedInstitute._id));
      setShowDeclineModal(false);
      setSelectedInstitute(null);
    } catch (error) {
      console.error("Error declining institute:", error.message);
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
    "Approve",
    "Decline"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ALL PENDING INSTITUTE REGISTRATION REQUESTS</h3>
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
          <FaUniversity className="me-2" />
          Institute Registration Details
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        <div className="d-flex flex-wrap gap-1justify-content-between align-items-center mb-3">
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
            Add New Institute
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
                          onClick={() => handleApproveClick(institute)}
                          className="fw-semibold" 
                        >
                          Approve
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDeclineClick(institute)} 
                          className="fw-semibold" 
                        >
                          Decline
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">No pending approvals</td>
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

      {/* Approve Modal */}
      <ApproveModal 
        show={showApproveModal} 
        onClose={() => setShowApproveModal(false)}
        onApprove={handleApproveConfirm}
        itemName={selectedInstitute?.instituteName || ""}
        darkMode={darkMode} 
      />

      {/* Decline Modal */}
      <DeclineModal 
        show={showDeclineModal} 
        onClose={() => setShowDeclineModal(false)} 
        onDecline={handleDeclineConfirm} 
        itemName={selectedInstitute?.instituteName || ""} 
        darkMode={darkMode} 
      />
    </div>
  );
};

export default ApproveInstitute;
