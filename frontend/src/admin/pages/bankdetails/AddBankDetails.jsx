import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import Notification from "../../../components/notifications/Notification";
import AddBankDetailsForm from "./AddBankDetailsForm";

const AddBankDetails = ({ darkMode }) => {
  const defaultBankData = {
    nic: "",
    internId: "",
    accountHolderName: "",
    bankName: "",
    branch: "",
    accountNumber: "",
  };

  const [bankData, setBankData] = useState(defaultBankData);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Input Change
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
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/bankDetails`, formattedData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Bank Details Saved:", response.data);
      setNotificationMessage("Bank details successfully saved!");
      setNotificationVariant("success");
      setShowNotification(true);
      setBankData(defaultBankData);
    } catch (error) {
      console.error("Error Saving Bank Details:", error.response?.data || error.message);
      setNotificationMessage(`Submission Failed: ${error.response?.data?.message || error.message}`);
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

      {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD BANK DETAILS</h3>
      </div>

      {/* Main Content */}
      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <h2 className="text-start">Bank Details</h2>
          <p className="text-start">Please fill in your bank details for payment processing.</p>
          <hr />

          {/* Bank Details Form Component */}
          <AddBankDetailsForm 
            bankData={bankData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            darkMode={darkMode}
            loading={loading}
          />
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

export default AddBankDetails;