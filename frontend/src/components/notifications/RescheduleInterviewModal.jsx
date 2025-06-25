import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const RescheduleInterviewModal = ({
  show,
  onClose,
  onConfirm,
  refNo,
  darkMode,
  successMessage,
  errorMessage,
  onClearMessages,
  currentInterviewId,
  currentInterviewName,
}) => {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const token = localStorage.getItem("token");

  // Clear messages when modal closes or when parent clears them
  useEffect(() => {
    if (!show) {
      setLocalError("");
      setLocalSuccess("");
      setRescheduleReason("");
      setSelectedInterview("");
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
        
        const availableInterviews = response.data.filter(interview => {
          const interviewDate = new Date(interview.interviewDate || interview.date);
          return interviewDate >= currentDate && interview._id !== currentInterviewId;
        });
        
        setInterviews(availableInterviews);
        
        if (availableInterviews.length === 0) {
          setLocalError("No available interviews found. Please create a new interview first.");
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
  }, [show, currentInterviewId]);

  const handleConfirm = async () => {
    if (!selectedInterview) {
      setLocalError("Please select a new interview slot.");
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
      await onConfirm(selectedInterview, currentInterviewId, rescheduleReason);
    } catch (err) {
      setLocalError(err.message || "Failed to reschedule interview");
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
          <FaCalendarAlt className="me-2" /> Reschedule Interview
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
            Reschedule the interview for <strong>{refNo}</strong>
            {currentInterviewName && (
              <span> (Currently: <em>{currentInterviewName}</em>)</span>
            )}
          </p>
        </div>

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
            <Spinner animation="border" variant="warning" />
            <p>Loading available interview slots...</p>
          </div>
        ) : (
          !localSuccess && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select New Interview Slot</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedInterview}
                  onChange={(e) => setSelectedInterview(e.target.value)}
                  className={darkMode ? "bg-dark text-white border-warning" : ""}
                  disabled={submitting}
                >
                  <option value="">Select a New Interview Slot</option>
                  {interviews.map((interview) => (
                    <option key={interview._id} value={interview._id}>
                      {interview.interviewName || interview.name || "Unnamed Interview"} - {" "}
                      {interview.interviewDate
                        ? new Date(interview.interviewDate).toLocaleDateString() + " " + 
                          (interview.interviewTime || new Date(interview.interviewDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
                        : interview.date 
                          ? new Date(interview.date).toLocaleDateString() + " " + 
                            (interview.time || new Date(interview.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
                          : "No Date"}
                    </option>
                  ))}
                </Form.Control>
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
        {!localSuccess && (
          <Button
            variant="warning"
            onClick={handleConfirm}
            disabled={!selectedInterview || !rescheduleReason.trim() || submitting || loading}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" /> Rescheduling...
              </>
            ) : (
              "Reschedule Interview"
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RescheduleInterviewModal;