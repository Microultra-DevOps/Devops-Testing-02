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
import AssignInductionModal from "../../../components/notifications/AssignInductionModal";

const ScheduleInduction = ({ darkMode }) => {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [cvToAssign, setCvToAssign] = useState(null);
  const [batchAssign, setBatchAssign] = useState(false);
  const [selectedInduction, setSelectedInduction] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api/cvs`,
    headers: { Authorization: `Bearer ${token}` },
  });

  const getInterviewDate = (cv) => {
    if (!cv.interview?.interviews || cv.interview.interviews.length === 0) {
      return "N/A";
    }

    // Find the most recent completed interview
    const completedInterview = cv.interview.interviews.find(
      (i) => i.result?.status === "interview-passed"
    );

    if (!completedInterview?.interviewId?.interviewDate) {
      return "N/A";
    }

    return new Date(
      completedInterview.interviewId.interviewDate
    ).toLocaleDateString();
  };

  const fetchCVs = async () => {
    setLoading(true);
    try {
      if (!token) {
        navigate("/login");
        return;
      }
  
      console.log("Fetching CVs for induction assignment");
      const response = await api.get("/assign-cvs-for-induction");
      console.log(`API returned ${response.data.length} records`);
      
      // Check if we have any data
      if (response.data.length === 0) {
        setError("No interview-passed candidates found for induction assignment");
        setCvData([]);
        setLoading(false);
        return;
      }
      
      // Debug logging
      if (response.data.length > 0) {
        console.log("Sample CV data:", {
          id: response.data[0]._id,
          refNo: response.data[0].refNo,
          interviewStatus: response.data[0].interview?.status,
          hasInterviews: response.data[0].interview?.interviews?.length > 0,
          inductionStatus: response.data[0].induction?.status,
        });
      }
  
      // No additional filtering needed as backend should return only eligible candidates
      setCvData(response.data);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      setError(`Failed to fetch CV data: ${error.response?.data?.message || error.message}`);
      setCvData([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCVs();
  }, [navigate]);

  const handleAssignInduction = async (payload) => {
    setModalError("");
    setModalSuccess("");

    try {
      if (batchAssign) {
        const results = await Promise.allSettled(
          selectedRows.map((id) =>
            api.patch(`/${id}/assign-induction`, payload)
          )
        );

        const failedAssignments = results.filter(
          (r) => r.status === "rejected"
        );
        if (failedAssignments.length > 0) {
          throw new Error(
            `Failed to assign ${failedAssignments.length} of ${selectedRows.length} inductions`
          );
        }

        setModalSuccess(
          `Successfully assigned induction to ${selectedRows.length} candidates`
        );
      } else if (cvToAssign) {
        await api.patch(`/${cvToAssign._id}/assign-induction`, payload);
        setModalSuccess("Induction assigned successfully");
      }

      fetchCVs();
    } catch (error) {
      console.error("Error assigning induction:", error);
      setModalError(
        error.response?.data?.message ||
          error.message ||
          "Failed to assign induction(s)"
      );
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
    "Interview Status",
    "Interview Date",
    "View",
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
        <h3 className="mt-3">INDUCTION ASSIGNMENT</h3>
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
          Assign Induction to Approved Candidates
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        {/* Filter Input with Batch Button */}
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
              variant="info"
              size="sm"
              onClick={() => {
                setBatchAssign(true);
                setShowAssignModal(true);
              }}
              disabled={selectedRows.length === 0}
              style={{ marginLeft: "1px", marginTop: "5px" }}
            >
              Batch Assign Induction
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
                      <td>
                        {cv.interview?.status === "interview-completed"
                          ? "Completed"
                          : "N/A"}
                      </td>
                      <td>{getInterviewDate(cv)}</td>
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
                      No interview-passed candidates found for induction
                      assignment
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
                          {filteredCvs.length} candidate(s) in total •{" "}
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

      {/* Assign Induction Modal */}
      <AssignInductionModal
        show={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setBatchAssign(false);
          setCvToAssign(null);
          setModalError("");
          setModalSuccess("");
        }}
        onClearMessages={() => {
          setModalError("");
          setModalSuccess("");
        }}
        onConfirm={handleAssignInduction}
        refNo={
          batchAssign
            ? `${selectedRows.length} selected candidates`
            : cvToAssign?.refNo
        }
        darkMode={darkMode}
        cvData={
          batchAssign
            ? cvData.filter((cv) => selectedRows.includes(cv._id))
            : cvToAssign
        }
        isBatch={batchAssign}
        errorMessage={modalError}
        successMessage={modalSuccess}
      />
    </div>
  );
};

export default ScheduleInduction;
