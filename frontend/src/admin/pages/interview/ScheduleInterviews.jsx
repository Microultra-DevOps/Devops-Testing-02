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
} from "react-bootstrap";
import { FaPenFancy, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import ScheduleInterviewModal from "../../../components/notifications/ScheduleInterviewModal";
import AssignInductionModal from "../../../components/notifications/AssignInductionModal";

const ScheduleInterviews = ({ darkMode }) => {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduleModalMessage, setScheduleModalMessage] = useState({
    variant: "",
    message: "",
  });
  const [assignModalMessage, setAssignModalMessage] = useState({
    variant: "",
    message: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [cvToSchedule, setCvToSchedule] = useState(null);
  const [cvToAssign, setCvToAssign] = useState(null);
  const [batchSchedule, setBatchSchedule] = useState(false);
  const [batchAssign, setBatchAssign] = useState(false);
  const [selectedInduction, setSelectedInduction] = useState("");
  const [error, setError] = useState({ variant: "", message: "" });
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: `${API_BASE_URL}/api/cvs`,
    headers: { Authorization: `Bearer ${token}` },
  });

  api.interceptors.request.use(
    (config) => {
      console.log("Making request to:", config.url);
      console.log("Request data:", config.data);
      return config;
    },
    (error) => {
      console.error("Request error:", error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log("Response from:", response.config.url);
      console.log("Response data:", response.data);
      return response;
    },
    (error) => {
      console.error("Response error:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchCVs();
    } finally {
      setRefreshing(false);
    }
  };
  const fetchCVs = async () => {
    setLoading(true);
    setError({ variant: "", message: "" });
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/approved-not-scheduled-cvs", {
        params: {
          "cvApproval.cvApproved": true,
          "cvApproval.status": "cv-approved",
          "interview.status": "interview-not-scheduled",
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setCvData(response.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch CV data";
      setError({
        variant: "danger",
        message: errorMsg,
      });
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, [navigate]);

  // Schedule interview(s)
  const handleSchedule = async (interviewId) => {
    try {
      if (batchSchedule) {
        await Promise.all(
          selectedRows.map((id) =>
            api.patch(`/${id}/schedule-interview`, {
              interviewId,
              status: "interview-scheduled",
            })
          )
        );
        return true;
      } else if (cvToSchedule) {
        await api.patch(`/${cvToSchedule._id}/schedule-interview`, {
          interviewId,
          status: "interview-scheduled",
        });
        return true;
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      throw error;
    }
  };

  // Assign Induction
  const handleAssignInduction = async (payload) => {
    try {
      if (!payload.inductionId) {
        throw new Error("Please select an induction to assign");
      }

      // Get and validate induction details
      const induction = await fetchAndValidateInduction(payload.inductionId);

      if (batchAssign) {
        // Process batch assignment
        const results = await processBatchAssignment(
          selectedRows,
          payload.inductionId,
          induction
        );
        return handleBatchResults(results);
      } else {
        // Single assignment
        await assignSingleCV(cvToAssign._id, payload.inductionId, induction);
        return "Induction assigned successfully!";
      }
    } catch (error) {
      console.error("Assignment failed:", {
        error: error.response?.data || error.message,
        payload,
        selectedRows,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  };

  // New helper functions
  const fetchAndValidateInduction = async (inductionId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/inductions/${inductionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const induction = response.data;

      // Modified validation to match your schema
      const requiredFields = ["induction", "startDate", "endDate", "location"];

      const missingFields = requiredFields.filter((field) => !induction[field]);

      if (missingFields.length > 0) {
        throw new Error(
          `Induction is missing required fields: ${missingFields.join(", ")}`
        );
      }

      return induction;
    } catch (error) {
      console.error("Failed to fetch/validate induction:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Invalid induction data. Please select a different induction program."
      );
    }
  };

  const processBatchAssignment = async (cvIds, inductionId, induction) => {
    return Promise.all(
      cvIds.map(async (cvId) => {
        try {
          const result = await assignSingleCV(cvId, inductionId, induction);
          return { success: true, cvId, data: result.data };
        } catch (error) {
          console.error(`Failed to assign CV ${cvId}:`, error);
          return { success: false, cvId, error: error.message };
        }
      })
    );
  };

  const assignSingleCV = async (cvId, inductionId, induction) => {
    const cv = cvData.find((c) => c._id === cvId);
    if (!cv) throw new Error(`CV ${cvId} not found`);

    // Verify we have an email address
    const recipientEmail = cv.email || cv.userId?.email;
    if (!recipientEmail) {
      throw new Error(`No email address found for CV ${cvId}`);
    }

    return api.patch(`/${cvId}/assign-induction`, {
      inductionId,
      interviewStatus: "interview-skipped",
      inductionStatus: "induction-assigned",
      emailData: {
        recipientEmail,
        location: induction.location,
        requirements: induction.requirements,
      },
    });
  };

  const handleBatchResults = (results) => {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      console.error("Some assignments failed:", failed);
      // Still show success count but warn about failures
      return `${successful.length}/${results.length} CVs assigned successfully (${failed.length} failed)`;
    }

    return `${results.length} CV(s) assigned successfully!`;
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

  const filteredCvs = cvData.filter(
    (cv) =>
      cv.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
      cv.nic?.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastCv = currentPage * itemsPerPage;
  const indexOfFirstCv = indexOfLastCv - itemsPerPage;
  const currentCvs = filteredCvs.slice(indexOfFirstCv, indexOfLastCv);
  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage);

  const columns = [
    "Select",
    "Ref. No.",
    "NIC",
    "Full Name",
    "Intern Type",
    "CV From",
    "District",
    "Application Date",
    "View",
    "Schedule Interview",
    "Assign Induction",
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
        <h3 className="mt-3">INTERVIEW ASSIGNMENT</h3>
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
          <FaPenFancy
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          Schedule Interview or Assign Induction
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        {/* Filter Input with Batch Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-left mb-3">
          <div className="mb-2 mb-sm-0">
            <Form.Control
              type="text"
              placeholder="Filter by Full Name or NIC"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: "250px", width: "100%" }}
            />
          </div>
          <div className="d-flex justify-content-start flex-wrap">
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                setBatchSchedule(true);
                setBatchAssign(false);
                setShowScheduleModal(true);
              }}
              disabled={selectedRows.length === 0}
              style={{ marginLeft: "2px", marginTop: "5px" }}
            >
              Schedule Interview
            </Button>
            <Button
              variant="info"
              size="sm"
              onClick={() => {
                setBatchAssign(true);
                setBatchSchedule(false);
                setShowAssignModal(true);
              }}
              disabled={selectedRows.length === 0}
              style={{ marginLeft: "10px", marginTop: "5px" }}
            >
              Assign Induction
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
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
                      <td>{cv.userType || "N/A"}</td>
                      <td>{cv.district || "N/A"}</td>
                      <td>
                        {cv.applicationDate
                          ? new Date(cv.applicationDate).toLocaleDateString()
                          : "N/A"}
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
                          onClick={() => {
                            setCvToSchedule(cv);
                            setBatchSchedule(false);
                            setShowScheduleModal(true);
                          }}
                          className="fw-semibold"
                        >
                          Schedule
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => {
                            setCvToAssign(cv);
                            setBatchAssign(false);
                            setShowAssignModal(true);
                          }}
                          className="fw-semibold"
                        >
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center">
                      No CVs found
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
                          {filteredCvs.length} application(s) in total •{" "}
                          {selectedRows.length} selected
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

      {/* Schedule Interview Modal */}

      <ScheduleInterviewModal
        show={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setBatchSchedule(false);
          setCvToSchedule(null);
          setSelectedRows([]);
          setScheduleModalMessage({ variant: "", message: "" }); // Clear modal message
          refreshData();
        }}
        onConfirm={async (interviewId) => {
          try {
            await handleSchedule(interviewId);
            setScheduleModalMessage({
              variant: "success",
              message: batchSchedule
                ? `${selectedRows.length} CV(s) scheduled successfully!`
                : "CV scheduled successfully!",
            });
            // Don't close modal automatically - let user see the success message
          } catch (error) {
            setScheduleModalMessage({
              variant: "danger",
              message: error.response?.data?.message || error.message,
            });
          }
        }}
        refNo={
          batchSchedule
            ? `${selectedRows.length} selected CVs`
            : cvToSchedule?.refNo
        }
        darkMode={darkMode}
        successMessage={
          scheduleModalMessage.variant === "success"
            ? scheduleModalMessage.message
            : null
        }
        errorMessage={
          scheduleModalMessage.variant === "danger"
            ? scheduleModalMessage.message
            : null
        }
        onClearMessages={() =>
          setScheduleModalMessage({ variant: "", message: "" })
        }
      />
      {/* Assign Induction Modal */}
      <AssignInductionModal
        show={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setAssignModalMessage({ variant: "", message: "" }); // Clear modal message
          refreshData();
        }}
        onConfirm={async (payload) => {
          try {
            const result = await handleAssignInduction(payload);
            setAssignModalMessage({
              variant: "success",
              message: result,
            });
            // Don't close modal automatically
          } catch (error) {
            setAssignModalMessage({
              variant: "danger",
              message: error.message,
            });
          }
        }}
        refNo={
          batchAssign
            ? `${selectedRows.length} selected CVs`
            : cvToAssign?.refNo
        }
        darkMode={darkMode}
        cvData={currentCvs.filter((cv) => selectedRows.includes(cv._id))}
        isBatch={batchAssign}
        successMessage={
          assignModalMessage.variant === "success"
            ? assignModalMessage.message
            : null
        }
        errorMessage={
          assignModalMessage.variant === "danger"
            ? assignModalMessage.message
            : null
        }
        onClearMessages={() =>
          setAssignModalMessage({ variant: "", message: "" })
        }
      />
    </div>
  );
};

export default ScheduleInterviews;
