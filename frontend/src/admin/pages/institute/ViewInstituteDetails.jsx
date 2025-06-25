import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import logo from "../../../assets/logo.png";
import { Spinner, Alert, Button, Form } from "react-bootstrap";
import { FaUniversity } from "react-icons/fa";

const ViewInstituteDetails = ({ darkMode }) => {
  const { id } = useParams();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstituteDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/universities/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setInstitute(data);
      } catch (err) {
        setError("Error fetching institute details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstituteDetails();
  }, [id]);

  if (loading) 
    return (
      <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"} align-items-center justify-content-center`}>
        <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
        <p className="mt-2">Loading institute details...</p>
      </div>
    );

  if (error) 
    return <Alert variant="danger" className="text-center">{error}</Alert>;
  
  if (!institute) 
    return <Alert variant="warning" className="text-center">No institute found</Alert>;

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">INSTITUTE DETAILS</h3>
      </div>

      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaUniversity className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
            <h5 className="mb-0">{institute.instituteName}</h5>
          </div>

          <p>Here are the details for the selected institute:</p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          <Form>
            <Form.Group controlId="contactEmail" className="mb-4">
              <Form.Label><strong>Institute Contact Email:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="email" 
                readOnly 
                value={institute.instituteContactEmail || "N/A"} 
              />
            </Form.Group>

            <Form.Group controlId="contactNumber" className="mb-4">
              <Form.Label><strong>Institute Contact Number:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                readOnly 
                value={institute.instituteContactNumber || "N/A"} 
              />
            </Form.Group>

            <Form.Group controlId="department" className="mb-4">
              <Form.Label><strong>Department:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                readOnly 
                value={institute.department || "N/A"} 
              />
            </Form.Group>

            <Form.Group controlId="instituteType" className="mb-4">
              <Form.Label><strong>Institute Type:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""} 
                type="text" 
                readOnly 
                value={institute.instituteType || "N/A"} 
              />
            </Form.Group>

            <Form.Group controlId="contactPerson" className="mb-4">
              <Form.Label><strong>Contact Person Name:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                readOnly 
                value={institute.fullName || "N/A"} 
              />
            </Form.Group>

            <Form.Group controlId="contactPersonEmail" className="mb-4">
              <Form.Label><strong>Contact Person Email:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                readOnly 
                value={institute.email || "N/A"} 
              />
            </Form.Group>

            <Form.Group controlId="contactPersonNumber" className="mb-4">
              <Form.Label><strong>Contact Person Number:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                readOnly 
                value={institute.contactNumber || "N/A"} 
              />
            </Form.Group>
          </Form>

          <Button variant="danger" className="mt-3" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </main>
    </div>
  );
};

export default ViewInstituteDetails;