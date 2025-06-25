import React, { useState, useEffect } from "react";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import { FaTimesCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const DeclineModal = ({ show, onClose, onConfirm, refNo, darkMode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [declineReason, setDeclineReason] = useState("");

  const handleConfirm = async () => {
    setIsProcessing(true);
    setErrorMessage("");
    try {
      await onConfirm(declineReason);
      setSuccessMessage(
        `${refNo || "Item"} declined successfully!`
      );
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
        setDeclineReason("");
      }, 1500); 
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to decline"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setSuccessMessage("");
      setErrorMessage("");
      setDeclineReason("");
    }
  }, [show]);

  return (
    <>
      {show && (
        <div
          className="modal-backdrop fade show"
          style={{ backdropFilter: "blur(8px)" }}
        />
      )}

      <Modal show={show} onHide={onClose} centered backdrop="static">
        <Modal.Header
          closeButton
          className={darkMode ? "bg-danger text-white" : "bg-light text-dark"}
        >
          <Modal.Title>
            <FaTimesCircle className="me-2" /> Confirm Decline
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className={`${
            darkMode ? "bg-dark text-white" : "bg-light text-dark"
          }`}
        >
          {successMessage ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-center"
            >
              <Alert variant="danger" className="mb-0">
                {successMessage}
              </Alert>
            </motion.div>
          ) : (
            <>
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                  className="mb-3"
                >
                  <FaTimesCircle className="text-danger" size={50} />
                </motion.div>
                <p>
                  Are you sure you want to decline{" "}
                  <strong className="text-danger">
                    {refNo || "this item"}
                  </strong>
                  ?
                  <br />
                  This action cannot be undone.
                </p>
              </div>

              {/* Decline Reason Input */}
              <Form.Group className="mb-3 mt-4">
                <Form.Label>Reason for declining</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter reason for declining..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  style={{
                    backgroundColor: darkMode ? "#2b3035" : "#fff",
                    color: darkMode ? "#fff" : "#212529",
                    border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
                  }}
                />
              </Form.Group>
            </>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3"
            >
              <Alert
                variant="danger"
                onClose={() => setErrorMessage("")}
                dismissible
              >
                {errorMessage}
              </Alert>
            </motion.div>
          )}
        </Modal.Body>
        <Modal.Footer
          className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
        >
          <Button
            variant={darkMode ? "outline-light" : "secondary"}
            onClick={onClose}
            disabled={isProcessing || successMessage}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isProcessing || successMessage}
          >
            {isProcessing
              ? "Processing..."
              : successMessage
              ? "Done"
              : "Decline"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeclineModal;