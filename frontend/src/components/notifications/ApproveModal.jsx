import React, { useState, useEffect } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const ApproveModal = ({ show, onClose, onConfirm, refNo, darkMode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    setIsProcessing(true);
    setErrorMessage("");
    try {
      await onConfirm();
      setSuccessMessage(
        `${refNo || "Item"} approved successfully!`
      );
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1500); 
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to approve"
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
          className={darkMode ? "bg-success text-white" : "bg-light text-dark"}
        >
          <Modal.Title>
            <FaCheckCircle className="me-2" /> Confirm Approval
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
                <FaCheckCircle className="text-success" size={50} />
              </motion.div>
              <p>
                Are you sure you want to approve{" "}
                <strong className="text-success">
                  {refNo || "this item"}
                </strong>
                ?
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
            variant="success"
            onClick={handleConfirm}
            disabled={isProcessing || successMessage}
          >
            {isProcessing
              ? "Processing..."
              : successMessage
              ? "Done"
              : "Approve"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApproveModal;