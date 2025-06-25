import React, { useState } from "react";
import axios from "axios";
import logo from "../../../assets/logo.png";
import { Spinner, Alert, Button, Form, Card } from "react-bootstrap";
import { FaUser, FaUpload } from "react-icons/fa";

const AddEmployee = ({ darkMode }) => {
  const [employee, setEmployee] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    department: '',
    job_title: '',
    hierarchy_level: '',
    division_code: '',
    cost_center: '',
    grade_level: '',
    joining_date: ''
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/employees/add`, employee);
      setSuccess('Employee added successfully!');
      setEmployee({
        employee_code: '',
        full_name: '',
        email: '',
        department: '',
        job_title: '',
        hierarchy_level: '',
        division_code: '',
        cost_center: '',
        grade_level: '',
        joining_date: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an Excel file first.');
      return;
    }

    setUploadLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/employees/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setSuccess('Employees uploaded successfully!');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading file. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD EMPLOYEE</h3>
      </div>

      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        
        {/* Manual Employee Addition Section */}
        <div className={`p-4 rounded mb-4 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaUser className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
            <h5 className="mb-0">Add New Employee Manually</h5>
          </div>

          <p>Fill in the details to add a new employee:</p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          {loading && <Spinner animation="border" variant={darkMode ? "light" : "dark"} />}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <div className="row">
              {Object.keys(employee).map((key) => (
                <div className="col-md-6 mb-4" key={key}>
                  <Form.Group controlId={key}>
                    <Form.Label><strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong></Form.Label>
                    <Form.Control
                      type={key.includes('date') ? 'date' : key === 'email' ? 'email' : 'text'}
                      name={key}
                      value={employee[key]}
                      onChange={handleChange}
                      required
                      placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                      className={darkMode ? "bg-secondary text-white" : ""}
                    />
                  </Form.Group>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="danger" onClick={handleBack}>Go Back</Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Employee'}
              </Button>
            </div>
          </Form>
        </div>

        {/* Excel Upload Section */}
        <div className={`p-4 rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaUpload className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
            <h5 className="mb-0">Upload Employees from Excel</h5>
          </div>

          <p>Upload multiple employees at once using an Excel file:</p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          {uploadLoading && <Spinner animation="border" variant={darkMode ? "light" : "dark"} />}

          <Form onSubmit={handleUpload}>
            <Form.Group controlId="file" className="mb-4">
              <Form.Label><strong>Select Excel File:</strong></Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className={darkMode ? "bg-secondary text-white" : ""}
              />
              {file && (
                <small className={`mt-2 d-block ${darkMode ? "text-light" : "text-muted"}`}>
                  Selected file: <strong>{file.name}</strong>
                </small>
              )}
            </Form.Group>

            <div className="d-flex flex-column flex-md-row gap-3 mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={uploadLoading}
                className="flex-grow-1"
              >
                {uploadLoading ? 'Uploading...' : 'Upload File'}
              </Button>
              <Button
                variant="outline-secondary"
                as="a"
                href="/templates/excel_template.xlsx"
                download
                className="flex-grow-1 text-center"
              >
                Download Template
              </Button>
            </div>
          </Form>
        </div>

      </main>
    </div>
  );
};

export default AddEmployee;