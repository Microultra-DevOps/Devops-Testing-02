import React from "react";
import PropTypes from "prop-types";
import { CgAwards } from "react-icons/cg";

const PreviousTrainingSection = ({ handleInputChange, cvData, darkMode, readOnly }) => {
  return (
    <div className={`p-4 rounded mt-4 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Section Header */}
      <div className="d-flex align-items-center gap-2">
        <CgAwards className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
        <h5 className="mb-0">Previous Training at SLT</h5>
      </div>

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Radio Buttons for Previous Training */}
      <div className="mb-3">
        <label className="form-label">
          Have you had previous training at SLT? <span className="text-danger">*</span>
        </label>
        <div className="d-flex gap-3 mt-2">
          {/* Yes Option */}
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="previousTraining"
              id="previousTraining-yes"
              value="yes"
              checked={cvData.previousTraining === "yes"}
              onChange={handleInputChange}
              required
              disabled={readOnly}
            />
            <label className="form-check-label" htmlFor="previousTraining-yes">
              Yes
            </label>
          </div>

          {/* No Option */}
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="previousTraining"
              id="previousTraining-no"
              value="no"
              checked={cvData.previousTraining === "no"}
              onChange={handleInputChange}
              required
              disabled={readOnly}
            />
            <label className="form-check-label" htmlFor="previousTraining-no">
              No
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

PreviousTrainingSection.propTypes = {
  cvData: PropTypes.shape({
    previousTraining: PropTypes.string.isRequired,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool,
};

PreviousTrainingSection.defaultProps = {
  readOnly: false, 
};

export default PreviousTrainingSection;
