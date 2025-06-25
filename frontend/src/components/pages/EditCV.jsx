import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import UserInfoSection from "../pages/UserInfoSection";
import EmergencySection from "../pages/EmergencySection";
import PreviousTrainingSection from "../pages/PreviousTrainingSection";
import InternshipTypeSection from "../pages/InternshipTypeSection";
import UploadDocumentSection from "../pages/UploadDocumentSection";
import { useNotification } from "../notifications/Notification"; 

const EditCV = ({ darkMode }) => {
  const { cvId } = useParams();
  const navigate = useNavigate();
  
  // Initialize notification hook
  const { showNotification, NotificationComponent } = useNotification();

  // CV Data State with proper structure matching the backend schema
  const [cvData, setCvData] = useState({
    fullName: "",
    nameWithInitials: "",
    gender: "",
    emailAddress: "",
    nic: "",
    birthday: "",
    mobileNumber: "",
    landPhone: "",
    postalAddress: "",
    district: "",
    institute: "",
    emergencyContactName1: "",
    emergencyContactNumber1: "",
    emergencyContactName2: "",
    emergencyContactNumber2: "",
    previousTraining: "",
    selectedRole: "",
    // Initialize roleData with proper structure
    roleData: {
      dataEntry: {
        language: "",
        mathematics: "",
        science: "",
        english: "",
        history: "",
        religion: "",
        optional1Name: "",
        optional1Result: "",
        optional2Name: "",
        optional2Result: "",
        optional3Name: "",
        optional3Result: "",
        aLevelSubject1Name: "",
        aLevelSubject1Result: "",
        aLevelSubject2Name: "",
        aLevelSubject2Result: "",
        aLevelSubject3Name: "",
        aLevelSubject3Result: "",
        preferredLocation: "",
        otherQualifications: ""
      },
      internship: {
        categoryOfApply: "",
        higherEducation: "",
        otherQualifications: ""
      }
    }
  });

  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);

  // File State
  const [files, setFiles] = useState({
    updatedCv: null,
    nicFile: null,
    policeClearanceReport: null,
    internshipRequestLetter: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showNotification("You are not logged in. Please log in.", "error");
          navigate("/login");
          return;
        }

        // Fetch all required data
        const [districtsRes, institutesRes, cvRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/districts`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/institutes`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/cvs/${cvId}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
        ]);

        // Handle districts response - match ViewCV pattern
        if (districtsRes.data?.success) {
          setDistricts(districtsRes.data.data || []);
        } else {
          setDistricts(districtsRes.data || []);
        }

        // Handle institutes response - match ViewCV pattern
        if (institutesRes.data?.success) {
          setInstitutes(institutesRes.data.data?.institutes || institutesRes.data.data || []);
        } else {
          setInstitutes(institutesRes.data?.institutes || institutesRes.data || []);
        }

        // Handle CV response - match ViewCV pattern
        let cvResponseData;
        if (cvRes.data?.success) {
          cvResponseData = cvRes.data.data;
        } else {
          cvResponseData = cvRes.data;
        }

        if (!cvResponseData || Object.keys(cvResponseData).length === 0) {
          throw new Error("CV data not found or empty");
        }

        // Ensure roleData structure exists and merge with fetched data
        const processedCvData = {
          ...cvData, // Start with default structure
          ...cvResponseData, // Override with fetched data
          roleData: {
            dataEntry: {
              ...cvData.roleData.dataEntry, // Default values
              ...(cvResponseData.roleData?.dataEntry || {}) // Fetched values
            },
            internship: {
              ...cvData.roleData.internship, // Default values
              ...(cvResponseData.roleData?.internship || {}) // Fetched values
            }
          }
        };

        setCvData(processedCvData);
        setSelectedRole(cvResponseData.selectedRole || "");
        showNotification("CV data loaded successfully!", "success");

      } catch (err) {
        console.error("Error fetching data:", err);
        
        // Handle different types of errors - match ViewCV pattern
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.message || err.message;
          
          if (status === 404) {
            setError("CV not found. It may have been deleted or does not exist.");
          } else if (status === 401) {
            setError("Unauthorized access. Please log in again.");
            localStorage.removeItem("token");
            navigate("/login");
            return;
          } else if (status === 403) {
            setError("You don't have permission to edit this CV.");
          } else {
            setError(`Failed to fetch data: ${message}`);
          }
        } else if (err.request) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(`Error: ${err.message}`);
        }
        
        showNotification("Failed to fetch CV data. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (cvId) {
      fetchData();
    } else {
      setError("Invalid CV ID");
      setLoading(false);
    }
  }, [cvId, navigate, showNotification]);

  // Handle Input Changes with proper nesting for roleData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setCvData((prevData) => {
      if (name.includes('roleData.')) {
        const parts = name.split('.');
        
        if (parts.length === 3) {
          const [, roleType, fieldName] = parts;
          
          return {
            ...prevData,
            roleData: {
              ...prevData.roleData,
              [roleType]: {
                ...prevData.roleData[roleType],
                [fieldName]: value
              }
            }
          };
        }
      }
  
      // Handle top-level fields
      return { ...prevData, [name]: value };
    });

    // Clear any existing errors for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle Role Change
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    setCvData(prev => ({
      ...prev,
      selectedRole: newRole
    }));

    // Clear role-related errors
    const roleErrorKeys = Object.keys(formErrors).filter(key => key.includes('selectedRole'));
    if (roleErrorKeys.length > 0) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        roleErrorKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  };

  // Handle File Uploads
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [e.target.name]: file }));
      showNotification(`${file.name} uploaded successfully!`, "info", 3000);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Basic required field validation
    if (!cvData.fullName?.trim()) {
      errors['fullName'] = 'Full name is required';
    }
    if (!cvData.emailAddress?.trim()) {
      errors['emailAddress'] = 'Email address is required';
    }
    if (!cvData.nic?.trim()) {
      errors['nic'] = 'NIC is required';
    }
    if (!cvData.mobileNumber?.trim()) {
      errors['mobileNumber'] = 'Mobile number is required';
    }

    // Validate role selection
    if (!selectedRole) {
      errors['selectedRole'] = 'Please select a role';
    }

    // Validate based on selected role
    if (selectedRole === 'dataEntry') {
      // Required O/L subjects
      const requiredOLSubjects = ['language', 'mathematics', 'science', 'english'];
      requiredOLSubjects.forEach(subject => {
        if (!cvData.roleData?.dataEntry?.[subject]?.trim()) {
          errors[`roleData.dataEntry.${subject}`] = `${subject.charAt(0).toUpperCase() + subject.slice(1)} result is required`;
        }
      });

      // Required preferred location
      if (!cvData.roleData?.dataEntry?.preferredLocation) {
        errors['roleData.dataEntry.preferredLocation'] = 'Preferred location is required';
      }
    }

    if (selectedRole === 'internship') {
      // Required category
      if (!cvData.roleData?.internship?.categoryOfApply) {
        errors['roleData.internship.categoryOfApply'] = 'Category of apply is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Updated CV Data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      showNotification("Please fix all validation errors before submitting.", "warning");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Set selectedRole
      formData.append('selectedRole', selectedRole);
      
      // Add non-nested properties first
      const topLevelFields = [
        'fullName', 'nameWithInitials', 'gender', 'emailAddress', 'nic', 
        'birthday', 'mobileNumber', 'landPhone', 'postalAddress', 'district', 
        'institute', 'emergencyContactName1', 'emergencyContactNumber1',
        'emergencyContactName2', 'emergencyContactNumber2', 'previousTraining'
      ];
      
      topLevelFields.forEach(field => {
        if (cvData[field] !== undefined) {
          formData.append(field, cvData[field] === null ? '' : cvData[field]);
        }
      });
      
      // Handle roleData structure
      if (cvData.roleData) {
        // For dataEntry role
        if (cvData.roleData.dataEntry) {
          Object.entries(cvData.roleData.dataEntry).forEach(([key, value]) => {
            formData.append(`roleData[dataEntry][${key}]`, value || '');
          });
        }
        
        // For internship role
        if (cvData.roleData.internship) {
          Object.entries(cvData.roleData.internship).forEach(([key, value]) => {
            formData.append(`roleData[internship][${key}]`, value || '');
          });
        }
      }

      // Append uploaded files if any
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          formData.append(key, files[key]);
        }
      });

      // Send update request
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/cvs/${cvId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showNotification("CV updated successfully! Redirecting...", "success", 3000);
      setTimeout(() => navigate(-1), 3000); 
    } catch (error) {
      console.error("Error updating CV:", error.response?.data || error.message);
      showNotification(
        error.response?.data?.message || "Failed to update CV. Please try again.", 
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state with better styling - match ViewCV
  if (loading) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading CV data...</p>
        </div>
      </div>
    );
  }

  // Error state with better styling - match ViewCV
  if (error) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error!</h4>
            <p>{error}</p>
            <hr />
            <button 
              className="btn btn-outline-danger" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if CV data is actually loaded - match ViewCV
  if (!cvData || Object.keys(cvData).length === 0) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <div className="text-center">
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">No Data Found!</h4>
            <p>CV data could not be loaded.</p>
            <button 
              className="btn btn-outline-warning" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Notification Component */}
      <NotificationComponent darkMode={darkMode} />
      
      {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">EDIT CV</h3>
        {cvData.refNo && (
          <p className="text-muted">Reference: {cvData.refNo}</p>
        )}
      </div>

      {/* Main Content */}
      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="text-start mb-1">Edit Your CV</h2>
              <p className="text-start mb-0">Update your CV details for {cvData.fullName || 'N/A'}.</p>
            </div>
            {cvData.currentStatus && (
              <span className={`badge ${getStatusBadgeClass(cvData.currentStatus)} fs-6`}>
                {formatStatus(cvData.currentStatus)}
              </span>
            )}
          </div>
          <hr />

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <UserInfoSection
              cvData={cvData}
              handleInputChange={handleInputChange} 
              districts={districts}
              institutes={institutes}
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
            />
            <PreviousTrainingSection 
              cvData={cvData} 
              handleInputChange={handleInputChange} 
              darkMode={darkMode} 
            />
            <UploadDocumentSection
              cvData={cvData}
              handleFileChange={handleFileChange}
              darkMode={darkMode}
            />

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`btn ${darkMode ? "btn-light text-dark" : "btn-primary"} w-100 mt-3`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Updating...
                </>
              ) : (
                "Update CV"
              )}
            </button>
          </form>

          {/* Back Button */}
          <button 
            className={`btn ${darkMode ? "btn-light text-dark" : "btn-secondary"} w-100 mt-3`} 
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Back to Previous Page
          </button>
        </div>
      </main>
    </div>
  );
};

// Helper function to get status badge class
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'draft': 'bg-secondary',
    'cv-submitted': 'bg-info',
    'cv-approved': 'bg-success',
    'cv-rejected': 'bg-danger',
    'interview-scheduled': 'bg-primary',
    'interview-re-scheduled': 'bg-warning',
    'interview-passed': 'bg-success',
    'interview-failed': 'bg-danger',
    'induction-scheduled': 'bg-primary',
    'induction-re-scheduled': 'bg-warning',
    'induction-passed': 'bg-success',
    'induction-failed': 'bg-danger',
    'induction-assigned': 'bg-info',
    'schema-assigned': 'bg-primary',
    'schema-completed': 'bg-success',
    'terminated': 'bg-dark'
  };
  return statusClasses[status] || 'bg-secondary';
};

// Helper function to format status text
const formatStatus = (status) => {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default EditCV;