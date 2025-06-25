import React, { useState } from "react";
import axios from "axios";
import { 
  Container, Row, Col, Card, Form, Button, Spinner, Alert,
  ProgressBar, Badge
} from "react-bootstrap";
import logo from "../../../assets/logo.png";

const CircleProgress = ({ percentage, color, size = 100, darkMode, title }) => {
  const radius = size / 2 - 10;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="position-relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="progress-circle">
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={radius} 
          fill="none" 
          stroke={darkMode ? "#444" : "#f0f0f0"} 
          strokeWidth="8"
          className="progress-circle-bg"
        />
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={radius} 
          fill="none" 
          stroke={color} 
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          className="progress-circle-indicator"
        />
      </svg>
      
      {/* Text positioned in the center */}
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center">
        <h4 className="mb-1 fw-bold">{title}</h4>
        <div className="text-center">
          <span className="fw-bold" style={{ fontSize: '1.2rem' }}>{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

// Modern timeline item component
const TimelineItem = ({ date, title, description, completed, failed, darkMode }) => {
  return (
    <div className="timeline-item d-flex mb-4 position-relative">
      <div className="timeline-icon me-3">
        <div 
          className={`rounded-circle d-flex align-items-center justify-content-center ${
            failed ? 'bg-danger' : completed ? 'bg-success' : 'bg-secondary'
          }`} 
          style={{ width: '40px', height: '40px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {failed ? '✕' : completed ? '✓' : '○'}
        </div>
        {/* Vertical connecting line */}
        <div className="timeline-line"></div>
      </div>
      <div className="timeline-content p-3 flex-grow-1 rounded shadow-sm" 
        style={{
          backgroundColor: darkMode ? '#2c2c2c' : 'white',
          border: `1px solid ${darkMode ? '#444' : '#eaeaea'}`
        }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-bold">{title}</h6>
          <span className={`${darkMode ? "text-light" : "text-muted"} timeline-date rounded-pill px-3 py-1`}
            style={{
              backgroundColor: darkMode ? '#333' : '#f8f9fa',
              fontSize: '0.8rem'
            }}>
            {date}
          </span>
        </div>
        <p className={`mb-0 ${darkMode ? "text-light" : "text-muted"}`}>{description}</p>
      </div>
    </div>
  );
};

// Modernized application progress component
const ApplicationProgress = ({ userData, darkMode }) => {
  if (!userData) return null;

  // Helper function to determine step completion
  const getStepStatus = (status) => {
    const statusMap = {
      "draft": 0,
      "cv-submitted": 1,
      "cv-approved": 2,
      "cv-rejected": -1, 
      "interview-scheduled": 3,
      "interview-passed": 4,
      "interview-failed": -1,
      "induction-assigned": 5,
      "induction-passed": 6,
      "induction-failed": -1,
      "schema-assigned": 7,
      "schema-completed": 8,
      "terminated": -1
    };
    return statusMap[status] || 0;
  };

  const currentStep = getStepStatus(userData.currentStatus);
  
  // Calculate progress percentage based on currentStep
  const getProgressPercentage = () => {
    if (currentStep < 0) return 0; 
    const totalSteps = 8; 
    return Math.round((currentStep / totalSteps) * 100);
  };

  const progressPercentage = getProgressPercentage();

  // Check if application was rejected at any stage
  const isRejected = userData.currentStatus === "cv-rejected" || 
                     userData.currentStatus === "interview-failed" ||
                     userData.currentStatus === "induction-failed" ||
                     userData.currentStatus === "terminated";

  // Colors for different stages
  const colors = {
    cv: "#4361ee",
    interview: "#3a0ca3",
    induction: "#7209b7",
    schema: "#f72585"
  };

  return (
    <div className="mt-5 application-progress">
      <h4 className="text-center mb-4 fw-bold">Application Progress</h4>
      
      {/* Modern Step Indicators */}
      <div className="position-relative mb-5 px-4">
        {/* Progress line */}
        <div className="position-absolute" style={{
          top: '35px',
          left: '10%',
          right: '10%',
          height: '4px',
          backgroundColor: darkMode ? '#444' : '#e9ecef',
          zIndex: 0
        }}></div>
        
        {/* Colored progress line */}
        <div className="position-absolute" style={{
          top: '35px',
          left: '10%',
          width: `${Math.min(80 * progressPercentage / 100, 80)}%`,
          height: '4px',
          backgroundColor: isRejected ? '#dc3545' : '#4361ee',
          zIndex: 1,
          transition: 'width 0.5s ease-in-out'
        }}></div>
        
        <Row className="justify-content-between">
          {['CV Submission', 'CV Review', 'Interview', 'Induction', 'Assignment'].map((step, index) => (
            <Col key={index} xs={6} md={2} className="text-center position-relative d-flex flex-column align-items-center">
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center position-relative z-2 ${
                  index < currentStep / 2 ? 'bg-primary' : 
                  index === Math.floor(currentStep / 2) ? 'bg-info' : 
                  'bg-secondary'
                }`} 
                style={{ 
                  width: '70px', 
                  height: '70px', 
                  color: 'white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease'
                }}>
                {index < currentStep / 2 ? (
                  <span style={{ fontSize: '1.5rem' }}>✓</span>
                ) : (
                  <span style={{ fontSize: '1.2rem' }}>{index + 1}</span>
                )}
              </div>
              <div className="mt-3 fw-bold" style={{ fontSize: '0.9rem' }}>{step}</div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Progress Bar */}
      <Row className="mb-5">
        <Col>
          <Card className={`border-0 shadow-sm ${darkMode ? "bg-dark text-white" : ""}`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Overall Progress</span>
                <span className="badge bg-primary rounded-pill">{progressPercentage}%</span>
              </div>
              <ProgressBar 
                now={progressPercentage} 
                variant={isRejected ? "danger" : "primary"} 
                className="mb-2"
                style={{ height: '10px', borderRadius: '5px' }}
              />
              <p className="text-center mt-3 mb-0">
                {isRejected ? 
                  <span className="text-danger">Application {userData.currentStatus.replace('-', ' ')}</span> : 
                  `${progressPercentage}% Complete`}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Circular Progress Cards */}
      <Row className="mb-5 g-4">
        <Col md={4}>
          <Card className={`h-100 border-0 shadow-sm text-center p-4 ${darkMode ? "bg-dark text-white" : ""}`}>
            <div className="mx-auto mb-3">
              <CircleProgress 
                percentage={currentStep >= 2 ? 100 : currentStep >= 1 ? 50 : 0} 
                color={colors.cv}
                size={130}
                darkMode={darkMode}
                title="CV"
              />
            </div>
            <h5 className="mt-3 mb-0 text-capitalize">
              {userData.cvApproval.status.replace('-', ' ')}
            </h5>
            <div className={darkMode ? "text-light-emphasis" : "text-muted"} style={{ fontSize: '0.9rem' }}>
              {currentStep >= 2 ? "Approved" : currentStep >= 1 ? "In Review" : "Not Started"}
            </div>
          </Card>
        </Col>
        <Col md={4}>
          <Card className={`h-100 border-0 shadow-sm text-center p-4 ${darkMode ? "bg-dark text-white" : ""}`}>
            <div className="mx-auto mb-3">
              <CircleProgress 
                percentage={currentStep >= 4 ? 100 : currentStep >= 3 ? 50 : 0}
                color={colors.interview}
                size={130}
                darkMode={darkMode}
                title="Interview"
              />
            </div>
            <h5 className="mt-3 mb-0 text-capitalize">
              {userData.interview.status.replace('-', ' ')}
            </h5>
            <div className={darkMode ? "text-light-emphasis" : "text-muted"} style={{ fontSize: '0.9rem' }}>
              {currentStep >= 4 ? "Completed" : currentStep >= 3 ? "Scheduled" : "Pending"}
            </div>
          </Card>
        </Col>
        <Col md={4}>
          <Card className={`h-100 border-0 shadow-sm text-center p-4 ${darkMode ? "bg-dark text-white" : ""}`}>
            <div className="mx-auto mb-3">
              <CircleProgress 
                percentage={currentStep >= 8 ? 100 : currentStep >= 6 ? 75 : currentStep >= 5 ? 50 : 0}
                color={colors.schema}
                size={130}
                darkMode={darkMode}
                title="Schema"
              />
            </div>
            <h5 className="mt-3 mb-0 text-capitalize">
              {userData.schemaAssignment.status.replace('-', ' ')}
            </h5>
            <div className={darkMode ? "text-light-emphasis" : "text-muted"} style={{ fontSize: '0.9rem' }}>
              {currentStep >= 8 ? "Completed" : currentStep >= 5 ? "In Progress" : "Not Started"}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Application Timeline */}
      <Card className={`border-0 shadow mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
        <Card.Header className="bg-transparent border-bottom-0 pt-4 px-4">
          <h5 className="mb-0 fw-bold">Application Timeline</h5>
        </Card.Header>
        <Card.Body className="px-4 pt-2 pb-4">
          <div className="timeline position-relative">
            <TimelineItem 
              date={new Date(userData.applicationDate).toLocaleDateString()} 
              title="Application Submitted" 
              description={`Reference Number: ${userData.refNo}`}
              completed={currentStep >= 1}
              darkMode={darkMode}
            />
            
            <TimelineItem 
              date={userData.cvApproval.approvedDate ? new Date(userData.cvApproval.approvedDate).toLocaleDateString() : 'Pending'} 
              title="CV Review" 
              description={userData.cvApproval.notes || "Your CV is being reviewed by our team."}
              completed={currentStep >= 2}
              failed={userData.cvApproval.status === 'cv-rejected'}
              darkMode={darkMode}
            />
            
            {userData.interview.interviews && userData.interview.interviews.length > 0 && (
              <TimelineItem 
                date={userData.interview.interviews[0].result?.evaluatedDate ? 
                  new Date(userData.interview.interviews[0].result.evaluatedDate).toLocaleDateString() : 'Scheduled'} 
                title="Interview" 
                description={userData.interview.interviews[0].result?.feedback || "Your interview is being scheduled."}
                completed={currentStep >= 4}
                failed={userData.interview.status === 'interview-failed' || userData.interview.status === 'interview-no-show'}
                darkMode={darkMode}
              />
            )}
            
            {currentStep >= 5 && (
              <TimelineItem 
                date={userData.induction.result?.evaluatedDate ? 
                  new Date(userData.induction.result.evaluatedDate).toLocaleDateString() : 'Assigned'} 
                title="Induction" 
                description={userData.induction.result?.feedback || "Your induction process is ongoing."}
                completed={currentStep >= 6}
                failed={userData.induction.status === 'induction-failed'}
                darkMode={darkMode}
              />
            )}
            
            {currentStep >= 7 && (
              <TimelineItem 
                date={userData.schemaAssignment.evaluation?.evaluatedDate ? 
                  new Date(userData.schemaAssignment.evaluation.evaluatedDate).toLocaleDateString() : 'Ongoing'} 
                title="Schema Assignment" 
                description={userData.schemaAssignment.schemeName || "You are currently working on your schema assignment."}
                completed={currentStep >= 8}
                failed={userData.schemaAssignment.status === 'terminated'}
                darkMode={darkMode}
              />
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

// Main StatusReport component
const StatusReport = ({ darkMode }) => {
  const [nic, setNic] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!nic.trim()) {
      setError("Please enter a valid NIC number.");
      return;
    }
  
    setLoading(true);
    setError("");
    setUserData(null);
  
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/cvs/nic/${nic}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      setUserData(data);
    } catch (err) {
      setError("No application found for this NIC number.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`status-report-page d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header with Background */}
      <div className="header-section py-5" style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Container>
          <div className="text-center">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="mx-auto d-block mb-3" 
              style={{ height: "60px", filter: darkMode ? 'brightness(1.2)' : 'none' }} 
            />
            <h2 className="mb-4 fw-bold">APPLICATION STATUS TRACKER</h2>
            
            {/* NIC Search Section */}
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <Card className={`border-0 shadow ${darkMode ? "bg-dark text-white" : ""}`}>
                  <Card.Body className="p-4">
                    <p className="mb-3">Enter your NIC number to track your application status</p>
                    <Form className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        placeholder="Enter NIC Number"
                        value={nic}
                        onChange={(e) => setNic(e.target.value)}
                        className={`flex-grow-1 ${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      />
                      <Button 
                        variant="primary" 
                        onClick={handleSearch}
                        className="px-4"
                        disabled={loading}
                      >
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : "Search"}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Error Message */}
        {error && (
          <Alert 
            variant="danger" 
            className="text-center mb-4 shadow-sm"
            dismissible
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Loading State with Shimmer Effect */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3">Fetching your application details...</p>
          </div>
        )}

        {/* User Details & Progress Indicators */}
        {userData && (
          <>
            <Card className={`border-0 shadow-sm mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
              <Card.Body className="p-4">
                <h4 className="mb-4 fw-bold border-bottom pb-2">Applicant Information</h4>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted" }>Full Name</div>
                      <div className="fw-bold fs-5">{userData.fullName}</div>
                    </div>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>NIC</div>
                      <div className="fw-bold">{userData.nic}</div>
                    </div>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Email Address</div>
                      <div className="fw-bold">{userData.emailAddress}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Reference Number</div>
                      <div className="fw-bold">{userData.refNo}</div>
                    </div>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Applied Position</div>
                      <div className="fw-bold">{userData.selectedRole === "dataEntry" ? "Data Entry Operator" : "Internship"}</div>
                    </div>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Current Status</div>
                      <Badge 
                        bg={
                          userData.currentStatus.includes("rejected") || 
                          userData.currentStatus.includes("failed") || 
                          userData.currentStatus === "terminated" ? "danger" : 
                          userData.currentStatus.includes("completed") ? "success" : "primary"
                        }
                        className="fs-6 text-capitalize px-3 py-2"
                      >
                        {userData.currentStatus.replace(/-/g, ' ')}
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            {/* Progress Indicators */}
            <ApplicationProgress userData={userData} darkMode={darkMode} />
          </>
        )}
      </Container>


      {/* Additional CSS */}
      <style jsx>{`
        .timeline {
          position: relative;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 20px;
          width: 2px;
          background-color: ${darkMode ? '#444' : '#e9ecef'};
        }
        
        .timeline-line {
          position: absolute;
          top: 40px;
          bottom: -40px;
          left: 50%;
          width: 2px;
          background-color: ${darkMode ? '#444' : '#e9ecef'};
          transform: translateX(-50%);
          z-index: -1;
        }

        @media (max-width: 767.98px) {
          .timeline::before {
            left: 20px;
          }
          
          .timeline-item {
            padding-left: 40px;
          }
          
          .timeline-icon {
            position: absolute;
            left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default StatusReport;