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
import ApproveModal from "../../../components/notifications/ApproveModal";
import DeclineModal from "../../../components/notifications/DeclineModal";
const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const ApproveCVs = ({ darkMode }) => {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ variant: "", message: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [cvToApprove, setCvToApprove] = useState(null);
  const [cvToDecline, setCvToDecline] = useState(null);
  const [batchApproval, setBatchApproval] = useState(false);
  const [batchDecline, setBatchDecline] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem("token");
  const isValidMongoId = (id) => {
    return id && /^[0-9a-fA-F]{24}$/.test(id);
  };
  // Axios instance with authentication
  const api = axios.create({
    baseURL: `${API_BASE_URL}/cvs`,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch CVs that are pending approval
  const fetchCVs = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      // Use the axios instance you already created
      const response = await api.get("/not-approved-cvs", {
        params: {
          status: "pending",
          includeAdminCreated: "true",
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setCvData(response.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      setError({
        variant: "danger",
        message:
          "Failed to fetch CV data. " +
          (error.response?.data?.message || error.message),
      });
      console.error("Error fetching CVs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add this useEffect to trigger the initial load
  useEffect(() => {
    fetchCVs();
  }, []); 

  // Approve CV(s)
  const handleApprove = async () => {
    setError({ variant: "", message: "" });
    setIsProcessing(true);
    try {
      const notes = batchApproval
        ? "Bulk approved by admin"
        : "Approved by admin";

      if (batchApproval && selectedRows.length > 0) {
        // Batch approval
        const approvalPromises = selectedRows.map((id) => {
          if (!isValidMongoId(id)) {
            throw new Error(`Invalid CV ID: ${id}`);
          }
          return api.post(`/${id}/approve`, { notes });
        });

        await Promise.all(approvalPromises);
        setError({
          variant: "success",
          message: `${selectedRows.length} CV(s) approved successfully!`,
        });
      } else if (cvToApprove) {
        // Single approval
        await api.post(`/${cvToApprove._id}/approve`, { notes });
        setError({
          variant: "success",
          message: "CV approved successfully!",
        });
      }

      // Wait a moment to show success message
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Reset states
      setShowApproveModal(false);
      setBatchApproval(false);
      setCvToApprove(null);
      setSelectedRows([]);

      // Refresh the list
      await fetchCVs();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setError({
        variant: "danger",
        message: `Failed to approve CV(s): ${errorMessage}`,
      });
      console.error("Error approving CV:", error);
      setShowApproveModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Decline CV(s)
  const handleDecline = async (declineReason) => {
    setError({ variant: "", message: "" });
    setIsProcessing(true);
    try {
      // Use the provided decline reason, or default if empty
      const notes = declineReason ? declineReason : "Declined by admin";
  
      if (batchDecline && selectedRows.length > 0) {
        // Batch decline
        const declinePromises = selectedRows.map((id) => {
          if (!isValidMongoId(id)) {
            throw new Error(`Invalid CV ID: ${id}`);
          }
          return api.post(`/${id}/decline`, { notes });
        });
  
        await Promise.all(declinePromises);
        setError({
          variant: "success",
          message: `${selectedRows.length} CV(s) declined successfully!`,
        });
      } else if (cvToDecline) {
        // Single decline
        await api.post(`/${cvToDecline._id}/decline`, { notes });
        setError({
          variant: "success",
          message: "CV declined successfully!",
        });
      }
  
      // Wait a moment to show success message
      await new Promise((resolve) => setTimeout(resolve, 1500));
  
      // Reset states
      setShowDeclineModal(false);
      setBatchDecline(false);
      setCvToDecline(null);
      setSelectedRows([]);
  
      // Refresh the list
      await fetchCVs();
    } catch (error) {
      setError({
        variant: "danger",
        message: `Failed to decline CV(s): ${
          error.response?.data?.message || error.message
        }`,
      });
      console.error("Error declining CV:", error);
      setShowDeclineModal(false);
    } finally {
      setIsProcessing(false);
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
    "Category",
    "District",
    "Application Date",
    "View",
    "Edit",
    "Approve",
    "Decline",
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
        <h3 className="mt-3">ALL CV APPLICATIONS</h3>
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
          Approve Internship Applications
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
          <div className="d-flex justify-content-start">
            <Button
              variant="success"
              size="sm"
              className="me-2"
              onClick={() => {
                setBatchApproval(true);
                setShowApproveModal(true);
              }}
              disabled={selectedRows.length === 0 || isProcessing}
              style={{ width: "120px" }}
            >
              {isProcessing ? "Processing..." : "Batch Approve"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setBatchDecline(true);
                setBatchApproval(false);
                setShowDeclineModal(true);
              }}
              disabled={selectedRows.length === 0}
              style={{ width: "120px" }}
            >
              Batch Decline
            </Button>
          </div>
        </div>
        {error.message && (
          <Alert
            variant={error.variant || "danger"}
            className="text-center mb-3"
            onClose={() => setError({ variant: "", message: "" })}
            dismissible
          >
            {error.message}
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
                        {cv.selectedRole === 'internship' 
                          ? cv.roleData?.internship?.categoryOfApply || "N/A"
                          : "-"
                        }
                      </td>
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
                          variant="outline-primary"
                          onClick={() => navigate(`/edit-cv/${cv._id}`)}
                          className="fw-semibold"
                        >
                          Edit
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => {
                            setCvToApprove(cv);
                            setBatchApproval(false);
                            setShowApproveModal(true);
                          }}
                          className="fw-semibold"
                        >
                          Approve
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            setCvToDecline(cv);
                            setBatchDecline(false);
                            setShowDeclineModal(true);
                          }}
                          className="fw-semibold"
                        >
                          Decline
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

      {/* Approve Modal */}
      <ApproveModal
        show={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setBatchApproval(false);
          setCvToApprove(null);
        }}
        onConfirm={handleApprove}
        refNo={
          batchApproval
            ? `${selectedRows.length} selected CVs`
            : cvToApprove?.refNo
        }
        darkMode={darkMode}
        isLoading={isProcessing}
        successMessage={error.variant === "success" ? error.message : ""}
      />

      {/* Decline Modal */}
      <DeclineModal
        show={showDeclineModal}
        onClose={() => {
          setShowDeclineModal(false);
          setBatchDecline(false);
          setCvToDecline(null);
        }}
        onConfirm={handleDecline}
        refNo={
          batchDecline
            ? `${selectedRows.length} selected CVs`
            : cvToDecline?.refNo
        }
        darkMode={darkMode}
        isLoading={isProcessing}
        successMessage={error.variant === "success" ? error.message : ""}
      />
    </div>
  );
};

export default ApproveCVs;