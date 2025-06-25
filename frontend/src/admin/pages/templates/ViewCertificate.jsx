import React, { useState, useEffect } from "react";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";

const ViewCertificate = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/interncertificates/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch certificate details");
        }
        const data = await response.json();
        setCertificate(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=1123');
    
    // Get certificate background color based on dark mode
    const bgColor = darkMode ? "#343a40" : "#fff";
    const textColor = darkMode ? "#fff" : "#000";
    const borderColor = "#1a5276";
    
    // Prepare certificate content - exclude the original footer so we can restructure it
    const certificateHeader = document.querySelector("#certificate-content .certificate-header").innerHTML;
    const certificateBody = document.querySelector("#certificate-content .certificate-body").innerHTML;
    const signatureSection = document.querySelector("#certificate-content .certificate-footer .row").innerHTML;
    
    // Get the label data we need to rearrange
    const engineerLabel = certificate.label13 || "Engineer/Talent Development";
    const successfullyLabel = certificate.label14 || "Successfully Completed";
    const awardedOnText = certificate.label11 || "";
    
    // Write print-optimized HTML to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Certificate</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: 'Arial', sans-serif;
            color: ${textColor};
            background-color: ${bgColor};
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          .print-instructions {
            background: #f8d7da;
            color: #721c24;
            padding: 10px 15px;
            margin-bottom: 20px;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
          }
          .certificate-container { 
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 20mm;
            position: relative;
            border: 10px double ${borderColor};
            background-color: ${bgColor};
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            overflow: hidden;
          }
          .certificate-header { 
            margin-bottom: 15mm; 
            text-align: center; 
            position: relative;
          }
          .certificate-number {
            position: absolute;
            top: 0;
            right: 0;
            font-size: 16px;
          }
          .certificate-title { 
            font-size: 36px; 
            font-weight: bold; 
            margin-bottom: 10mm;
            color: #1a5276;
          }
          .certificate-body { 
            margin-bottom: 15mm; 
            text-align: center; 
            font-size: 20px; 
            line-height: 1.6; 
          }
          .certificate-footer { 
            text-align: center; 
            margin-top: 10mm;
            position: relative;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 30mm;
            margin-bottom: 20mm;
          }
          .signature-column {
            width: 45%;
            text-align: center;
          }
          .signature-line { 
            width: 100%; 
            border-top: 1px solid ${textColor}; 
            margin-bottom: 5mm; 
          }
          .bottom-details {
            display: flex;
            justify-content: space-between;
            position: absolute;
            bottom: 10mm;
            left: 0;
            width: 100%;
            font-size: 14px;
          }
          .left-detail, .right-detail {
            max-width: 45%;
          }
          .print-hide {
            display: block;
          }
          @media print {
            .print-hide {
              display: none;
            }
            .certificate-container {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-hide print-instructions">
          <p>🖨️ PRINTING INSTRUCTIONS:</p>
          <p>1. Select "Save as PDF" if you want to save it</p>
          <p>2. Make sure to check "Background graphics" in browser print options</p>
          <p>3. Set paper size to A4 and margins to None/Minimum</p>
          <button onclick="window.print()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Print Certificate</button>
        </div>
        
        <div class="certificate-container">
          <div class="certificate-header">
            ${certificateHeader}
          </div>
          
          <div class="certificate-body">
            ${certificateBody}
          </div>
          
          <div class="certificate-footer">
            <div class="signature-section">
              <div class="signature-column">
                <div class="signature-line"></div>
                <p>${engineerLabel}</p>
              </div>
              <div class="signature-column">
                <div class="signature-line"></div>
                <p>${successfullyLabel}</p>
              </div>
            </div>
            
            <div class="bottom-details">
              <div class="right-detail">
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error}
          <Button variant="link" onClick={() => navigate("/all-certificate")}>
            Return to Certificate List
          </Button>
        </Alert>
      </Container>
    );
  }

  // Extract certificate number from label15 or label12
  const getCertificateNumber = () => {
    if (certificate.label15 && certificate.label15.includes("Certificate No:")) {
      return certificate.label15;
    } else if (certificate.label12 && certificate.label12.includes("Certificate No:")) {
      return certificate.label12;
    }
    return "";
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">VIEW CERTIFICATE</h3>
      </Container>

      <Container className="mb-5">
        <Button variant="outline-secondary" className="mb-3" onClick={() => navigate("/all-certificate")}>
          <FaArrowLeft className="me-2" /> Back to All Certificates
        </Button>
        
        <Button variant="outline-primary" className="mb-3 ms-2" onClick={handlePrint}>
          <FaPrint className="me-2" /> Print Certificate
        </Button>

        {certificate && (
          <Card 
            className="certificate-preview-card shadow-lg mx-auto" 
            style={{ 
              maxWidth: "850px", 
              backgroundColor: darkMode ? "#343a40" : "#fff",
              color: darkMode ? "#fff" : "#000",
              border: "10px double #1a5276",
              minHeight: "1000px",
              padding: "40px"
            }}
          >
            <Card.Body className="position-relative" id="certificate-content">
              <div className="certificate-header text-center mb-5 position-relative">
                {/* Certificate Number moved to top right */}
                <div style={{ position: "absolute", top: 0, right: 0 }}>
                  <p style={{ fontSize: "16px" }}>{getCertificateNumber()}</p>
                </div>
                <img src={logo} alt="Company Logo" style={{ maxHeight: "80px" }} />
                <h1 className="certificate-title mt-4">{certificate.label1}</h1>
              </div>
              
              <div className="certificate-body text-center fs-4 lh-lg" style={{ marginBottom: "60px" }}>
                <p>{certificate.label2}</p>
                <p>{certificate.label3}</p>
                <p className="fw-bold">{certificate.label4}</p>
                <p>{certificate.label5} {certificate.label6}</p>
                <p>{certificate.label7}</p>
                <p>{certificate.label8}</p>
                <p>{certificate.label9}</p>
                <p className="fw-bold">{certificate.label10}</p>
              </div>
              
              <div className="certificate-footer text-center mt-5">
                <div className="row mt-5">
                  <div className="col-6 text-center">
                    <div className="signature-line"></div>
                    <p>{certificate.label13}</p>
                  </div>
                  <div className="col-6 text-center">
                    <div className="signature-line"></div>
                    <p>{certificate.label14}</p>
                  </div>
                </div>
                
                <div className="certificate-details mt-5 pt-4">
                  {/* Keep Awarded on: line */}

                  
                  {/* Hide Certificate No: if it's now in the top right */}
                  {!getCertificateNumber().includes(certificate.label12) && (
                    <p>{certificate.label12}</p>
                  )}

                </div>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

ViewCertificate.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewCertificate; 


