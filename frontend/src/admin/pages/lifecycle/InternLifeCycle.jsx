import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Spinner, Badge } from "react-bootstrap";
import { 
  BookOpen, School, MapPin, Award, Users, Target,
  Search, User, Calendar, Phone, Mail, FileText, File,
  CheckCircle, XCircle, Clock, AlertCircle,
  ChevronDown, ChevronRight
} from "lucide-react";
import logo from "../../../assets/logo.png";
import { format } from 'date-fns';

const InternLifeCycle = ({ darkMode }) => {
  const [nic, setNic] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    application: true,
    interview: false,
    induction: false,
    assignment: false
  });

  const navigate = useNavigate();

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

  const viewPlacementLetter = () => {
    if (userData?.induction?.placementLetterUrl) {
      window.open(userData.induction.placementLetterUrl, '_blank');
    }
  };

  const generatePlacementLetter = () => {
    const { fullName, nic, institute, refNo } = userData;
    
    return {
      letterName: "Placement Letter",
      label1: "Talent Development Section",
      label2: "7th Floor, Head Office, Lotus Road, Colombo 01",
      label3: `Our/My Ref: ${refNo.replace('REF-', 'TRPS-FTP-')}`,
      label4: `Your Ref: ${refNo}`,
      label5: "Telephone: 011-2021359",
      label6: "Fax: 011-2478627",
      label7: "Email: hiroshim@slt.com",
      label8: `To: .......................`,
      label9: "From: Engineer Talent Development",
      label10: `Date: ${format(new Date(), 'yyyy-MM-dd')}`,
      label11: "Subject - Assignment of Internship",
      label12: `Following student from ${institute || "[Institute]"} has been assigned to`,
      label13: `you to undergo the Intern Program under your supervision from ................. to ......................`,
      label14: "",
      label15: "Please arrange to accommodate the Intern. Please note that the induction programme is",
      label16: "compulsory for all interns.",
      label17: "Please arrange to release the interns for the next induction training.",
      label18: "Please do not expose any confidential information to the Intern and strictly follow the information",
      label19: "Security guideline currently prevailing at SLT when assigning duties to the Intern.",
      label20: "Details of the Intern as follows:",
      label21: `Name: ${fullName}`,
      label22: `NIC: ${nic}`,
      label23: "",
      label24: "Intern has signed the following documents - Police report, Duration check, Agreement, and NDA",
      label25: "...........................",
      label26: "Engineer/Talent Development",
      label27: ".................",
      label28: "Signature",
    };
  };

  const handleNicChange = useCallback((e) => {
    setNic(e.target.value);
    if (error) setError("");
  }, [error]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "secondary";
    if (status.includes("passed") || status.includes("completed")) return "success";
    if (status.includes("failed") || status.includes("rejected") || status === "terminated") return "danger";
    if (status.includes("progress") || status.includes("pending")) return "info";
    return "secondary";
  };

  const ModernCard = ({ children, className = "" }) => (
    <div 
      className={`rounded-4 shadow-lg border-0 ${
        darkMode 
          ? "bg-dark text-white border-secondary" 
          : "bg-white text-dark"
      } ${className}`} 
      style={{borderRadius: '1.5rem'}}
    >
      {children}
    </div>
  );

  const SectionHeader = ({ title, icon: Icon, section, count }) => (
  <div
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSection(section);
    }}
    className={`d-flex align-items-center justify-content-between p-4 ${
      darkMode ? "text-white" : "text-dark"
    }`}
    style={{ 
      cursor: 'pointer', 
      borderRadius: '1.5rem 1.5rem 0 0',
      transition: 'background-color 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
    }}
  >
    <div className="d-flex align-items-center">
      <div className={`p-2 rounded-3 me-3 ${
        darkMode 
          ? "bg-primary bg-opacity-25" 
          : "bg-primary bg-opacity-10"
      }`}>
        <Icon size={20} className="text-primary" />
      </div>
      <div>
        <h5 className={`mb-0 ${darkMode ? "text-white" : "text-dark"}`}>
          {title}
        </h5>
        {count && (
          <small className={darkMode ? "text-light" : "text-muted"}>
            {count}
          </small>
        )}
      </div>
    </div>
    {expandedSections[section] ? 
      <ChevronDown size={20} className={darkMode ? "text-light" : "text-muted"} /> : 
      <ChevronRight size={20} className={darkMode ? "text-light" : "text-muted"} />
    }
  </div>
);

  const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`p-3 rounded-3 ${
      darkMode 
        ? "bg-secondary bg-opacity-10 border-secondary" 
        : "bg-light"
    } ${className}`}>
      <div className="d-flex align-items-start">
        <div className={`p-2 rounded-2 me-3 ${
          darkMode ? "bg-dark" : "bg-white"
        }`}>
          <Icon size={16} className={darkMode ? "text-light" : "text-muted"} />
        </div>
        <div className="flex-grow-1">
          <small className={`d-block ${darkMode ? "text-light" : "text-muted"}`}>
            {label}
          </small>
          <div 
            className={`${darkMode ? "text-white" : "text-dark"}`} 
            style={{wordBreak: 'break-word'}}
          >
            {value || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <ModernCard className="mb-4">
      <SectionHeader title="Basic Information" icon={User} section="basic" />
      {expandedSections.basic && (
        <div className="px-4 pb-4">
          <Row className="g-3">
            <Col md={6}>
              <InfoItem icon={User} label="Full Name" value={userData.fullName} />
            </Col>
            <Col md={6}>
              <InfoItem icon={FileText} label="Name with Initials" value={userData.nameWithInitials} />
            </Col>
            <Col md={6}>
              <InfoItem icon={User} label="Gender" value={userData.gender} />
            </Col>
            <Col md={6}>
              <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(userData.birthday)} />
            </Col>
            <Col md={6}>
              <InfoItem icon={FileText} label="NIC" value={userData.nic} />
            </Col>
            <Col md={6}>
              <InfoItem icon={Phone} label="Mobile" value={userData.mobileNumber} />
            </Col>
            <Col md={6}>
              <InfoItem icon={Mail} label="Email" value={userData.emailAddress} />
            </Col>
            <Col md={6}>
              <InfoItem icon={MapPin} label="District" value={userData.district} />
            </Col>
          </Row>
        </div>
      )}
    </ModernCard>
  );

  const renderCVDetails = () => (
    <ModernCard className="mb-4">
      <SectionHeader title="Application Details" icon={FileText} section="application" />
      {expandedSections.application && (
        <div className="px-4 pb-4">
          <Row className="g-3 mb-4">
            <Col md={6}>
              <InfoItem icon={FileText} label="Reference No" value={userData.refNo} />
            </Col>
            <Col md={6}>
              <div className={`p-3 rounded-3 ${
                darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-light"
              }`}>
                <div className="d-flex align-items-start">
                  <div className={`p-2 rounded-2 me-3 ${
                    darkMode ? "bg-dark" : "bg-white"
                  }`}>
                    <Target size={16} className={darkMode ? "text-light" : "text-muted"} />
                  </div>
                  <div className="flex-grow-1">
                    <small className={`d-block ${darkMode ? "text-light" : "text-muted"}`}>
                      Applied Position
                    </small>
                    <Badge bg="primary" className="text-capitalize">
                      {userData.selectedRole === "dataEntry" ? "Data Entry Operator" : "Internship"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <InfoItem icon={School} label="Institute" value={userData.institute} />
            </Col>
            <Col md={6}>
              <InfoItem icon={Calendar} label="Application Date" value={formatDate(userData.applicationDate)} />
            </Col>
            <Col md={6}>
              <div className={`p-3 rounded-3 ${
                darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-light"
              }`}>
                <div className="d-flex align-items-start">
                  <div className={`p-2 rounded-2 me-3 ${
                    darkMode ? "bg-dark" : "bg-white"
                  }`}>
                    <CheckCircle size={16} className={darkMode ? "text-light" : "text-muted"} />
                  </div>
                  <div className="flex-grow-1">
                    <small className={`d-block ${darkMode ? "text-light" : "text-muted"}`}>
                      Current Status
                    </small>
                    <Badge 
                      bg={getStatusColor(userData.currentStatus)}
                      className="text-capitalize"
                    >
                      {userData.currentStatus?.replace(/-/g, ' ') || "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <InfoItem icon={MapPin} label="Postal Address" value={userData.postalAddress} />
            </Col>
          </Row>

          <div className={`border-0 rounded-3 ${
            darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-light"
          }`}>
            <div 
              className={`p-3 border-0 rounded-3 ${
                darkMode ? "bg-transparent text-white" : "bg-transparent text-dark"
              }`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const accordion = document.querySelector('#roleAccordion');
                if (accordion) {
                  accordion.style.display = accordion.style.display === 'none' ? 'block' : 'none';
                }
              }}
            >
              <h6 className={`mb-0 ${darkMode ? "text-white" : "text-dark"}`}>
                {userData.selectedRole === "dataEntry"
                  ? "Data Entry Operator Details"
                  : "Internship Details"}
              </h6>
            </div>

            <div id="roleAccordion" className={`px-3 pb-3 ${
              darkMode ? "bg-transparent text-white" : "bg-transparent text-dark"
            }`}>
              {userData.selectedRole === "dataEntry" ? (
                <div className="space-y-4">
                  <Card className={`border-0 rounded-3 shadow-sm ${
                    darkMode ? "bg-dark text-white border-secondary" : "bg-white text-dark"
                  }`}>
                    <Card.Header className={`border-0 rounded-top-3 ${
                      darkMode ? "bg-secondary text-white border-secondary" : "bg-light text-dark"
                    }`}>
                      <div className="d-flex align-items-center">
                        <BookOpen size={16} className="me-2" />
                        O/L Results
                      </div>
                    </Card.Header>
                    <Card.Body className={darkMode ? "text-white" : "text-dark"}>
                      <Row className="g-3">
                        <Col md={4}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={darkMode ? "text-light" : "text-muted"}>Language:</span>
                            <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                              {userData.roleData?.dataEntry?.language || "N/A"}
                            </span>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={darkMode ? "text-light" : "text-muted"}>Mathematics:</span>
                            <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                              {userData.roleData?.dataEntry?.mathematics || "N/A"}
                            </span>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={darkMode ? "text-light" : "text-muted"}>Science:</span>
                            <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                              {userData.roleData?.dataEntry?.science || "N/A"}
                            </span>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={darkMode ? "text-light" : "text-muted"}>English:</span>
                            <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                              {userData.roleData?.dataEntry?.english || "N/A"}
                            </span>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={darkMode ? "text-light" : "text-muted"}>History:</span>
                            <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                              {userData.roleData?.dataEntry?.history || "N/A"}
                            </span>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={darkMode ? "text-light" : "text-muted"}>Religion:</span>
                            <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                              {userData.roleData?.dataEntry?.religion || "N/A"}
                            </span>
                          </div>
                        </Col>
                      </Row>

                      {(userData.roleData?.dataEntry?.optional1Name ||
                        userData.roleData?.dataEntry?.optional2Name ||
                        userData.roleData?.dataEntry?.optional3Name) && (
                        <>
                          <hr className={`my-3 ${darkMode ? "border-secondary" : "border-light"}`} />
                          <Row className="g-3">
                            {userData.roleData.dataEntry.optional1Name && (
                              <Col md={4}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className={darkMode ? "text-light" : "text-muted"}>
                                    {userData.roleData.dataEntry.optional1Name}:
                                  </span>
                                  <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                                    {userData.roleData.dataEntry.optional1Result || "N/A"}
                                  </span>
                                </div>
                              </Col>
                            )}
                            {userData.roleData.dataEntry.optional2Name && (
                              <Col md={4}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className={darkMode ? "text-light" : "text-muted"}>
                                    {userData.roleData.dataEntry.optional2Name}:
                                  </span>
                                  <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                                    {userData.roleData.dataEntry.optional2Result || "N/A"}
                                  </span>
                                </div>
                              </Col>
                            )}
                            {userData.roleData.dataEntry.optional3Name && (
                              <Col md={4}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className={darkMode ? "text-light" : "text-muted"}>
                                    {userData.roleData.dataEntry.optional3Name}:
                                  </span>
                                  <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                                    {userData.roleData.dataEntry.optional3Result || "N/A"}
                                  </span>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </>
                      )}
                    </Card.Body>
                  </Card>

                  {(userData.roleData?.dataEntry?.aLevelSubject1Name ||
                    userData.roleData?.dataEntry?.aLevelSubject2Name ||
                    userData.roleData?.dataEntry?.aLevelSubject3Name) && (
                    <Card className={`border-0 rounded-3 shadow-sm mt-3 ${
                      darkMode ? "bg-dark text-white border-secondary" : "bg-white text-dark"
                    }`}>
                      <Card.Header className={`border-0 rounded-top-3 ${
                        darkMode ? "bg-secondary text-white border-secondary" : "bg-light text-dark"
                      }`}>
                        <div className="d-flex align-items-center">
                          <Award size={16} className="me-2" />
                          A/L Results
                        </div>
                      </Card.Header>
                      <Card.Body className={darkMode ? "text-white" : "text-dark"}>
                        <Row className="g-3">
                          {userData.roleData.dataEntry.aLevelSubject1Name && (
                            <Col md={4}>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className={darkMode ? "text-light" : "text-muted"}>
                                  {userData.roleData.dataEntry.aLevelSubject1Name}:
                                </span>
                                <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                                  {userData.roleData.dataEntry.aLevelSubject1Result || "N/A"}
                                </span>
                              </div>
                            </Col>
                          )}
                          {userData.roleData.dataEntry.aLevelSubject2Name && (
                            <Col md={4}>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className={darkMode ? "text-light" : "text-muted"}>
                                  {userData.roleData.dataEntry.aLevelSubject2Name}:
                                </span>
                                <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                                  {userData.roleData.dataEntry.aLevelSubject2Result || "N/A"}
                                </span>
                              </div>
                            </Col>
                          )}
                          {userData.roleData.dataEntry.aLevelSubject3Name && (
                            <Col md={4}>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className={darkMode ? "text-light" : "text-muted"}>
                                  {userData.roleData.dataEntry.aLevelSubject3Name}:
                                </span>
                                <span className={`fw-bold ${darkMode ? "text-white" : "text-dark"}`}>
                                  {userData.roleData.dataEntry.aLevelSubject3Result || "N/A"}
                                </span>
                              </div>
                            </Col>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  )}

                  <div className="mt-3">
                    <InfoItem icon={MapPin} label="Preferred Location" value={userData.roleData?.dataEntry?.preferredLocation || "Not specified"} />
                  </div>
                  <div className="mt-3">
                    <InfoItem icon={School} label="Other Qualifications" value={userData.roleData?.dataEntry?.otherQualifications || "None"} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoItem icon={BookOpen} label="Category of Application" value={userData.roleData?.internship?.categoryOfApply || "Not specified"} />
                  <InfoItem icon={School} label="Higher Education" value={userData.roleData?.internship?.higherEducation || "None"} />
                  <InfoItem icon={Award} label="Other Qualifications" value={userData.roleData?.internship?.otherQualifications || "None"} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ModernCard>
  );

  const renderInterviewDetails = () => (
    <ModernCard className="mb-4">
      <SectionHeader 
        title="Interview Details" 
        icon={Users} 
        section="interview"
        count={userData.interview?.interviews?.length ? `${userData.interview.interviews.length} interview(s)` : "No interviews"}
      />
      {expandedSections.interview && (
        <div className="px-4 pb-4">
          {userData.interview?.interviews && userData.interview.interviews.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {userData.interview.interviews.map((interview, index) => (
                <div key={index} className={`p-4 rounded-3 ${
                  darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-light"
                }`}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className={`mb-0 ${darkMode ? "text-white" : "text-dark"}`}>
                      <span className={darkMode ? "text-light" : "text-muted"}>Name:</span>
                      <span name="interviewName" className={`ms-2 ${darkMode ? "text-white" : "text-dark"}`}>
                        {interview.interviewName || `Interview ${index + 1}`}
                      </span>
                    </h6>
                    <Badge 
                      bg={getStatusColor(interview.result?.status)}
                      className="text-capitalize"
                    >
                      {interview.result?.status?.replace('interview-', '') || 'Pending'}
                    </Badge>
                  </div>
                  <Row className="g-2 small">
                    <Col md={6}>
                      <span className={darkMode ? "text-light" : "text-muted"}>Evaluated By:</span>
                      <span className={`ms-2 ${darkMode ? "text-white" : "text-dark"}`}>
                        {interview.result?.evaluatedBy?.name || "N/A"}
                      </span>
                    </Col>
                    <Col md={6}>
                      <span className={darkMode ? "text-light" : "text-muted"}>Date:</span>
                      <span className={`ms-2 ${darkMode ? "text-white" : "text-dark"}`}>
                        {formatDate(interview.result?.evaluatedDate)}
                      </span>
                    </Col>
                  </Row>
                  {interview.result?.feedback && (
                    <div className={`mt-3 p-3 rounded-2 ${
                      darkMode ? "bg-dark border-secondary" : "bg-white"
                    }`}>
                      <small className={`${darkMode ? "text-light" : "text-muted"}`}>
                        {interview.result.feedback}
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <Clock size={48} className={`${darkMode ? "text-light" : "text-muted"} mb-3`} />
              <p className={darkMode ? "text-light" : "text-muted"}>
                No interview details available yet
              </p>
            </div>
          )}
        </div>
      )}
    </ModernCard>
  );

  const renderInductionDetails = () => (
    <ModernCard className="mb-4">
      <SectionHeader title="Induction Details" icon={BookOpen} section="induction" />
      {expandedSections.induction && (
        <div className="px-4 pb-4">
          {userData.induction && (userData.induction.inductionAssigned || userData.induction.status !== "induction-not-assigned") ? (
            <div className="d-flex flex-column gap-3">
              <div className={`p-4 rounded-3 ${
                darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-light"
              }`}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className={`mb-0 ${darkMode ? "text-white" : "text-dark"}`}>
                    <span className={darkMode ? "text-light" : "text-muted"}>Name:</span>
                    <span name="inductionName" className={`ms-2 ${darkMode ? "text-white" : "text-dark"}`}>
                      {userData.induction.inductionName || "Induction Program"}
                    </span>
                  </h6>
                  <Badge 
                    bg={getStatusColor(userData.induction.result?.status)}
                    className="text-capitalize"
                  >
                    {(userData.induction.result?.status || userData.induction.status || "pending").replace('induction-', '')}
                  </Badge>
                </div>
                <Row className="g-2 small">
                  <Col md={6}>
                    <span className={darkMode ? "text-light" : "text-muted"}>Evaluated By:</span>
                    <span className={`ms-2 ${darkMode ? "text-white" : "text-dark"}`}>
                      {userData.induction.result?.evaluatedBy?.name || "N/A"}
                    </span>
                  </Col>
                  <Col md={6}>
                    <span className={darkMode ? "text-light" : "text-muted"}>Date:</span>
                    <span className={`ms-2 ${darkMode ? "text-white" : "text-dark"}`}>
                      {formatDate(userData.induction.result?.evaluatedDate)}
                    </span>
                  </Col>
                </Row>
                {userData.induction.result?.feedback && (
                  <div className={`mt-3 p-3 rounded-2 ${
                    darkMode ? "bg-dark border-secondary" : "bg-white"
                  }`}>
                    <small className={`${darkMode ? "text-light" : "text-muted"}`}>
                      {userData.induction.result.feedback}
                    </small>
                  </div>
                )}
              </div>
              {userData.induction?.placementLetterUrl ? (
                <div className="mt-4 d-flex gap-2">
                  <Button
                    variant={darkMode ? "outline-light" : "outline-primary"}
                    onClick={viewPlacementLetter}
                    className="d-flex align-items-center gap-2"
                  >
                    <File size={18} />
                    View Placement Letter
                  </Button>
                  <Button
                    variant={darkMode ? "outline-info" : "outline-secondary"}
                    onClick={() => {
                      const letterData = generatePlacementLetter();
                      navigate('/generate-placement-letter', { state: { prefilledData: letterData } });
                    }}
                    className="d-flex align-items-center gap-2"
                  >
                    <File size={18} />
                    Generate New Placement Letter
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  <Button
                    variant={darkMode ? "outline-info" : "outline-primary"}
                    onClick={() => {
                      const letterData = generatePlacementLetter();
                      navigate('/generate-placement-letter', { state: { prefilledData: letterData } });
                    }}
                    className="d-flex align-items-center gap-2"
                  >
                    <File size={18} />
                    Generate Placement Letter
                  </Button>
                </div>
              )}
            </div>
            
          ) : (
            <div className="text-center py-5">
              <Clock size={48} className={`${darkMode ? "text-light" : "text-muted"} mb-3`} />
              <p className={darkMode ? "text-light" : "text-muted"}>
                No induction details available yet
              </p>
            </div>
          )}
        </div>
      )}
    </ModernCard>
  );

  const renderSchemaDetails = () => (
    <ModernCard className="mb-4">
      <SectionHeader title="Assignment Details" icon={Target} section="assignment" />
      {expandedSections.assignment && (
        <div className="px-4 pb-4">
          {userData.schemaAssignment?.schemaAssigned ? (
            <div className="space-y-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className={`mb-0 ${darkMode ? "text-white" : "text-dark"}`}>
                  {userData.schemaAssignment.schemeName}
                </h6>
                <Badge 
                  bg={getStatusColor(userData.schemaAssignment.status)}
                  className="text-capitalize"
                >
                  {userData.schemaAssignment.status?.replace('schema-', '') || 'Pending'}
                </Badge>
              </div>
              
              <Row className="g-3">
                <Col md={6}>
                  <InfoItem 
                    icon={Users} 
                    label="Manager" 
                    value={`${userData.schemaAssignment.managerName || 'N/A'} ${userData.schemaAssignment.managerRole ? `(${userData.schemaAssignment.managerRole})` : ''}`}
                  />
                </Col>
                <Col md={6}>
                  <InfoItem 
                    icon={Calendar} 
                    label="Duration" 
                    value={userData.schemaAssignment.internshipPeriod ? `${userData.schemaAssignment.internshipPeriod} months` : 'N/A'}
                  />
                </Col>
                <Col md={6}>
                  <InfoItem icon={Calendar} label="Start Date" value={formatDate(userData.schemaAssignment.startDate)} />
                </Col>
                <Col md={6}>
                  <InfoItem icon={Calendar} label="End Date" value={formatDate(userData.schemaAssignment.endDate)} />
                </Col>
              </Row>

              {userData.schemaAssignment.evaluation && (
                <div className="border-top pt-4 mt-4">
                  <h6 className={`mb-3 ${darkMode ? "text-white" : "text-dark"}`}>Evaluation</h6>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className={darkMode ? "text-light" : "text-muted"}>Status:</span>
                    <Badge 
                      bg={getStatusColor(userData.schemaAssignment.evaluation.status)}
                      className="text-capitalize"
                    >
                      {userData.schemaAssignment.evaluation.status}
                    </Badge>
                  </div>
                  {userData.schemaAssignment.evaluation.feedback && (
                    <div className={`p-4 rounded-3 ${
                      darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-light"
                    }`}>
                      <p className={`mb-0 ${darkMode ? "text-light" : "text-muted"}`}>
                        {userData.schemaAssignment.evaluation.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5">
              <Clock size={48} className={`${darkMode ? "text-light" : "text-muted"} mb-3`} />
              <p className={darkMode ? "text-light" : "text-muted"}>
                No assignment details available yet
              </p>
            </div>
          )}
        </div>
      )}
    </ModernCard>
  );


  return (
    <div 
      className={`min-vh-100 ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`} 
      style={{
        background: !darkMode 
          ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' 
          : 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)',
        minHeight: '100vh'
      }}
    >
      <div className="position-relative overflow-hidden">
        <div 
          className="position-absolute top-0 start-0 w-100 h-100" 
          style={{
            background: darkMode
              ? 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 55, 72, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(233, 236, 239, 0.9) 100%)',
            zIndex: 1
          }}
        />
        <div className="position-relative px-4 py-5" style={{ zIndex: 2 }}>
          <Container>
            <div className="text-center">
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-center mb-4">
                  <Container className="text-center mt-4 mb-3">
                     <img
                     src={logo}
                     alt="Company Logo"
                     className="mx-auto d-block"
                     style={{ height: "50px" }}
                     />
                     <h3 className="mt-3">INTERN LIFE CYCLE</h3>
                  </Container>
                </div>
              </div>

              <Row className="justify-content-center">
                <Col md={8} lg={6}>
                  <ModernCard className={darkMode ? "bg-dark bg-opacity-75" : "bg-white bg-opacity-95"}>
                    <div className="p-4">
                      <div className="text-center mb-4">
                        <h5 className={darkMode ? "text-white" : "text-dark"}>Find Your Application</h5>
                        <p className={darkMode ? "text-light" : "text-muted"}>Enter your NIC number to view your status</p>
                      </div>
                      
                      <div className="position-relative mb-3">
                        <Form.Control
                          type="text"
                          placeholder="Enter NIC Number"
                          value={nic}
                          onChange={handleNicChange}
                          className={`ps-5 py-3 border-0 rounded-3 ${darkMode ? "bg-dark text-white border-secondary" : "bg-light"}`}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          autoFocus
                        />
                        <Search className={`position-absolute top-50 start-0 translate-middle-y ms-3 ${darkMode ? "text-light" : "text-muted"}`} size={20} />
                      </div>
                      
                      <Button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-100 py-3 rounded-3 border-0 fw-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search size={20} className="me-2" />
                            Search Application
                          </>
                        )}
                      </Button>
                    </div>
                  </ModernCard>
                </Col>
              </Row>
            </div>
          </Container>
        </div>
      </div>

      <Container className="py-5">
        {error && (
          <ModernCard className={`mb-4 ${darkMode ? "bg-danger bg-opacity-10 border-danger" : ""}`}>
            <div className="p-4 d-flex align-items-center">
              <AlertCircle className="text-danger me-3 flex-shrink-0" size={24} />
              <div className="flex-grow-1">
                <h6 className="text-danger mb-1">Error</h6>
                <p className="text-danger">{error}</p>
              </div>
              <Button
                variant="link"
                onClick={() => setError("")}
                className="text-danger p-0 border-0"
              >
                <XCircle size={20} />
              </Button>
            </div>
          </ModernCard>
        )}

        {loading && (
          <div className="text-center py-5">
            <div className="mb-4">
              <div 
                className="spinner-border text-primary mx-auto" 
                style={{ width: '4rem', height: '4rem' }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h4 className={`mb-2 ${darkMode ? "text-white" : "text-dark"}`}>Loading Application</h4>
            <p className={darkMode ? "text-light" : "text-muted"}>Please wait while we fetch your details...</p>
          </div>
        )}

        {userData && (
          <>
            {renderBasicInfo()}
            {renderCVDetails()}
            {renderInterviewDetails()}
            {renderInductionDetails()}
            {renderSchemaDetails()}
          </>
        )}
      </Container>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .backdrop-blur {
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
};

export default InternLifeCycle;