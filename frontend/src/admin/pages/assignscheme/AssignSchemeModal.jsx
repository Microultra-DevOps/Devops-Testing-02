import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const AssignSchemeModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  refNo, 
  darkMode, 
  isBatch = false, 
  selectedCount = 0 
}) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schemeId: "",
    managerId: "",
    internshipPeriod: 6,
    startDate: "",
    forRequest: "no",
  });
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [schemeManagers, setSchemeManagers] = useState([]);

  // Create axios instance
  const api = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
  });

  // Add request interceptor to include auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Helper function to get today's date in yyyy-MM-dd format
  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      schemeId: "",
      managerId: "",
      internshipPeriod: 6,
      startDate: getTodayFormatted(),
      forRequest: "no",
    });
    setSelectedScheme(null);
    setSchemeManagers([]);
    setMessage({ text: "", variant: "" });
  };

  // Fetch schemes when modal opens
  useEffect(() => {
    const fetchSchemes = async () => {
      if (!show) return;
      
      setLoading(true);
      setMessage({ text: "", variant: "" });
      
      try {
        const response = await api.get("/schemes");
        const schemesData = response.data?.data || response.data || [];
        
        if (Array.isArray(schemesData)) {
          // Filter only active schemes
          const activeSchemes = schemesData.filter(scheme => scheme.isActive !== false);
          setSchemes(activeSchemes);
        } else {
          console.error("Invalid schemes data structure:", schemesData);
          setSchemes([]);
          setMessage({
            text: "Failed to load schemes: Invalid data format",
            variant: "danger",
          });
        }
      } catch (error) {
        console.error("Error fetching schemes:", error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            "Failed to fetch schemes";
        setMessage({
          text: `Failed to fetch schemes: ${errorMessage}`,
          variant: "danger",
        });
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      resetForm();
      fetchSchemes();
    }
  }, [show]);

  // Update available managers when scheme is selected
  useEffect(() => {
    if (!selectedScheme) {
      setSchemeManagers([]);
      setFormData(prev => ({ ...prev, managerId: "" }));
      return;
    }

    const managers = [];

    // Check all 6 levels of managers based on your schema
    const managerLevels = [
      { key: 'level1Manager', level: 1, title: 'Executive Level' },
      { key: 'level2Manager', level: 2, title: 'Senior Management' },
      { key: 'level3Manager', level: 3, title: 'Middle Management' },
      { key: 'level4Manager', level: 4, title: 'Team Leadership' },
      { key: 'level5Manager', level: 5, title: 'Supervisory Level' },
      { key: 'level6Manager', level: 6, title: 'Operational Level' }
    ];

    managerLevels.forEach(({ key, level, title }) => {
      const manager = selectedScheme[key];
      if (manager?.employeeId && manager?.name) {
        const availableAllocation = manager.availableAllocation || 0;
        
        // Only include managers with available allocation
        if (availableAllocation > 0) {
          managers.push({
            id: level.toString(), // Use level as ID for backend compatibility
            employeeId: manager.employeeId,
            name: manager.name,
            role: `${title} (Level ${level})`,
            position: manager.position || title,
            department: manager.department || 'N/A',
            availableAllocation: availableAllocation,
            allocationCount: manager.allocationCount || 0,
            assignedCount: manager.assignedCount || 0,
            level: level
          });
        }
      }
    });

    // Sort managers by hierarchy level
    managers.sort((a, b) => a.level - b.level);

    setSchemeManagers(managers);
    setFormData(prev => ({ ...prev, managerId: "" }));
  }, [selectedScheme]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Update selected scheme when scheme changes
    if (name === "schemeId") {
      if (value) {
        const scheme = schemes.find((s) => s._id === value);
        setSelectedScheme(scheme);
      } else {
        setSelectedScheme(null);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.schemeId || !formData.managerId || !formData.startDate) {
      setMessage({
        text: "Please fill all required fields",
        variant: "danger",
      });
      return;
    }

    // Validate internship period
    if (formData.internshipPeriod < 1 || formData.internshipPeriod > 24) {
      setMessage({
        text: "Internship period must be between 1 and 24 months",
        variant: "danger",
      });
      return;
    }

    // Validate start date is not in the past
    const startDate = new Date(formData.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      setMessage({
        text: "Start date cannot be in the past",
        variant: "danger",
      });
      return;
    }

    // Check if selected manager has available allocation
    const selectedManager = schemeManagers.find(m => m.id === formData.managerId);
    if (selectedManager && selectedManager.availableAllocation <= 0) {
      setMessage({
        text: "Selected manager has no available allocation",
        variant: "danger",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ text: "", variant: "" });

      // Prepare data for submission
      const submissionData = {
        ...formData,
        managerLevel: parseInt(formData.managerId), // Convert to number for backend
        forRequest: formData.forRequest === "yes"
      };

      // Call the parent's onConfirm function
      await onConfirm(submissionData);

      // Show success message
      setMessage({
        text: isBatch 
          ? `Successfully assigned scheme to ${selectedCount} candidates!`
          : "Scheme assigned successfully!",
        variant: "success",
      });

      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error("Error in form submission:", error);
      setMessage({
        text: error.message || "Failed to assign scheme. Please try again.",
        variant: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  // Get scheme display text with available positions
  const getSchemeDisplayText = (scheme) => {
    const emptyCount = scheme.totalEmptyCount !== undefined
      ? scheme.totalEmptyCount
      : Math.max(0, (scheme.totalAllocation || 0) - (scheme.totalAllocatedCount || 0));

    return `${scheme.schemeName} (Available: ${emptyCount})`;
  };

  // Filter schemes with available positions
  const availableSchemes = schemes.filter((scheme) => {
    const emptyCount = scheme.totalEmptyCount !== undefined
      ? scheme.totalEmptyCount
      : Math.max(0, (scheme.totalAllocation || 0) - (scheme.totalAllocatedCount || 0));
    
    return emptyCount > 0 && scheme.isActive !== false;
  });

  // Get selected manager details for display
  const getSelectedManagerDetails = () => {
    if (!formData.managerId) return null;
    return schemeManagers.find(m => m.id === formData.managerId);
  };

  const selectedManagerDetails = getSelectedManagerDetails();

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      contentClassName={darkMode ? "bg-dark text-white" : ""}
    >
      <Modal.Header 
        closeButton 
        className={darkMode ? "border-secondary" : ""}
      >
        <Modal.Title>
          {isBatch ? `Batch Assign Scheme (${selectedCount} candidates)` : "Assign Scheme"}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Loading State */}
        {loading && (
          <div className="text-center p-4">
            <Spinner animation="border" variant={darkMode ? "light" : "primary"} />
            <p className="mt-3">Loading schemes...</p>
          </div>
        )}

        {/* Messages */}
        {message.text && (
          <Alert 
            variant={message.variant} 
            className="mt-3"
            dismissible={message.variant === "danger"}
            onClose={() => message.variant === "danger" && setMessage({ text: "", variant: "" })}
          >
            {message.text}
          </Alert>
        )}

        {/* Form */}
        {!loading && (
          <Form onSubmit={handleSubmit}>
            {/* Candidate Reference */}
            <Form.Group className="mb-3">
              <Form.Label>
                {isBatch ? "Selected Candidates" : "Candidate Reference"}
              </Form.Label>
              <Form.Control
                type="text"
                value={refNo || (isBatch ? `${selectedCount} candidates selected` : "Selected Candidate")}
                disabled
                className={darkMode ? "bg-secondary text-white border-secondary" : ""}
              />
            </Form.Group>

            {/* Scheme Selection */}
            <Form.Group className="mb-3">
              <Form.Label>
                Select Scheme <span className="text-danger">*</span>
              </Form.Label>
              {availableSchemes.length === 0 ? (
                <Alert variant="warning" className={darkMode ? "bg-warning text-dark" : ""}>
                  No schemes with available positions found. Please contact administrator.
                </Alert>
              ) : (
                <>
                  <Form.Select
                    name="schemeId"
                    value={formData.schemeId}
                    onChange={handleChange}
                    required
                    className={darkMode ? "bg-secondary text-white border-secondary" : ""}
                    disabled={submitting}
                  >
                    <option value="">Choose a scheme...</option>
                    {availableSchemes.map((scheme) => (
                      <option key={scheme._id} value={scheme._id}>
                        {getSchemeDisplayText(scheme)}
                      </option>
                    ))}
                  </Form.Select>
                  {selectedScheme?.description && (
                    <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                      <strong>Description:</strong> {selectedScheme.description}
                    </Form.Text>
                  )}
                  {selectedScheme && (
                    <div className="mt-2">
                      <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                        <strong>Period:</strong> {selectedScheme.schemeStartDate} to {selectedScheme.schemeEndDate} | 
                        <strong> Allowance:</strong> ${selectedScheme.perHeadAllowance} {selectedScheme.allowanceFrequency} | 
                        <strong> Total Positions:</strong> {selectedScheme.totalAllocation}
                      </Form.Text>
                    </div>
                  )}
                </>
              )}
            </Form.Group>

            {/* Manager Selection */}
            <Form.Group className="mb-3">
              <Form.Label>
                Select Manager <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white border-secondary" : ""}
                disabled={!selectedScheme || schemeManagers.length === 0 || submitting}
              >
                <option value="">Choose a manager...</option>
                {schemeManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} - {manager.role} (Available: {manager.availableAllocation}/{manager.allocationCount})
                  </option>
                ))}
              </Form.Select>
              
              {selectedScheme && schemeManagers.length === 0 && (
                <Form.Text className="text-warning">
                  No managers with available allocation found for this scheme.
                </Form.Text>
              )}
              
              {selectedManagerDetails && (
                <div className="mt-2">
                  <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                    <strong>Manager Details:</strong><br/>
                    <strong>Employee ID:</strong> {selectedManagerDetails.employeeId}<br/>
                    <strong>Department:</strong> {selectedManagerDetails.department}<br/>
                    <strong>Position:</strong> {selectedManagerDetails.position}<br/>
                    <strong>Allocation:</strong> {selectedManagerDetails.assignedCount}/{selectedManagerDetails.allocationCount} assigned
                  </Form.Text>
                </div>
              )}
            </Form.Group>

            {/* Internship Period */}
            <Form.Group className="mb-3">
              <Form.Label>
                Internship Period (Months) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="internshipPeriod"
                value={formData.internshipPeriod}
                onChange={handleChange}
                min="1"
                max="24"
                required
                className={darkMode ? "bg-secondary text-white border-secondary" : ""}
                disabled={availableSchemes.length === 0 || submitting}
              />
              <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                Enter a value between 1 and 24 months
              </Form.Text>
            </Form.Group>

            {/* Start Date */}
            <Form.Group className="mb-3">
              <Form.Label>
                Internship Start Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={getTodayFormatted()}
                required
                className={darkMode ? "bg-secondary text-white border-secondary" : ""}
                disabled={availableSchemes.length === 0 || submitting}
              />
              <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                Start date cannot be in the past
              </Form.Text>
            </Form.Group>

            {/* For Request */}
            <Form.Group className="mb-4">
              <Form.Label>For Request</Form.Label>
              <Form.Select
                name="forRequest"
                value={formData.forRequest}
                onChange={handleChange}
                className={darkMode ? "bg-secondary text-white border-secondary" : ""}
                disabled={availableSchemes.length === 0 || submitting}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Form.Select>
              <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                Specify if this assignment is for a specific request
              </Form.Text>
            </Form.Group>

            {/* Form Actions */}
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={handleClose} 
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  availableSchemes.length === 0 ||
                  !formData.schemeId ||
                  !formData.managerId ||
                  !formData.startDate ||
                  submitting ||
                  schemeManagers.length === 0
                }
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    {isBatch ? "Assigning..." : "Processing..."}
                  </>
                ) : (
                  <>
                    {isBatch ? `Assign to ${selectedCount} Candidates` : "Confirm Assignment"}
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AssignSchemeModal;