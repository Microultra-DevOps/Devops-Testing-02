import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";

const DeleteConfirmationModal = ({ 
  show, 
  onClose, 
  onDelete, 
  cvData, 
  darkMode,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    adminName: "",
    employeeId: "",
    deletionReason: "",
    deletionComments: "",
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); 

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (show) {
      setFormData({
        adminName: "",
        employeeId: "",
        deletionReason: "",
        deletionComments: "",
      });
      setErrors({});
      setStep(1);
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.adminName.trim()) {
      newErrors.adminName = "Admin name is required";
    }
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }
    
    if (!formData.deletionReason.trim()) {
      newErrors.deletionReason = "Deletion reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(formData);
  };

  const handleCancel = () => {
    setStep(1);
    setFormData({
      adminName: "",
      employeeId: "",
      deletionReason: "",
      deletionComments: "",
    });
    setErrors({});
    onClose();
  };

  const modalBg = darkMode ? "#343a40" : "#ffffff";
  const modalColor = darkMode ? "white" : "black";
  const headerBg = darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark border-light";

  return (
    <Modal
      show={show}
      onHide={handleCancel}
      centered
      backdrop="static"
      size="lg"
      animation={false}
      style={{ backdropFilter: "blur(3px)" }}
    >
      <Modal.Header
        closeButton
        className={headerBg}
        style={{ padding: "15px" }}
      >
        <Modal.Title style={{ fontSize: "1.3rem" }}>
          {step === 1 ? "Delete CV - Admin Confirmation" : "Confirm Deletion"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          backgroundColor: modalBg,
          color: modalColor,
          padding: "20px",
          minHeight: "400px",
        }}
      >
        {step === 1 ? (
          <div>
            <motion.div
              className="d-flex justify-content-center mb-3"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaExclamationTriangle size={40} className="text-warning" />
            </motion.div>

            <Alert variant="warning" className="mb-4">
              <strong>Warning:</strong> You are about to delete CV for{" "}
              <strong>{cvData?.fullName || "Unknown"}</strong> (Ref: {cvData?.refNo || "N/A"}).
              Please fill out the required information below.
            </Alert>

            <Form onSubmit={handleFormSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Admin Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      isInvalid={!!errors.adminName}
                      style={{
                        backgroundColor: darkMode ? "#495057" : "#ffffff",
                        color: darkMode ? "white" : "black",
                        borderColor: darkMode ? "#6c757d" : "#ced4da",
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.adminName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Employee ID <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      placeholder="Enter your employee ID"
                      isInvalid={!!errors.employeeId}
                      style={{
                        backgroundColor: darkMode ? "#495057" : "#ffffff",
                        color: darkMode ? "white" : "black",
                        borderColor: darkMode ? "#6c757d" : "#ced4da",
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.employeeId}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>
                  Reason for Deletion <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="deletionReason"
                  value={formData.deletionReason}
                  onChange={handleInputChange}
                  isInvalid={!!errors.deletionReason}
                  style={{
                    backgroundColor: darkMode ? "#495057" : "#ffffff",
                    color: darkMode ? "white" : "black",
                    borderColor: darkMode ? "#6c757d" : "#ced4da",
                  }}
                >
                  <option value="">Select a reason</option>
                  <option value="duplicate_entry">Duplicate Entry</option>
                  <option value="incomplete_information">Incomplete Information</option>
                  <option value="candidate_withdrawal">Candidate Withdrawal</option>
                  <option value="invalid_documents">Invalid Documents</option>
                  <option value="system_error">System Error</option>
                  <option value="data_corruption">Data Corruption</option>
                  <option value="policy_violation">Policy Violation</option>
                  <option value="other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.deletionReason}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Additional Comments (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="deletionComments"
                  value={formData.deletionComments}
                  onChange={handleInputChange}
                  placeholder="Provide any additional details about the deletion..."
                  style={{
                    backgroundColor: darkMode ? "#495057" : "#ffffff",
                    color: darkMode ? "white" : "black",
                    borderColor: darkMode ? "#6c757d" : "#ced4da",
                  }}
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  Continue
                </Button>
              </div>
            </Form>
          </div>
        ) : (

          <div className="text-center">
            <motion.div
              className="d-flex justify-content-center mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <FaTrashAlt size={50} className="text-danger" />
            </motion.div>

            <Alert variant="danger" className="mb-4">
              <h5>Final Confirmation Required</h5>
              <p className="mb-0">
                This action will soft delete the CV and can be reversed later by an administrator.
                The CV will be moved to the deleted items section for review.
              </p>
            </Alert>

            <div className="mb-4 text-start">
              <h6 className="mb-3">Deletion Summary:</h6>
              <div className="p-3 border rounded" style={{
                backgroundColor: darkMode ? "#495057" : "#f8f9fa",
                borderColor: darkMode ? "#6c757d" : "#dee2e6"
              }}>
                <p><strong>CV:</strong> {cvData?.fullName || "Unknown"} ({cvData?.refNo || "N/A"})</p>
                <p><strong>Admin:</strong> {formData.adminName}</p>
                <p><strong>Employee ID:</strong> {formData.employeeId}</p>
                <p><strong>Reason:</strong> {formData.deletionReason.replace(/_/g, ' ').toUpperCase()}</p>
                {formData.deletionComments && (
                  <p><strong>Comments:</strong> {formData.deletionComments}</p>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-center gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setStep(1)}
                disabled={loading}
                size="lg"
              >
                Back to Form
              </Button>
              <Button 
                variant="danger" 
                onClick={handleConfirmDelete}
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </div>

            <div className="mt-3">
              <small className="text-muted">
                This CV will be soft deleted and can be restored by administrators if needed.
              </small>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

DeleteConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  cvData: PropTypes.shape({
    fullName: PropTypes.string,
    refNo: PropTypes.string,
    _id: PropTypes.string
  }),
  darkMode: PropTypes.bool,
  loading: PropTypes.bool
};

export default DeleteConfirmationModal;