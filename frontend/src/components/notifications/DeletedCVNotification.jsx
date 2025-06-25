import React, { useState } from 'react';
import { Button, Badge, Modal, Form } from 'react-bootstrap';
import { FiAlertTriangle, FiTrash2, FiX, FiAlertCircle, FiRefreshCw, FiClock } from 'react-icons/fi';
import axios from 'axios';

const DeletedCVNotification = ({ 
  deletedCVs, 
  onPermanentDelete, 
  onDismiss, 
  darkMode,
  setNotification 
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [confirmationError, setConfirmationError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!deletedCVs || deletedCVs.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePermanentDeleteClick = (cv) => {
    setSelectedCV(cv);
    setConfirmationText('');
    setConfirmationError('');
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmationText !== 'PERMANENTLY_DELETE') {
      setConfirmationError('Please type "PERMANENTLY_DELETE" exactly as shown');
      return;
    }
    
    if (!selectedCV) return;

    setIsDeleting(true);
    
    const token = localStorage.getItem("token");
    if (!token) {
      setNotification({ 
        show: true, 
        message: "Please log in.", 
        variant: "danger" 
      });
      setShowConfirmModal(false);
      setIsDeleting(false);
      return;
    }

    try {
      console.log('Attempting to permanently delete CV:', selectedCV._id);

      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/cvs/deleted/${selectedCV._id}/permanent`, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { 
            confirmDelete: 'PERMANENTLY_DELETE' 
          }
        }
      );
      
      console.log('Permanent delete response:', response.data);
      
      onPermanentDelete(selectedCV);
      
      setNotification({ 
        show: true, 
        message: response.data.message || "CV permanently deleted successfully. You can now re-apply for internship.", 
        variant: "success" 
      });
      
      setShowConfirmModal(false);
      setSelectedCV(null);
      setConfirmationText('');
      setConfirmationError('');
      
    } catch (error) {
      console.error("Error permanently deleting CV:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Failed to permanently delete CV";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "CV not found or already deleted";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to delete this CV";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid request. Please try again.";
      }
      
      setNotification({ 
        show: true, 
        message: errorMessage, 
        variant: "danger" 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setSelectedCV(null);
    setConfirmationText('');
    setConfirmationError('');
  };

  // Modern theme-based styles
  const containerStyles = {
    background: darkMode 
      ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' 
      : 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    border: darkMode ? '1px solid #4a5568' : '1px solid #f97316',
    borderRadius: '16px',
    boxShadow: darkMode 
      ? '0 10px 25px rgba(0, 0, 0, 0.3)' 
      : '0 10px 25px rgba(249, 115, 22, 0.15)',
  };

  const cardStyles = {
    background: darkMode 
      ? 'rgba(45, 55, 72, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: darkMode ? '1px solid rgba(74, 85, 104, 0.3)' : '1px solid rgba(249, 115, 22, 0.2)',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  };

  const buttonStyles = {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
  };

  const dismissButtonStyles = {
    background: darkMode 
      ? 'rgba(74, 85, 104, 0.8)' 
      : 'rgba(107, 114, 128, 0.1)',
    border: darkMode ? '1px solid #4a5568' : '1px solid #6b7280',
    borderRadius: '8px',
    color: darkMode ? '#e2e8f0' : '#374151',
    transition: 'all 0.3s ease',
  };

  return (
    <>
      <div className="mb-4">
        <div className="p-4" style={containerStyles}>
          {/* Header Section */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <div 
                className="me-3 p-2 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  minWidth: '48px',
                  minHeight: '48px'
                }}
              >
                <FiAlertTriangle size={24} color="white" />
              </div>
              <div>
                <h5 className="mb-1 fw-bold" style={{ color: darkMode ? '#f7fafc' : '#1a202c' }}>
                  Application Review Required
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <Badge 
                    className="px-3 py-2"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}
                  >
                    {deletedCVs.length} Application{deletedCVs.length > 1 ? 's' : ''} Affected
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button
              onClick={onDismiss}
              className="p-2 d-flex align-items-center justify-content-center"
              style={{
                ...dismissButtonStyles,
                width: '40px',
                height: '40px',
                borderRadius: '50%'
              }}
            >
              <FiX size={20} />
            </Button>
          </div>

          {/* Message Section */}
          <div className="mb-4 p-3 rounded-lg" style={{
            background: darkMode 
              ? 'rgba(45, 55, 72, 0.5)' 
              : 'rgba(255, 255, 255, 0.7)',
            border: darkMode ? '1px solid rgba(74, 85, 104, 0.3)' : '1px solid rgba(249, 115, 22, 0.2)',
            borderRadius: '12px'
          }}>
            <p className="mb-0" style={{ 
              color: darkMode ? '#cbd5e0' : '#2d3748',
              lineHeight: '1.6'
            }}>
              Your application{deletedCVs.length > 1 ? 's have' : ' has'} been moved to review status. 
              You can choose to permanently remove {deletedCVs.length > 1 ? 'these applications' : 'this application'} and submit 
              {deletedCVs.length > 1 ? ' new ones' : ' a new one'}, or contact support for assistance.
            </p>
          </div>
          
          {/* CV Cards */}
          <div className="mb-4">
            {deletedCVs.map((cv, index) => (
              <div 
                key={cv._id}
                className="mb-3 p-4 position-relative overflow-hidden"
                style={{
                  ...cardStyles,
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: darkMode 
                      ? '0 12px 28px rgba(0, 0, 0, 0.4)' 
                      : '0 12px 28px rgba(249, 115, 22, 0.2)'
                  }
                }}
              >
                {/* Status Indicator */}
                <div 
                  className="position-absolute top-0 end-0 px-3 py-1"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    borderRadius: '0 12px 0 12px',
                    fontSize: '0.75rem',
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  Under Review
                </div>

                <div className="row align-items-center">
                  <div className="col-12 col-lg-8 mb-3 mb-lg-0">
                    {/* Main Info */}
                    <div className="mb-3">
                      <h6 className="mb-2 fw-bold" style={{ 
                        color: darkMode ? '#f7fafc' : '#1a202c',
                        fontSize: '1.1rem'
                      }}>
                        {cv.fullName}
                      </h6>
                      <div className="small mb-2">
                        Reference: <span className="fw-semibold">{cv.refNo}</span>
                      </div>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-center">
                          <div 
                            className="me-2 p-1 rounded"
                            style={{ 
                              background: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                              minWidth: '24px',
                              minHeight: '24px'
                            }}
                          >
                            <div style={{ 
                              width: '8px', 
                              height: '8px', 
                              background: '#3b82f6', 
                              borderRadius: '50%',
                              margin: '8px'
                            }}></div>
                          </div>
                          <div>
                            <div className="small">Position</div>
                            <div className="fw-semibold" style={{ color: darkMode ? '#e2e8f0' : '#374151' }}>
                              {cv.selectedRole}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-center">
                          <div 
                            className="me-2 p-1 rounded d-flex align-items-center justify-content-center"
                            style={{ 
                              background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                              minWidth: '24px',
                              minHeight: '24px'
                            }}
                          >
                            <FiClock size={12} color="#10b981" />
                          </div>
                          <div>
                            <div className="small">Review Date</div>
                            <div className="fw-semibold" style={{ color: darkMode ? '#e2e8f0' : '#374151' }}>
                              {formatDate(cv.deletionInfo.deletedDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reason Section */}
                    <div className="p-3 rounded-lg" style={{
                      background: darkMode 
                        ? 'rgba(220, 38, 38, 0.1)' 
                        : 'rgba(220, 38, 38, 0.05)',
                      border: '1px solid rgba(220, 38, 38, 0.2)'
                    }}>
                      <div className="small text-danger fw-semibold mb-1">Review Reason:</div>
                      <div className="small" style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                        {cv.deletionInfo.deletionReason}
                      </div>
                      {cv.deletionInfo.deletionComments && (
                        <>
                          <div className="small text-danger fw-semibold mt-2 mb-1">Additional Notes:</div>
                          <div className="small fst-italic" style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                            {cv.deletionInfo.deletionComments}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-12 col-lg-4 d-flex justify-content-center justify-content-lg-end">
                    <Button
                      onClick={() => handlePermanentDeleteClick(cv)}
                      disabled={isDeleting}
                      className="px-4 py-2 d-flex align-items-center fw-semibold"
                      style={buttonStyles}
                    >
                      <FiRefreshCw className="me-2" size={16} />
                      <span>Remove & Reapply</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer Info */}
          <div className="p-3 rounded-lg" style={{
            background: darkMode 
              ? 'rgba(59, 130, 246, 0.1)' 
              : 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div className="d-flex align-items-start">
              <FiAlertCircle 
                className="me-2 mt-1 flex-shrink-0" 
                size={16} 
                style={{ color: '#3b82f6' }}
              />
              <div className="small" style={{ color: darkMode ? '#93c5fd' : '#1e40af' }}>
                <strong>Next Steps:</strong> Click "Remove & Reapply" to permanently delete the application 
                and submit a new one, or contact our support team if you need assistance with the review process.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Confirmation Modal */}
      <Modal 
        show={showConfirmModal} 
        onHide={handleCancelConfirm}
        centered
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <div style={{
          background: darkMode 
            ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <Modal.Header 
            closeButton 
            className="border-0 pb-0"
            style={{ 
              background: 'transparent'
            }}
          >
            <Modal.Title 
              className="d-flex align-items-center w-100"
              style={{ color: darkMode ? '#f7fafc' : '#1a202c' }}
            >
              <div 
                className="me-3 p-2 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  minWidth: '40px',
                  minHeight: '40px'
                }}
              >
                <FiAlertCircle size={20} color="white" />
              </div>
              Confirm Application Removal
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body className="pt-0">
            {selectedCV && (
              <>
                <div className="p-4 rounded-lg mb-4" style={{
                  background: darkMode 
                    ? 'rgba(220, 38, 38, 0.1)' 
                    : 'rgba(220, 38, 38, 0.05)',
                  border: '1px solid rgba(220, 38, 38, 0.2)'
                }}>
                  <div className="d-flex align-items-start">
                    <FiAlertTriangle className="me-3 mt-1 flex-shrink-0 text-danger" size={20} />
                    <div>
                      <div className="fw-bold text-danger mb-2">Permanent Action Warning</div>
                      <div className="small" style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>
                        This will permanently remove your application for <strong>{selectedCV.fullName}</strong> 
                        (Ref: {selectedCV.refNo}) from our system. This action cannot be reversed.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg mb-4" style={{
                  background: darkMode 
                    ? 'rgba(45, 55, 72, 0.5)' 
                    : 'rgba(248, 250, 252, 0.8)',
                  border: darkMode ? '1px solid rgba(74, 85, 104, 0.3)' : '1px solid #e2e8f0'
                }}>
                  <h6 className="fw-bold mb-3" style={{ color: darkMode ? '#f7fafc' : '#1a202c' }}>
                    Application Details:
                  </h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="small">Full Name</div>
                      <div className="fw-semibold">{selectedCV.fullName}</div>
                    </div>
                    <div className="col-6">
                      <div className="small">Reference</div>
                      <div className="fw-semibold">{selectedCV.refNo}</div>
                    </div>
                    <div className="col-6">
                      <div className="small">Position</div>
                      <div className="fw-semibold">{selectedCV.selectedRole}</div>
                    </div>
                    <div className="col-6">
                      <div className="small">NIC</div>
                      <div className="fw-semibold">{selectedCV.nic}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Form.Label className="fw-bold mb-3" style={{ color: darkMode ? '#f7fafc' : '#1a202c' }}>
                    To confirm removal, type{' '}
                    <code 
                      className="px-2 py-1 rounded fw-bold"
                      style={{
                        background: darkMode ? '#4a5568' : '#f1f5f9',
                        color: darkMode ? '#e2e8f0' : '#1e293b',
                        fontSize: '0.875rem'
                      }}
                    >
                      PERMANENTLY_DELETE
                    </code>{' '}
                    below:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={confirmationText}
                    onChange={(e) => {
                      setConfirmationText(e.target.value);
                      setConfirmationError('');
                    }}
                    placeholder="Type PERMANENTLY_DELETE here"
                    className={`py-3 ${confirmationError ? 'is-invalid' : ''}`}
                    disabled={isDeleting}
                    style={{
                      backgroundColor: darkMode ? '#2d3748' : '#ffffff',
                      borderColor: confirmationError ? '#dc3545' : (darkMode ? '#4a5568' : '#d1d5db'),
                      color: darkMode ? '#f7fafc' : '#1a202c',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                  {confirmationError && (
                    <div className="invalid-feedback d-block mt-2">
                      {confirmationError}
                    </div>
                  )}
                </div>
                
                <div className="p-4 rounded-lg" style={{
                  background: darkMode 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div className="d-flex align-items-start">
                    <FiRefreshCw 
                      className="me-2 mt-1 flex-shrink-0" 
                      size={16} 
                      style={{ color: '#3b82f6' }}
                    />
                    <div className="small" style={{ color: darkMode ? '#93c5fd' : '#1e40af' }}>
                      <strong>After removal:</strong> You'll be able to submit a new internship application 
                      with updated information right away.
                    </div>
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
          
          <Modal.Footer 
            className="border-0 pt-0"
            style={{ background: 'transparent' }}
          >
            <Button 
              variant="outline-secondary"
              onClick={handleCancelConfirm}
              disabled={isDeleting}
              className="px-4 py-2 me-2"
              style={{
                borderRadius: '8px',
                borderColor: darkMode ? '#4a5568' : '#d1d5db',
                color: darkMode ? '#e2e8f0' : '#374151'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              disabled={confirmationText !== 'PERMANENTLY_DELETE' || isDeleting}
              className="px-4 py-2 fw-semibold"
              style={{
                background: confirmationText === 'PERMANENTLY_DELETE' && !isDeleting
                  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                opacity: confirmationText === 'PERMANENTLY_DELETE' && !isDeleting ? 1 : 0.6
              }}
            >
              <FiTrash2 className="me-2" size={16} />
              {isDeleting ? 'Processing...' : 'Remove Application'}
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
};

export default DeletedCVNotification;