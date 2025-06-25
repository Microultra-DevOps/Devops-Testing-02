import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CgFile } from "react-icons/cg";
import axios from "axios";

const AdminUploadDocumentSection = ({
  handleFileChange,
  cvData,
  darkMode,
  handleInputChange,
}) => {
  const [cvApproved, setCvApproved] = useState(cvData?.cvApproved || false);

  // Validate the form based on required fields
  const isFormValid =
    cvData?.referredBy &&
    cvData?.updatedCv &&
    cvData?.nicFile &&
    cvData?.internshipRequestLetter;

  const toggleCvApproval = async () => {
    try {
      const newStatus = !cvApproved;
      await axios.put(`${import.meta.env.VITE_BASE_URL}/api/cv/${cvData._id}/approve`, {
        cvApproved: newStatus,
      });

      setCvApproved(newStatus);
    } catch (error) {
      console.error("Error updating CV status:", error);
    }
  };

  const inputClass = darkMode
    ? "bg-secondary text-white border-light"
    : "bg-white text-dark border-secondary";

  return (
    <div
      className={`p-4 rounded mt-4 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      {/* Section Header */}
      <div className="d-flex align-items-center gap-2">
        <CgFile className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
        <h5 className="mb-0">Upload Documents</h5>
      </div>

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Upload Fields */}
      <div className="row g-3">
        {[
          {
            name: "updatedCv",
            label: "Updated CV",
            required: true,
            accept: ".pdf,.doc,.docx",
          },
          {
            name: "nicFile",
            label: "NIC (Both Sides)",
            required: true,
            accept: ".pdf,.jpg,.png",
          },
          {
            name: "policeClearanceReport",
            label: "Police Clearance Report",
            required: false,
            accept: ".pdf,.jpg,.png",
          },
          {
            name: "internshipRequestLetter",
            label: "Internship Request Letter",
            required: true,
            accept: ".pdf,.doc,.docx",
          },
        ].map(({ name, label, required, accept }) => (
          <div key={name} className="col-md-6">
            <label className="form-label">
              {label} {required && <span className="text-danger">*</span>}
            </label>
            {cvData?.[name] ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-primary">
                  (Upload new file to replace)
                </span>
              </div>
            ) : (
              <p className="text-primary">No file uploaded yet</p>
            )}

            {/* File Upload Input */}
            <input
              type="file"
              name={name}
              onChange={handleFileChange}
              accept={accept}
              className={`form-control ${inputClass} mt-2`}
              required={required && !cvData?.[name]}
            />
          </div>
        ))}
      </div>

      {/* Referred By Input Field */}
      <div className="mt-4">
        <label htmlFor="referredBy" className="form-label">
          Referred By
        </label>
        <input
          type="text"
          id="referredBy"
          name="referredBy"
          className={`form-control ${inputClass}`}
          placeholder="Enter the name of the person who referred you"
          value={cvData?.referredBy || ""}
          onChange={handleInputChange}
        />
      </div>

      {/* Terms and Conditions
      <div className="mt-4">
        <div className="form-check">
          <input type="checkbox" id="terms" required className="form-check-input" />
          <label htmlFor="terms" className="form-check-label ms-2">
            I agree to the <span className="text-primary">terms and conditions</span>
          </label>
        </div>
        <p className="mt-2 small">
          I hereby declare that the above information is true and correct to the best of my knowledge. I agree to sign all relevant documents and abide by all applicable rules and regulations of SLT. Further, I acknowledge that I am not entitled to an allowance payment or a claim for employment at Sri Lanka Telecom PLC due to this internship program. Payment of an allowance and extension of this internship will be at the sole discretion of SLT.
        </p>
      </div> */}
    
    </div>
  );
};

AdminUploadDocumentSection.propTypes = {
  handleFileChange: PropTypes.func.isRequired,
  cvData: PropTypes.object.isRequired,
  darkMode: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default AdminUploadDocumentSection;
