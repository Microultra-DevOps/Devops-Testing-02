import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { FaChalkboardTeacher } from "react-icons/fa";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const AssignInductionModal = ({
  show,
  onClose,
  onConfirm,
  refNo,
  darkMode,
  cvData,
  isBatch,
  successMessage,
  errorMessage,
  onClearMessages,
}) => {
  const [inductions, setInductions] = useState([]);
  const [selectedInduction, setSelectedInduction] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  useEffect(() => {
    if (!show) {
      setLocalError("");
      setLocalSuccess("");
    }
  }, [show]);

  useEffect(() => {
    if (errorMessage) setLocalError(errorMessage);
    if (successMessage) setLocalSuccess(successMessage);
  }, [errorMessage, successMessage]);

  const fetchInductions = async () => {
    if (!show) return;
    setFetching(true);
    setLocalError("");

    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/inductions`);
      const validInductions = response.data.filter(
        (induction) =>
          induction.induction &&
          induction.startDate &&
          induction.endDate &&
          induction.location
      );
      setInductions(validInductions);

      if (validInductions.length === 0) {
        setLocalError("No valid induction programs available");
      }
    } catch (err) {
      setLocalError("Failed to fetch inductions");
      console.error("Fetch error:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchInductions();
  }, [show]);

const handleConfirm = async () => {
  if (!selectedInduction) {
    setLocalError("Please select an induction");
    return;
  }

  setLoading(true);
  setLocalError("");
  if (typeof onClearMessages === "function") onClearMessages();

  try {
    const induction = inductions.find((i) => i._id === selectedInduction);
    if (!induction) throw new Error("Selected induction not found");

    let recipientEmail;
    
    if (isBatch && Array.isArray(cvData)) {
      recipientEmail = null; 
    } else if (cvData) {
      recipientEmail = cvData.email || 
                      (cvData.userId && cvData.userId.email) || 
                      null;
    }

    console.log("Email data being sent:", {
      hasCvData: !!cvData,
      recipientEmail: recipientEmail,
      isBatch: isBatch
    });

    const payload = {
      inductionId: selectedInduction,
      status: "induction-assigned",
      emailData: {
        recipientEmail: recipientEmail,
        inductionDetails: {
          inductionName: induction.induction,
          startDate: induction.startDate,
          endDate: induction.endDate,
          location: induction.location,
        }
      },
    };

    await onConfirm(payload);
  } catch (err) {
    setLocalError(
      err.response?.data?.message || err.message || "Assignment failed"
    );
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setLocalError("");
    setLocalSuccess("");
    if (typeof onClearMessages === "function") onClearMessages();
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header
        closeButton
        className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
      >
        <Modal.Title>
          <FaChalkboardTeacher className="me-2" />
          {localSuccess ? "Success" : "Assign Induction"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className={`text-center ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        {localSuccess && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-3"
            >
              <FaChalkboardTeacher className="text-success" size={50} />
            </motion.div>
            <Alert variant="success" dismissible onClose={handleClose}>
              {localSuccess}
            </Alert>
          </>
        )}

        {localError && (
          <Alert variant="danger" dismissible onClose={() => setLocalError("")}>
            {localError}
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

        {!localSuccess && !localError && (
          <>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="mb-3"
            >
              <FaChalkboardTeacher className="text-info" size={50} />
            </motion.div>

            <p>
              Assign induction for <strong>{refNo || "selected CV(s)"}</strong>
            </p>

            {fetching ? (
              <div className="text-center">
                <Spinner animation="border" variant="info" />
                <p>Loading available inductions...</p>
              </div>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>Select Induction</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedInduction}
                  onChange={(e) => setSelectedInduction(e.target.value)}
                  className={darkMode ? "bg-dark text-white border-info" : ""}
                  disabled={loading}
                >
                  <option value="">Select an Induction</option>
                  {inductions.map((induction) => (
                    <option key={induction._id} value={induction._id}>
                      {induction.induction} -{" "}
                      {new Date(induction.startDate).toLocaleDateString()} to{" "}
                      {new Date(induction.endDate).toLocaleDateString()}
                      {induction.location ? ` (${induction.location})` : ""}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer
        className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
      >
        {!localSuccess ? (
          <>
            <Button
              variant={darkMode ? "outline-light" : "secondary"}
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="info"
              onClick={handleConfirm}
              disabled={!selectedInduction || loading || fetching}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Assigning...
                </>
              ) : (
                "Assign Induction"
              )}
            </Button>
          </>
        ) : (
          <Button variant="success" onClick={handleClose}>
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

AssignInductionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  refNo: PropTypes.string,
  darkMode: PropTypes.bool,
  cvData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  isBatch: PropTypes.bool,
  successMessage: PropTypes.string,
  errorMessage: PropTypes.string,
  onClearMessages: PropTypes.func,
};

AssignInductionModal.defaultProps = {
  refNo: "",
  darkMode: false,
  cvData: null,
  isBatch: false,
  successMessage: "",
  errorMessage: "",
  onClearMessages: () => {},
};

export default AssignInductionModal;
