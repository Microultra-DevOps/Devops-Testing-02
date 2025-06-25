import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import logo from "../../../assets/logo.png"; 
import { useNotification } from "../../../components/notifications/Notification"; 
import PropTypes from "prop-types";

const ViewGeneratePlacementLetter = ({ darkMode, isPreview = false }) => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingToDatabase, setSavingToDatabase] = useState(false);
  const letterRef = useRef(null);
  
  const { showNotification, NotificationComponent } = useNotification();

  const getAuthToken = () => {
    return (
      localStorage.getItem('token') || 
      localStorage.getItem('authToken') || 
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('accessToken')
    );
  };

  // Create axios instance with authentication
  const createAuthenticatedAxios = () => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    return axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  useEffect(() => {
    const loadScripts = () => {
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      html2canvasScript.async = true;
      document.body.appendChild(html2canvasScript);

      const jsPDFScript = document.createElement('script');
      jsPDFScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      jsPDFScript.async = true;
      document.body.appendChild(jsPDFScript);

      return () => {
        // Clean up scripts when component unmounts
        try {
          if (document.body.contains(html2canvasScript)) {
            document.body.removeChild(html2canvasScript);
          }
          if (document.body.contains(jsPDFScript)) {
            document.body.removeChild(jsPDFScript);
          }
        } catch (e) {
          console.log("Script cleanup error:", e);
        }
      };
    };

    const cleanupScripts = loadScripts(); 

    if (isPreview && state?.previewData) {
      setLetter(state.previewData);
      setLoading(false);
      showNotification("Preview loaded successfully", "info", 3000);
      return cleanupScripts; 
    }

    // Load letter data from API if not in preview mode
    if (id && !isPreview) {
      const loadLetterData = async () => {
        try {
          const authAxios = createAuthenticatedAxios();
          const response = await authAxios.get(`/api/placementletters/${id}`);
          setLetter(response.data);
          showNotification("Letter loaded successfully", "success", 3000);
        } catch (err) {
          console.error("Error loading letter:", err);
          if (err.response?.status === 401) {
            showNotification("Authentication expired. Please login again.", "error");
            setTimeout(() => navigate('/login'), 2000);
          } else {
            const errorMessage = err.response?.data?.message || "Failed to load letter data";
            setError(errorMessage);
            showNotification(errorMessage, "error");
          }
        } finally {
          setLoading(false);
        }
      };

      loadLetterData();
    } else {
      setLoading(false);
    }

    return cleanupScripts; 
  }, [id, isPreview, state, navigate, showNotification]); 

  const handlePrint = () => {
    try {
      window.print();
      showNotification("Print dialog opened", "info", 2000);
    } catch (err) {
      showNotification("Failed to open print dialog", "error");
    }
  };

  const generatePDFBlob = async () => {
    if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
      throw new Error("PDF generation libraries are still loading. Please try again in a moment.");
    }

    if (!letterRef.current) {
      throw new Error("Letter content reference is null. Cannot generate PDF.");
    }

    showNotification("Generating PDF...", "info", 2000);

    const originalLetterElement = letterRef.current;

    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 210mm; 
      background-color: white; 
      color: black; 
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.6;
      box-sizing: border-box;
      overflow: hidden; 
    `;
    document.body.appendChild(tempContainer);

    const letterClone = originalLetterElement.cloneNode(true);

    letterClone.style.cssText = `
      background-color: white !important; 
      color: black !important; 
      box-shadow: none !important; 
      border: none !important; 
      font-family: 'Times New Roman', Times, serif !important; 
      font-size: 12pt !important; 
      line-height: 1.6 !important; 
      padding: 45px !important;
      width: 210mm !important;
      max-width: 210mm !important;
    `;

    const allElements = letterClone.querySelectorAll('*');
    allElements.forEach(element => {
      element.style.color = 'black'; 
      element.style.backgroundColor = 'transparent'; 
      element.style.filter = 'none'; 

      // Fixed header alignment styles
      if (element.classList.contains('memo-header')) {
        element.style.display = 'flex';
        element.style.alignItems = 'flex-start';
        element.style.marginBottom = '25px';
        element.style.width = '100%';
        element.style.justifyContent = 'flex-start';
        element.style.position = 'relative';
      }
      
      if (element.classList.contains('header-logo-container')) {
        element.style.marginRight = '20px';
        element.style.flexShrink = '0';
        element.style.marginTop = '0px';
        element.style.width = 'auto';
        element.style.display = 'flex';
        element.style.alignItems = 'flex-start';
        element.style.height = 'auto';
      }
      
      if (element.classList.contains('header-text')) {
        element.style.textAlign = 'center';
        element.style.flexGrow = '1';
        element.style.width = 'calc(100% - 100px)';
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'flex-start';
        element.style.margin = '0 auto';
        element.style.paddingTop = '0px';
      }
      
      if (element.closest('.header-text')) {
        if (element.tagName === 'H4') {
          element.style.textAlign = 'center';
          element.style.margin = '0 0 8px 0';
          element.style.fontSize = '16px';
          element.style.fontWeight = 'bold';
          element.style.width = '100%';
          element.style.display = 'block';
          element.style.color = 'black';
        }
        
        if (element.tagName === 'P') {
          element.style.textAlign = 'center';
          element.style.margin = '0 0 4px 0';
          element.style.fontSize = '14px';
          element.style.width = '100%';
          element.style.display = 'block';
          element.style.color = 'black';
        }
      }

      // Logo image specific styles
      if (element.tagName === 'IMG' && element.closest('.header-logo-container')) {
        element.style.height = '40px';
        element.style.width = 'auto';
        element.style.display = 'block';
        element.style.margin = '0';
        element.style.padding = '0';
        element.style.filter = 'none';
        element.style.verticalAlign = 'top';
      }

      if (element.classList.contains('info-table')) {
        element.style.width = '100%';
        element.style.marginBottom = '25px';
        element.style.borderCollapse = 'collapse';
        element.style.tableLayout = 'fixed';
      }
      if (element.tagName === 'TD') {
        element.style.padding = '4px 0';
        element.style.verticalAlign = 'top';
        element.style.color = 'black';
        element.style.fontSize = '14px';
        element.style.lineHeight = '1.4';

        const cellIndex = Array.from(element.parentNode.children).indexOf(element);
        if (cellIndex === 0) element.style.width = '15%';
        else if (cellIndex === 1) element.style.width = '2%';
        else if (cellIndex === 2) element.style.width = '43%';
        else if (cellIndex === 3) {
          element.style.width = '40%';
          element.style.textAlign = 'right';
        }
      }
      if (element.classList.contains('divider')) {
        element.style.borderTopColor = '#000';
        element.style.borderTopWidth = '1px';
        element.style.borderTopStyle = 'solid';
        element.style.margin = '20px 0';
        element.style.width = '100%';
        element.style.height = '0';
        element.style.display = 'block';
      }
      if (element.classList.contains('subject-line')) {
        element.style.marginBottom = '25px';
        element.style.fontWeight = 'normal';
      }
      if (element.tagName === 'P' && !element.closest('.header-text')) {
        element.style.marginBottom = '18px';
        element.style.lineHeight = '1.6';
        element.style.textAlign = 'justify';
        element.style.color = 'black';
        element.style.fontSize = '14px';
        element.style.textJustify = 'inter-word';
        element.style.margin = '0 0 18px 0'; 
      }
      if (element.classList.contains('intern-details')) {
        element.style.margin = '20px 0';
        element.style.paddingLeft = '25px';
      }
      if (element.classList.contains('intern-details') && element.tagName === 'P') {
        element.style.margin = '8px 0';
        element.style.lineHeight = '1.5';
        element.style.fontSize = '14px';
      }
      if (element.classList.contains('signature-block')) {
        element.style.display = 'flex';
        element.style.justifyContent = 'space-between';
        element.style.marginTop = '50px';
        element.style.width = '100%';
        element.style.alignItems = 'flex-end';
        element.style.minHeight = '120px';
      }
      if (element.classList.contains('signature-line')) {
        element.style.borderTopColor = '#666';
        element.style.borderTopWidth = '1px';
        element.style.borderTopStyle = 'solid';
        element.style.width = '180px';
        element.style.textAlign = 'center';
        element.style.paddingTop = '8px';
        element.style.fontSize = '12px';
        element.style.marginTop = '60px';
        element.style.display = 'block';
      }
      if (element.tagName === 'H4' && !element.closest('.header-text')) {
        element.style.margin = '0 0 8px 0';
        element.style.textAlign = 'center';
        element.style.color = 'black';
        element.style.fontSize = '16px';
        element.style.fontWeight = 'bold';
      }
      if (element.tagName === 'STRONG') {
        element.style.fontWeight = 'bold';
        element.style.color = 'black';
      }
      if (element.classList.contains('letter-content')) {
        element.style.whiteSpace = 'pre-line'; 
      }
      if (element.tagName === 'IMG') {
        element.style.filter = 'none';
      }
    });

    tempContainer.appendChild(letterClone); 
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const canvas = await window.html2canvas(letterClone, {
      scale: 2.0, 
      useCORS: true,
      logging: false, 
      backgroundColor: "#ffffff",
      width: letterClone.offsetWidth,
      height: letterClone.offsetHeight, 
      windowWidth: letterClone.offsetWidth, 
      windowHeight: letterClone.offsetHeight, 
      scrollX: 0,
      scrollY: 0,
      allowTaint: false,
      foreignObjectRendering: false,
      removeContainer: false,
      onclone: (clonedDoc) => {
        const clonedElements = clonedDoc.querySelectorAll('*');
        clonedElements.forEach(el => {
          el.style.webkitPrintColorAdjust = 'exact';
          el.style.colorAdjust = 'exact';
        });
      }
    });

    document.body.removeChild(tempContainer); 

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new window.jspdf.jsPDF({ 
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true 
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgAspect = canvas.width / canvas.height;
    let imgWidth = pdfWidth;
    let imgHeight = pdfWidth / imgAspect;

    if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * imgAspect;
    }

    // Center the image on the PDF page
    const xOffset = (pdfWidth - imgWidth) / 2;
    const yOffset = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight, null, 'FAST');

    return pdf.output('blob');
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await generatePDFBlob();
      
      let nicValue = "";
      if (letter?.label22) {
        const nicMatch = letter.label22.match(/NIC:\s*(.+)/i);
        if (nicMatch && nicMatch[1]) nicValue = nicMatch[1].trim();
      }

      const fileName = nicValue
        ? `${nicValue}-Placement-Letter.pdf`
        : `placement-letter-${id || "preview"}.pdf`;

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification("PDF downloaded successfully!", "success");

    } catch (err) {
      console.error("Error generating PDF:", err);
      setError(err.message || "Failed to generate PDF. Please try again.");
      showNotification(err.message || "Failed to generate PDF. Please try again.", "error");
      const tempDivs = document.querySelectorAll('div[style*="top: -9999px"]');
      tempDivs.forEach(div => div.remove());
    }
  };

  const handleSaveToDatabase = async () => {
    setSavingToDatabase(true);
    showNotification("Saving PDF to database...", "info", 2000);
    
    try {
      // Check if user is authenticated before proceeding
      const token = getAuthToken();
      if (!token) {
        showNotification("Authentication required. Please login again.", "error");
        setTimeout(() => {
          // Redirect to login page
          navigate('/login');
        }, 2000);
        return;
      }

      const pdfBlob = await generatePDFBlob();
      
      let nicValue = "";
      if (letter?.label22) {
        const nicMatch = letter.label22.match(/NIC:\s*(.+)/i);
        if (nicMatch && nicMatch[1]) nicValue = nicMatch[1].trim();
      }

      const fileName = nicValue
        ? `${nicValue}-Placement-Letter.pdf`
        : `placement-letter-${id || "preview"}.pdf`;

      // Create FormData to send PDF file
      const formData = new FormData();
      formData.append('pdf', pdfBlob, fileName);
      formData.append('letterId', id || 'preview');
      formData.append('letterType', 'placement');
      formData.append('nicValue', nicValue);
      
      if (letter) {
        formData.append('letterData', JSON.stringify(letter));
      }

      // Make authenticated request
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/placementletters/save-pdf`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      showNotification("PDF saved to database successfully!", "success");

    } catch (err) {
      console.error("Error saving PDF to database:", err);
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        showNotification("Authentication expired. Please login again.", "error");
        setTimeout(() => {
          // Clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('accessToken');
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 403) {
        showNotification("Access denied. You don't have permission to perform this action.", "error");
      } else if (err.response?.status === 413) {
        showNotification("File too large. Please try again with a smaller file.", "error");
      } else if (err.response?.data?.message) {
        showNotification(`Error: ${err.response.data.message}`, "error");
      } else {
        showNotification("Failed to save PDF to database. Please try again.", "error");
      }
    } finally {
      setSavingToDatabase(false);
    }
  };

  const getLabel = (labelValue, fallback = "") => {
    if (!labelValue) return fallback;
    if (typeof labelValue === "string" && labelValue.includes(":")) {
      return labelValue.split(":").slice(1).join(":").trim();
    }
    return labelValue;
  };

  const getLabelPrefix = (labelValue, defaultPrefix = "") => {
    if (!labelValue) return defaultPrefix;
    if (typeof labelValue === "string" && labelValue.includes(":")) {
      return labelValue.split(":")[0].trim();
    }
    return defaultPrefix;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        {/* Notification Component */}
        <NotificationComponent darkMode={darkMode} />
      </Container>
    );
  }

  // Display error message if there's an error
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error}
          <Button variant="link" onClick={() => navigate("/generate-placement-letter")}>
            Back
          </Button>
        </Alert>
        {/* Notification Component */}
        <NotificationComponent darkMode={darkMode} />
      </Container>
    );
  }

  // Display a warning if no letter data is found
  if (!letter) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Letter data not found.</Alert>
        {/* Notification Component */}
        <NotificationComponent darkMode={darkMode} />
      </Container>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Notification Component */}
      <NotificationComponent darkMode={darkMode} />
      
      <style>
        {`
          .letter-paper {
            position: relative;
            background-color: ${darkMode ? "#2c2c2c" : "#ffffff"};
            color: ${darkMode ? "#e4e4e4" : "#000"};
            padding: 45px; 
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.6;
            min-height: auto;
            width: 210mm; 
            max-width: 210mm;
            margin: 0 auto; 
            box-shadow: ${darkMode ? "0 4px 12px rgba(0, 0, 0, 0.5)" : "0 4px 12px rgba(0, 0, 0, 0.15)"};
            border: ${darkMode ? "1px solid #444" : "1px solid #ddd"};
            transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
            overflow: visible; 
            page-break-inside: avoid; 
          }

          .memo-header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 25px;
            width: 100%;
            page-break-inside: avoid;
            justify-content: flex-start;
          }
          
          .header-logo-container {
            margin-right: 20px;
            flex-shrink: 0;
            margin-top: 0px;
            height: auto;
          }
          
          .header-text {
            text-align: center;
            flex-grow: 1;
            width: calc(100% - 100px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 0px;
          }
          
          .header-text h4, 
          .header-text p {
            text-align: center;
            width: 100%;
            margin-left: auto;
            margin-right: auto;
            font-size: 14px;
            line-height: 1.4;
            display: block;
          }
          
          .header-text h4 {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
          }

          .info-table {
            width: 100%;
            margin-bottom: 25px;
            color: inherit;
            border-collapse: collapse;
            table-layout: fixed; 
          }

          .info-table td {
            padding: 4px 0;
            vertical-align: top;
            color: inherit;
            font-size: 14px;
            line-height: 1.4;
          }

          .divider {
            border-top: 1px solid ${darkMode ? "#666" : "#000"};
            margin: 20px 0;
            width: 100%;
          }

          .subject-line {
            margin-bottom: 25px;
            font-weight: normal;
          }

          .subject-line strong {
            font-weight: bold;
            text-decoration: underline;
          }
          
          .signature-block {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            width: 100%;
            page-break-inside: avoid;
            min-height: 120px;
            align-items: flex-end;
          }
          
          .signature-line {
            border-top: 1px solid ${darkMode ? "#777" : "#666"};
            width: 180px;
            text-align: center;
            padding-top: 8px;
            font-size: 12px;
            margin-top: 60px;
          }

          .letter-content {
            white-space: pre-line; /* Preserves whitespace and line breaks from data */
          }

          .letter-content p {
            margin-bottom: 18px;
            line-height: 1.6;
            text-align: justify; /* Justify text for a formal look */
            text-justify: inter-word;
            font-size: 14px;
          }

          .intern-details {
            margin: 20px 0;
            padding-left: 25px;
            page-break-inside: avoid; /* Keep intern details together on one page */
          }

          .intern-details p {
            margin: 8px 0;
            line-height: 1.5;
            font-size: 14px;
          }

          .btn-dark-mode {
            background-color: ${darkMode ? "#444" : "#f8f9fa"};
            color: ${darkMode ? "#fff" : "#333"};
            border-color: ${darkMode ? "#666" : "#ccc"};
          }

          /* Center the letter container on the screen */
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
            
            /* Hide UI elements not meant for printing */
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
            
            /* Ensure letter paper fills the A4 page and overrides any screen-specific styles */
            .letter-paper {
              width: 210mm !important;
              min-height: 297mm !important; 
              max-width: none !important;
              padding: 25mm !important; 
              margin: 0 !important;
              box-shadow: none !important;
              background-color: white !important;
              color: black !important;
              border: none !important;
              overflow: visible !important;
              page-break-inside: avoid !important;
              page-break-after: always !important; 
            }
            
            /* General font and line height for print */
            .letter-content {
              font-family: 'Times New Roman', Times, serif !important;
              font-size: 12pt !important;
              line-height: 1.6 !important;
            }
            
            .letter-content p {
              margin-bottom: 18px !important;
              line-height: 1.6 !important;
            }
            
            .intern-details {
              margin: 20px 0 !important;
              padding-left: 25px !important;
            }
            
            .intern-details p {
              margin: 8px 0 !important;
            }
            
            .signature-block {
              margin-top: 50px !important;
              page-break-inside: avoid !important;
            }
            
            .signature-line {
              margin-top: 60px !important;
              width: 180px !important;
            }
            
            /* Reset dark mode specific borders/colors for printing */
            .divider {
              border-top-color: #000 !important;
            }

            .signature-line {
              border-top-color: #666 !important;
            }
            
            .memo-header {
              margin-top: 0 !important;
              margin-bottom: 25px !important;
            }
            
            .info-table {
              margin-bottom: 25px !important;
            }
            
            .subject-line {
              margin-bottom: 25px !important;
            }
            
            /* Ensure full page utilization and prevent unwanted margins/padding */
            html, body {
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
            }
            
            .container, .letter-container {
              max-width: none !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}
      </style>

      {/* Screen-only UI elements (buttons, header logo) */}
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
        <div className="d-flex justify-content-start gap-2 flex-wrap">
          <Button 
            variant={darkMode ? "outline-light" : "outline-secondary"} 
            className="mb-3" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          
          <Button 
            variant={darkMode ? "outline-light" : "outline-primary"} 
            className="mb-3" 
            onClick={handlePrint}
          >
            Print Placement Letter
          </Button>

          <Button 
            variant={darkMode ? "outline-light" : "outline-danger"} 
            className="mb-3" 
            onClick={handleDownloadPDF}
          >
            Download as PDF
          </Button>

          {/* Save to Database button */}
          <Button 
            variant={darkMode ? "outline-light" : "outline-success"} 
            className="mb-3" 
            onClick={handleSaveToDatabase}
            disabled={savingToDatabase}
          >
            {savingToDatabase ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Saving...
              </>
            ) : (
              "Save to Database"
            )}
          </Button>
        </div>
      </Container>

      {/* The letter content - optimized for both screen and PDF export */}
      <Container className="letter-container">
        <div className="letter-paper" ref={letterRef}>
          {/* Memo Header Section */}
          <div className="memo-header">
            {/* Logo on the left side */}
            <div className="header-logo-container">
              <img 
                src={logo}
                alt="Company Logo" 
                style={{ 
                  height: "40px",
                  width: "auto",
                  filter: darkMode ? "brightness(1.2) contrast(1.2)" : "none" 
                }} 
              />
            </div>
            
            {/* Header text in the center */}
            <div className="header-text">
              <h4 style={{ marginTop: "0", marginBottom: "8px" }}>{letter.letterName || "Placement Letter"}</h4>
              <p style={{ margin: "0 0 4px 0" }}>{letter.label1 || "Talent Development Section"}</p>
              <p style={{ margin: "0" }}>{letter.label2 || "7th Floor, Head Office, Lotus Road, Colombo 01"}</p>
            </div>
          </div>
          
          {/* Information Table */}
          <table className="info-table">
            <tbody>
              <tr>
                <td width="15%">{getLabelPrefix(letter.label3, "Our/My Ref")}</td>
                <td width="2%">:</td>
                <td width="43%">{getLabel(letter.label3, ".......................")}</td>
                <td width="40%" style={{ textAlign: "right" }}>{letter.label5 || "Telephone: 011-2021359"}</td>
              </tr>
              <tr>
                <td>{getLabelPrefix(letter.label4, "Your Ref")}</td>
                <td>:</td>
                <td>{getLabel(letter.label4, ".......................")}</td>
                <td style={{ textAlign: "right" }}>{letter.label6 || "Fax: 011-2478627"}</td>
              </tr>
              <tr>
                <td>{getLabelPrefix(letter.label8, "To")}</td>
                <td>:</td>
                <td>{getLabel(letter.label8, "[Manager Name]")}</td>
                <td style={{ textAlign: "right" }}>{letter.label7 || "Email: hiroshim@slt.com"}</td>
              </tr>
              <tr>
                <td>{getLabelPrefix(letter.label9, "From")}</td>
                <td>:</td>
                <td>{getLabel(letter.label9, "Engineer Talent Development")}</td>
                <td style={{ textAlign: "right" }}>{letter.label10 || new Date().toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="divider"></div>
          
          {/* Subject Line */}
          <div className="subject-line">
            <p><strong>{letter.label11 || "Subject - Assignment of Internship"}</strong></p>
          </div>
          
          {/* Main Letter Content */}
          <div className="letter-content">
            <p>{letter.label12} {letter.label13}</p>
            <p>{letter.label14}</p>
            <p>{letter.label15} {letter.label16}</p>
            <p>{letter.label17}</p>
            <p>{letter.label18} {letter.label19}</p>
            <p><strong>{letter.label20 || "Details of the Intern as follows:"}</strong></p>
            
            {/* Intern Details Section */}
            <div className="intern-details">
              <p>{letter.label21 || "Name: ..........."}</p>
              <p>{letter.label22 || "NIC: ..............."}</p>
              {letter.label23 && <p>{letter.label23}</p>}
            </div>
            
            <p>{letter.label24}</p>
          </div>
          
          {/* Signature Block */}
          <div className="signature-block">
            <div>
              <div className="signature-line">
                {letter.label26 || "Engineer/Talent Development"}
              </div>
            </div>
            <div>
              <div className="signature-line">
                {letter.label28 || "Signature"}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

// PropTypes for component props validation
ViewGeneratePlacementLetter.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  isPreview: PropTypes.bool
};

export default ViewGeneratePlacementLetter;