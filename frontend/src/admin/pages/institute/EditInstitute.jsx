import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import { Spinner, Alert, Button, Form } from "react-bootstrap";
import { FaUniversity } from "react-icons/fa";

const EditInstitute = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchInstituteDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/universities/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setInstitute(data);
        setFormData(data);
      } catch (err) {
        setError("Error fetching institute details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstituteDetails();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/api/universities/${id}`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
      });
      setInstitute(formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating institute details", err);
      setError("Failed to update institute details.");
    }
  };

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
        <h3 className="mt-3">{isEditing ? "EDIT INSTITUTE DETAILS" : "INSTITUTE DETAILS"}</h3>
      </div>

      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaUniversity className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
            <h5 className="mb-0">{formData.instituteName}</h5>
          </div>

          <p>{isEditing ? "Edit the details below:" : "Here are the details for the selected institute:"}</p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          <Form>
            <Form.Group controlId="instituteName" className="mb-4">
              <Form.Label><strong>Institute Name:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                name="instituteName"
                value={formData.instituteName || ""}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="contactEmail" className="mb-4">
              <Form.Label><strong>Institute Contact Email:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="email" 
                name="instituteContactEmail"
                value={formData.instituteContactEmail || ""}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="contactNumber" className="mb-4">
              <Form.Label><strong>Institute Contact Number:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                name="instituteContactNumber"
                value={formData.instituteContactNumber || ""}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="department" className="mb-4">
              <Form.Label><strong>Department:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                name="department"
                value={formData.department || ""}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="instituteType" className="mb-4">
              <Form.Label><strong>Institute Type:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""} 
                type="text" 
                name="instituteType"
                value={formData.instituteType || ""}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="contactPerson" className="mb-4">
              <Form.Label><strong>Contact Person Name:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                name="fullName"
                value={formData.fullName || ""}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="contactPersonNumber" className="mb-4">
              <Form.Label><strong>Contact Person Number:</strong></Form.Label>
              <Form.Control 
                className={darkMode ? "bg-secondary text-white" : ""}
                type="text" 
                name="contactNumber"
                value={formData.contactNumber || ""}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="danger" onClick={() => navigate(-1)}>Go Back</Button>
            {isEditing ? (
              <div className="d-flex gap-3">
                <Button variant="success" onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="primary" onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditInstitute;
