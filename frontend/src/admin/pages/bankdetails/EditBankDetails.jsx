import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import Notification from "../../../components/notifications/Notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FaUniversity } from "react-icons/fa";

const EditBankDetails = ({ darkMode }) => {
  const { id } = useParams(); 
  const defaultBankData = {
    nic: "",
    internId: "",
    accountHolderName: "",
    bankName: "",
    branch: "",
    accountNumber: "",
  };

  const [bankData, setBankData] = useState(defaultBankData);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!id) return;
      
      setFetchingDetails(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/bankDetails/id/${id}`, {
            headers: { 
              "Content-Type": "application/json"
            },
          });
        
        const data = response.data;
        if (data.accountNumber) {
          data.accountNumber = data.accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
        }
        
        setBankData(data);
      } catch (error) {
        console.error("Error fetching bank details:", error);
        setNotificationMessage(`Error fetching details: ${error.response?.data?.message || error.message}`);
        setNotificationVariant("danger");
        setShowNotification(true);
      } finally {
        setFetchingDetails(false);
      }
    };

    fetchBankDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "accountNumber") {
      let numericValue = value.replace(/\D/g, "").slice(0, 16);
      const formattedValue = numericValue.replace(/(\d{4})/g, "$1 ").trim();

      setBankData((prevState) => ({
        ...prevState,
        [name]: formattedValue,
      }));
      return;
    }

    setBankData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedData = { ...bankData, accountNumber: bankData.accountNumber.replace(/\s/g, "") };

    try {
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/bankDetails/id/${id}`, formattedData, {
        headers: { 
          "Content-Type": "application/json"
        },
      });
      console.log("Bank Details Updated:", response.data);
      setNotificationMessage("Bank details successfully updated!");
      setNotificationVariant("success");
      setShowNotification(true);
    } catch (error) {
      console.error("Error Updating Bank Details:", error.response?.data || error.message);
      setNotificationMessage(`Update Failed: ${error.response?.data?.message || error.message}`);
      setNotificationVariant("danger");
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    if (notificationVariant === "success") {
      navigate("/intern-bank-details");
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Message Banner */}
      <div className={`alert ${darkMode ? "alert-info" : "alert-warning"} text-center`} role="alert">
        This form is available for all users to update their bank details.
      </div>

      {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">
          <FontAwesomeIcon icon={faEdit} className="me-2" />
          EDIT BANK DETAILS
        </h3>
      </div>

      {/* Main Content */}
      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <h2 className="text-start">Update Bank Details</h2>
          <p className="text-start">Make changes to your bank details below.</p>
          <hr />

          {fetchingDetails ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant={darkMode ? "light" : "primary"}>
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Fetching bank details...</p>
            </div>
          ) : (
            /* Bank Details Form */
            <div className={`p-4 rounded mt-4 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
              {/* Section Header */}
              <div className="d-flex align-items-center gap-2">
                <FaUniversity className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
                <h5 className="mb-0">Bank Details</h5>
              </div>

              <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

              {/* Bank Details Inputs */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">NIC Number <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="nic"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    placeholder="Enter NIC number"
                    value={bankData.nic || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Intern ID <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="internId"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    placeholder="Enter Intern ID"
                    value={bankData.internId || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Account Holder Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="accountHolderName"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    placeholder="Enter account holder name"
                    value={bankData.accountHolderName || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Bank Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="bankName"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    placeholder="Enter bank name"
                    value={bankData.bankName || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Branch <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="branch"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    placeholder="Enter branch name"
                    value={bankData.branch || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Account Number <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="accountNumber"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={bankData.accountNumber || ""}
                    onChange={handleInputChange}
                    required
                    maxLength="19" 
                  />
                </div>
              </div>

              <div className="d-flex gap-3 mt-4">
                <button
                  type="button"
                  className={`btn ${darkMode ? "btn-danger" : "btn-outline-secondary"}`}
                  onClick={() => navigate("/intern-bank-details")}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn flex-grow-1 ${darkMode ? "btn-primary" : "btn-success"}`}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Bank Details"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Notification Component */}
      <Notification 
        show={showNotification} 
        onClose={handleCloseNotification} 
        message={notificationMessage} 
        variant={notificationVariant} 
      />
    </div>
  );
};

export default EditBankDetails;