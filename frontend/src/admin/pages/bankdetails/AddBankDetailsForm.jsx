import React from "react";
import { FaUniversity } from "react-icons/fa";

const BankDetailsForm = ({ bankData, handleInputChange, handleSubmit, readOnly, darkMode, loading }) => {
  return (
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
            disabled={readOnly}
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
            disabled={readOnly}
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
            disabled={readOnly}
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
            disabled={readOnly}
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
            disabled={readOnly}
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
               disabled={readOnly}
               maxLength="19" 
          />

        </div>
      </div>

      {!readOnly && (
        <button type="submit" className={`btn w-100 mt-3 ${darkMode ? "btn-primary" : "btn-success"}`} onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Bank Details"}
        </button>
      )}
    </div>
  );
};

export default BankDetailsForm;
