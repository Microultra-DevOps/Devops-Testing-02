import React from "react";
import PropTypes from "prop-types";
import { CgMail } from "react-icons/cg";

const InternshipTypeSection = ({
  selectedRole,
  handleRoleChange,
  cvData,
  handleInputChange,
  readOnly,
  darkMode,
  errors = {},
  setFormErrors,
}) => {
  return (
    <div
      className={`p-4 rounded mt-4 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      {/* Section Header */}
      <div className="d-flex align-items-center gap-2">
        <CgMail className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
        <h5 className="mb-0">Type of Internship and Qualifications</h5>
      </div>

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Role Selection */}
      <div className="mt-3">
        <label className="form-label">
          Apply As <span className="text-danger">*</span>
        </label>
        <div className="d-flex gap-3">
          {["dataEntry", "internship"].map((role) => (
            <div className="form-check" key={role}>
              <input
                type="radio"
                id={`role-${role}`}
                name="selectedRole"
                value={role}
                className="form-check-input"
                onChange={handleRoleChange}
                checked={selectedRole === role}
                disabled={readOnly}
              />
              <label htmlFor={`role-${role}`} className="form-check-label">
                {role === "dataEntry" ? "Data Entry Operator" : "Internship"}
              </label>
            </div>
          ))}
        </div>
        {errors?.selectedRole && (
          <div className="text-danger mt-1">
            <small>{errors.selectedRole}</small>
          </div>
        )}
      </div>

      {/* Data Entry Operator Section */}
      {selectedRole === "dataEntry" && (
        <>
          <p className="mt-3 fw-semibold">
            Data Entry Operator Internship requires an IT course including
            Microsoft Office.
          </p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          {/* O/L Results Section */}
          <p className="mt-3 fw-semibold">O/L RESULTS ARE REQUIRED:</p>
          <div className="row">
            {[
              "language",
              "mathematics",
              "science",
              "english", 
              "history",
              "religion",
            ].map((subject) => (
              <div key={subject} className="col-md-4 mb-3">
                <label className="form-label">
                  {subject.charAt(0).toUpperCase() +
                    subject.slice(1).replace(/([A-Z])/g, " $1")}
                  {["language", "mathematics", "science", "english"].includes(subject) && (
                    <span className="text-danger">*</span>
                  )}
                </label>
                <input
                  type="text"
                  id={subject}
                  name={`roleData.dataEntry.${subject}`}
                  className={`form-control ${
                    darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                  } ${
                    errors?.[`roleData.dataEntry.${subject}`] ? "is-invalid" : ""
                  }`}
                  placeholder="Result"
                  value={cvData.roleData?.dataEntry?.[subject] || ""}
                  onChange={handleInputChange}
                  required={[
                    "language",
                    "mathematics", 
                    "science",
                    "english",
                  ].includes(subject)}
                  disabled={readOnly}
                />
                {errors?.[`roleData.dataEntry.${subject}`] && (
                  <div className="invalid-feedback">
                    {errors[`roleData.dataEntry.${subject}`]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Optional Subjects */}
          <p className="mt-3 fw-semibold">Optional Subjects:</p>
          <div className="row">
            {[1, 2, 3].map((index) => (
              <div key={index} className="col-md-4 mb-3">
                <label className="form-label">Optional Subject {index}</label>
                <input
                  type="text"
                  id={`optional${index}Name`}
                  name={`roleData.dataEntry.optional${index}Name`}
                  className={`form-control mb-2 ${
                    darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                  }`}
                  placeholder="Subject Name"
                  value={cvData.roleData?.dataEntry?.[`optional${index}Name`] || ""}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                <input
                  type="text"
                  id={`optional${index}Result`}
                  name={`roleData.dataEntry.optional${index}Result`}
                  className={`form-control ${
                    darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                  }`}
                  placeholder="Result"
                  value={cvData.roleData?.dataEntry?.[`optional${index}Result`] || ""}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
              </div>
            ))}
          </div>

          <hr className={darkMode ? "border-light" : "border-dark"} />

          <p className="mt-3 fw-semibold">A/L RESULTS (Optional):</p>
          <div className="row">
            {[1, 2, 3].map((index) => (
              <div key={index} className="col-md-4 mb-3">
                <label className="form-label">A/L Subject {index}</label>
                <input
                  type="text"
                  id={`aLevelSubject${index}Name`}
                  name={`roleData.dataEntry.aLevelSubject${index}Name`}
                  className={`form-control mb-2 ${
                    darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                  }`}
                  placeholder="Subject Name"
                  value={cvData.roleData?.dataEntry?.[`aLevelSubject${index}Name`] || ""}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
                <input
                  type="text"
                  id={`aLevelSubject${index}Result`}
                  name={`roleData.dataEntry.aLevelSubject${index}Result`}
                  className={`form-control ${
                    darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                  }`}
                  placeholder="Result"
                  value={cvData.roleData?.dataEntry?.[`aLevelSubject${index}Result`] || ""}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
              </div>
            ))}
          </div>

          {/* Preferred Location & Other Qualifications */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Preferred Location <span className="text-danger">*</span>
              </label>
              <select
                id="preferredLocation"
                name="roleData.dataEntry.preferredLocation"
                className={`form-select ${
                  darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                } ${
                  errors?.["roleData.dataEntry.preferredLocation"]
                    ? "is-invalid"
                    : ""
                }`}
                value={cvData.roleData?.dataEntry?.preferredLocation || ""}
                onChange={(e) => {
                  handleInputChange(e);
                  // Clear error if it exists
                  if (errors?.["roleData.dataEntry.preferredLocation"]) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors["roleData.dataEntry.preferredLocation"];
                      return newErrors;
                    });
                  }
                }}
                disabled={readOnly}
                required
              >
                <option value="">Select Location</option>
                <option value="colombo">Colombo</option>
                <option value="kandy">Kandy</option>
                <option value="galle">Galle</option>
                <option value="jaffna">Jaffna</option>
                <option value="batticaloa">Batticaloa</option>
                <option value="kurunegala">Kurunegala</option>
                <option value="anuradhapura">Anuradhapura</option>
                <option value="ratnapura">Ratnapura</option>
                <option value="badulla">Badulla</option>
                <option value="matara">Matara</option>
                <option value="hambantota">Hambantota</option>
                <option value="trincomalee">Trincomalee</option>
                <option value="vavuniya">Vavuniya</option>
                <option value="mannar">Mannar</option>
                <option value="ampara">Ampara</option>
                <option value="polonnaruwa">Polonnaruwa</option>
                <option value="kalutara">Kalutara</option>
                <option value="gampaha">Gampaha</option>
                <option value="puttalam">Puttalam</option>
                <option value="kegalle">Kegalle</option>
                <option value="monaragala">Monaragala</option>
                <option value="nuwara-eliya">Nuwara Eliya</option>
                <option value="matale">Matale</option>
                <option value="kilinochchi">Kilinochchi</option>
                <option value="mullaitivu">Mullaitivu</option>
              </select>
              {errors?.["roleData.dataEntry.preferredLocation"] && (
                <div className="invalid-feedback">
                  {errors["roleData.dataEntry.preferredLocation"]}
                </div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Other Qualifications</label>
              <textarea
                id="otherQualifications"
                name="roleData.dataEntry.otherQualifications"
                className={`form-control ${
                  darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                }`}
                rows="3"
                placeholder="Enter any additional qualifications, certifications, or relevant experience..."
                value={cvData.roleData?.dataEntry?.otherQualifications || ""}
                onChange={handleInputChange}
                disabled={readOnly}
              />
              <small>
                Include IT courses, Microsoft Office certifications, typing speed, etc.
              </small>
            </div>
          </div>
        </>
      )}

      {/* Internship Section */}
      {selectedRole === "internship" && (
        <>
          <p className="mt-3 fw-semibold">
            Internships are offered to students pursuing higher education
            programs at recognized institutes that require an internship period
            as part of the program.
          </p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          <div className="mb-3">
            <label className="form-label">
              Category of Apply <span className="text-danger">*</span>
            </label>
            <select
              id="categoryOfApply"
              name="roleData.internship.categoryOfApply"
              className={`form-select ${
                darkMode ? "bg-secondary text-white" : "bg-white text-dark"
              } ${
                errors?.["roleData.internship.categoryOfApply"]
                  ? "is-invalid" 
                  : ""
              }`}
              value={cvData.roleData?.internship?.categoryOfApply || ""}
              onChange={(e) => {
                handleInputChange(e);
                // Clear error if it exists
                if (errors?.["roleData.internship.categoryOfApply"]) {
                  setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors["roleData.internship.categoryOfApply"];
                    return newErrors;
                  });
                }
              }}
              disabled={readOnly}
              required
            >
              <option value="">Select Category</option>
              <option value="software">Software Development</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile App Development</option>
              <option value="data">Data Analytics</option>
              <option value="ai">Artificial Intelligence</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="marketing">Digital Marketing</option>
              <option value="design">UI/UX Design</option>
              <option value="graphics">Graphic Design</option>
              <option value="business">Business Development</option>
              <option value="finance">Finance & Accounting</option>
              <option value="hr">Human Resources</option>
              <option value="operations">Operations Management</option>
              <option value="content">Content Writing</option>
              <option value="social">Social Media Management</option>
              <option value="other">Other</option>
            </select>
            {errors?.["roleData.internship.categoryOfApply"] && (
              <div className="invalid-feedback">
                {errors["roleData.internship.categoryOfApply"]}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Higher Education Qualifications
            </label>
            <textarea
              id="higherEducation"
              name="roleData.internship.higherEducation"
              className={`form-control ${
                darkMode ? "bg-secondary text-white" : "bg-white text-dark"
              }`}
              rows="3"
              placeholder="Enter your current degree program, university, year of study, GPA, etc..."
              value={cvData.roleData?.internship?.higherEducation || ""}
              onChange={handleInputChange}
              disabled={readOnly}
            />
            <small className="form-text text-muted">
              Include degree program, university name, year of study, GPA if applicable
            </small>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Other Qualifications</label>
            <textarea
              id="otherQualificationsInternship"
              name="roleData.internship.otherQualifications"
              className={`form-control ${
                darkMode ? "bg-secondary text-white" : "bg-white text-dark"
              }`}
              rows="3"
              placeholder="Enter any additional qualifications, certifications, projects, or relevant experience..."
              value={cvData.roleData?.internship?.otherQualifications || ""}
              onChange={handleInputChange}
              disabled={readOnly}
            />
            <small className="form-text text-muted">
              Include certifications, personal projects, online courses, relevant experience
            </small>
          </div>
        </>
      )}
    </div>
  );
};

InternshipTypeSection.propTypes = {
  selectedRole: PropTypes.string.isRequired,
  handleRoleChange: PropTypes.func.isRequired,
  cvData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  darkMode: PropTypes.bool.isRequired,
  errors: PropTypes.object,
  setFormErrors: PropTypes.func.isRequired,
};

InternshipTypeSection.defaultProps = {
  readOnly: false,
  errors: {},
};

export default InternshipTypeSection;