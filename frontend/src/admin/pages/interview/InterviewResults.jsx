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
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaFileExcel,
  FaFilePdf,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa";
import logo from "../../../assets/logo.png";
import PassModal from "../../../components/notifications/PassModal";
import FailModal from "../../../components/notifications/FailModal";
import RescheduleInterviewModal from "../../../components/notifications/RescheduleInterviewModal"; 
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InterviewResults = ({ darkMode }) => {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState([]);
  const [filteredCvData, setFilteredCvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [interviewSearchTerm, setInterviewSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Modal states
  const [showPassModal, setShowPassModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false); 
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [selectedCvRef, setSelectedCvRef] = useState("");
  const [isBulkAction, setIsBulkAction] = useState(false);
  const [currentInterviewId, setCurrentInterviewId] = useState(null); 
  const [currentInterviewName, setCurrentInterviewName] = useState(""); 

  const token = localStorage.getItem("token");
  const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/interviews`;

  const api = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api/cvs`,
  });

  // Add request interceptor
  api.interceptors.request.use(
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

  // Add response interceptor to handle 401 errors
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token
          const refreshToken = localStorage.getItem("refreshToken");
          const response = await axios.post("/api/auth/refresh", {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem("token", token);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          // If refresh fails, redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
  // Fetch CVs with scheduled interviews
  const fetchCVs = async () => {
    setLoading(true);
    setError("");

    try {
      if (!token) {
        navigate("/login");
        return;
      }

      // Make the API request
      const response = await api.get("/scheduled-interviews");

      // Access the data array from response.data.data
      const interviewData = response.data.data || []; 

      // No need for additional filtering since backend already filtered
      setCvData(interviewData);
      setFilteredCvData(interviewData);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch interview data."
      );
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  // Filter CVs based on search term
  useEffect(() => {
    if (interviewSearchTerm.trim() === "") {
      setFilteredCvData(cvData);
    } else {
      const searchTermLower = interviewSearchTerm.toLowerCase();
      const filtered = cvData.filter(
        (cv) =>
          (cv.interview?.interviewName &&
            cv.interview.interviewName
              .toLowerCase()
              .includes(searchTermLower)) ||
          (cv.fullName &&
            cv.fullName.toLowerCase().includes(searchTermLower)) ||
          (cv.nic && cv.nic.toLowerCase().includes(searchTermLower))
      );
      setFilteredCvData(filtered);
    }
    setCurrentPage(1);
    setSelectedRows([]);
  }, [interviewSearchTerm, cvData]);

  // Open pass modal
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

  // Open fail modal
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

  // Open reschedule modal
  const openRescheduleModal = (id, refNo, interviewId, interviewName) => {
    setSelectedCvId(id);
    setSelectedCvRef(refNo);
    setCurrentInterviewId(interviewId);
    setCurrentInterviewName(interviewName);
    setShowRescheduleModal(true);
  };

  // Handle reschedule interview
  const handleRescheduleInterview = async (newInterviewId, currentInterviewId, reason) => {
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return false;
      }
  
      // Make the API call to reschedule the interview with new interview ID
      const response = await api.patch(`/${selectedCvId}/reschedule-interview`, {
        interviewId: currentInterviewId,
        newInterviewId: newInterviewId, // Send the new interview ID
        notes: reason
      });
  
      setSuccessMessage(`Interview for ${selectedCvRef} has been rescheduled successfully!`);
      
      // Close modal and refresh data after successful rescheduling
      setTimeout(() => {
        setShowRescheduleModal(false);
        fetchCVs();
      }, 1500);
      
      return true;
    } catch (error) {
      console.error("Reschedule error:", error);
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to reschedule interview. Please try again.";
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Handle pass interview
  const handlePassInterview = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      if (isBulkAction) {
        const results = await Promise.all(
          selectedRows.map((id) =>
            api.post(
              `/${id}/pass-interview`,
              {},
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            )
          )
        );
      } else {
        await api.post(
          `/${selectedCvId}/pass-interview`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setSuccessMessage(
        isBulkAction
          ? "Selected candidates passed successfully!"
          : `Candidate ${selectedCvRef} passed successfully!`
      );

      setTimeout(() => {
        setShowPassModal(false);
        fetchCVs();
      }, 1500);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        //navigate("/login");
      } else {
        setError(
          error.response?.data?.message || "Failed to update interview status"
        );
      }
    }
  };

  // handleFailInterview
  const handleFailInterview = async () => {
    setError("");
    try {
      if (isBulkAction) {
        for (const id of selectedRows) {
          await api.post(`/${id}/fail-interview`);
        }
      } else {
        await api.post(`/${selectedCvId}/fail-interview`);
      }
      setShowFailModal(false);
      fetchCVs();
      setSuccessMessage(
        isBulkAction
          ? "Bulk fail successful!"
          : `CV ${selectedCvRef} failed successfully!`
      );
    } catch (error) {
      console.error("Error failing interview:", error.message);
      setError(
        `Failed to update interview status: ${
          error.response?.data?.message || error.message
        }`
      );
    }
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
        "Interview Name":
          cv.interview?.interviews[0]?.interviewId?.interviewName || "N/A",
        "Interview Date": cv.interview?.interviews[0]?.interviewId
          ?.interviewDate
          ? new Date(cv.interview.interviews[0].interviewId.interviewDate).toLocaleDateString()
          : "N/A",
        "Interview Time":
          cv.interview?.interviews[0]?.interviewId?.interviewTime || "N/A",
        Location: cv.interview?.interviews[0]?.interviewId?.location || "N/A",
        Status: cv.interviewStatus || "Scheduled",
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Interviews");

      // Set column widths
      const columnWidths = [
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
      ];
      worksheet["!cols"] = columnWidths;

      const date = new Date();
      const fileName = `Interview_Results_${
        date.toISOString().split("T")[0]
      }.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError("Failed to export to Excel. Please try again.");
    }
  };

  const exportToPDF = () => {
    try {
      let dataToExport =
        selectedRows.length > 0
          ? filteredCvData.filter((cv) => selectedRows.includes(cv._id))
          : filteredCvData;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("List of Scheduled Interviews", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      if (interviewSearchTerm) {
        doc.text(`Search: "${interviewSearchTerm}"`, 14, 38);
      }

      const tableColumn = [
        "Ref. No.",
        "Name",
        "Category",
        "Interview",
        "Date",
        "Time",
        "Location",
        "Status",
      ];

      const tableRows = [];

      dataToExport.forEach((cv) => {
        const cvData = [
          cv.refNo || "N/A",
          cv.fullName || "N/A",
          cv.selectedRole || "N/A",
          cv.interview?.interviews[0]?.interviewId?.interviewName || "N/A",
          cv.interview?.interviews[0]?.interviewId?.interviewDate
            ? new Date(cv.interview.interviews[0].interviewId.interviewDate).toLocaleDateString()
            : "N/A",
          cv.interview?.interviews[0]?.interviewId?.interviewTime || "N/A",
          cv.interview?.interviews[0]?.interviewId?.location || "N/A",
          cv.interviewStatus ? cv.interviewStatus.toUpperCase() : "SCHEDULED",
        ];
        tableRows.push(cvData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: interviewSearchTerm ? 45 : 38,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { cellWidth: 15 },
          5: { cellWidth: 15 },
          6: { cellWidth: 20 },
          7: { cellWidth: 15 },
        },
      });

      const date = new Date();
      const fileName = `Interview_Results_${
        date.toISOString().split("T")[0]
      }.pdf`;

      doc.save(fileName);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setError("Failed to export to PDF. Please try again.");
    }
  };

  // Handle row selection
  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  // Select all rows
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

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // Updated columns to include "Re-Schedule" column
  const columns = [
    "Select",
    "Ref. No.",
    "NIC",
    "Full Name",
    "Category",
    "Mobile No",
    "Interview Name",
    "Interview Date",
    "Interview Time",
    "Location",
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
    >
      <Container className="text-center mt-4 mb-3">
        <img
          src={logo}
          alt="SLT Mobitel Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">INTERVIEW MANAGEMENT</h3>
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
          <FaEye
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          Scheduled Interviews
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        <Row className="mb-3 align-items-end">
          <Col md={5} lg={4}>
            <Form.Group controlId="interviewSearch">
              <Form.Label>Search Interviews</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, NIC or interview..."
                  value={interviewSearchTerm}
                  onChange={(e) => setInterviewSearchTerm(e.target.value)}
                />
                {interviewSearchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setInterviewSearchTerm("")}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Form.Group>
          </Col>
          <Col
            md={7}
            lg={8}
            className="d-flex justify-content-md-end mt-3 mt-md-0"
          >
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
          </Col>
        </Row>

        {/* Export Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-left mb-3">
          <div className="mb-2 mb-sm-0">
            <span>Total Scheduled: {filteredCvData.length}</span>
            {selectedRows.length > 0 && (
              <span className="ms-2">Selected: {selectedRows.length}</span>
            )}
          </div>
          <div className="d-flex justify-content-start flex-wrap">
            <Button
              variant="success"
              size="sm"
              onClick={exportToExcel}
              style={{ marginLeft: "3px", marginTop: "5px" }}
              disabled={filteredCvData.length === 0}
            >
              <FaFileExcel className="me-1" /> Export Excel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={exportToPDF}
              style={{ marginLeft: "10px", marginTop: "5px" }}
              disabled={filteredCvData.length === 0}
            >
              <FaFilePdf className="me-1" /> Export PDF
            </Button>
          </div>
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
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
            <p>Loading scheduled interviews...</p>
          </div>
        ) : (
          <>
            <Table
              striped
              bordered
              hover
              variant={darkMode ? "dark" : "light"}
              responsive
            >
              <thead>
                <tr>
                  <th>
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
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentCvs.length > 0 ? (
                  currentCvs.map((cv, index) => (
                    <tr key={cv._id || index}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedRows.includes(cv._id)}
                          onChange={() => handleSelectRow(cv._id)}
                        />
                      </td>
                      <td>{cv.refNo || "N/A"}</td>
                      <td>{cv.nic || "N/A"}</td>
                      <td>{cv.fullName || "N/A"}</td>
                      <td>{cv.selectedRole || "N/A"}</td>
                      <td>{cv.mobileNumber || "N/A"}</td>
                      <td>
                        {cv.interview?.interviews[0]?.interviewId
                          ?.interviewName || "N/A"}
                      </td>
                      <td>
                        {cv.interview?.interviews[0]?.interviewId?.interviewDate
                          ? new Date(
                              cv.interview.interviews[0].interviewId.interviewDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        {cv.interview?.interviews[0]?.interviewId
                          ?.interviewTime || "N/A"}
                      </td>
                      <td>
                        {cv.interview?.interviews[0]?.interviewId?.location ||
                          "N/A"}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/view-cv/${cv._id}`)}
                          className="fw-semibold"
                        >
                          View
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => openPassModal(cv._id, cv.refNo)}
                          className="fw-semibold"
                        >
                          Pass
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => openFailModal(cv._id, cv.refNo)}
                          className="fw-semibold"
                        >
                          Fail
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => openRescheduleModal(
                            cv._id, 
                            cv.refNo, 
                            cv.interview?.interviews[0]?.interviewId?._id,
                            cv.interview?.interviews[0]?.interviewId?.interviewName
                          )}
                          className="fw-semibold"
                        >
                          Reschedule
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center">
                      {interviewSearchTerm
                        ? "No matching interviews found"
                        : "No scheduled interviews found"}
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
                          interviews
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
          </>
        )}
      </Container>

      {/* Pass Modal */}
      <PassModal
        show={showPassModal}
        onClose={() => setShowPassModal(false)}
        onConfirm={handlePassInterview}
        refNo={selectedCvRef}
        isBulk={isBulkAction}
        darkMode={darkMode}
      />

      {/* Fail Modal */}
      <FailModal
        show={showFailModal}
        onClose={() => setShowFailModal(false)}
        onConfirm={handleFailInterview}
        refNo={selectedCvRef}
        isBulk={isBulkAction}
        darkMode={darkMode}
      />

      {/* Reschedule Modal */}
      <RescheduleInterviewModal
        show={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleRescheduleInterview}
        refNo={selectedCvRef}
        darkMode={darkMode}
        successMessage={successMessage}
        errorMessage={error}
        onClearMessages={clearMessages}
        currentInterviewId={currentInterviewId}
        currentInterviewName={currentInterviewName}
      />
    </div>
  );
};

export default InterviewResults;