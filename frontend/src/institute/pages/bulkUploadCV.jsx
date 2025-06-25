import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx"; 
import { Button, Container, Alert, Form } from "react-bootstrap";
import { FaPenFancy} from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import logo from "../../assets/logo.png";


const BulkCVUpload = ({ darkMode }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const navigate = useNavigate();

  const validateExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = "Sheet1";
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          reject(`The sheet "${sheetName}" does not exist in the Excel file.`);
          return;
        }

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers = rows[0].map((header) => header.trim());

        const requiredColumns = [
          "Full Name",
          "Name with Initials",
          "Gender",
          "Postal Address",
          "District",
          "Birthday",
          "NIC",
          "Mobile Number",
          "Email",
          "Institute",
        ];

        const missingColumns = requiredColumns.filter(
          (col) => !headers.includes(col)
        );

        if (missingColumns.length > 0) {
          reject(
            `The Excel file is missing the following required columns: ${missingColumns.join(", ")}`
          );
        }

        const dataRows = rows.slice(1);
        const nonEmptyRows = dataRows.filter((row) =>
          row.some((cell) => cell !== null && cell !== "" && cell !== undefined)
        );

        if (nonEmptyRows.length === 0) {
          reject("The Excel file does not contain any valid data rows.");
        }

        resolve();
      };
      reader.onerror = () => reject("Error reading the file.");
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      await validateExcelFile(file);

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated. Please log in.");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/cvs/bulk-upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors && response.data.errors.length > 0) {
        setUploadErrors(response.data.errors);
        setError("Some CVs could not be uploaded. See details below.");
        setSuccess(null);
      } else {
        setSuccess("File uploaded successfully!");
        setError(null);
        setUploadErrors([]);
      }
    } catch (err) {
      setError(
        err.message ||
          "Error uploading file. Please check the file format and try again."
      );
      setSuccess(null);
      console.error("Upload error:", err);
    }
  };

  return (
    
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
      
    >
      <Container className="text-center mt-4 mb-3">
        <img
          src={logo}
          alt="SLT Mobitel Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">Bulk CV Upload</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <h5 className="mb-3">
          <FaPenFancy
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          Bulk CV Upload
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Download Templates */}
        <div className="mb-4">
  <h5>Download Templates:</h5>
  <div className="d-flex flex-wrap gap-3"> 
    <Button
      variant="primary"
      href="/templates/Data_Entry_Operator_Template.xlsx"
      download="Data_Entry_Operator_Template.xlsx"
    >
      Download Data Entry Operator Template
    </Button>
    <Button
      variant="success"
      href="/templates/Internship_Template.xlsx"
      download
    >
      Download Internship Template
    </Button>
  </div>
</div>

        {/* Upload Section */}
        <Form onSubmit={handleFileUpload}>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>
              Upload Excel File <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <Form.Text className="text-muted">
              Please upload an Excel file in the provided template format.
            </Form.Text>
          </Form.Group>

          <Button
            variant={darkMode ? "light" : "primary"}
            type="submit"
            className="w-100"
          >
            <FiUpload className="me-2" />
            Upload
          </Button>
        </Form>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mt-3">
            {success}
          </Alert>
        )}
        {uploadErrors.length > 0 && (
          <div className="mt-3">
            <h5>Upload Errors:</h5>
            {uploadErrors.map((err, idx) => (
              <Alert variant="warning" key={idx}>
                {err}
              </Alert>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default BulkCVUpload; 
