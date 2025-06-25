
import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaTimesCircle } from "react-icons/fa"; 

const InstituteDeclineModal = ({ show, onClose, onDecline, itemName, darkMode }) => {
  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      backdrop="static" 
      animation={false}
      style={{ backdropFilter: "blur(3px)" }} 
    >
      <Modal.Header 
        closeButton 
        className={darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark border-light"}
        style={{ padding: "12px" }}
      >
        <Modal.Title style={{ fontSize: "1.2rem" }}>Confirm Decline</Modal.Title>
      </Modal.Header>
      
      <Modal.Body
        style={{
          backgroundColor: darkMode ? "#343a40" : "#ffffff", 
          color: darkMode ? "white" : "black",
          padding: "15px",
          textAlign: "center"
        }}
      >
        <motion.div
          className="d-flex justify-content-center mb-3"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} 
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop" }}
        >
          <FaTimesCircle size={45} className="text-danger" /> 
        </motion.div>
        <p style={{ fontSize: "0.95rem", marginBottom: "10px" }}>
          Are you sure you want to decline <strong>{itemName}</strong>? This action cannot be undone.
        </p>
      </Modal.Body>

      <Modal.Footer 
        style={{
          backgroundColor: darkMode ? "#343a40" : "#ffffff",
          borderTop: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
          padding: "12px",
          justifyContent: "center"
        }}
      >
        <Button variant="secondary" onClick={onClose} size="sm">
          Cancel
        </Button>
        <Button variant="danger" onClick={onDecline} size="sm"> 
          Decline
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

InstituteDeclineModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  itemName: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default InstituteDeclineModal;
