import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaListAlt, FaChevronLeft, FaChevronRight, FaFileAlt } from "react-icons/fa";
import logo from "../../../assets/logo.png";

const InternAllocations = ({ darkMode }) => {
  const navigate = useNavigate();
  const [allocationData, setAllocationData] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Dummy data for intern allocations
  const dummyAllocationData = [
    {
      _id: "1",
      schemeName: "SLT Graduate Program",
      allocation: "Full-time",
      supervisorName: "Kamal Perera",
      supervisorNo: "SP001",
      allowance: "25,000",
      field: "Network Engineering"
    },
    {
      _id: "2",
      schemeName: "Mobitel Internship",
      allocation: "Part-time",
      supervisorName: "Nimali Fernando",
      supervisorNo: "SP002",
      allowance: "18,000",
      field: "Software Development"
    },
    {
      _id: "3",
      schemeName: "SLT Graduate Program",
      allocation: "Full-time",
      supervisorName: "Sunil Rathnayake",
      supervisorNo: "SP003",
      allowance: "25,000",
      field: "Data Analytics"
    },
    {
      _id: "4",
      schemeName: "SLT Apprentice Scheme",
      allocation: "Full-time",
      supervisorName: "Anoma Silva",
      supervisorNo: "SP004",
      allowance: "20,000",
      field: "Customer Support"
    },
    {
      _id: "5",
      schemeName: "Mobitel Internship",
      allocation: "Full-time",
      supervisorName: "Rajitha Gamage",
      supervisorNo: "SP005",
      allowance: "22,000",
      field: "Mobile App Development"
    },
    {
      _id: "6",
      schemeName: "SLT Graduate Program",
      allocation: "Part-time",
      supervisorName: "Priyantha Jayasundara",
      supervisorNo: "SP006",
      allowance: "15,000",
      field: "Cyber Security"
    },
    {
      _id: "7",
      schemeName: "SLT Apprentice Scheme",
      allocation: "Full-time",
      supervisorName: "Sanduni Alwis",
      supervisorNo: "SP007",
      allowance: "20,000",
      field: "Marketing"
    },
    {
      _id: "8",
      schemeName: "Mobitel Internship",
      allocation: "Part-time",
      supervisorName: "Dinesh Kumara",
      supervisorNo: "SP008",
      allowance: "18,000",
      field: "UI/UX Design"
    },
    {
      _id: "9",
      schemeName: "SLT Graduate Program",
      allocation: "Full-time",
      supervisorName: "Chamari Bandara",
      supervisorNo: "SP009",
      allowance: "25,000",
      field: "Cloud Computing"
    },
    {
      _id: "10",
      schemeName: "SLT Apprentice Scheme",
      allocation: "Part-time",
      supervisorName: "Asanka Gunawardena",
      supervisorNo: "SP010",
      allowance: "15,000",
      field: "Human Resources"
    },
    {
      _id: "11",
      schemeName: "Mobitel Internship",
      allocation: "Full-time",
      supervisorName: "Tharindu Liyanage",
      supervisorNo: "SP011",
      allowance: "22,000",
      field: "AI Development"
    },
    {
      _id: "12",
      schemeName: "SLT Graduate Program",
      allocation: "Full-time",
      supervisorName: "Shyama Rajapakse",
      supervisorNo: "SP012",
      allowance: "25,000",
      field: "Database Administration"
    }
  ];

  const fetchAllocation = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set dummy data
      setAllocationData(dummyAllocationData);
      setLoading(false);
      
    } catch (error) {
      setError("Failed to fetch allocation data.");
      console.error("Error fetching allocations:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocation();
  }, [navigate]);

  const filteredAllocation = allocationData.filter(
    (allocation) =>
      allocation.supervisorNo?.toLowerCase().includes(filter.toLowerCase()) ||
      allocation.schemeName?.toLowerCase().includes(filter.toLowerCase()) ||
      allocation.supervisorName?.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastAllocation = currentPage * itemsPerPage;
  const indexOfFirstAllocation = indexOfLastAllocation - itemsPerPage;
  const currentAllocation = filteredAllocation.slice(indexOfFirstAllocation, indexOfLastAllocation);
  const totalPages = Math.ceil(filteredAllocation.length / itemsPerPage);

  const columns = [
    "#",
    "Scheme Name",
    "Allocation",
    "Supervisor Name",
    "Supervisor No:",
    "Allowance (LKR)",
    "Field",
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">MY INTERNS ALLOCATIONS</h3>
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
          Intern Allocation Records
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        
        {/* Filter Input */}
        <div className="mb-3">
          <Form.Control
            type="text"
            placeholder="Filter by Scheme, Supervisor Name or No"
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
                  {currentAllocation.length > 0 ? (
                    currentAllocation.map((allocation, index) => (
                      <tr key={allocation._id || index}>
                        <td>{indexOfFirstAllocation + index + 1}</td>
                        <td>{allocation.schemeName || "N/A"}</td>
                        <td>{allocation.allocation || "N/A"}</td>
                        <td>{allocation.supervisorName || "N/A"}</td>
                        <td>{allocation.supervisorNo || "N/A"}</td>
                        <td>{allocation.allowance || "N/A"}</td>
                        <td>{allocation.field || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center">
                        No allocation records found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          <span>{filteredAllocation.length} allocation(s) in total</span>
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

export default InternAllocations;