import React, { useEffect, useState } from "react";
import axios from "axios";
import { CgFileDocument } from "react-icons/cg";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";

const ViewUploadedDocuments = ({ cvId, darkMode }) => {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referredBy, setReferredBy] = useState("");

  useEffect(() => {
    const fetchCV = async () => {
      try {
        // Get token from localStorage for authentication
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/cvs/${cvId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Handle different response formats
        let cvResponseData;
        if (response.data?.success) {
          cvResponseData = response.data.data;
        } else {
          cvResponseData = response.data;
        }

        if (!cvResponseData) {
          throw new Error("CV data not found");
        }

        setCvData(cvResponseData);
        setReferredBy(cvResponseData.referredBy || "");
      } catch (err) {
        console.error("Error fetching CV documents:", err);
        
        // Better error handling
        if (err.response) {
          const status = err.response.status;
          if (status === 404) {
            setError("CV not found.");
          } else if (status === 401) {
            setError("Unauthorized access. Please log in again.");
          } else {
            setError(`Failed to load CV documents: ${err.response.data?.message || err.message}`);
          }
        } else if (err.request) {
          setError("Network error. Please check your connection.");
        } else {
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (cvId) {
      fetchCV();
    } else {
      setError("Invalid CV ID provided.");
      setLoading(false);
    }
  }, [cvId]);

  if (loading) {
    return (
      <Container className="text-center mt-4">
        <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
        <p className="mt-2">Loading documents...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" className="text-center">{error}</Alert>
      </Container>
    );
  }

  if (!cvData) {
    return (
      <Container className="mt-4">
        <Alert variant="info" className="text-center">No CV data found.</Alert>
      </Container>
    );
  }

  const fileFields = [
    { label: "Updated CV", key: "updatedCv" },
    { label: "NIC (Both Sides)", key: "nicFile" },
    { label: "Police Clearance Report", key: "policeClearanceReport" },
    { label: "Internship Request Letter", key: "internshipRequestLetter" },
  ];

  const openInNewTab = (filePath) => {
    if (!filePath) {
      alert("File path not available");
      return;
    }

    try {
      // Handle different path formats
      let fileName;
      
      // Check if it's already a filename or a path
      if (filePath.includes('/') || filePath.includes('\\')) {
        // Extract filename from path
        fileName = filePath.split(/[/\\]/).pop();
      } else {
        // It's already just a filename
        fileName = filePath;
      }

      // Construct the full URL
      const fileUrl = `${import.meta.env.VITE_BASE_URL}/uploads/cvs/${fileName}`;
      
      console.log("Opening file:", fileUrl); // Debug log
      
      // Open in new tab
      const newWindow = window.open(fileUrl, "_blank");
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        alert("Popup blocked. Please allow popups for this site and try again.");
        return;
      }
      
      // Handle cases where the file might not load
      newWindow.onerror = () => {
        alert("Failed to load the document. The file might not exist or there may be a server issue.");
      };
      
    } catch (error) {
      console.error("Error opening file:", error);
      alert("Error opening file. Please try again.");
    }
  };

  // Check if any files are available
  const availableFiles = fileFields.filter(({ key }) => cvData[key]);
  const hasFiles = availableFiles.length > 0;

  return (
    <Container className={`mt-4 p-4 rounded ${darkMode ? "bg-dark text-white border border-light" : "bg-white text-dark shadow-sm border"}`}>
      <Row className="align-items-center mb-4">
        <Col xs="auto">
          <CgFileDocument size={24} className={darkMode ? "text-light" : "text-primary"} />
        </Col>
        <Col>
          <h5 className="font-weight-bold mb-0">Uploaded Documents</h5>
        </Col>
      </Row>

      <hr className={darkMode ? "border-light" : "border-dark"} />

      {!hasFiles ? (
        <Alert variant="info" className="text-center">
          No documents have been uploaded yet.
        </Alert>
      ) : (
        <div className="mt-3">
          {availableFiles.map(({ label, key }) => {
            const filePath = cvData[key];
            
            return (
              <div key={key} className="mb-3 p-3 border rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="font-weight-medium mb-1">{label}</p>
                    <small className={`${darkMode ? "text-light" : "text-muted"}`}>
                      File: {filePath ? filePath.split(/[/\\]/).pop() : "N/A"}
                    </small>
                  </div>
                  <Button
                    variant={darkMode ? "outline-light" : "primary"}
                    size="sm"
                    onClick={() => openInNewTab(filePath)}
                    disabled={!filePath}
                  >
                    View {label}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Referred By Input Field */}
      <div className="mt-4">
        <label htmlFor="referredBy" className="form-label">
          Referred By <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="referredBy"
          name="referredBy"
          className={`form-control ${darkMode ? "bg-secondary text-white border-light" : "bg-white text-dark"}`}
          placeholder="Enter the name of the person who referred you"
          value={referredBy || ""}
          readOnly
        />
        {!referredBy && (
          <small className={`${darkMode ? "text-light" : "text-muted"}`}>
            No referrer information provided.
          </small>
        )}
      </div>
    </Container>
  );
};

export default ViewUploadedDocuments;