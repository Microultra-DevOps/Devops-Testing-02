import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { 
  FaFilePdf, 
  FaFileExcel, 
  FaFilter,
} from "react-icons/fa";
import logo from "../../../assets/logo.png";
import ReportsFilters from "./ReportsFilters";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const AdminReports = ({ darkMode = false }) => {
  const [cvData, setCvData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    status: "all",
    dateRange: "all",
    district: "all",
    institute: "all",
    internType: "all",
    cvFrom: "all",
    gender: "all",
    referredBy: "all",
    customDateFrom: "",
    customDateTo: "",
    searchTerm: ""
  });

  const itemsPerPage = 20;
  const navigate = useNavigate();

  // Helper function to validate MongoDB ObjectId
  const isValidMongoId = (id) => {
    return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Fetch CVs from API
  useEffect(() => {
    const fetchCVs = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please login again.");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/cvs/get-all-with-filtering`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              // Get all data for comprehensive reporting
              limit: 10000,
              includeDeleted: false
            },
          }
        );

        if (response.status === 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          const validCVs = data.filter((cv) => cv && cv._id && isValidMongoId(cv._id));
          setCvData(validCVs);
          setError("");
        } else {
          setError("Unexpected response format from the server.");
        }
      } catch (error) {
        console.error("Error fetching CVs:", error);
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(error.response?.data?.message || "Failed to fetch CV data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, [navigate]);

  // Apply filters to CV data
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...cvData];

      // Apply search term filter
      if (activeFilters.searchTerm && activeFilters.searchTerm.trim()) {
        const searchLower = activeFilters.searchTerm.toLowerCase().trim();
        filtered = filtered.filter((cv) => {
          return (
            (cv.fullName || "").toLowerCase().includes(searchLower) ||
            (cv.nic || "").toLowerCase().includes(searchLower) ||
            (cv.refNo || "").toLowerCase().includes(searchLower) ||
            (cv.district || "").toLowerCase().includes(searchLower) ||
            (cv.institute || "").toLowerCase().includes(searchLower) ||
            (cv.referredBy || "").toLowerCase().includes(searchLower)
          );
        });
      }

      // Apply status filter
      if (activeFilters.status !== "all") {
        filtered = filtered.filter((cv) => {
          const currentStatus = cv.currentStatus || "";
          
          switch (activeFilters.status) {
            case "cv-approved":
              return currentStatus === "cv-approved";
            case "cv-pending":
              return currentStatus === "cv-submitted" || currentStatus === "cv-pending" || !currentStatus;
            case "interview-scheduled":
              return (
                currentStatus === "interview-scheduled" ||
                currentStatus === "induction-scheduled" ||
                currentStatus === "schema-assigned" ||
                currentStatus.includes("interview") ||
                currentStatus.includes("induction") ||
                currentStatus.includes("schema")
              );
            case "cv-rejected":
              return currentStatus === "cv-rejected";
            default:
              return true;
          }
        });
      }

      // Apply district filter
      if (activeFilters.district !== "all") {
        filtered = filtered.filter((cv) => cv.district === activeFilters.district);
      }

      // Apply institute filter
      if (activeFilters.institute !== "all") {
        filtered = filtered.filter((cv) => cv.institute === activeFilters.institute);
      }

      // Apply intern type filter
      if (activeFilters.internType !== "all") {
        filtered = filtered.filter((cv) => cv.selectedRole === activeFilters.internType);
      }

      // Apply CV from filter
      if (activeFilters.cvFrom !== "all") {
        filtered = filtered.filter((cv) => cv.userType === activeFilters.cvFrom);
      }

      // Apply gender filter
      if (activeFilters.gender !== "all") {
        filtered = filtered.filter((cv) => cv.gender?.toLowerCase() === activeFilters.gender);
      }

      // Apply referred by filter
      if (activeFilters.referredBy !== "all") {
        filtered = filtered.filter((cv) => cv.referredBy === activeFilters.referredBy);
      }

      // Apply date range filter
      if (activeFilters.dateRange !== "all") {
        const now = new Date();
        let startDate, endDate;

        switch (activeFilters.dateRange) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
          case "yesterday":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "this-week":
            const weekStart = now.getDate() - now.getDay();
            startDate = new Date(now.getFullYear(), now.getMonth(), weekStart);
            endDate = new Date(now.getFullYear(), now.getMonth(), weekStart + 7);
            break;
          case "last-week":
            const lastWeekStart = now.getDate() - now.getDay() - 7;
            startDate = new Date(now.getFullYear(), now.getMonth(), lastWeekStart);
            endDate = new Date(now.getFullYear(), now.getMonth(), lastWeekStart + 7);
            break;
          case "this-month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
          case "last-month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "last-3-months":
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
          case "last-6-months":
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
          case "this-year":
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear() + 1, 0, 1);
            break;
          case "custom":
            if (activeFilters.customDateFrom && activeFilters.customDateTo) {
              startDate = new Date(activeFilters.customDateFrom);
              endDate = new Date(activeFilters.customDateTo);
              endDate.setHours(23, 59, 59, 999); // Include full end date
            }
            break;
          default:
            startDate = null;
            endDate = null;
        }

        if (startDate && endDate) {
          filtered = filtered.filter((cv) => {
            const cvDate = new Date(cv.applicationDate);
            return cvDate >= startDate && cvDate < endDate;
          });
        }
      }

      setFilteredData(filtered);
      setCurrentPage(1);
    };

    applyFilters();
  }, [activeFilters, cvData]);

  // Get unique values for filter options
  const getUniqueValues = (field) => {
    return [...new Set(cvData.map(cv => cv[field]).filter(Boolean))].sort();
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  // Generate statistics
  const generateStatistics = () => {
    const stats = {
      total: filteredData.length,
      approved: filteredData.filter(cv => cv.currentStatus === "cv-approved").length,
      pending: filteredData.filter(cv => !cv.currentStatus || cv.currentStatus === "cv-submitted" || cv.currentStatus === "cv-pending").length,
      rejected: filteredData.filter(cv => cv.currentStatus === "cv-rejected").length,
      interview: filteredData.filter(cv => cv.currentStatus && cv.currentStatus.includes("interview")).length,
      byDistrict: {},
      byInstitute: {},
      byGender: {},
      byInternType: {},
      byCvFrom: {}
    };

    // Group by district
    filteredData.forEach(cv => {
      const district = cv.district || "Not Specified";
      stats.byDistrict[district] = (stats.byDistrict[district] || 0) + 1;
    });

    // Group by institute
    filteredData.forEach(cv => {
      const institute = cv.institute || "Not Specified";
      stats.byInstitute[institute] = (stats.byInstitute[institute] || 0) + 1;
    });

    // Group by gender
    filteredData.forEach(cv => {
      const gender = cv.gender || "Not Specified";
      stats.byGender[gender] = (stats.byGender[gender] || 0) + 1;
    });

    // Group by intern type
    filteredData.forEach(cv => {
      const internType = cv.selectedRole || "Not Specified";
      stats.byInternType[internType] = (stats.byInternType[internType] || 0) + 1;
    });

    // Group by CV from
    filteredData.forEach(cv => {
      const cvFrom = cv.userType || "Not Specified";
      stats.byCvFrom[cvFrom] = (stats.byCvFrom[cvFrom] || 0) + 1;
    });

    return stats;
  };

  // Export to Excel
  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const statistics = generateStatistics();
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ["SLT Mobitel CV Reports - Summary"],
        ["Generated on:", new Date().toLocaleString()],
        [""],
        ["Overview Statistics"],
        ["Total CVs", statistics.total],
        ["Approved CVs", statistics.approved],
        ["Pending CVs", statistics.pending],
        ["Rejected CVs", statistics.rejected],
        ["Interview Stage", statistics.interview],
        [""],
        ["By District"],
        ...Object.entries(statistics.byDistrict).map(([key, value]) => [key, value]),
        [""],
        ["By Institute"],
        ...Object.entries(statistics.byInstitute).map(([key, value]) => [key, value]),
        [""],
        ["By Gender"],
        ...Object.entries(statistics.byGender).map(([key, value]) => [key, value]),
        [""],
        ["By Intern Type"],
        ...Object.entries(statistics.byInternType).map(([key, value]) => [key, value]),
        [""],
        ["By CV Source"],
        ...Object.entries(statistics.byCvFrom).map(([key, value]) => [key, value])
      ];
      
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");
      
      // Detailed data sheet
      const detailedData = filteredData.map((cv, index) => ({
        "S.No": index + 1,
        "Ref No": cv.refNo || "N/A",
        "NIC": cv.nic || "N/A",
        "Full Name": cv.fullName || "N/A",
        "Gender": cv.gender || "N/A",
        "CV From": cv.userType || "N/A",
        "Intern Type": cv.selectedRole || "N/A",
        "District": cv.district || "N/A",
        "Institute": cv.institute || "N/A",
        "Referred By": cv.referredBy || "N/A",
        "Application Date": cv.applicationDate ? new Date(cv.applicationDate).toLocaleDateString() : "N/A",
        "Status": cv.currentStatus || "Pending",
        "Phone": cv.phone || "N/A",
        "Email": cv.email || "N/A"
      }));
      
      const detailedWS = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, detailedWS, "Detailed Data");
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `SLT_Mobitel_CV_Report_${timestamp}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      alert(`Excel report exported successfully as ${filename}`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export Excel report. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
  setExportLoading(true);
  try {
    const statistics = generateStatistics();
    
    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(18);
    doc.text("SLT Mobitel CV Reports", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
    
    let yPosition = 45;
    
    // Summary statistics section
    doc.setFontSize(14);
    doc.text("Summary Statistics", 20, yPosition);
    yPosition += 10;
    
    // Create summary data without using autoTable first
    const summaryText = [
      `Total CVs: ${statistics.total}`,
      `Approved: ${statistics.approved}`,
      `Pending: ${statistics.pending}`,
      `Rejected: ${statistics.rejected}`,
      `Interview Stage: ${statistics.interview}`
    ];
    
    doc.setFontSize(11);
    summaryText.forEach((text, index) => {
      doc.text(text, 25, yPosition + (index * 7));
    });
    
    yPosition += summaryText.length * 7 + 15;
    
    // District breakdown (simple text format to avoid autoTable issues)
    if (Object.keys(statistics.byDistrict).length > 0) {
      doc.setFontSize(14);
      doc.text("Distribution by District", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      const districts = Object.entries(statistics.byDistrict)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Show top 10
      
      districts.forEach(([district, count], index) => {
        const text = `${district}: ${count}`;
        doc.text(text, 25, yPosition + (index * 6));
      });
      
      yPosition += districts.length * 6 + 15;
    }
    
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Detailed CV data (simple table format)
    const maxRecords = Math.min(filteredData.length, 30); // Reduce number for simple format
    
    if (filteredData.length > 0) {
      doc.setFontSize(14);
      doc.text(`CV Details (First ${maxRecords} records)`, 20, yPosition);
      yPosition += 15;
      
      // Table headers
      doc.setFontSize(9);
      doc.text("#", 20, yPosition);
      doc.text("Ref No", 30, yPosition);
      doc.text("Name", 55, yPosition);
      doc.text("District", 100, yPosition);
      doc.text("Status", 130, yPosition);
      
      yPosition += 7;
      
      // Draw header line
      doc.line(20, yPosition - 2, 180, yPosition - 2);
      
      // Table data
      filteredData.slice(0, maxRecords).forEach((cv, index) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
          
          // Repeat headers on new page
          doc.setFontSize(9);
          doc.text("#", 20, yPosition);
          doc.text("Ref No", 30, yPosition);
          doc.text("Name", 55, yPosition);
          doc.text("District", 100, yPosition);
          doc.text("Status", 130, yPosition);
          yPosition += 7;
          doc.line(20, yPosition - 2, 180, yPosition - 2);
        }
        
        const refNo = (cv.refNo || "N/A").substring(0, 12);
        const name = (cv.fullName || "N/A").substring(0, 20);
        const district = (cv.district || "N/A").substring(0, 15);
        const status = (cv.currentStatus || "Pending").substring(0, 15);
        
        doc.text((index + 1).toString(), 20, yPosition);
        doc.text(refNo, 30, yPosition);
        doc.text(name, 55, yPosition);
        doc.text(district, 100, yPosition);
        doc.text(status, 130, yPosition);
        
        yPosition += 6;
      });
    }
    
    // Add footer note if data was limited
    if (filteredData.length > maxRecords) {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.text(
        `Note: Showing ${maxRecords} of ${filteredData.length} total records. Use Excel export for complete data.`, 
        20, 
        pageHeight - 15
      );
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `SLT_Mobitel_CV_Report_${timestamp}.pdf`;
    
    // Save PDF
    doc.save(filename);
    
    alert(`PDF report exported successfully as ${filename}`);
    
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    alert(`Failed to export PDF report. Error: ${error.message}`);
  } finally {
    setExportLoading(false);
  }
};

// Alternative version WITH autoTable (if you can fix the import):
const exportToPDFWithAutoTable = async () => {
  setExportLoading(true);
  try {
    const statistics = generateStatistics();
    const doc = new jsPDF();
    
    // Test if autoTable is available
    if (typeof doc.autoTable !== 'function') {
      throw new Error('autoTable plugin not loaded. Using simple table format instead.');
    }
    
    // Add title
    doc.setFontSize(16);
    doc.text("SLT Mobitel CV Reports", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });
    
    let yPosition = 45;
    
    // Summary statistics with autoTable
    const summaryData = [
      ['Total CVs', statistics.total],
      ['Approved CVs', statistics.approved],
      ['Pending CVs', statistics.pending],
      ['Rejected CVs', statistics.rejected],
      ['Interview Stage', statistics.interview]
    ];
    
    doc.autoTable({
      head: [['Metric', 'Count']],
      body: summaryData,
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
    
    // District data with autoTable
    if (Object.keys(statistics.byDistrict).length > 0) {
      const districtData = Object.entries(statistics.byDistrict)
        .sort(([,a], [,b]) => b - a)
        .map(([district, count]) => [district, count]);
      
      doc.autoTable({
        head: [['District', 'Count']],
        body: districtData,
        startY: yPosition,
        theme: 'striped',
        styles: { fontSize: 9 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
    }
    
    // CV details with autoTable
    const limitedData = filteredData.slice(0, 50).map((cv, index) => [
      index + 1,
      cv.refNo || "N/A",
      (cv.fullName || "N/A").substring(0, 25),
      cv.district || "N/A",
      cv.selectedRole || "N/A",
      cv.currentStatus || "Pending"
    ]);
    
    if (limitedData.length > 0) {
      doc.autoTable({
        head: [['#', 'Ref No', 'Name', 'District', 'Type', 'Status']],
        body: limitedData,
        startY: yPosition,
        theme: 'striped',
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 }
        }
      });
    }
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `SLT_Mobitel_CV_Report_${timestamp}.pdf`;
    
    doc.save(filename);
    alert(`PDF report exported successfully as ${filename}`);
    
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    // Fallback to simple version
    exportToPDF();
  } finally {
    setExportLoading(false);
  }
};
  // Statistics for dashboard cards
  const statistics = generateStatistics();

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const indexOfLastCV = currentPage * itemsPerPage;
  const indexOfFirstCV = indexOfLastCV - itemsPerPage;
  const currentCVs = filteredData.slice(indexOfFirstCV, indexOfLastCV);

  // Render loading state
  if (loading) {
    return (
      <div
        className={`d-flex flex-column min-vh-100 justify-content-center align-items-center ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
        <p className="mt-3">Loading CV data for reports...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        className={`d-flex flex-column min-vh-100 ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <Container className="text-center mt-4">
          <Alert variant="danger">
            <h5>Error Loading Data</h5>
            <p>{error}</p>
            <Button 
              variant="outline-danger" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
      style={{ paddingBottom: '3rem' }}
    >
      <Container className="text-center mt-4 mb-3">
        <img
          src={logo}
          alt="SLT Mobitel Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <h3 className="mt-3">ADMIN REPORTS</h3>
        <p>Comprehensive CV Reports and Analytics</p>
      </Container>
      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <Row className="align-items-center mb-3 gap-3">
          <Col>
            <h5 className="mb-0">
              <FaFilter className="me-2" />
              CV Reports & Analytics
            </h5>
          </Col>
          <Col xs="auto">
            <Button
              variant="success"
              onClick={exportToExcel}
              disabled={exportLoading || filteredData.length === 0}
              className="me-2"
            >
              <FaFileExcel className="me-1" />
              {exportLoading ? "Exporting..." : "Export Excel"}
            </Button>
            <Button
              variant="danger"
              onClick={exportToPDF}
              disabled={exportLoading || filteredData.length === 0}
            >
              <FaFilePdf className="me-1" />
              {exportLoading ? "Exporting..." : "Export PDF"}
            </Button>
          </Col>
        </Row>

        <hr className={darkMode ? "border-light" : "border-dark"} />

        {/* Filters Component */}
        <ReportsFilters
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          darkMode={darkMode}
          uniqueDistricts={getUniqueValues('district')}
          uniqueInstitutes={getUniqueValues('institute')}
          uniqueInternTypes={getUniqueValues('selectedRole')}
          uniqueCvFroms={getUniqueValues('userType')}
          uniqueReferredBy={getUniqueValues('referredBy')}
        />

        {/* Results Summary */}
        <Row className="mb-3">
          <Col>
            <div className="d-flex align-items-center flex-wrap">
              <Badge bg="primary" className="me-2 mb-2">
                {filteredData.length} Results Found
              </Badge>
              {activeFilters.status !== "all" && (
                <Badge bg="secondary" className="me-2 mb-2">
                  Status: {activeFilters.status.replace(/-/g, ' ').toUpperCase()}
                </Badge>
              )}
              {activeFilters.district !== "all" && (
                <Badge bg="secondary" className="me-2 mb-2">
                  District: {activeFilters.district}
                </Badge>
              )}
              {activeFilters.dateRange !== "all" && (
                <Badge bg="secondary" className="me-2 mb-2">
                  Date: {activeFilters.dateRange.replace(/-/g, ' ').toUpperCase()}
                </Badge>
              )}
            </div>
          </Col>
        </Row>

        {/* Data Table */}
        <div className="table-responsive">
          <Table
            striped
            bordered
            hover
            variant={darkMode ? "dark" : "light"}
            className="mb-0"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Ref No</th>
                <th>Name</th>
                <th>District</th>
                <th>Institute</th>
                <th>Intern Type</th>
                <th>CV From</th>
                <th>Application Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentCVs.length > 0 ? (
                currentCVs.map((cv, index) => (
                  <tr key={cv._id || index}>
                    <td>{indexOfFirstCV + index + 1}</td>
                    <td>{cv.refNo || "N/A"}</td>
                    <td>{cv.fullName || "N/A"}</td>
                    <td>{cv.district || "N/A"}</td>
                    <td>{cv.institute || "N/A"}</td>
                    <td>{cv.selectedRole || "N/A"}</td>
                    <td>{cv.userType || "N/A"}</td>
                    <td>
                      {cv.applicationDate
                        ? new Date(cv.applicationDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <Badge
                        bg={
                          cv.currentStatus === "cv-approved"
                            ? "success"
                            : cv.currentStatus === "cv-rejected"
                            ? "danger"
                            : cv.currentStatus?.includes("interview")
                            ? "info"
                            : "warning"
                        }
                      >
                        {cv.currentStatus || "PENDING"}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div>
                      <FaFilter className="mb-2" size={32} />
                      <br />
                      No CVs found matching your criteria
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredData.length > itemsPerPage && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Showing {indexOfFirstCV + 1} to {Math.min(indexOfLastCV, filteredData.length)} of {filteredData.length} entries
            </div>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="me-2"
              >
                Previous
              </Button>
              <span className="mx-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default AdminReports;