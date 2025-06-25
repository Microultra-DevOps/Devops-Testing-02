import React, { useState, useEffect } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { FaTimesCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const FailModal = ({ show, onClose, onConfirm, refNo, isBulk, darkMode }) => {
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
          ? "Selected candidates failed successfully!"
          : `${refNo || "Candidate"} failed successfully!`
      );
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1500); 
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to mark as failed"
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
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)",
            zIndex: 1040,
          }}
        />
      )}

      <Modal
        show={show}
        onHide={onClose}
        centered
        backdrop="static"
        style={{ zIndex: 1050 }}
      >
        <Modal.Header
          closeButton
          className={darkMode ? "bg-danger text-white" : "bg-light text-dark"}
        >
          <Modal.Title>
            <FaTimesCircle className="me-2" /> Confirm Failure
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
                <FaTimesCircle className="text-danger" size={50} />
              </motion.div>
              <p>
                Are you sure you want to mark{" "}
                <strong className="text-danger">
                  {isBulk ? "selected candidates" : refNo || "this candidate"}
                </strong>{" "}
                as failed?
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
            variant="danger"
            onClick={handleConfirm}
            disabled={isProcessing || successMessage}
          >
            {isProcessing
              ? "Processing..."
              : successMessage
              ? "Done"
              : "Confirm Fail"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FailModal;
