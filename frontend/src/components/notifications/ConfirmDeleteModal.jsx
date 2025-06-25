import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";

const ConfirmDeleteModal = ({ show, onClose, onConfirm, refNo, darkMode }) => {
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
            <FaExclamationTriangle className="me-2" /> Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className={`text-center ${
            darkMode ? "bg-dark text-white" : "bg-light text-dark"
          }`}
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="mb-3"
          >
            <FaExclamationTriangle className="text-warning" size={50} />
          </motion.div>
          <p>
            Are you sure you want to delete{" "}
            <strong className="text-danger">{refNo || "this item"}</strong>?
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer
          className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
        >
          <Button
            variant={darkMode ? "outline-light" : "secondary"}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ConfirmDeleteModal;
