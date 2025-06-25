import React, { useState, useMemo } from "react";
import { Container, Row, Col, Card, Button, Collapse, Form, InputGroup } from "react-bootstrap";
import logo from "../../../assets/logo.png";

const AdminHelp = ({ darkMode }) => {
  const [openFAQ, setOpenFAQ] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFAQ = (index) => {
    setOpenFAQ(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const faqData = [
    {
      question: "How do I access the Internship Management System?",
      answer: "You can access the system through your admin credentials provided by the IT department. If you haven't received your login details, please contact IT support at it-support@sltmobitel.lk"
    },
    {
      question: "How can I add new interns to the system?",
      answer: "Navigate to the 'Manage Interns' section from your admin dashboard. Click on 'Add New Intern' and fill in the required information including personal details, department assignment, and internship duration."
    },
    {
      question: "What should I do if I forgot my admin password?",
      answer: "Click on the 'Forgot Password' link on the login page and enter your registered email address. You'll receive a password reset link within 5-10 minutes. If you don't receive the email, check your spam folder or contact IT support."
    },
    {
      question: "How do I generate internship reports?",
      answer: "Go to the 'Reports' section in your dashboard. Select the report type (individual, department, or comprehensive), choose the date range, and click 'Generate Report'. The report will be available for download in PDF or Excel format."
    },
    {
      question: "Can I modify intern assignments after they've been created?",
      answer: "Yes, you can modify intern assignments through the 'Manage Interns' section. Select the intern, click 'Edit Assignment', and update the necessary details. Changes will be reflected immediately in the system."
    },
    {
      question: "How do I track intern attendance and performance?",
      answer: "The system provides real-time attendance tracking and performance metrics. Navigate to 'Analytics Dashboard' to view attendance records, evaluation scores, and progress reports for individual interns or departments."
    },
    {
      question: "What browsers are supported by the system?",
      answer: "The system is optimized for Chrome, Firefox, Safari, and Edge (latest versions). For the best experience, we recommend using Chrome or Firefox with JavaScript enabled."
    },
    {
      question: "How often is the system updated?",
      answer: "The system receives regular updates every month with new features and security patches. Major updates are scheduled quarterly. You'll be notified in advance of any scheduled maintenance."
    },
    {
      question: "Who can I contact for technical issues?",
      answer: "For technical support, you can contact our IT support team at it-support@sltmobitel.lk or call +94 112 345 678 during business hours (Monday to Friday, 9 AM - 5 PM). For urgent issues, use our WhatsApp support."
    },
    {
      question: "How do I export intern data?",
      answer: "Go to the 'Data Management' section, select the data you want to export (all interns, specific department, or date range), choose your preferred format (CSV or Excel), and click 'Export'. The file will be downloaded to your device."
    }
  ];

  // Filter FAQs based on search term
  const filteredFAQs = useMemo(() => {
    if (!searchTerm.trim()) return faqData;
    
    return faqData.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container fluid className="px-3 px-md-4">
        <div className="text-center mt-3 mt-md-4 mb-3">
          <img 
            src={logo} 
            alt="SLT Mobitel Logo" 
            className="mx-auto d-block" 
            style={{ height: "40px", maxHeight: "50px" }} 
          />
          <h3 className="mt-3 h4 h3-md">FREQUENTLY ASKED QUESTIONS</h3>
          <p>Find answers to common questions about the Internship Management System</p>
        </div>
      </Container>

      {/* FAQ Content */}
      <Container fluid className="px-3 px-md-4">
        <div className={`p-3 p-md-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-4 mb-md-5`}>
          
          {/* Search Bar */}
          <Row className="mb-4">
            <Col xs={12}>
              <h4 className="mb-3 h5 h4-md">Search FAQs</h4>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search questions and answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={darkMode ? "bg-dark text-white border-secondary" : ""}
                  style={darkMode ? { 
                    backgroundColor: '#2c2c2c', 
                    borderColor: '#6c757d',
                    color: 'white'
                  } : {}}
                />
                {searchTerm && (
                  <Button
                    variant={darkMode ? "outline-light" : "outline-secondary"}
                    onClick={clearSearch}
                    className="px-2 px-md-3"
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
              {searchTerm && (
                <small className="text-muted d-block mt-2">
                  {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found
                </small>
              )}
            </Col>
          </Row>

          {/* FAQ List */}
          <Row>
            <Col xs={12}>
              <h4 className="mb-3 mb-md-4 h5 h4-md">
                {searchTerm ? 'Search Results' : 'Common Questions'}
              </h4>
              
              {filteredFAQs.length === 0 ? (
                <Card className={`mb-3 ${darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark"}`}>
                  <Card.Body className="text-center py-4">
                    <h6 className="text-muted">No questions found matching your search.</h6>
                    <p className="text-muted small mb-3">Try different keywords or browse all questions below.</p>
                    <Button 
                      variant={darkMode ? "outline-light" : "outline-primary"} 
                      size="sm"
                      onClick={clearSearch}
                    >
                      View All Questions
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                filteredFAQs.map((faq, index) => {
                  // Use original index for state management
                  const originalIndex = faqData.findIndex(item => item.question === faq.question);
                  return (
                    <Card 
                      key={originalIndex} 
                      className={`mb-3 ${darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark"}`}
                    >
                      <Card.Header 
                        className="d-flex justify-content-between align-items-start p-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleFAQ(originalIndex)}
                      >
                        <h6 className="mb-0 me-2 flex-grow-1 pe-2" style={{ lineHeight: "1.4" }}>
                          {faq.question}
                        </h6>
                        <Button
                          variant="link"
                          className={`p-0 flex-shrink-0 ${darkMode ? "text-white" : "text-dark"}`}
                          style={{ 
                            textDecoration: "none", 
                            fontSize: "1.2rem",
                            minWidth: "20px",
                            lineHeight: "1"
                          }}
                        >
                          {openFAQ[originalIndex] ? "−" : "+"}
                        </Button>
                      </Card.Header>
                      <Collapse in={openFAQ[originalIndex]}>
                        <Card.Body className="pt-0">
                          <div 
                            className={`p-3 rounded border ${
                              darkMode 
                                ? "bg-secondary border-secondary text-white" 
                                : "bg-white border-light text-dark"
                            }`}
                            style={{
                              backgroundColor: darkMode ? '#495057' : '#f8f9fa',
                              borderColor: darkMode ? '#6c757d' : '#dee2e6',
                              boxShadow: darkMode 
                                ? '0 1px 3px rgba(0,0,0,0.3)' 
                                : '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                          >
                            <p className="mb-0" style={{ lineHeight: "1.5" }}>{faq.answer}</p>
                          </div>
                        </Card.Body>
                      </Collapse>
                    </Card>
                  );
                })
              )}
            </Col>
          </Row>

          <hr className="my-4" />

          {/* Still Need Help Section */}
          <div>
            <h4 className="mb-3 h5 h4-md">Still Need Help?</h4>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Card className={`h-100 ${darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark"}`}>
                  <Card.Body className="d-flex flex-column">
                    <Card.Text className="fw-bold mb-2">Chat with IT Support</Card.Text>
                    <p className="small flex-grow-1 mb-3">Get real-time assistance from our support team via WhatsApp.</p>
                    <div>
                      <a
                        href="https://wa.me/94710755777?text=Hello%20SLT%20Mobitel%20Support,%20I%20need%20assistance%20with%20the%20Internship%20Management%20System."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        <Button 
                          className="w-100 w-md-auto"
                          style={{ 
                            backgroundColor: "#25D366", 
                            border: "none", 
                            color: "white" 
                          }}
                          size="sm"
                        >
                          Chat on WhatsApp
                        </Button>
                      </a>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6}>
                <Card className={`h-100 ${darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark"}`}>
                  <Card.Body>
                    <Card.Text className="fw-bold mb-2">Contact Support Team</Card.Text>
                    <div className="small">
                      <p className="mb-1"><strong>Phone:</strong> +94 112 345 678</p>
                      <p className="mb-1"><strong>Email:</strong> it-support@sltmobitel.lk</p>
                      <p className="mb-0"><strong>Hours:</strong> Monday to Friday, 9 AM - 5 PM</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          {/* System Information */}
          <hr className="my-4" />
          <div>
            <h5 className="mb-3 h6 h5-md">System Information</h5>
            <Row className="g-2 g-md-3">
              <Col xs={12} sm={4}>
                <small className="text-muted d-block"><strong>Version:</strong> v0.1</small>
              </Col>
              <Col xs={12} sm={4}>
                <small className="text-muted d-block"><strong>Last Updated:</strong> 2024-07-01</small>
              </Col>
              <Col xs={12} sm={4}>
                <small className="text-muted d-block"><strong>Status:</strong> <span className="text-info">Operational</span></small>
              </Col>
            </Row>
          </div>
          
        </div>
      </Container>
    </div>
  );
};

export default AdminHelp;