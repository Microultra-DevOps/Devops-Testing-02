import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '',
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

// Add response interceptor
api.interceptors.response.use(
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
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

const RescheduleInductionModal = ({
  show,
  onClose,
  onConfirm,
  refNo,
  darkMode,
  successMessage,
  errorMessage,
  onClearMessages,
  currentInductionId,
  currentInductionName,
}) => {
  const [inductions, setInductions] = useState([]);
  const [selectedInduction, setSelectedInduction] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  // Clear messages when modal closes or when parent clears them
  useEffect(() => {
    if (!show) {
      setLocalError("");
      setLocalSuccess("");
      setRescheduleReason("");
      setSelectedInduction("");
    }
  }, [show]);

  // Sync with parent component messages
  useEffect(() => {
    if (errorMessage) {
      setLocalError(errorMessage);
    }
    if (successMessage) {
      setLocalSuccess(successMessage);
    }
  }, [errorMessage, successMessage]);

  const fetchInductions = async () => {
    if (!show) return;

    setLoading(true);
    setLocalError("");
    setLocalSuccess("");

    try {
      const response = await api.get("/api/inductions");

      if (response.data && Array.isArray(response.data)) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); 
        
        const availableInductions = response.data.filter(induction => {
          const inductionStartDate = new Date(
            induction.inductionStartDate || 
            induction.startDate || 
            induction.inductionStart ||
            induction.start
          );
          
          return inductionStartDate >= currentDate && induction._id !== currentInductionId;
        });
        
        setInductions(availableInductions);
        
        if (availableInductions.length === 0) {
          setLocalError("No available inductions found. Please create a new induction first.");
        }
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        setLocalError("Session expired. Please login again.");
      } else {
        setLocalError("Failed to fetch inductions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInductions();
  }, [show, currentInductionId]);

  const handleConfirm = async () => {
    if (!selectedInduction) {
      setLocalError("Please select a new induction session.");
      return;
    }

    if (!rescheduleReason.trim()) {
      setLocalError("Please provide a reason for rescheduling.");
      return;
    }

    setSubmitting(true);
    setLocalError("");
    onClearMessages(); 

    try {
      await onConfirm(selectedInduction, currentInductionId, rescheduleReason);
    } catch (err) {
      console.error("Reschedule error:", err);
      setLocalError(err.message || "Failed to reschedule induction");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setLocalError("");
    setLocalSuccess("");
    onClearMessages();
    onClose();
  };

  const formatInductionDisplay = (induction) => {
    const name = induction.induction || 
                 induction.inductionName || 
                 induction.name || 
                 "Unnamed Induction";
    
    const startDate = induction.inductionStartDate || 
                     induction.startDate || 
                     induction.inductionStart ||
                     induction.start;
    
    const endDate = induction.inductionEndDate || 
                   induction.endDate || 
                   induction.inductionEnd ||
                   induction.end;
    
    let dateRange = "No Date Range";
    if (startDate && endDate) {
      dateRange = `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
    } else if (startDate) {
      dateRange = `From ${new Date(startDate).toLocaleDateString()}`;
    }
    
    return `${name} - ${dateRange}`;
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header
        closeButton
        className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
      >
        <Modal.Title>
          <FaCalendarAlt className="me-2" /> Reschedule Induction
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className={`${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <div className="text-center mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
            className="mb-3"
          >
            <FaCalendarAlt className="text-warning" size={50} />
          </motion.div>

          <p>
            Reschedule the induction for <strong>{refNo}</strong>
            {currentInductionName && (
              <span> (Currently: <em>{currentInductionName}</em>)</span>
            )}
          </p>
        </div>

        {/* Show success/error messages from either local state or props */}
        {(localSuccess || successMessage) && (
          <Alert
            variant="success"
            dismissible
            onClose={() => {
              setLocalSuccess("");
              onClearMessages();
            }}
          >
            {localSuccess || successMessage}
          </Alert>
        )}

        {(localError || errorMessage) && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => {
              setLocalError("");
              onClearMessages();
            }}
          >
            {localError || errorMessage}
            <Button
              size="sm"
              variant="outline-danger"
              className="ms-2"
              onClick={fetchInductions}
            >
              Retry
            </Button>
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="warning" />
            <p>Loading available induction sessions...</p>
          </div>
        ) : (
          !(localSuccess || successMessage) && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select New Induction Session</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedInduction}
                  onChange={(e) => setSelectedInduction(e.target.value)}
                  className={darkMode ? "bg-dark text-white border-warning" : ""}
                  disabled={submitting}
                >
                  <option value="">Select a New Induction Session</option>
                  {inductions.map((induction) => (
                    <option key={induction._id} value={induction._id}>
                      {formatInductionDisplay(induction)}
                    </option>
                  ))}
                </Form.Control>
                {inductions.length === 0 && !loading && (
                  <Form.Text className="text-danger">
                    No available induction sessions found.
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Reason for Rescheduling</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Please provide a reason for rescheduling..."
                  className={darkMode ? "bg-dark text-white border-warning" : ""}
                  disabled={submitting}
                />
                <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                  This reason will be included in the notification to the candidate.
                </Form.Text>
              </Form.Group>
            </Form>
          )
        )}
      </Modal.Body>

      <Modal.Footer
        className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
      >
        <Button
          variant={darkMode ? "outline-light" : "secondary"}
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        {!(localSuccess || successMessage) && (
          <Button
            variant="warning"
            onClick={handleConfirm}
            disabled={
              !selectedInduction || 
              !rescheduleReason.trim() || 
              submitting || 
              loading ||
              inductions.length === 0
            }
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" /> Rescheduling...
              </>
            ) : (
              "Reschedule Induction"
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RescheduleInductionModal;