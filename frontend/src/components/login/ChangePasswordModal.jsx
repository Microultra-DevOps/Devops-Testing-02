import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner, InputGroup } from "react-bootstrap";
import axios from "axios";
import { Eye, EyeSlash } from "react-bootstrap-icons";

const ChangePasswordModal = ({ show, onHide, darkMode, triggerNotification }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle password form changes
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError("");
  };

  // Reset form when modal is closed
  const handleClose = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setPasswordError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onHide();
  };

  // Handle password change submission
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    // Don't allow the same password
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPasswordError("Unauthorized: Please log in again.");
        setChangingPassword(false);
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reset form and close modal
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      handleClose();
      triggerNotification("Password changed successfully!", "success");
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage = error.response?.data?.message || "Error changing password";
      setPasswordError(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  // Toggle button styles for eye icon
  const eyeIconStyle = {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 12px",
  };

  return (
    <Modal show={show} onHide={handleClose} centered className={darkMode ? "text-white" : ""}>
      <Modal.Header className={darkMode ? "bg-dark text-white" : ""} closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
        <Form onSubmit={handleSubmitPasswordChange}>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className={darkMode ? "bg-dark text-white" : ""}
              />
              <InputGroup.Text 
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={eyeIconStyle}
                className={darkMode ? "bg-dark text-white border-secondary" : ""}
              >
                {showCurrentPassword ? <EyeSlash /> : <Eye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className={darkMode ? "bg-dark text-white" : ""}
              />
              <InputGroup.Text 
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={eyeIconStyle}
                className={darkMode ? "bg-dark text-white border-secondary" : ""}
              >
                {showNewPassword ? <EyeSlash /> : <Eye />}
              </InputGroup.Text>
            </InputGroup>
            <Form.Text className={darkMode ? "text-light" : "text-muted"}>
              Password must be at least 6 characters long.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                required
                className={darkMode ? "bg-dark text-white" : ""}
              />
              <InputGroup.Text 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={eyeIconStyle}
                className={darkMode ? "bg-dark text-white border-secondary" : ""}
              >
                {showConfirmPassword ? <EyeSlash /> : <Eye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={changingPassword}>
              {changingPassword ? <Spinner size="sm" animation="border" /> : "Change Password"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordModal;