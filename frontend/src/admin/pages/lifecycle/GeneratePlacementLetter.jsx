import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container, Row, Col, Form, Button, Card, Spinner,
} from "react-bootstrap";
import { FaPrint, FaArrowLeft } from "react-icons/fa";
import logo from "../../../assets/logo.png";

const GeneratePlacementLetter = ({ darkMode }) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === 'string') {
      const cleanDate = date.replace(/^Date:\s*/, "");
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
        return cleanDate;
      }
      const parsedDate = new Date(cleanDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split("T")[0];
      }
      return "";
    }
    // Handle Date object
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    return "";
  };

  const formatReadableDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const [formData, setFormData] = useState({
    letterName: "Placement Letter",
    label1: "Talent Development Section",  
    label2: "7th Floor, Head Office, Lotus Road, Colombo 01",
    label3: "Our/My Ref:.......................",
    label4: "Your Ref:......................",
    label5: "Telephone: 011-2021359",
    label6: "Fax: 011-2478627",
    label7: "Email: hiroshim@slt.com",
    label8: "To: .............",
    label9: "From: Engineer Talent Development",
    label10: formatDate(new Date()), 
    label11: "Subject - Assignment of Internship",
    label12: "Following student from (.....Uni/Institute....) has been assigned to",
    label13: "you to undergo the Intern Program under your supervision from (......) to (.....)",
    label14: "",
    label15: "Please arrange to accommodate the Intern. Please note that the induction programme is",
    label16: "compulsory for all interns.",
    label17: "Please arrange to release the interns for the next induction programme which will be held on undefined",
    label18: "Please do not expose any confidential information to the Intern and strictly follow the information",
    label19: "Security guideline currently prevailing at SLT when assigning duties to the Intern.",
    label20: "Details of the Intern as follows:",
    label21: "Name: ...........",
    label22: "NIC:...............",
    label23: "",
    label24: "Intern has signed the following documents - Police report, Duration check, Agreement, and NDA",
    label25: "...........................",
    label26: "Engineer/Talent Development",
    label27: ".................",
    label28: "Signature",
    startDate: "",
    endDate: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state?.prefilledData) {
      const cleanedData = { ...state.prefilledData };
      
      if (cleanedData.label10) {
        cleanedData.label10 = formatDate(cleanedData.label10);
      }

      if (cleanedData.startDate) {
        cleanedData.startDate = formatDate(cleanedData.startDate);
      }
      
      if (cleanedData.endDate) {
        cleanedData.endDate = formatDate(cleanedData.endDate);
      }
      
      setFormData(prev => ({ ...prev, ...cleanedData }));
    }
  }, [state]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const startDateFormatted = formatReadableDate(formData.startDate);
      const endDateFormatted = formatReadableDate(formData.endDate);
      setFormData(prev => ({
        ...prev,
        label13: `you to undergo the Intern Program under your supervision from ${startDateFormatted} to ${endDateFormatted}`
      }));
    } else if (formData.startDate && !formData.endDate) {
      const startDateFormatted = formatReadableDate(formData.startDate);
      setFormData(prev => ({
        ...prev,
        label13: `you to undergo the Intern Program under your supervision from ${startDateFormatted} to (.....)`
      }));
    } else if (!formData.startDate && formData.endDate) {
      const endDateFormatted = formatReadableDate(formData.endDate);
      setFormData(prev => ({
        ...prev,
        label13: `you to undergo the Intern Program under your supervision from (......) to ${endDateFormatted}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        label13: "you to undergo the Intern Program under your supervision from (......) to (.....)"
      }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For date fields, ensure proper formatting
    if (name === 'label10' || name === 'startDate' || name === 'endDate') {
      const formattedValue = formatDate(value);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePrintPreview = () => {
    navigate("/view-generate-placement-letter/preview", { state: { previewData: formData } });
  };

  return (
    <div 
      className={`min-vh-100 ${darkMode ? "bg-dark" : "bg-light"}`}
      style={{ 
        minHeight: '100vh',
        paddingTop: '20px',
        paddingBottom: '20px'
      }}
    >
      <Container 
        className={`py-4 ${darkMode ? "text-white" : "text-dark"}`}
        style={{ marginTop: '10px', marginBottom: '10px' }}
      >
        {/* Fixed Header with proper logo alignment */}
        <div className="d-flex align-items-center justify-content-between mb-4 position-relative">

          {/* Centered Logo */}
          <div className="position-absolute start-50 translate-middle-x">
            <img 
              src={logo}
              alt="Company Logo" 
              style={{ 
                height: "50px",
                width: "auto",
                filter: darkMode ? "brightness(1.2) contrast(1.2)" : "none" 
              }} 
            />
          </div>
          
          {/* Title */}
          <h3 className="mb-0 text-center position-absolute start-50 translate-middle-x" style={{ top: '40px' }}>
            Generate Placement Letter
          </h3>
          
          {/* Spacer for alignment */}
          <div style={{ width: "100px" }}></div>
        </div>

        {/* Add space for the title */}
        <div style={{ marginTop: '100px' }}></div>

        <Row className="justify-content-center">
          <Col lg={10}>
            <Card 
              className={`shadow ${darkMode ? "bg-dark text-white border-secondary" : "bg-white text-dark"}`}
              style={{ 
                marginTop: '20px', 
                marginBottom: '20px',
                backgroundColor: darkMode ? '#343a40' : '#ffffff'
              }}
            >
              <Card.Body style={{ padding: '25px' }}>
                <Form>
                  {/* Letter Name */}
                  <h5 className="mb-3">Letter Information</h5>
                  <Form.Group controlId="letterName" className="mb-3">
                    <Form.Label>Letter Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="letterName"
                      value={formData.letterName}
                      onChange={handleChange}
                      readOnly
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  {/* Header Information */}
                  <h5 className="mb-3">Header Information</h5>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="label1">
                        <Form.Label>Department (Line 1)</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="label1" 
                          value={formData.label1} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="label2">
                        <Form.Label>Address (Line 2)</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="label2" 
                          value={formData.label2} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Reference Information */}
                  <h5 className="mb-3 mt-4">Reference Information</h5>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="label3">
                        <Form.Label>Our/My Reference (Line 3)</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="label3" 
                          value={formData.label3} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="label4">
                        <Form.Label>Your Reference (Line 4)</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="label4" 
                          value={formData.label4} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Contact Information */}
                  <h5 className="mb-3 mt-4">Contact Information</h5>
                  <Row className="mb-3">
                    <Col md={4}>
                      <Form.Group controlId="label5">
                        <Form.Label>Telephone (Line 5)</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="label5" 
                          value={formData.label5} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="label6">
                        <Form.Label>Fax (Line 6)</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="label6" 
                          value={formData.label6} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="label7">
                        <Form.Label>Email (Line 7)</Form.Label>
                        <Form.Control 
                          type="email" 
                          name="label7" 
                          value={formData.label7} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Letter Details */}
                  <h5 className="mb-3 mt-4">Letter Details</h5>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="label8">
                        <Form.Label>To (Line 8)</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="label8" 
                          value={formData.label8} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="label9">
                        <Form.Label>From (Line 9)</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="label9" 
                          value={formData.label9} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="label10">
                        <Form.Label>Date (Line 10)</Form.Label>
                        <Form.Control 
                          type="date" 
                          name="label10" 
                          value={formData.label10} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="label11">
                        <Form.Label>Subject (Line 11)</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="label11" 
                          value={formData.label11} 
                          onChange={handleChange}
                          required
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Letter Content */}
                  <h5 className="mb-3 mt-4">Letter Content</h5>
                  <Form.Group controlId="label12" className="mb-3">
                    <Form.Label>Introduction Text (Line 12)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2}
                      name="label12" 
                      value={formData.label12} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  {/* Duration Section with Date Pickers */}
                  <h6 className="mb-3 mt-4">Internship Duration</h6>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="startDate">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control 
                          type="date" 
                          name="startDate" 
                          value={formData.startDate} 
                          onChange={handleChange}
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="endDate">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control 
                          type="date" 
                          name="endDate" 
                          value={formData.endDate} 
                          onChange={handleChange}
                          min={formData.startDate} 
                          className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                          style={{ 
                            backgroundColor: darkMode ? '#495057' : '',
                            borderColor: darkMode ? '#6c757d' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group controlId="label13" className="mb-3">
                    <Form.Label>Duration Text (Line 13) - Auto-generated</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2}
                      name="label13" 
                      value={formData.label13} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                      readOnly
                    />
                    <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                      This field is automatically updated when you select start and end dates above.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group controlId="label14" className="mb-3">
                    <Form.Label>Additional Line (Line 14) - Optional</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="label14" 
                      value={formData.label14} 
                      onChange={handleChange}
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  {/* Instructions */}
                  <h5 className="mb-3 mt-4">Instructions</h5>
                  <Form.Group controlId="label15" className="mb-3">
                    <Form.Label>Accommodation Instructions (Line 15)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2}
                      name="label15" 
                      value={formData.label15} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label16" className="mb-3">
                    <Form.Label>Compulsory Note (Line 16)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="label16" 
                      value={formData.label16} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label17" className="mb-3">
                    <Form.Label>Induction Programme (Line 17)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2}
                      name="label17" 
                      value={formData.label17} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label18" className="mb-3">
                    <Form.Label>Security Instructions (Line 18)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2}
                      name="label18" 
                      value={formData.label18} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label19" className="mb-3">
                    <Form.Label>Security Guidelines (Line 19)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2}
                      name="label19" 
                      value={formData.label19} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  {/* Intern Information */}
                  <h5 className="mb-3 mt-4">Intern Information</h5>
                  <Form.Group controlId="label20" className="mb-3">
                    <Form.Label>Details Header (Line 20)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="label20" 
                      value={formData.label20} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label21" className="mb-3">
                    <Form.Label>Intern Name (Line 21)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="label21" 
                      value={formData.label21} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label22" className="mb-3">
                    <Form.Label>NIC Number (Line 22)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="label22" 
                      value={formData.label22} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label24" className="mb-3">
                    <Form.Label>Document Information (Line 24)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2}
                      name="label24" 
                      value={formData.label24} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  {/* Signature Block */}
                  <h5 className="mb-3 mt-4">Signature Block</h5>
                  <Form.Group controlId="label25" className="mb-3">
                    <Form.Label>Signature Line (Line 25)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="label25" 
                      value={formData.label25} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label26" className="mb-3">
                    <Form.Label>Signatory Title (Line 26)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="label26" 
                      value={formData.label26} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label27" className="mb-3">
                    <Form.Label>Additional Signature Line (Line 27)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="label27" 
                      value={formData.label27} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <Form.Group controlId="label28" className="mb-3">
                    <Form.Label>Signature Label (Line 28)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="label28" 
                      value={formData.label28} 
                      onChange={handleChange}
                      required
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      style={{ 
                        backgroundColor: darkMode ? '#495057' : '',
                        borderColor: darkMode ? '#6c757d' : ''
                      }}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end mt-4">
                    <Button variant="primary" onClick={handlePrintPreview} disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FaPrint className="me-2" /> Preview
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default GeneratePlacementLetter;