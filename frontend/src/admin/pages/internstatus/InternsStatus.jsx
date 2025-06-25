import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Form, Alert, Row, Col } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck, FaFileDownload } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const InternsStatus = ({ darkMode }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const itemsPerPage = 20;

  // Status options based on the provided list
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "cv-submitted", label: "CV Submitted" },
    { value: "cv-approved", label: "CV Approved" },
    { value: "cv-rejected", label: "CV Rejected" },
    { value: "interview-scheduled", label: "Interview Scheduled" },
    { value: "interview-re-scheduled", label: "Interview Re-scheduled" },
    { value: "interview-passed", label: "Interview Passed" },
    { value: "interview-failed", label: "Interview Failed" },
    { value: "induction-scheduled", label: "Induction Scheduled" },
    { value: "induction-passed", label: "Induction Passed" },
    { value: "induction-failed", label: "Induction Failed" },
    { value: "schema-assigned", label: "Schema Assigned" },
    { value: "schema-completed", label: "Schema Completed" },
    { value: "terminated", label: "Terminated" }
  ];

  // Fetch interns status data from the backend
  useEffect(() => {
    const fetchInternsStatus = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        setCurrentPage(1);

        const response = await axios.get(
          `${API_BASE_URL}/api/cvs/get-all-with-filtering`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              status: statusFilter === "all" ? undefined : statusFilter
            }
          }
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          setStatus(response.data);
        } else {
          setError("Unexpected response format from the server.");
        }
      } catch (error) {
        console.error("Error fetching intern status:", error);
        setError(error.response?.data?.message || "Failed to fetch intern status data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInternsStatus();
  }, [navigate, statusFilter]);

  const filteredStatus = status;

  // Pagination logic
  const totalPages = Math.ceil(filteredStatus.length / itemsPerPage);
  const indexOfLastStatus = currentPage * itemsPerPage;
  const indexOfFirstStatus = indexOfLastStatus - itemsPerPage;
  const currentStatus = filteredStatus.slice(indexOfFirstStatus, indexOfLastStatus);

  const getStatusBadgeClass = (status) => {
    if (!status) return "bg-secondary";
    
    if (status.includes("cv-approved") || status.includes("passed") || status.includes("completed")) {
      return "bg-success";
    } 
    else if (status.includes("rejected") || status.includes("failed") || status === "terminated") {
      return "bg-danger";
    } 
    else if (status.includes("scheduled") || status.includes("assigned")) {
      return "bg-info";
    } 
    else {
      return "bg-warning";
    }
  };
  
  // Handle view function
  const handleView = (id) => {
    navigate(`/view-cv/${id}`);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); 
  };

  // Generate and download status count report
  const handleDownloadReport = async () => {
    setDownloadLoading(true);
    try {
      // Calculate status counts
      const statusCounts = {};
      statusOptions.forEach(option => {
        if (option.value !== "all") {
          statusCounts[option.label] = 0;
        }
      });

      // Count each status
      status.forEach(intern => {
        const currentStatus = intern.currentStatus || "Draft";
        const formattedStatus = statusOptions.find(option => 
          option.value === currentStatus
        )?.label || "Unknown";
        
        statusCounts[formattedStatus] = (statusCounts[formattedStatus] || 0) + 1;
      });

      // Create institute-wise breakdown
      const instituteBreakdown = {};
      status.forEach(intern => {
        const institute = intern.institute || "Unknown";
        if (!instituteBreakdown[institute]) {
          instituteBreakdown[institute] = {
            total: 0
          };
          statusOptions.forEach(option => {
            if (option.value !== "all") {
              instituteBreakdown[institute][option.value] = 0;
            }
          });
        }
        
        instituteBreakdown[institute].total += 1;
        const currentStatus = intern.currentStatus || "draft";
        instituteBreakdown[institute][currentStatus] = (instituteBreakdown[institute][currentStatus] || 0) + 1;
      });

      // Create overview sheet data
      const totalInternsCount = status.length;
      
      const summaryData = [
        ["INTERN STATUS REPORT - EXECUTIVE SUMMARY"],
        ["Generated on", new Date().toLocaleString()],
        [""],
        ["STATUS", "COUNT", "PERCENTAGE"],
        ...Object.entries(statusCounts).map(([statusLabel, count]) => [
          statusLabel, 
          count, 
          totalInternsCount > 0 ? `${((count / totalInternsCount) * 100).toFixed(2)}%` : "0.00%"
        ]),
        [""],
        ["Total Interns", totalInternsCount]
      ];

      // Create institute breakdown sheet data
      const instituteData = [
        ["INSTITUTE-WISE BREAKDOWN"],
        [""],
        ["INSTITUTE", "TOTAL INTERNS", ...statusOptions.filter(o => o.value !== "all").map(o => o.label)]
      ];

      Object.entries(instituteBreakdown).forEach(([institute, data]) => {
        instituteData.push([
          institute, 
          data.total,
          ...statusOptions.filter(o => o.value !== "all").map(o => data[o.value] || 0)
        ]);
      });

      // Create a workbook
      const wb = XLSX.utils.book_new();
      
      // Add the summary sheet
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Status Summary");
      
      // Add the institute breakdown sheet
      const instituteWs = XLSX.utils.aoa_to_sheet(instituteData);
      XLSX.utils.book_append_sheet(wb, instituteWs, "Institute Breakdown");
      
      // Add detailed data sheet
      const detailedData = [
        ["DETAILED INTERN DATA"],
        [""],
        ["#", "NIC", "NAME", "MOBILE", "INSTITUTE", "START DATE", "END DATE", "PERIOD", "STATUS"]
      ];
      
      status.forEach((intern, index) => {
        detailedData.push([
          index + 1,
          intern.nic || "N/A",
          intern.fullName || "N/A",
          intern.mobileNumber || "N/A",
          intern.institute || "N/A",
          intern.internshipStartDate ? new Date(intern.internshipStartDate).toLocaleDateString() : "N/A",
          intern.internshipEndDate ? new Date(intern.internshipEndDate).toLocaleDateString() : "N/A",
          intern.internshipPeriod || "N/A",
          intern.currentStatus ? intern.currentStatus.toUpperCase().replace(/-/g, " ") : "PENDING"
        ]);
      });
      
      const detailedWs = XLSX.utils.aoa_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, detailedWs, "Detailed Data");

      // Save the file
      XLSX.writeFile(wb, `Intern_Status_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">INTERN STATUS</h3>
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
          <FaCalendarCheck className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
          Intern Status
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Status Filter and Download Button */}
       <Row className="mb-3">
  <Col xs={12} md={6} className="mb-2 mb-md-0">
    {/* Download Report Button */}
    <Button
      variant={darkMode ? "outline-light" : "outline-dark"}
      className="d-flex align-items-center"
      onClick={handleDownloadReport}
      disabled={downloadLoading || loading || status.length === 0}
    >
      {downloadLoading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Generating...
        </>
      ) : (
        <>
          <FaFileDownload className="me-2" />
          Download Status Report
        </>
      )}
    </Button>
  </Col>
  <Col xs={12} md={6}>
    <div className="d-flex justify-content-md-end">
      {/* Scrollable Status Dropdown Filter */}
      <Form.Group className="mb-0" style={{ maxWidth: "200px" }}>
        <Form.Select
          value={statusFilter}
          onChange={handleStatusChange}
          size="sm"
          style={{
            height: "auto",
            maxHeight: "200px",
            overflowY: "auto",
            backgroundColor: darkMode ? "#343a40" : "white",
            color: darkMode ? "white" : "black",
          }}
        >
          {statusOptions.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              style={{
                backgroundColor: darkMode ? "#343a40" : "white",
                color: darkMode ? "white" : "black",
                padding: "4px 8px",
              }}
            >
              {option.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>
  </Col>
</Row>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading status...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : (
          <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>NIC</th>
                <th>Name</th>
                <th>Mobile No</th>
                <th>Institute</th>
                <th>Internship Start Date</th>
                <th>Internship End Date</th>
                <th>Internship Period</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {currentStatus.length > 0 ? (
                currentStatus.map((cv, index) => (
                  <tr key={cv._id}>
                    <td>{indexOfFirstStatus + index + 1}</td>
                    <td>{cv.nic || "N/A"}</td>
                    <td>{cv.fullName || "N/A"}</td>
                    <td>{cv.mobileNumber || "N/A"}</td>
                    <td>{cv.institute || "N/A"}</td>
                    <td>{cv.internshipStartDate ? new Date(cv.internshipStartDate).toLocaleDateString() : "N/A"}</td>
                    <td>{cv.internshipEndDate ? new Date(cv.internshipEndDate).toLocaleDateString() : "N/A"}</td>
                    <td>{cv.internshipPeriod || "N/A"}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(cv.currentStatus)}`}>
                        {cv.currentStatus ? cv.currentStatus.toUpperCase().replace(/-/g, " ") : "PENDING"}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleView(cv._id)}
                        className="fw-semibold"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">No Intern Status found</td>
                </tr>
              )}
            </tbody>

            {/* Pagination Footer */}
            <tfoot>
              <tr>
                <td colSpan={10} style={{ padding: "5px", fontSize: "14px" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1 text-center">
                      Showing {currentStatus.length} of {filteredStatus.length} interns
                    </div>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
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
                      <span className="mx-2">
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages || totalPages === 0}
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
                  </div>
                </td>
              </tr>
            </tfoot>
          </Table>
        )}
      </Container>
    </div>
  );
};

export default InternsStatus;