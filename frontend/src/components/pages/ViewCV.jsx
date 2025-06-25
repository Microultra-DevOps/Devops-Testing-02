import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import UserInfoSection from "../pages/UserInfoSection";
import EmergencySection from "../pages/EmergencySection";
import PreviousTrainingSection from "../pages/PreviousTrainingSection";
import InternshipTypeSection from "../pages/InternshipTypeSection";
import ViewUploadDocuments from "../pages/ViewUploadDocuments";

const ViewCV = ({ darkMode }) => {
  const { cvId } = useParams(); 
  const navigate = useNavigate(); 
  const [cvData, setCvData] = useState({});
  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Fetch data when the component is mounted
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You are not logged in. Please log in.");
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

        // Handle districts response
        if (districtsRes.data?.success) {
          setDistricts(districtsRes.data.data || []);
        } else {
          setDistricts(districtsRes.data || []);
        }

        // Handle institutes response
        if (institutesRes.data?.success) {
          setInstitutes(institutesRes.data.data?.institutes || institutesRes.data.data || []);
        } else {
          setInstitutes(institutesRes.data?.institutes || institutesRes.data || []);
        }

        // Handle CV response - check for the new response format
        let cvResponseData;
        if (cvRes.data?.success) {
          cvResponseData = cvRes.data.data;
        } else {
          cvResponseData = cvRes.data;
        }

        if (!cvResponseData || Object.keys(cvResponseData).length === 0) {
          throw new Error("CV data not found or empty");
        }

        setCvData(cvResponseData);
        setSelectedRole(cvResponseData.selectedRole || "");

      } catch (err) {
        console.error("Error fetching data:", err);
        
        // Handle different types of errors
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
            setError("You don't have permission to view this CV.");
          } else {
            setError(`Failed to fetch data: ${message}`);
          }
        } else if (err.request) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(`Error: ${err.message}`);
        }
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
  }, [cvId, navigate]); 

  const handleInputChange = () => {
    console.log("Input change attempted in read-only mode");
  };

  // Loading state with better styling
  if (loading) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading CV details...</p>
        </div>
      </div>
    );
  }

  // Error state with better styling
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

  // Check if CV data is actually loaded
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
      {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">VIEW CV</h3>
      </div>

      {/* Main Content */}
      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="text-start mb-1">CV Details</h2>
              <p className="text-start mb-0">Here you can view CV details for {cvData.fullName || 'N/A'}.</p>
                      {cvData.refNo && (
          <p>Reference: {cvData.refNo}</p>
        )}
            </div>
            {cvData.currentStatus && (
              <span className={`badge ${getStatusBadgeClass(cvData.currentStatus)} fs-6`}>
                {formatStatus(cvData.currentStatus)}
              </span>
            )}
          </div>
          <hr />

          {/* Display CV Details in Read-Only Mode */}
          <UserInfoSection
            cvData={cvData}
            districts={districts}
            institutes={institutes}
            handleInputChange={handleInputChange}
            darkMode={darkMode}
            readOnly={true}
            errors={formErrors}
            setFormErrors={setFormErrors}
          />
          
          <InternshipTypeSection
            cvData={cvData}
            selectedRole={selectedRole}
            darkMode={darkMode}
            readOnly={true}
          />
          
          <EmergencySection 
            cvData={cvData} 
            darkMode={darkMode} 
            readOnly={true} 
          />
          
          <PreviousTrainingSection 
            cvData={cvData} 
            darkMode={darkMode} 
            readOnly={true} 
          />
          
          <ViewUploadDocuments 
            cvId={cvId} 
            darkMode={darkMode} 
          />

          {/* Application Metadata */}
          {(cvData.applicationDate || cvData.lastUpdated) && (
            <div className="mt-4 pt-3 border-top">
              <h5>Application Information</h5>
              <div className="row">
                {cvData.applicationDate && (
                  <div className="col-md-6">
                    <small className="text-muted">Application Date:</small>
                    <p>{new Date(cvData.applicationDate).toLocaleDateString()}</p>
                  </div>
                )}
                {cvData.lastUpdated && (
                  <div className="col-md-6">
                    <small className="text-muted">Last Updated:</small>
                    <p>{new Date(cvData.lastUpdated).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            className={`btn ${darkMode ? "btn-light text-dark" : "btn-secondary"} w-100 mt-3`}
            onClick={() => navigate(-1)} 
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

export default ViewCV;