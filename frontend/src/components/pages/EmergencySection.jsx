import React from "react";
import PropTypes from "prop-types";
import { MdEmergency } from "react-icons/md";

const EmergencySection = ({ handleInputChange, cvData, readOnly, darkMode }) => {
  return (
    <div className={`p-4 rounded mt-4 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Section Header */}
      <div className="d-flex align-items-center gap-2">
        <MdEmergency className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
        <h5 className="mb-0">In Case of Emergency</h5>
      </div>

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Emergency Contact Inputs */}
      {[1, 2].map((number) => (
        <div key={number} className="row g-3 mb-3">
          {/* Contact Name */}
          <div className="col-md-6">
            <label className="form-label">
              Emergency Contact Name {number} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id={`emergencyContactName${number}`}
              name={`emergencyContactName${number}`}
              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
              placeholder={`Enter emergency contact name ${number}`}
              value={cvData[`emergencyContactName${number}`] || ""}
              onChange={handleInputChange}
              required
              disabled={readOnly}
            />
          </div>

          {/* Contact Number */}
          <div className="col-md-6">
            <label className="form-label">
              Emergency Contact Number {number} <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              id={`emergencyContactNumber${number}`}
              name={`emergencyContactNumber${number}`}
              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
              placeholder={`Enter emergency contact number ${number}`}
              value={cvData[`emergencyContactNumber${number}`] || ""}
              onChange={handleInputChange}
              required
              pattern="^\d{10}$" 
              disabled={readOnly}
              maxLength={10} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

EmergencySection.propTypes = {
  cvData: PropTypes.shape({
    emergencyContactName1: PropTypes.string,
    emergencyContactNumber1: PropTypes.string,
    emergencyContactName2: PropTypes.string,
    emergencyContactNumber2: PropTypes.string,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  darkMode: PropTypes.bool.isRequired,
};

EmergencySection.defaultProps = {
  readOnly: false,
};

export default EmergencySection;
