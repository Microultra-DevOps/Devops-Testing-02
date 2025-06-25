import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaListAlt, FaChevronLeft, FaChevronRight, FaFileAlt } from "react-icons/fa";
import logo from "../../../assets/logo.png";

const InternPlacements = ({ darkMode }) => {
  const navigate = useNavigate();
  const [placementData, setPlacementData] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Axios instance with authentication
  const api = axios.create({
    baseURL: "http://localhost:5000/api/approved-placements",
    headers: { Authorization: `Bearer ${token}` }
  });

  const mockData = [
    {
      _id: "1",
      nic: "995678123V",
      name: "John Smith",
      managerName: "David Wilson",
      schemeDate: "2024-01-15",
      startDate: "2024-01-01",
      endDate: "2024-07-01",
      period: 6,
      cvLink: "http://example.com/cv/1.pdf"
    },
    {
      _id: "2",
      nic: "987654321V",
      name: "Sarah Johnson",
      managerName: "Michael Brown",
      schemeDate: "2024-02-01",
      startDate: "2024-02-15",
      endDate: "2024-05-15",
      period: 3,
      cvLink: "http://example.com/cv/2.pdf"
    },
    {
      _id: "3",
      nic: "945612378V",
      name: "Alex Chen",
      managerName: "Emma Davis",
      schemeDate: "2024-02-20",
      startDate: "2024-03-01",
      endDate: "2024-07-01",
      period: 4,
      cvLink: "http://example.com/cv/3.pdf"
    }
  ];

  const fetchPlacements = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      
      setTimeout(() => {
        setPlacementData(mockData);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      setError("Failed to fetch approved placements.");
      console.error("Error fetching placements:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, [navigate]);

  const handleViewCV = (cvLink) => {
    window.open(cvLink, '_blank');
  };

  const filteredPlacements = placementData.filter(
    (placement) =>
      placement.nic?.toLowerCase().includes(filter.toLowerCase()) ||
      placement.name?.toLowerCase().includes(filter.toLowerCase()) ||
      placement.managerName?.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastPlacement = currentPage * itemsPerPage;
  const indexOfFirstPlacement = indexOfLastPlacement - itemsPerPage;
  const currentPlacements = filteredPlacements.slice(indexOfFirstPlacement, indexOfLastPlacement);
  const totalPages = Math.ceil(filteredPlacements.length / itemsPerPage);

  const columns = [
    "#",
    "NIC",
    "Name",
    "Manager Name",
    "Scheme Date",
    "Start Date",
    "End Date",
    "Period (Months)",
    "View CV"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">INTERN PLACEMENTS</h3>
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
          <FaListAlt className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
          Intern Placement Records
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        
        {/* Filter Input */}
        <div className="mb-3">
          <Form.Control
            type="text"
            placeholder="Filter by NIC, Name, or Manager"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "250px", width: "100%" }}
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
                  {currentPlacements.length > 0 ? (
                    currentPlacements.map((placement, index) => (
                      <tr key={placement._id || index}>
                        <td>{indexOfFirstPlacement + index + 1}</td>
                        <td>{placement.nic || "N/A"}</td>
                        <td>{placement.name || "N/A"}</td>
                        <td>{placement.managerName || "N/A"}</td>
                        <td>{placement.schemeDate ? new Date(placement.schemeDate).toLocaleDateString() : "N/A"}</td>
                        <td>{placement.startDate ? new Date(placement.startDate).toLocaleDateString() : "N/A"}</td>
                        <td>{placement.endDate ? new Date(placement.endDate).toLocaleDateString() : "N/A"}</td>
                        <td>{placement.period || "N/A"}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => handleViewCV(placement.cvLink)}
                            className="fw-semibold"
                          >
                            <FaFileAlt className="me-1" /> View CV
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center">
                        No approved placements found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          <span>{filteredPlacements.length} placement(s) in total</span>
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
    </div>
  );
};

export default InternPlacements;