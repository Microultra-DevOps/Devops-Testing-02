import React, { useState, useEffect } from "react";
import logo from "../../../assets/logo.png";
import UserInfoSection from "../../../components/pages/UserInfoSection";
import EmergencySection from "../../../components/pages/EmergencySection";
import PreviousTrainingSection from "../../../components/pages/PreviousTrainingSection";
import InternshipTypeSection from "../../../components/pages/InternshipTypeSection";
import { useNavigate } from "react-router-dom";
import Notification from "../../../components/notifications/Notification";
import UploadDocumentSection from "../../../components/pages/UploadDocumentSection";

const IndividualAddCVs = ({ darkMode }) => {
  const defaultCVData = {
    fullName: "",
    nameWithInitials: "",
    gender: "",
    postalAddress: "",
    referredBy: "",
    district: "",
    birthday: "",
    nic: "",
    mobileNumber: "",
    landPhone: "",
    emailAddress: "",
    institute: "",
    selectedRole: "",
    roleData: {
      dataEntry: {
        // O/L Results (Required subjects)
        language: "",
        mathematics: "",
        science: "",
        english: "",
        history: "",
        religion: "",
        // Optional subjects
        optional1Name: "",
        optional1Result: "",
        optional2Name: "",
        optional2Result: "",
        optional3Name: "",
        optional3Result: "",
        // A/L Results
        aLevelSubject1Name: "",
        aLevelSubject1Result: "",
        aLevelSubject2Name: "",
        aLevelSubject2Result: "",
        aLevelSubject3Name: "",
        aLevelSubject3Result: "",
        // Other fields
        preferredLocation: "",
        otherQualifications: "",
      },
      internship: {
        categoryOfApply: "",
        higherEducation: "",
        otherQualifications: "",
      }
    },
    emergencyContactName1: "",
    emergencyContactNumber1: "",
    emergencyContactName2: "",
    emergencyContactNumber2: "",
    previousTraining: "",
    updatedCv: null,
    nicFile: null,
    policeClearanceReport: null,
    internshipRequestLetter: null,
  };

  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [cvData, setCvData] = useState(defaultCVData);
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
    isLoading: false,
    onClose: null,
  });
  const [formModified, setFormModified] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const navigate = useNavigate();

  // Fetch districts and institutes on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/districts`);
        if (!response.ok) throw new Error("Failed to fetch districts");
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
        setNotification({
          show: true,
          message: "Error fetching districts. Please try again.",
          variant: "danger",
        });
      }
    };

    const fetchInstitutes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/institutes`);
        if (!response.ok) throw new Error("Failed to fetch institutes");
        const data = await response.json();
        setInstitutes(data.institutes);
      } catch (error) {
        console.error("Error fetching institutes:", error);
        setNotification({
          show: true,
          message: "Error fetching institutes. Please try again.",
          variant: "danger",
        });
      }
    };

    fetchDistricts();
    fetchInstitutes();
  }, []);

  // Handle back navigation with confirmation if form is modified
  const handleBackClick = () => {
    if (formModified) {
      setShowBackConfirmation(true);
    } else {
      navigate(-1);
    }
  };

  // Handle confirmation dialog responses
  const handleConfirmBack = () => {
    setShowBackConfirmation(false);
    navigate(-1);
  };

  const handleCancelBack = () => {
    setShowBackConfirmation(false);
  };

  // Handle Role Change
  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    setCvData((prevState) => ({
      ...prevState,
      selectedRole: role,
    }));
    setFormModified(true);
    // Clear role-specific errors when changing roles
    const commonErrors = {};
    Object.entries(formErrors).forEach(([key, value]) => {
      if (!key.includes('roleData')) {
        commonErrors[key] = value;
      }
    });
    setFormErrors(commonErrors);
  };

  // Handle Input Change with improved nested object handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormModified(true);
    
    // Handle nested paths like "roleData.dataEntry.proficiency.msWord"
    if (name.includes(".")) {
      const parts = name.split(".");
      setCvData(prevState => {
        const newState = { ...prevState };
        let current = newState;
        
        // Navigate to the deepest level except the last part
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        const lastPart = parts[parts.length - 1];
        
        // Handle numeric values for proficiency
        if (parts.includes("proficiency") && 
            (lastPart === "msWord" || lastPart === "msExcel" || lastPart === "msPowerPoint")) {
          current[lastPart] = parseInt(value) || 0;
        } else {
          current[lastPart] = value;
        }
        
        return newState;
      });
      
      // Clear error for nested field if it exists
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      // Handle simple fields
      setCvData(prevState => ({
        ...prevState,
        [name]: value
      }));
      
      // Clear error for this field if it exists
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormModified(true);
    setCvData((prevState) => ({
      ...prevState,
      [name]: files[0] || null,
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    // Basic validation for user info section
    const requiredUserFields = [
      'fullName', 'nameWithInitials', 'gender', 'postalAddress', 
      'district', 'birthday', 'nic', 'mobileNumber', 
      'emailAddress', 'institute'
    ];
    
    requiredUserFields.forEach(field => {
      if (!cvData[field]) {
        errors[field] = `This field is required`;
      }
    });
    
    // Email validation
    if (cvData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cvData.emailAddress)) {
      errors.emailAddress = "Please enter a valid email address";
    }
    
    // Mobile number validation
    if (cvData.mobileNumber && !/^\d{10}$/.test(cvData.mobileNumber)) {
      errors.mobileNumber = "Mobile number must be 10 digits";
    }
    
    // Emergency contact validation
    if (!cvData.emergencyContactName1 || !cvData.emergencyContactNumber1) {
      if (!cvData.emergencyContactName1) {
        errors.emergencyContactName1 = "Primary emergency contact name is required";
      }
      if (!cvData.emergencyContactNumber1) {
        errors.emergencyContactNumber1 = "Primary emergency contact number is required";
      }
    }
    
    // Check if a role is selected
    if (!cvData.selectedRole) {
      errors.selectedRole = "Please select a role";
    }
    
    // Data Entry specific validations
    if (cvData.selectedRole === "dataEntry") {
      // Check preferred location
      if (!cvData.roleData?.dataEntry?.preferredLocation) {
        errors["roleData.dataEntry.preferredLocation"] = "Please select a preferred location";
      }
      
      // Check required O/L results - FIXED: Access direct fields, not nested olResults
      const requiredSubjects = ["language", "mathematics", "science", "english"];
      requiredSubjects.forEach(subject => {
        if (!cvData.roleData?.dataEntry?.[subject]) {
          errors[`roleData.dataEntry.${subject}`] = "This field is required";
        }
      });
    }
    
    // Internship specific validations
    if (cvData.selectedRole === "internship") {
      if (!cvData.roleData?.internship?.categoryOfApply) {
        errors["roleData.internship.categoryOfApply"] = "Please select a category";
      }
    }
    
    // Required files validation
    if (!cvData.updatedCv) {
      errors.updatedCv = "CV upload is required";
    }
    
    if (!cvData.nicFile) {
      errors.nicFile = "NIC scan is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      setNotification({
        show: true,
        message: "Please fill in all required fields and correct any errors.",
        variant: "danger",
      });
      
      const firstErrorElement = document.querySelector('.is-invalid');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setNotification({
        show: true,
        message: "You are not logged in. Please log in and try again.",
        variant: "danger",
      });
      return;
    }

    // Create FormData object
    const formData = new FormData();

    // Add basic fields
    const basicFields = [
      'fullName', 'nameWithInitials', 'gender', 'postalAddress', 'referredBy',
      'district', 'birthday', 'nic', 'mobileNumber', 'landPhone', 'emailAddress',
      'institute', 'selectedRole', 'emergencyContactName1', 'emergencyContactNumber1',
      'emergencyContactName2', 'emergencyContactNumber2', 'previousTraining'
    ];
    
    basicFields.forEach(field => {
      if (cvData[field] !== undefined && cvData[field] !== null) {
        formData.append(field, cvData[field]);
      }
    });

    // Handle role-specific data with correct field names for backend
    if (cvData.selectedRole === 'dataEntry') {
      const dataEntryData = cvData.roleData?.dataEntry || {};
      
      // O/L Results - Send as flat fields (what backend expects)
      const olSubjects = ['language', 'mathematics', 'science', 'english', 'history', 'religion'];
      olSubjects.forEach(subject => {
        formData.append(subject, dataEntryData[subject] || '');
      });
      
      // Optional subjects
      for (let i = 1; i <= 3; i++) {
        formData.append(`optional${i}Name`, dataEntryData[`optional${i}Name`] || '');
        formData.append(`optional${i}Result`, dataEntryData[`optional${i}Result`] || '');
      }
      
      // A/L Results - Send as flat fields (what backend expects)
      for (let i = 1; i <= 3; i++) {
        formData.append(`aLevelSubject${i}Name`, dataEntryData[`aLevelSubject${i}Name`] || '');
        formData.append(`aLevelSubject${i}Result`, dataEntryData[`aLevelSubject${i}Result`] || '');
      }
      
      // Other fields
      formData.append('preferredLocation', dataEntryData.preferredLocation || '');
      formData.append('otherQualifications', dataEntryData.otherQualifications || '');
      
      // Add proficiency data if it exists
      if (dataEntryData.proficiency) {
        formData.append('msWordProficiency', dataEntryData.proficiency.msWord || '0');
        formData.append('msExcelProficiency', dataEntryData.proficiency.msExcel || '0');
        formData.append('msPowerPointProficiency', dataEntryData.proficiency.msPowerPoint || '0');
      }
    } 
    else if (cvData.selectedRole === 'internship') {
      // Internship specific fields
      const internshipData = cvData.roleData?.internship || {};
      formData.append('categoryOfApply', internshipData.categoryOfApply || '');
      formData.append('higherEducation', internshipData.higherEducation || '');
      formData.append('otherQualifications', internshipData.otherQualifications || '');
    }

    // Add files
    const fileFields = ['updatedCv', 'nicFile', 'policeClearanceReport', 'internshipRequestLetter'];
    fileFields.forEach(field => {
      if (cvData[field]) {
        formData.append(field, cvData[field]);
      }
    });

    try {
      // Set loading state
      setNotification({
        show: true,
        message: "Submitting CV...",
        variant: "info",
        isLoading: true,
      });

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/cvs/addcv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setFormModified(false);
        setNotification({
          show: true,
          message: "CV successfully added!",
          variant: "success",
          isLoading: false,
          onClose: () => {
            navigate("/individual-home", { replace: true });
          }
        });
        
        setTimeout(() => {
          navigate("/individual-home", { replace: true });
        }, 1500);
      } else {
        console.error("Failed to submit CV:", result);
        let errorMessage = "Failed to submit CV: ";
        
        if (typeof result === 'object') {
          if (result.message) {
            errorMessage += result.message;
          } else if (result.error) {
            errorMessage += result.error;
          } else if (result.errors && Array.isArray(result.errors)) {
            errorMessage += result.errors.map(e => e.message || e.field).join(', ');
          } else {
            errorMessage += JSON.stringify(result);
          }
        } else {
          errorMessage += "Unknown error";
        }
        
        setNotification({
          show: true,
          message: errorMessage,
          variant: "danger",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error submitting CV:", error);
      setNotification({
        show: true,
        message: `Error submitting CV: ${error.message || "Unknown error"}`,
        variant: "danger",
        isLoading: false,
      });
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD NEW CV</h3>
      </div>

      {/* Main Content */}
      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <h2 className="text-start">New CV</h2>
          <p className="text-start">You can add a new CV and later schedule an interview for it.</p>
          <hr />

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <UserInfoSection
              districts={districts}
              institutes={institutes}
              cvData={cvData}
              handleInputChange={handleInputChange}
              darkMode={darkMode}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />
            <InternshipTypeSection
              selectedRole={selectedRole}
              handleRoleChange={handleRoleChange}
              cvData={cvData}
              handleInputChange={handleInputChange}
              darkMode={darkMode}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />
            <EmergencySection 
              cvData={cvData} 
              handleInputChange={handleInputChange} 
              darkMode={darkMode}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />
            <PreviousTrainingSection 
              cvData={cvData} 
              handleInputChange={handleInputChange} 
              darkMode={darkMode}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />
            <UploadDocumentSection 
              handleFileChange={handleFileChange} 
              cvData={cvData} 
              darkMode={darkMode} 
              handleInputChange={handleInputChange}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />

            {/* Form Navigation Buttons */}
            <div className="d-flex flex-wrap gap-2 justify-content-between mt-4">
              <button 
                type="button" 
                className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-secondary"} px-5`}
                onClick={handleBackClick}
              >
                Back
              </button>
              <button 
                type="submit" 
                className={`btn ${darkMode ? "btn-primary" : "btn-success"} px-5`}
              >
                Submit CV
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Back Confirmation Modal */}
      {showBackConfirmation && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
          <div className={`card ${darkMode ? "bg-dark text-white" : "bg-white"}`} style={{ maxWidth: '400px' }}>
            <div className="card-header">
              <h5>Unsaved Changes</h5>
            </div>
            <div className="card-body">
              <p>You have unsaved changes. Are you sure you want to go back?</p>
              <div className="d-flex justify-content-end gap-2">
                <button 
                  className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-secondary"}`}
                  onClick={handleCancelBack}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleConfirmBack}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Notification
        show={notification.show}
        onClose={() => {
          // First close the notification
          setNotification({ ...notification, show: false });
          
          // Then execute any onClose callback if it exists
          if (notification.onClose && typeof notification.onClose === 'function') {
            notification.onClose();
          }
        }}
        message={notification.message}
        variant={notification.variant}
        isLoading={notification.isLoading}
      />
    </div>
  );
};

export default IndividualAddCVs;