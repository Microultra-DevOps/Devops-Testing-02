import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import { FaArrowLeft, FaPrint } from "react-icons/fa";

const ViewPlacementLetter = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch letter data from the API
  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/letters/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch letter details");
        }
        const data = await response.json();
        setLetter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [id]);

  const handlePrint = () => {
    window.print();
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
          <Button variant="link" onClick={() => navigate("/all-placement-letters")}>
            Return to Placement Letter List
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!letter) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Letter data not found.</Alert>
      </Container>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <style>
        {`
          /* Common styles for both screen and print */
          .letter-paper {
            position: relative;
            background-color: ${darkMode ? "#2c2c2c" : "#f9f9f9"};
            color: ${darkMode ? "#e4e4e4" : "#000"};
            padding: 40px;
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.5;
            min-height: auto;
            width: 210mm; /* A4 width */
            max-width: 210mm;
            margin: 0 auto;
            box-shadow: ${darkMode ? "0 4px 8px rgba(0, 0, 0, 0.5)" : "0 4px 8px rgba(0, 0, 0, 0.1)"};
            border: ${darkMode ? "1px solid #444" : "none"};
            transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
          }

          .memo-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            width: 100%;
          }
          
          .header-logo-container {
            margin-right: 15px;
            flex-shrink: 0;
          }
          
          .header-text {
            text-align: center;
            flex-grow: 1;
          }
          
          .header-text h4, 
          .header-text p {
            text-align: center;
            width: 100%;
            margin-left: auto;
            margin-right: auto;
          }

          .info-table {
            width: 100%;
            margin-bottom: 20px;
            color: inherit;
          }

          .info-table td {
            padding: 3px 0;
            vertical-align: top;
            color: inherit;
          }

          .divider {
            border-top: 1px solid ${darkMode ? "#666" : "#000"};
            margin: 15px 0;
          }

          .subject-line {
            margin-bottom: 20px;
            font-weight: normal;
          }

          .subject-line strong {
            font-weight: bold;
            text-decoration: underline;
          }
          
          .signature-block {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
          }
          
          .signature-line {
            border-top: 1px solid ${darkMode ? "#777" : "#999"};
            width: 150px;
            text-align: center;
            padding-top: 5px;
          }

          .letter-content {
            white-space: pre-line;
          }

          .btn-dark-mode {
            background-color: ${darkMode ? "#444" : "#f8f9fa"};
            color: ${darkMode ? "#fff" : "#333"};
            border-color: ${darkMode ? "#666" : "#ccc"};
          }

          /* Center the letter container better */
          .letter-container {
            display: flex;
            justify-content: center;
            padding: 0;
            margin-bottom: 2rem;
          }

          /* Print-specific styles */
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            
            /* Hide all UI elements */
            .no-print, 
            button, 
            .navbar, 
            .footer {
              display: none !important;
            }
            
            body {
              background-color: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            
            /* Set the letter to fill the A4 page */
            .letter-paper {
              width: 210mm !important;
              min-height: 297mm !important;
              max-width: none !important;
              padding: 20mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              background-color: white !important;
              color: black !important;
              border: none !important;
              overflow: visible !important;
              page-break-inside: avoid !important;
              page-break-after: always !important;
            }
            
            .letter-content {
              font-family: 'Times New Roman', Times, serif !important;
              font-size: 12pt !important;
            }
            
            /* Reset any dark mode styles for printing */
            .divider {
              border-top-color: #000 !important;
            }

            .signature-line {
              border-top-color: #999 !important;
            }
            
            /* Ensure proper page breaks */
            .signature-block {
              page-break-inside: avoid !important;
            }
            
            .memo-header {
              margin-top: 0 !important;
            }
            
            /* Ensure cleaner print */
            html, body {
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
            }
            
            /* Ensure container doesn't mess with A4 size */
            .container, .letter-container {
              max-width: none !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}
      </style>

      {/* Screen-only UI elements */}
      <Container className="text-center mt-4 mb-3 no-print">
        <img 
          src={logo} 
          alt="Company Logo" 
          className="mx-auto d-block" 
          style={{ 
            height: "50px",
            filter: darkMode ? "brightness(1.2) contrast(1.2)" : "none" 
          }} 
        />
        <h3 className="mt-3">VIEW PLACEMENT LETTER</h3>
      </Container>

      <Container className="mb-3 no-print">
        <div className="d-flex justify-content-start gap-2">
          <Button 
            variant={darkMode ? "outline-light" : "outline-secondary"} 
            className="mb-3" 
            onClick={() => navigate("/all-placement-letters")}
          >
            <FaArrowLeft className="me-2" /> Back to All Placement Letters
          </Button>
          
          <Button 
            variant={darkMode ? "outline-light" : "outline-primary"} 
            className="mb-3" 
            onClick={handlePrint}
          >
            <FaPrint className="me-2" /> Print Placement Letter
          </Button>
        </div>
      </Container>

      {/* The letter content - this is what will be printed */}
      <Container className="letter-container">
        <div className="letter-paper">
          <div className="memo-header">
            {/* Logo on the left side */}
            <div className="header-logo-container">
              <img 
                src={logo} 
                alt="SLT Logo" 
                style={{ 
                  height: "40px",
                  filter: darkMode ? "brightness(1.2) contrast(1.2)" : "none" 
                }} 
              />
            </div>
            
            {/* Header text in the center */}
            <div className="header-text">
              <h4 style={{ marginTop: "0", marginBottom: "5px" }}>{letter.letterName}</h4>
              <p style={{ margin: "0" }}>{letter.label1}</p>
              <p style={{ margin: "0" }}>{letter.label2}</p>
            </div>
          </div>
          
          <table className="info-table">
            <tbody>
              <tr>
                <td width="15%">{letter.label3?.split(":")[0] || "Our/My Ref"}</td>
                <td width="2%">:</td>
                <td width="43%">{letter.label3?.split(":")[1] || ""}</td>
                <td width="40%" style={{ textAlign: "right" }}>{letter.label5 || ""}</td>
              </tr>
              <tr>
                <td>{letter.label4?.split(":")[0] || "Your Ref"}</td>
                <td>:</td>
                <td>{letter.label4?.split(":")[1] || ""}</td>
                <td style={{ textAlign: "right" }}>{letter.label6 || ""}</td>
              </tr>
              <tr>
                <td>{letter.label8?.split(":")[0] || "To"}</td>
                <td>:</td>
                <td>{letter.label8?.split(":")[1] || ""}</td>
                <td style={{ textAlign: "right" }}>{letter.label7 || ""}</td>
              </tr>
              <tr>
                <td>{letter.label9?.split(":")[0] || "From"}</td>
                <td>:</td>
                <td>{letter.label9?.split(":")[1] || ""}</td>
                <td style={{ textAlign: "right" }}>{letter.label10 || ""}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="divider"></div>
          
          <div className="subject-line">
            <p><strong>{letter.label11 || "Subject: Assignment of Internship"}</strong></p>
          </div>
          
          <div className="letter-content">
            <p>{letter.label12} {letter.label13}</p>
            <p>{letter.label14}</p>
            <p>{letter.label15} {letter.label16}</p>
            <p>{letter.label17}</p>
            <p>{letter.label18} {letter.label19}</p>
            <p>{letter.label20}</p>
            <p>{letter.label21}</p>
            <p>{letter.label22}</p>
            <p>{letter.label24}</p>
          </div>
          
          <div className="signature-block">
            <div>
              <div className="signature-line" style={{ marginTop: "80px" }}>
                {letter.label26 || "Engineer/Talent Development"}
              </div>
            </div>
            <div>
              <div className="signature-line" style={{ marginTop: "80px" }}>
                {letter.label28 || "Signature"}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

ViewPlacementLetter.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewPlacementLetter;