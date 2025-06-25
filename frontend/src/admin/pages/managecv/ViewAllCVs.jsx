import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Form,
  Row,
  Col,
  ButtonGroup,
  Card,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFileCode,
  FaChartBar,
  FaCalendarAlt,
  FaUsers,
  FaUserTie,
  FaBriefcase,
} from "react-icons/fa";
import logo from "../../../assets/logo.png";
import DeleteConfirmationModal from "../../../components/notifications/DeleteConfirmationModal";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const ViewAllCVs = ({ darkMode = false }) => {
  // State for analytics
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const allStatuses = [
    "cv-submitted",
    "cv-approved",
    "cv-rejected",
    "interview-scheduled",
    "interview-re-scheduled",
    "interview-passed",
    "interview-failed",
    "induction-scheduled",
    "induction-re-scheduled",
    "induction-passed",
    "induction-failed",
    "induction-assigned",
    "schema-assigned",
    "schema-completed",
    "terminated",
  ];

  // Color palettes
  const lightModeColors = [
    "#0d6efd",
    "#198754",
    "#dc3545",
    "#fd7e14",
    "#6f42c1",
    "#20c997",
    "#ffc107",
    "#e83e8c",
    "#6610f2",
    "#17a2b8",
    "#28a745",
    "#007bff",
    "#495057",
    "#6c757d",
    "#343a40",
    "#adb5bd",
  ];

  const darkModeColors = [
    "#4dabf7",
    "#51cf66",
    "#ff6b6b",
    "#ffa94d",
    "#9775fa",
    "#4ecdc4",
    "#ffe066",
    "#ff8cc8",
    "#845ef7",
    "#74c0fc",
    "#69db7c",
    "#339af0",
    "#868e96",
    "#adb5bd",
    "#ced4da",
    "#dee2e6",
  ];

const calculateColumnWidths = () => {
  if (!filteredData.length) return {};

  const columnWidths = {};

  const calculateWidth = (values, headerText, minWidth = 80, maxWidth = 600) => {
    const allValues = [...values.filter(v => v != null), headerText];
    
    const maxLength = Math.max(
      ...allValues.map(val => String(val || "").length)
    );
    
    const calculatedWidth = Math.max(minWidth, Math.min(maxWidth, maxLength * 10 + 40));
    return calculatedWidth;
  };


  // Fixed width columns
  const nicValues = [...filteredData.map(cv => cv.nic), "NIC"];
  columnWidths["nic"] = calculateWidth(nicValues, 100, 180);

  const refNoValues = [...filteredData.map(cv => cv.refNo), "Ref No"];
  columnWidths["refNo"] = calculateWidth(refNoValues, 80, 150);

  const nameValues = [...filteredData.map(cv => renderNameWithPrefix(cv.fullName, cv.gender)), "Name"];
  columnWidths["name"] = calculateWidth(nameValues, 150, 250);

  const cvFromValues = [...filteredData.map(cv => cv.userType), "CV From"];
  columnWidths["cvFrom"] = calculateWidth(cvFromValues, 90, 140);

  const internTypeValues = [...filteredData.map(cv => cv.selectedRole), "Intern Type"];
  columnWidths["internType"] = calculateWidth(internTypeValues, 100, 160);

  columnWidths["applicationDate"] = 150; // Fixed for date consistency

  const districtValues = [...filteredData.map(cv => cv.district), "District"];
  columnWidths["district"] = calculateWidth(districtValues, 100, 180);

  const instituteValues = [...filteredData.map(cv => cv.institute), "Institute"];
  columnWidths["institute"] = calculateWidth(instituteValues, 150, 300);

  const referredByValues = [...filteredData.map(cv => cv.referredBy), "Referred By"];
  columnWidths["referredBy"] = calculateWidth(referredByValues, 100, 180);

  columnWidths["status"] = 200; 
  
if (hasInternshipCVs()) {
    const categoryValues = [
      ...filteredData
        .filter(cv => cv.selectedRole === 'internship')
        .map(cv => cv.roleData?.internship?.categoryOfApply),
      "Category of Apply"
    ];
    columnWidths["categoryOfApply"] = calculateWidth(categoryValues, 120, 200);
  }

  return columnWidths;
};


  const colorPalette = darkMode ? darkModeColors : lightModeColors;
  const genderColors = darkMode
    ? { Male: "#4dabf7", Female: "#ff8cc8", Other: "#69db7c" }
    : { Male: "#0d6efd", Female: "#e83e8c", Other: "#28a745" };

  // State for CV table
  const [cvData, setCvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("fullName");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  // Helper functions
  const renderNameWithPrefix = (fullName, gender) => {
    const name = fullName || "N/A";
    if (gender?.toLowerCase() === "male") {
      return `Mr. ${name}`;
    } else if (gender?.toLowerCase() === "female") {
      return `Ms. ${name}`;
    }
    return name;
  };

  const hasInternshipCVs = () => {
    return filteredData.some((cv) => cv.selectedRole === "internship");
  };

  const isValidMongoId = (id) => {
    return id && typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
  };

  const formatStatus = (status) => {
    if (!status) return "PENDING";
    return status.toUpperCase().replace(/-/g, " ");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "cv-approved":
        return "bg-success";
      case "cv-rejected":
        return "bg-danger";
      case "interview-scheduled":
      case "induction-assigned":
      case "schema-assigned":
        return "bg-info";
      default:
        return "bg-warning";
    }
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
              status: statusFilter === "all" ? undefined : statusFilter,
              search: searchTerm || undefined,
              filterBy: filterCategory,
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
          setError(
            error.response?.data?.message ||
              "Failed to fetch CV data. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, [navigate, statusFilter, searchTerm, filterCategory]);

  // Apply filters to CV data
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...cvData];

      // Apply search term filter
      if (searchTerm && searchTerm.trim()) {
        filtered = filtered.filter((cv) => {
          const value = (cv[filterCategory] || "").toString().toLowerCase();
          return value.includes(searchTerm.toLowerCase().trim());
        });
      }

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((cv) => {
          const currentStatus = cv.currentStatus || "";

          switch (statusFilter) {
            case "cv-approved":
              return currentStatus === "cv-approved";
            case "cv-pending":
              return (
                currentStatus === "cv-submitted" ||
                currentStatus === "cv-pending" ||
                !currentStatus
              );
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

      // Apply date filter
      if (dateFilter !== "all") {
        filtered.sort((a, b) => {
          const dateA = new Date(a.applicationDate || 0);
          const dateB = new Date(b.applicationDate || 0);
          return dateFilter === "newest" ? dateB - dateA : dateA - dateB;
        });
      }

      setFilteredData(filtered);
      setCurrentPage(1);
    };

    applyFilters();
  }, [searchTerm, filterCategory, statusFilter, dateFilter, cvData]);

  // Analytics data processing functions
  const getMonthlySubmissionData = () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      count: 0,
    }));

    cvData.forEach((cv) => {
      if (cv.applicationDate) {
        const date = new Date(cv.applicationDate);
        if (date.getFullYear() === selectedYear) {
          const month = date.getMonth();
          monthlyData[month].count++;
        }
      }
    });

    return monthlyData;
  };

  const getStatusData = () => {
    const statusCounts = {};

    // Initialize all statuses with 0
    allStatuses.forEach((status) => {
      statusCounts[status] = 0;
    });

    // Count actual statuses from ALL data (no date filtering)
    cvData.forEach((cv) => {
      const status = cv.currentStatus || "cv-submitted";
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    // Convert to chart format and filter out zero values
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count], index) => ({
        status: status.replace(/-/g, " ").toUpperCase(),
        count,
        color: colorPalette[index % colorPalette.length],
      }));
  };

  const getGenderData = () => {
    const genderCounts = { Male: 0, Female: 0, Other: 0 };

    cvData.forEach((cv) => {
      if (cv.applicationDate) {
        const date = new Date(cv.applicationDate);
        if (date.getFullYear() === selectedYear) {
          const gender = cv.gender;
          if (gender) {
            const normalizedGender = gender.toLowerCase();
            if (normalizedGender === "male") {
              genderCounts.Male++;
            } else if (normalizedGender === "female") {
              genderCounts.Female++;
            } else {
              genderCounts.Other++;
            }
          } else {
            genderCounts.Other++;
          }
        }
      }
    });

    return Object.entries(genderCounts)
      .filter(([_, count]) => count > 0)
      .map(([gender, count]) => ({
        gender,
        count,
        color: genderColors[gender],
      }));
  };

  const getInternTypeData = () => {
    const internTypes = {};

    cvData.forEach((cv) => {
      if (cv.applicationDate) {
        const date = new Date(cv.applicationDate);
        if (date.getFullYear() === selectedYear) {
          const role = cv.selectedRole || "Not Specified";
          internTypes[role] = (internTypes[role] || 0) + 1;
        }
      }
    });

    return Object.entries(internTypes)
      .map(([type, count], index) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        color: colorPalette[index % colorPalette.length],
      }));
  };

  const getAvailableYears = () => {
    const years = new Set();
    cvData.forEach((cv) => {
      if (cv.applicationDate) {
        years.add(new Date(cv.applicationDate).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  // Custom Tooltip components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="shadow-lg rounded-lg p-3"
          style={{
            backgroundColor: darkMode ? "#495057" : "#ffffff",
            border: `1px solid ${darkMode ? "#6c757d" : "#dee2e6"}`,
            color: darkMode ? "#ffffff" : "#000000",
          }}
        >
          <p className="mb-1 fw-bold">{label}</p>
          <p className="mb-0" style={{ color: payload[0].color }}>
            <strong>Count: {payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="shadow-lg rounded-lg p-3"
          style={{
            backgroundColor: darkMode ? "#495057" : "#ffffff",
            border: `1px solid ${darkMode ? "#6c757d" : "#dee2e6"}`,
            color: darkMode ? "#ffffff" : "#000000",
          }}
        >
          <p className="mb-1 fw-bold">{payload[0].name}</p>
          <p className="mb-0" style={{ color: payload[0].payload.color }}>
            <strong>Count: {payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  // CV Table functions
  const handleView = (cvId) => {
    if (!isValidMongoId(cvId)) {
      alert("Invalid CV ID format");
      return;
    }
    navigate(`/view-cv/${cvId}`);
  };

  const handleDelete = async (deletionData) => {
    if (!cvToDelete) return;

    // Validate ID format
    if (!isValidMongoId(cvToDelete._id)) {
      alert("Invalid CV ID format");
      setShowDeleteModal(false);
      return;
    }

    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Use the soft delete endpoint with the form data
      const response = await axios.delete(`${API_BASE_URL}/cvs/${cvToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          adminName: deletionData.adminName,
          employeeId: deletionData.employeeId,
          deletionReason: deletionData.deletionReason,
          deletionComments: deletionData.deletionComments
        }
      });

      if (response.status === 200) {
        // Remove the CV from the current data
        setCvData(prevData => prevData.filter((cv) => cv._id !== cvToDelete._id));
        setFilteredData(prevData => prevData.filter((cv) => cv._id !== cvToDelete._id));

        // Show success message
        alert(`CV deleted successfully! 
        
Deletion Details:
- Ref No: ${response.data.deletionInfo?.refNo || cvToDelete.refNo || 'N/A'}  
- Deleted by: ${response.data.deletionInfo?.deletedBy || deletionData.adminName || 'N/A'}
- Reason: ${deletionData.deletionReason.replace(/_/g, ' ').toUpperCase()}

The CV has been moved to deleted items and can be restored by administrators if needed.`);
      } else {
        alert("Failed to delete CV. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting CV:", error);

      let errorMessage = "Failed to delete CV. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid request. Please check all required fields are filled correctly.";
      } else if (error.response?.status === 404) {
        errorMessage = "CV not found or may have already been deleted.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      alert(errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setCvToDelete(null);
    }
  };

  // Handle opening delete modal
  const handleDeleteClick = (cvId) => {
    const cvToDeleteData = cvData.find((cv) => cv._id === cvId);
    if (cvToDeleteData) {
      setCvToDelete(cvToDeleteData); 
      setShowDeleteModal(true);
    } else {
      alert("CV not found");
    }
  };

  // Handle closing delete modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCvToDelete(null);
    setDeleteLoading(false);
  };


  // Table columns and pagination
  const getColumns = () => {
  const columnWidths = calculateColumnWidths();
  
  const baseColumns = [
    { key: "#", label: "#", width: `${columnWidths["#"] || 60}px` },
    { key: "nic", label: "NIC", width: `${columnWidths["nic"] || 140}px` },
    { key: "refNo", label: "Ref No", width: `${columnWidths["refNo"] || 120}px` },
    { key: "name", label: "Name", width: `${columnWidths["name"] || 180}px` },
    { key: "cvFrom", label: "CV From", width: `${columnWidths["cvFrom"] || 110}px` },
    { key: "internType", label: "Intern Type", width: `${columnWidths["internType"] || 130}px` },
    { key: "applicationDate", label: "Application Date", width: `${columnWidths["applicationDate"] || 150}px` },
    { key: "district", label: "District", width: `${columnWidths["district"] || 120}px` },
    { key: "institute", label: "Institute", width: `${columnWidths["institute"] || 200}px` },
    { key: "referredBy", label: "Referred By", width: `${columnWidths["referredBy"] || 140}px` },
  ];

  if (hasInternshipCVs()) {
    baseColumns.push({
      key: "categoryOfApply",
      label: "Category of Apply",
      width: `${columnWidths["categoryOfApply"] || 160}px`,
    });
  }

  baseColumns.push(
    { key: "status", label: "Status", width: `${columnWidths["status"] || 120}px` },
    { key: "view", label: "View", width: `${columnWidths["view"] || 80}px` },
    { key: "delete", label: "Delete", width: `${columnWidths["delete"] || 80}px` }
  );

  return baseColumns;
};

useEffect(() => {
}, [filteredData]);

  const columns = getColumns();
  const totalTableWidth = columns.reduce((total, col) => {
  return total + parseInt(col.width.replace("px", ""));
  }, 0);
  const minTableWidth = 1200; 
  const finalTableWidth = Math.max(totalTableWidth, minTableWidth);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const indexOfLastCV = currentPage * itemsPerPage;
  const indexOfFirstCV = indexOfLastCV - itemsPerPage;
  const currentCVs = filteredData.slice(indexOfFirstCV, indexOfLastCV);

  // Table styles
const tableContainerStyles = {
  overflowX: "auto",
  overflowY: "visible",
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "auto",
  scrollbarColor: darkMode ? "#6c757d #343a40" : "#6c757d #f8f9fa",
  border: darkMode ? "1px solid #454d55" : "1px solid #dee2e6",
  borderRadius: "0.375rem",
  boxShadow: darkMode
    ? "0 0.125rem 0.25rem rgba(255, 255, 255, 0.075)"
    : "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
  position: "relative",
  minHeight: "200px",
};

  const scrollbarStyles = `
  .enhanced-table-container::-webkit-scrollbar {
    height: 12px;
    background-color: ${darkMode ? "#343a40" : "#f8f9fa"};
    border-radius: 6px;
  }
  
  .enhanced-table-container::-webkit-scrollbar-track {
    background-color: ${darkMode ? "#343a40" : "#f8f9fa"};
    border-radius: 6px;
    border: 1px solid ${darkMode ? "#454d55" : "#dee2e6"};
  }
  
  .enhanced-table-container::-webkit-scrollbar-thumb {
    background-color: ${darkMode ? "#6c757d" : "#adb5bd"};
    border-radius: 6px;
    border: 2px solid ${darkMode ? "#343a40" : "#f8f9fa"};
    transition: background-color 0.2s ease;
  }
  
  .enhanced-table-container::-webkit-scrollbar-thumb:hover {
    background-color: ${darkMode ? "#868e96" : "#868e96"};
  }
  
  .enhanced-table-container::-webkit-scrollbar-thumb:active {
    background-color: ${darkMode ? "#495057" : "#6c757d"};
  }
  
  .enhanced-table-container {
    scrollbar-width: auto;
    scrollbar-color: ${darkMode ? "#6c757d #343a40" : "#6c757d #f8f9fa"};
  }

  /* Fixed table layout with dynamic column widths */
  .enhanced-table-container table {
    table-layout: fixed;
    width: ${totalTableWidth}px;
    min-width: ${totalTableWidth}px;
  }

  .enhanced-table-container th,
  .enhanced-table-container td {
    white-space: nowrap;
    padding: 0.75rem 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }

  /* Specific column widths */
  ${columns
    .map(
      (col, index) => `
  .enhanced-table-container th:nth-child(${index + 1}),
  .enhanced-table-container td:nth-child(${index + 1}) { 
    width: ${col.width}; 
    min-width: ${col.width}; 
    max-width: ${col.width}; 
  }`
    )
    .join("\n")}

  /* Smooth scrolling behavior */
  .enhanced-table-container {
    scroll-behavior: smooth;
  }

  /* Focus styles for accessibility */
  .enhanced-table-container:focus {
    outline: 2px solid ${darkMode ? "#0d6efd" : "#0d6efd"};
    outline-offset: 2px;
  }

  /* Sticky header */
  .enhanced-table-container thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: ${darkMode ? "#343a40" : "#f8f9fa"};
    border-bottom: 2px solid ${darkMode ? "#454d55" : "#dee2e6"};
  }

  /* Better cell content handling */
  .enhanced-table-container td {
    position: relative;
  }

  .enhanced-table-container td:hover {
    overflow: visible;
    z-index: 5;
  }

  /* Button sizing in action columns */
  .enhanced-table-container .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    white-space: nowrap;
  }

  /* Badge styling */
  .enhanced-table-container .badge {
    font-size: 0.75rem;
    white-space: nowrap;
  }
`;

  // Loading and error states
  if (loading) {
    return (
      <div
        className={`d-flex flex-column min-vh-100 justify-content-center align-items-center ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
        <p className="mt-3">Loading CV data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`d-flex flex-column min-vh-100 ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <Container className="text-center mt-4">
          <Alert variant="danger">
            <h5>Error Loading CVs</h5>
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

  // Get analytics data
  const monthlyData = getMonthlySubmissionData();
  const statusData = getStatusData();
  const genderData = getGenderData();
  const internTypeData = getInternTypeData();
  const availableYears = getAvailableYears();

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
      style={{ paddingBottom: "3rem" }}
    >
      {/* Inject custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      <Container className="py-4">
        {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">VIEW ALL CVs</h3>
      </div>

        {/* Year Filter */}
        <Row className="mb-4">
          <Col lg={4} md={6} className="mx-auto">
            <Card
              className={`border-0 shadow-sm ${
                darkMode ? "bg-dark text-white" : "bg-white"
              }`}
            >
              <Card.Body>
                <Form.Group>
                  <Form.Label className="fw-bold mb-3">
                    <FaCalendarAlt
                      className={`me-2 ${
                        darkMode ? "text-white" : "text-primary"
                      }`}
                    />
                    Select Year for Analysis
                  </Form.Label>
                  <Form.Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className={`form-select-lg ${
                      darkMode
                        ? "bg-dark text-white border-secondary"
                        : "bg-white text-dark border-light"
                    }`}
                    style={{ fontSize: "1.1rem" }}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Select>
                  <small
                    className={`mt-2 d-block ${
                      darkMode ? "text-white-50" : "text-muted"
                    }`}
                  >
                    Monthly data will be filtered by selected year
                  </small>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Analytics Charts */}
        <Row className="g-4 mb-5">
          {/* Monthly Submissions Chart */}
          <Col  md={4} className="mb-4">
            <Card
              className={`border-0 shadow-lg h-100 ${
                darkMode ? "bg-dark" : "bg-white"
              }`}
            >
              <Card.Header
                className={`border-0 py-3 ${
                  darkMode ? "bg-secondary text-white" : "bg-primary text-white"
                }`}
              >
                <h5 className="mb-0 fw-bold">
                  <FaCalendarAlt className="me-2" />
                  Monthly CV Submissions - {selectedYear}
                </h5>
                <small className="opacity-75">Filtered by selected year</small>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#495057" : "#dee2e6"}
                    />
                    <XAxis
                      dataKey="month"
                      stroke={darkMode ? "#adb5bd" : "#6c757d"}
                      fontSize={12}
                      fontWeight="500"
                    />
                    <YAxis
                      stroke={darkMode ? "#adb5bd" : "#6c757d"}
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill={darkMode ? "#4dabf7" : "#0d6efd"}
                      name="CV Submissions"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* Status Distribution Chart - ALL TIME */}
          <Col  md={4} className="mb-4">
            <Card
              className={`border-0 shadow-lg h-100 ${
                darkMode ? "bg-dark" : "bg-white"
              }`}
            >
              <Card.Header
                className={`border-0 py-3 ${
                  darkMode ? "bg-secondary text-white" : "bg-primary text-white"
                }`}
              >
                <h5 className="mb-0 fw-bold">
                  <FaUserTie className="me-2" />
                  Current Status Distribution
                </h5>
                <small className="opacity-75">All time data - no date filter</small>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={40}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="status"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: "12px",
                        color: darkMode ? "#adb5bd" : "#6c757d",
                      }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>


          {/* Intern Type Distribution Chart */}
          <Col  md={4} className="mb-4">
            <Card
              className={`border-0 shadow-lg h-100 ${
                darkMode ? "bg-dark" : "bg-white"
              }`}
            >
              <Card.Header
                className={`border-0 py-3 ${
                  darkMode ? "bg-secondary text-white" : "bg-primary text-white"
                }`}
              >
                <h5 className="mb-0 fw-bold">
                  <FaBriefcase className="me-2" />
                  Intern Type Distribution - {selectedYear}
                </h5>
                <small className="opacity-75">Filtered by selected year</small>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={internTypeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#495057" : "#dee2e6"}
                    />
                    <XAxis
                      dataKey="type"
                      stroke={darkMode ? "#adb5bd" : "#6c757d"}
                      fontSize={11}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      stroke={darkMode ? "#adb5bd" : "#6c757d"}
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      name="Application Count"
                      radius={[4, 4, 0, 0]}
                    >
                      {internTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* CV Table Section */}
        <Container
          className="mt-4 p-4 rounded"
          style={{
            background: darkMode ? "#343a40" : "#ffffff",
            color: darkMode ? "white" : "black",
            border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
          }}
        >
          <h5 className="mb-3">
            <FaFileCode
              className="me-2"
              style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
            />
            View All CVs
          </h5>
          <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

          {/* Filter Section */}
          <Row className="mb-3">
            <Col md={3} sm={6} xs={12}>
              <Form.Group controlId="filterCategory">
                <Form.Label>Filter Category</Form.Label>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="fullName">Name</option>
                  <option value="nic">NIC</option>
                  <option value="refNo">Ref No</option>
                  <option value="district">District</option>
                  <option value="institute">Institute</option>
                  <option value="userType">CV From</option>
                  <option value="selectedRole">Intern Type</option>
                  <option value="referredBy">Referred By</option>
                </Form.Select>
              </Form.Group>
            </Col>
          <Col md={5} sm={12} xs={12}>
            <Form.Group controlId="searchInput">
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder={`Search by ${filterCategory}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%" }}
              />
            </Form.Group>
          </Col>
          <Col
            md={4}
            sm={6}
            xs={12}
            className="d-flex justify-content-md-end justify-content-left mt-3 mt-md-0"
          >
            <Button
              variant="primary"
              onClick={() => navigate("/admin-add-cv")}
              className="mx-0"
              style={{ width: "auto" }}
            >
              Add New CV
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("/admin-approve-cvs")}
              className="mx-2"
              style={{ width: "auto" }}
            >
              Approve CVs
            </Button>
          </Col>
        </Row>

        {/* Button Filter Section */}
        <Row className="mb-4">
          {/* Status Filter */}
          <Col md={6}>
            <Form.Label>Status Filter</Form.Label>
            <div>
              <ButtonGroup className="flex-wrap">
                {[
                  { key: "all", label: "All CVs" },
                  { key: "cv-approved", label: "Approved CVs" },
                  { key: "cv-pending", label: "Pending CVs" },
                  { key: "interview-scheduled", label: "Interview Stage" },
                  { key: "cv-rejected", label: "Rejected CVs" }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant="outline-dark"
                    onClick={() => setStatusFilter(key)}
                    style={
                      statusFilter === key
                        ? { backgroundColor: "#6c757d", color: "white" }
                        : {}
                    }
                    className="mb-2"
                  >
                    {label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </Col>

          {/* Date Filter */}
          <Col md={6}>
            <Form.Label>Date Filter</Form.Label>
            <div>
              <ButtonGroup className="flex-wrap">
                {[
                  { key: "all", label: "All Dates" },
                  { key: "newest", label: "Newest First" },
                  { key: "earliest", label: "Earliest First" }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant="outline-dark"
                    onClick={() => setDateFilter(key)}
                    style={
                      dateFilter === key
                        ? { backgroundColor: "#6c757d", color: "white" }
                        : {}
                    }
                    className="mb-2"
                  >
                    {label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </Col>
        </Row>

        {/* Enhanced CV Table Container with Professional Horizontal Scrolling */}
        <div 
          className="enhanced-table-container" 
          style={tableContainerStyles}
          tabIndex="0" 
          role="region"
          aria-label="CV data table with horizontal scrolling"
        >
          <Table
            striped
            bordered
            hover
            variant={darkMode ? "dark" : "light"}
            className="mb-0"
          >
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="text-center align-middle">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentCVs.length > 0 ? (
                currentCVs.map((cv, index) => (
                  <tr key={cv._id || index}>
                    <td className="text-center">{indexOfFirstCV + index + 1}</td>
                    <td title={cv.nic || "N/A"}>{cv.nic || "N/A"}</td>
                    <td title={cv.refNo || "N/A"}>{cv.refNo || "N/A"}</td>
                    <td title={renderNameWithPrefix(cv.fullName, cv.gender)}>
                      {renderNameWithPrefix(cv.fullName, cv.gender)}
                    </td>
                    <td title={cv.userType || "N/A"}>{cv.userType || "N/A"}</td>
                    <td title={cv.selectedRole || "N/A"}>{cv.selectedRole || "N/A"}</td>
                    <td title={cv.applicationDate ? new Date(cv.applicationDate).toLocaleDateString() : "N/A"}>
                      {cv.applicationDate
                        ? new Date(cv.applicationDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td title={cv.district || "N/A"}>{cv.district || "N/A"}</td>
                    <td title={cv.institute || "N/A"}>{cv.institute || "N/A"}</td>
                    <td title={cv.referredBy || "N/A"}>{cv.referredBy || "N/A"}</td>
                    {hasInternshipCVs() && (
                      <td title={cv.selectedRole === 'internship' ? cv.roleData?.internship?.categoryOfApply || "N/A" : "-"}>
                        {cv.selectedRole === 'internship' 
                          ? cv.roleData?.internship?.categoryOfApply || "N/A"
                          : "-"
                        }
                      </td>
                    )}
                    <td className="text-center">
                      <span
                        className={`badge ${getStatusBadgeClass(cv.currentStatus)}`}
                        title={formatStatus(cv.currentStatus)}
                      >
                        {formatStatus(cv.currentStatus)}
                      </span>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleView(cv._id)}
                        className="fw-semibold"
                      >
                        View
                      </Button>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteClick(cv._id)}
                        className="fw-semibold"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    <div>
                      <i className="fa fa-search mb-2" style={{ fontSize: '2rem' }}></i>
                      <br />
                      {searchTerm || statusFilter !== "all" || dateFilter !== "all" 
                        ? "No CVs found matching your criteria" 
                        : "No CVs found"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: "5px", fontSize: "14px" }}
                >
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ minHeight: "30px" }}
                  >
                    <div className="flex-grow-1 text-center">
                      <span>
                        {filteredData.length} of {cvData.length} CV(s) shown
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
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
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
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
        </div>

      </Container>
        </Container>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onDelete={handleDelete}
        cvData={cvToDelete}
        darkMode={darkMode}
        loading={deleteLoading}
      />
    
    </div>
    
  );
};

export default ViewAllCVs;