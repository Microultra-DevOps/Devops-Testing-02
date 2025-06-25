import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { FaChalkboardTeacher } from "react-icons/fa";
import { motion } from "framer-motion";

const ScheduleInterviewModal = ({
  show,
  onClose,
  onConfirm,
  refNo,
  darkMode,
  successMessage,
  errorMessage,
  onClearMessages,
}) => {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!show) {
      setLocalError("");
      setLocalSuccess("");
    }
  }, [show]);

  useEffect(() => {
    if (errorMessage) {
      setLocalError(errorMessage);
    }
    if (successMessage) {
      setLocalSuccess(successMessage);
      
      if (successMessage) {
        const timer = setTimeout(() => {
          handleClose();
        }, 1000); 
        
        return () => clearTimeout(timer);
      }
    }
  }, [errorMessage, successMessage]);

  const fetchInterviews = async () => {
    if (!show) return;

    setLoading(true);
    setLocalError("");
    setLocalSuccess("");

    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/interviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); 
        
        const futureInterviews = response.data.filter(interview => {
          const interviewDate = new Date(interview.interviewDate || interview.date);
          return interviewDate >= currentDate;
        });
        
        setInterviews(futureInterviews);
        
        if (futureInterviews.length === 0) {
          setLocalError("No upcoming interviews available. Please create a new interview first.");
        }
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      setLocalError("Failed to fetch interviews. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [show]);

  const handleConfirm = async () => {
    if (!selectedInterview) {
      setLocalError("Please select an interview.");
      return;
    }

    setSubmitting(true);
    setLocalError("");
    onClearMessages(); 

    try {
      await onConfirm(selectedInterview);
    } catch (err) {
      setLocalError(err.message || "Failed to schedule interview");
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

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header
        closeButton
        className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
      >
        <Modal.Title>
          <FaChalkboardTeacher className="me-2" /> Schedule Interview
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className={`text-center ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop" }}
          className="mb-3"
        >
          <FaChalkboardTeacher className="text-info" size={50} />
        </motion.div>

        <p>Schedule interview for {refNo || "the selected CVs"}</p>

        {/* Show success/error messages from either local state or props */}
        {localSuccess && (
          <Alert
            variant="success"
            dismissible
            onClose={() => {
              setLocalSuccess("");
              onClearMessages();
            }}
          >
            {localSuccess}
          </Alert>
        )}

        {localError && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => {
              setLocalError("");
              onClearMessages();
            }}
          >
            {localError}
            <Button
              size="sm"
              variant="outline-danger"
              className="ms-2"
              onClick={fetchInterviews}
            >
              Retry
            </Button>
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="info" />
            <p>Loading interviews...</p>
          </div>
        ) : (
          !localSuccess && (
            <Form.Group className="mb-3">
              <Form.Label>Select Interview</Form.Label>
              <Form.Control
                as="select"
                value={selectedInterview}
                onChange={(e) => setSelectedInterview(e.target.value)}
                className={darkMode ? "bg-dark text-white border-info" : ""}
                disabled={submitting}
              >
                <option value="">Select an Interview</option>
                {interviews.map((interview) => (
                  <option key={interview._id} value={interview._id}>
                    {interview.interviewName || interview.name || "Unnamed Interview"} - {" "}
                    {interview.interviewDate
                      ? new Date(interview.interviewDate).toLocaleDateString()
                      : interview.date 
                        ? new Date(interview.date).toLocaleDateString()
                        : "No Date"}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
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
        {!localSuccess && (
          <Button
            variant="info"
            onClick={handleConfirm}
            disabled={!selectedInterview || submitting || loading}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" /> Scheduling...
              </>
            ) : (
              "Schedule Interview"
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ScheduleInterviewModal;