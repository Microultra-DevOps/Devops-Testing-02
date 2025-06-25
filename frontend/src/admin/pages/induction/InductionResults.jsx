import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form, InputGroup, Row, Col, ButtonGroup} from "react-bootstrap";
import { FaEye, FaChevronLeft, FaChevronRight, FaFileExcel, FaFilePdf, FaSearch, FaCalendarAlt } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import PassModal from "../../../components/notifications/PassModal";
import FailModal from "../../../components/notifications/FailModal";
import RescheduleInductionModal from "../../../components/notifications/RescheduleInductionModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Create axios instance for API calls
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
});

const InductionResults = ({ darkMode }) => {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState([]);
  const [filteredCvData, setFilteredCvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [inductionSearchTerm, setInductionSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [assignmentTypeFilter, setAssignmentTypeFilter] = useState("all");

  const [showPassModal, setShowPassModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [selectedCvRef, setSelectedCvRef] = useState("");
  const [selectedInductionId, setSelectedInductionId] = useState("");
  const [selectedInductionName, setSelectedInductionName] = useState("");
  const [isBulkAction, setIsBulkAction] = useState(false);

  // Set up axios interceptors
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/refresh`, {
              refreshToken,
            });

            const { token } = response.data;
            localStorage.setItem("token", token);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } catch (err) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            navigate("/login");
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  const fetchCVs = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/cvs/assigned-to-induction");
      const inductionData = response.data || [];

      // Include all CVs with induction-assigned and induction-re-scheduled status
      const filteredData = inductionData.filter(cv => 
        cv.induction?.status === "induction-assigned" || 
        cv.induction?.status === "induction-re-scheduled" ||
        cv.currentStatus === "induction-assigned" ||
        cv.currentStatus === "induction-re-scheduled"
      );

      setCvData(filteredData);
      setFilteredCvData(filteredData);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch induction data."
      );
      console.error("Error fetching inductions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  useEffect(() => {
    let filtered = cvData;

    // Filter by search term
    if (inductionSearchTerm.trim() !== "") {
      const term = inductionSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (cv) =>
          (cv.induction?.inductionName &&
            cv.induction.inductionName.toLowerCase().includes(term)) ||
          (cv.fullName && cv.fullName.toLowerCase().includes(term)) ||
          (cv.nic && cv.nic.toLowerCase().includes(term)) ||
          (cv.refNo && cv.refNo.toLowerCase().includes(term))
      );
    }

    // Filter by assignment type
    if (assignmentTypeFilter !== "all") {
      filtered = filtered.filter((cv) => {
        const assignmentType = getAssignmentType(cv);
        return assignmentType.toLowerCase() === assignmentTypeFilter.toLowerCase();
      });
    }

    setFilteredCvData(filtered);
    setCurrentPage(1);
    setSelectedRows([]);
  }, [cvData, inductionSearchTerm, assignmentTypeFilter]);

  // Get assignment type based on interviewScheduled status
  const getAssignmentType = (cv) => {
    if (cv.interview?.interviewScheduled === false) {
      return "Direct";
    } else if (cv.interview?.interviewScheduled === true) {
      return "Interview Assigned";
    }
    return "Direct"; 
  };

  const openPassModal = (id, refNo, bulk = false) => {
    setIsBulkAction(bulk);
    if (bulk) {
      if (selectedRows.length === 0) {
        setError("Please select at least one row to perform bulk action");
        return;
      }
      setSelectedCvRef("multiple selected references");
    } else {
      setSelectedCvId(id);
      setSelectedCvRef(refNo);
    }
    setShowPassModal(true);
  };

  const openFailModal = (id, refNo, bulk = false) => {
    setIsBulkAction(bulk);
    if (bulk) {
      if (selectedRows.length === 0) {
        setError("Please select at least one row to perform bulk action");
        return;
      }
      setSelectedCvRef("multiple selected references");
    } else {
      setSelectedCvId(id);
      setSelectedCvRef(refNo);
    }
    setShowFailModal(true);
  };

  const openRescheduleModal = (id, refNo, inductionId, inductionName) => {
    setSelectedCvId(id);
    setSelectedCvRef(refNo);
    setSelectedInductionId(inductionId);
    setSelectedInductionName(inductionName);
    setShowRescheduleModal(true);
  };

  const handlePassInduction = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (isBulkAction) {
        const results = await Promise.all(
          selectedRows.map((id) =>
            api.patch(`/cvs/${id}/pass-induction`, {
              status: "induction-passed",
            })
          )
        );
      } else {
        await api.patch(`/cvs/${selectedCvId}/pass-induction`, {
          status: "induction-passed",
        });
      }

      setSuccessMessage(
        isBulkAction
          ? "Selected candidates passed successfully!"
          : `Candidate ${selectedCvRef} passed successfully!`
      );

      setTimeout(() => {
        setShowPassModal(false);
        fetchCVs();
        setSuccessMessage("");
      }, 1500);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(
          error.response?.data?.message || "Failed to update induction status"
        );
      }
    }
  };

  const handleFailInduction = async () => {
    setError("");
    try {
      if (isBulkAction) {
        for (const id of selectedRows) {
          await api.patch(`/cvs/${id}/fail-induction`);
        }
      } else {
        await api.patch(`/cvs/${selectedCvId}/fail-induction`);
      }
      setShowFailModal(false);
      fetchCVs();
      setSuccessMessage(
        isBulkAction
          ? "Bulk fail successful!"
          : `CV ${selectedCvRef} failed successfully!`
      );
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error failing induction:", error.message);
      setError(
        `Failed to update induction status: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleRescheduleInduction = async (newInductionId, currentInductionId, reason) => {
    setError("");
    try {
      await api.patch(`/cvs/${selectedCvId}/reschedule-induction`, {
        newInductionId: newInductionId,
        currentInductionId: currentInductionId,
        reason: reason
      });
      
      setSuccessMessage(`Induction for ${selectedCvRef} rescheduled successfully!`);
      setTimeout(() => {
        setShowRescheduleModal(false);
        fetchCVs();
        setSuccessMessage("");
      }, 1500);
    } catch (error) {
      console.error("Error rescheduling induction:", error);
      setError(
        error.response?.data?.message || "Failed to reschedule induction"
      );
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // Get induction status display text
  const getInductionStatus = (cv) => {
    if (cv.induction?.status === "induction-re-scheduled" || cv.currentStatus === "induction-re-scheduled") {
      return "Re-scheduled";
    } else if (cv.induction?.status === "induction-assigned" || cv.currentStatus === "induction-assigned") {
      return "Scheduled";
    }
    return cv.currentStatus || "Pending";
  };

  // Export to Excel 
  const exportToExcel = () => {
    try {
      let dataToExport =
        selectedRows.length > 0
          ? filteredCvData.filter((cv) => selectedRows.includes(cv._id))
          : filteredCvData;

      const formattedData = dataToExport.map((cv) => ({
        "Reference No": cv.refNo || "N/A",
        NIC: cv.nic || "N/A",
        "Full Name": cv.fullName || "N/A",
        Category: cv.selectedRole || "N/A",
        "Mobile No": cv.mobileNumber || "N/A",
        "Assignment Type": getAssignmentType(cv),
        "Induction Name": cv.induction?.inductionName || "N/A",
        "Start Date": cv.induction?.inductionStartDate
          ? new Date(cv.induction.inductionStartDate).toLocaleDateString()
          : "N/A",
        "End Date": cv.induction?.inductionEndDate
          ? new Date(cv.induction.inductionEndDate).toLocaleDateString()
          : "N/A",
        Status: getInductionStatus(cv),
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inductions");

      const columnWidths = [
        { wch: 15 }, // Reference No
        { wch: 15 }, // NIC
        { wch: 25 }, // Full Name
        { wch: 20 }, // Category
        { wch: 15 }, // Mobile No
        { wch: 18 }, // Assignment Type
        { wch: 25 }, // Induction Name
        { wch: 15 }, // Start Date
        { wch: 15 }, // End Date
        { wch: 15 }, // Status
      ];
      worksheet["!cols"] = columnWidths;

      const date = new Date();
      const fileName = `Induction_Results_${
        date.toISOString().split("T")[0]
      }.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError("Failed to export to Excel. Please try again.");
    }
  };

  // Export to PDF - Updated to include Assignment Type
  const exportToPDF = () => {
    try {
      let dataToExport =
        selectedRows.length > 0
          ? filteredCvData.filter((cv) => selectedRows.includes(cv._id))
          : filteredCvData;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("List of Induction Candidates", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      if (inductionSearchTerm) {
        doc.text(`Search: "${inductionSearchTerm}"`, 14, 38);
      }

      if (assignmentTypeFilter !== "all") {
        const filterText = assignmentTypeFilter === "direct" ? "Direct" : "Interview Assigned";
        doc.text(`Filter: ${filterText}`, 14, inductionSearchTerm ? 42 : 38);
      }

      const tableColumn = [
        "Ref. No.",
        "Name",
        "Category",
        "Mobile",
        "Assignment",
        "Induction",
        "Start Date",
        "End Date",
        "Status",
      ];

      const tableRows = [];

      dataToExport.forEach((cv) => {
        const cvData = [
          cv.refNo || "N/A",
          cv.fullName || "N/A",
          cv.selectedRole || "N/A",
          cv.mobileNumber || "N/A",
          getAssignmentType(cv),
          cv.induction?.inductionName || "N/A",
          cv.induction?.inductionStartDate
            ? new Date(cv.induction.inductionStartDate).toLocaleDateString()
            : "N/A",
          cv.induction?.inductionEndDate
            ? new Date(cv.induction.inductionEndDate).toLocaleDateString()
            : "N/A",
          getInductionStatus(cv),
        ];
        tableRows.push(cvData);
      });

      const startY = (inductionSearchTerm && assignmentTypeFilter !== "all") ? 50 : 
                    (inductionSearchTerm || assignmentTypeFilter !== "all") ? 45 : 38;

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: startY,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 18 }, // Ref. No.
          1: { cellWidth: 25 }, // Name
          2: { cellWidth: 20 }, // Category
          3: { cellWidth: 18 }, // Mobile
          4: { cellWidth: 20 }, // Assignment
          5: { cellWidth: 25 }, // Induction
          6: { cellWidth: 18 }, // Start Date
          7: { cellWidth: 18 }, // End Date
          8: { cellWidth: 18 }, // Status
        },
      });

      const date = new Date();
      const fileName = `Induction_Results_${
        date.toISOString().split("T")[0]
      }.pdf`;

      doc.save(fileName);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setError("Failed to export to PDF. Please try again.");
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === currentCvs.length
        ? []
        : currentCvs.map((cv) => cv._id)
    );
  };

  const indexOfLastCv = currentPage * itemsPerPage;
  const indexOfFirstCv = indexOfLastCv - itemsPerPage;
  const currentCvs = filteredCvData.slice(indexOfFirstCv, indexOfLastCv);
  const totalPages = Math.ceil(filteredCvData.length / itemsPerPage);

  const columns = [
    "Select",
    "Ref. No.",
    "NIC",
    "Full Name",
    "Category",
    "Mobile No",
    "Assignment Type",
    "Induction Name",
    "Start Date",
    "End Date",
    "Status",
    "View",
    "Pass",
    "Fail",
    "Reschedule" 
  ];

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
      style={{ padding: 0, margin: 0 }}
    >
      <Container className="text-center py-3" style={{ marginBottom: 0 }}>
        <img
          src={logo}
          alt="SLT Mobitel Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-2 mb-0">INDUCTION MANAGEMENT</h3>
      </Container>

      <Container
        className="p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
          marginTop: "1rem",
          marginBottom: "1rem"
        }}
      >
        <h5 className="mb-3">
          <FaEye
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          Manage Induction Candidates
        </h5>

        <hr className={darkMode ? "border-light my-3" : "border-dark my-3"} />

        <Row className="mb-3 align-items-end">
          <Col md={6} lg={5}>
            <Form.Group controlId="inductionSearch">
              <Form.Label>Search Candidates</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, NIC or reference..."
                  value={inductionSearchTerm}
                  onChange={(e) => setInductionSearchTerm(e.target.value)}
                />
                {inductionSearchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setInductionSearchTerm("")}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Form.Group>
          </Col>
          
          <Col md={6} lg={4}>
            <Form.Group controlId="assignmentTypeFilter">
              <Form.Label>Filter by Assignment Type</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  name="assignmentType"
                  id="all-assignments"
                  label="All"
                  checked={assignmentTypeFilter === "all"}
                  onChange={() => setAssignmentTypeFilter("all")}
                />
                <Form.Check
                  type="radio"
                  name="assignmentType"
                  id="direct-assignments"
                  label="Direct"
                  checked={assignmentTypeFilter === "Direct"}
                  onChange={() => setAssignmentTypeFilter("Direct")}
                />
                <Form.Check
                  type="radio"
                  name="assignmentType"
                  id="interview-assignments"
                  label="Interview Assigned"
                  checked={assignmentTypeFilter === "Interview Assigned"}
                  onChange={() => setAssignmentTypeFilter("Interview Assigned")}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        {/* Export Buttons */}
        <div className="d-flex justify-content-left mb-3">
          <Button
            variant="success"
            size="sm"
            onClick={exportToExcel}
            className="me-2"
            disabled={filteredCvData.length === 0}
          >
            <FaFileExcel className="me-1" /> Export Excel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={exportToPDF}
            disabled={filteredCvData.length === 0}
          >
            <FaFilePdf className="me-1" /> Export PDF
          </Button>
        </div>

        {/* Bulk Actions */}
        <div className="d-flex justify-content-left mb-3">
          <Button
            variant="success"
            size="sm"
            className="me-2"
            onClick={() => openPassModal(null, null, true)}
            disabled={selectedRows.length === 0}
          >
            Bulk Pass
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => openFailModal(null, null, true)}
            disabled={selectedRows.length === 0}
          >
            Bulk Fail
          </Button>
        </div>

        <div className="mb-3">
          <span>Total Candidates: {filteredCvData.length}</span>
          {selectedRows.length > 0 && (
            <span className="ms-2">Selected: {selectedRows.length}</span>
          )}
        </div>

        {error && (
          <Alert
            variant="danger"
            className="text-center mb-3"
            onClose={() => setError("")}
            dismissible
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            variant="success"
            className="text-center mb-3"
            onClose={() => setSuccessMessage("")}
            dismissible
          >
            {successMessage}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
            <p className="mt-2">Loading induction candidates...</p>
          </div>
        ) : (
          <div style={{ marginTop: 0, paddingTop: 0 }}>
            <Table
              striped
              bordered
              hover
              variant={darkMode ? "dark" : "light"}
              responsive
              style={{ marginTop: 0 }}
            >
              <thead>
                <tr>
                  <th style={{ padding: "8px", verticalAlign: "middle" }}>
                    <Form.Check
                      type="checkbox"
                      checked={
                        selectedRows.length === currentCvs.length &&
                        currentCvs.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  {columns.slice(1).map((col, index) => (
                    <th key={index} style={{ padding: "8px", verticalAlign: "middle" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentCvs.length > 0 ? (
                  currentCvs.map((cv, index) => (
                    <tr key={cv._id || index}>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedRows.includes(cv._id)}
                          onChange={() => handleSelectRow(cv._id)}
                        />
                      </td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>{cv.refNo || "N/A"}</td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>{cv.nic || "N/A"}</td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>{cv.fullName || "N/A"}</td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>{cv.selectedRole || "N/A"}</td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>{cv.mobileNumber || "N/A"}</td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>
                        <span className={`badge ${
                          getAssignmentType(cv) === "Direct" 
                            ? "bg-primary" 
                            : "bg-secondary"
                        }`}>
                          {getAssignmentType(cv)}
                        </span>
                      </td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>{cv.induction?.inductionName || "N/A"}</td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>
                        {cv.induction?.inductionStartDate
                          ? new Date(cv.induction.inductionStartDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>
                        {cv.induction?.inductionEndDate
                          ? new Date(cv.induction.inductionEndDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>
                        <span className={`badge ${
                          getInductionStatus(cv) === "Re-scheduled" 
                            ? "bg-warning" 
                            : "bg-info"
                        }`}>
                          {getInductionStatus(cv)}
                        </span>
                      </td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/view-cv/${cv._id}`)}
                          className="fw-semibold"
                        >
                          View
                        </Button>
                      </td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => openPassModal(cv._id, cv.refNo)}
                          className="fw-semibold"
                          disabled={
                            cv.induction?.result?.status === "induction-passed"
                          }
                        >
                          Pass
                        </Button>
                      </td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => openFailModal(cv._id, cv.refNo)}
                          className="fw-semibold"
                          disabled={
                            cv.induction?.result?.status === "induction-failed"
                          }
                        >
                          Fail
                        </Button>
                      </td>
                      <td style={{ padding: "8px", verticalAlign: "middle" }}>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => openRescheduleModal(
                            cv._id, 
                            cv.refNo, 
                            cv.induction?._id,
                            cv.induction?.inductionName
                          )}
                          className="fw-semibold"
                          disabled={
                            cv.induction?.result?.status === "induction-passed"
                          }
                        >
                           Reschedule
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      {inductionSearchTerm || assignmentTypeFilter !== "all"
                        ? "No matching candidates found"
                        : "No induction candidates found"}
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
                          Showing {currentCvs.length} of {filteredCvData.length}{" "}
                          candidates
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
                        <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
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
        )}
      </Container>

      {/* Pass Modal */}
      <PassModal
        show={showPassModal}
        onClose={() => setShowPassModal(false)}
        onConfirm={handlePassInduction}
        refNo={selectedCvRef}
        isBulk={isBulkAction}
        darkMode={darkMode}
      />

      {/* Fail Modal */}
      <FailModal
        show={showFailModal}
        onClose={() => setShowFailModal(false)}
        onConfirm={handleFailInduction}
        refNo={selectedCvRef}
        isBulk={isBulkAction}
        darkMode={darkMode}
      />

      {/* Reschedule Modal */}
      <RescheduleInductionModal
        show={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleRescheduleInduction}
        refNo={selectedCvRef}
        darkMode={darkMode}
        successMessage={successMessage}
        errorMessage={error}
        onClearMessages={clearMessages}
        currentInductionId={selectedInductionId}
        currentInductionName={selectedInductionName}
      />
    </div>
  );
};

export default InductionResults;