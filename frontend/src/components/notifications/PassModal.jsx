import React, { useState, useEffect } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const PassModal = ({ show, onClose, onConfirm, refNo, isBulk, darkMode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    setIsProcessing(true);
    setErrorMessage("");
    try {
      await onConfirm();
      setSuccessMessage(
        isBulk
          ? "Selected candidates passed successfully!"
          : `${refNo || "Candidate"} passed successfully!`
      );
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1500); 
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to mark as passed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setSuccessMessage("");
      setErrorMessage("");
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
          className={darkMode ? "bg-primary text-white" : "bg-light text-dark"}
        >
          <Modal.Title>
            <FaCheckCircle className="me-2" /> Confirm Pass
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className={`text-center ${
            darkMode ? "bg-dark text-white" : "bg-light text-dark"
          }`}
        >
          {successMessage ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Alert variant="success" className="mb-0">
                {successMessage}
              </Alert>
            </motion.div>
          ) : (
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
                <FaCheckCircle className="text-primary" size={50} />
              </motion.div>
              <p>
                Are you sure you want to mark{" "}
                <strong className="text-primary">
                  {isBulk ? "selected candidates" : refNo || "this candidate"}
                </strong>{" "}
                as passed?
              </p>
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
            variant="primary"
            onClick={handleConfirm}
            disabled={isProcessing || successMessage}
          >
            {isProcessing
              ? "Processing..."
              : successMessage
              ? "Done"
              : "Confirm Pass"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PassModal;
