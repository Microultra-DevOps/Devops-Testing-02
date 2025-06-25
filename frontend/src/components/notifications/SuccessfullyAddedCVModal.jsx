import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import PropTypes from "prop-types";

const SuccessfullyAddedCVModal = ({
  show,
  onClose,
  darkMode,
  message = "Thank you! Your submission has been sent.",
}) => {
  if (!show) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 1050,
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        className={`p-4 rounded shadow-lg text-center ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
        style={{ maxWidth: "400px", width: "90%" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="d-flex justify-content-center align-items-center mx-auto mb-3"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop" }}
        >
          <FaCheckCircle className="text-success fs-1" />
        </motion.div>

        <h2 className="h5 fw-semibold mb-2">Successfully Added</h2>
        <p className="mb-0">{message}</p>
      </motion.div>
    </div>
  );
};

SuccessfullyAddedCVModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  message: PropTypes.string,
};

export default SuccessfullyAddedCVModal;
