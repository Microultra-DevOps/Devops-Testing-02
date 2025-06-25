import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../../assets/logo.png";
import { Spinner, Alert, Button, Form } from "react-bootstrap";
import { FaUniversity } from "react-icons/fa";

const AddNewInstitute = ({ darkMode }) => {
  const [instituteData, setInstituteData] = useState({
    instituteName: "",
    instituteContactEmail: "",
    instituteContactNumber: "",
    department: "",
    instituteType: "",
    fullName: "",
    email: "",
    contactNumber: "",
    username: "",
    nameWithInitials: "",
    password: "",
    nic: "",
    userType: "institute",
  });

  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/institutes`);
        setInstitutes(response.data.institutes || []);
      } catch (error) {
        console.error("Error fetching institutes:", error);
      }
    };
    fetchInstitutes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInstituteData({ ...instituteData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/register`, instituteData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess("Institute added successfully!");
      setInstituteData({
        instituteName: "",
        instituteContactEmail: "",
        instituteContactNumber: "",
        department: "",
        instituteType: "",
        fullName: "",
        email: "",
        contactNumber: "",
        username: "",
        nameWithInitials: "",
        password: "",
        nic: "",
        userType: "institute",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error adding institute. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD INSTITUTE</h3>
      </div>

      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaUniversity className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
            <h5 className="mb-0">Institute Information</h5>
          </div>

          <p>Fill in the details to add a new institute:</p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          {loading && <Spinner animation="border" variant={darkMode ? "light" : "dark"} />}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username" className="mb-4">
              <Form.Label><strong>Username:</strong></Form.Label>
              <Form.Control type="text" name="username" value={instituteData.username} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            <Form.Group controlId="fullName" className="mb-4">
              <Form.Label><strong>Contact Person Full Name:</strong></Form.Label>
              <Form.Control type="text" name="fullName" value={instituteData.fullName} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            <Form.Group controlId="nameWithInitials" className="mb-4">
              <Form.Label><strong>Contact Person Name with Initials:</strong></Form.Label>
              <Form.Control type="text" name="nameWithInitials" value={instituteData.nameWithInitials} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            <Form.Group controlId="email" className="mb-4">
              <Form.Label><strong>Contact Person Email:</strong></Form.Label>
              <Form.Control type="email" name="email" value={instituteData.email} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            <Form.Group controlId="contactNumber" className="mb-4">
              <Form.Label><strong>Contact Person Number:</strong></Form.Label>
              <Form.Control type="text" name="contactNumber" value={instituteData.contactNumber} onChange={handleChange} required  className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            <Form.Group controlId="nic" className="mb-4">
              <Form.Label><strong>Contact Person NIC:</strong></Form.Label>
              <Form.Control type="text" name="nic" value={instituteData.nic} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            <Form.Group controlId="instituteName" className="mb-4">
              <Form.Label><strong>Institute:</strong></Form.Label>
              <Form.Control as="select" name="instituteName" value={instituteData.instituteName} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}>
                <option value="">Select Institute</option>
                {institutes.map((institute, index) => (
                  <option key={institute.id || index} value={institute.name}>
                    {institute.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="instituteContactEmail" className="mb-4">
              <Form.Label><strong>Institute Contact Email:</strong></Form.Label>
              <Form.Control type="email" name="instituteContactEmail" value={instituteData.instituteContactEmail} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            <Form.Group controlId="instituteContactNumber" className="mb-4">
              <Form.Label><strong>Institute Contact Number:</strong></Form.Label>
              <Form.Control type="text" name="instituteContactNumber" value={instituteData.instituteContactNumber} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            <Form.Group controlId="department" className="mb-4">
              <Form.Label><strong>Department:</strong></Form.Label>
              <Form.Control type="text" name="department" value={instituteData.department} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            <Form.Group controlId="instituteType" className="mb-4">
              <Form.Label><strong>Institute Type:</strong></Form.Label>
              <Form.Control as="select" name="instituteType" value={instituteData.instituteType} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}>
                <option value="">Select Institute Type</option>
                <option value="Government University">Government University</option>
                <option value="Private University">Private University</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="password" className="mb-4">
              <Form.Label><strong>Password:</strong></Form.Label>
              <Form.Control type="password" name="password" value={instituteData.password} onChange={handleChange} required className={darkMode ? "bg-secondary text-white" : ""}/>
            </Form.Group>

            {/* Buttons Container */}
            <div className="d-flex justify-content-between mt-4">
              <Button variant="danger" onClick={handleBack}>Go Back</Button>
              <Button variant="primary" type="submit">Add Institute</Button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default AddNewInstitute;