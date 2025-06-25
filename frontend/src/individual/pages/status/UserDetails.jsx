/* import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { CgFile, CgUser } from "react-icons/cg";
import { FaUser } from "react-icons/fa";

const UserDetails = ({ userData, darkMode }) => {
  if (!userData) return null;

  const getRingStyle = (status) => {
    const lowerStatus = status?.toLowerCase();
    const styles = {
      pending: { borderColor: "orange", color: "orange" },
      approved: { borderColor: "blue", color: "blue" },
      assigned: { borderColor: "green", color: "green" },
      rejected: { borderColor: "red", color: "red" }, 
      default: { borderColor: "gray", color: "gray" },
    };
    return styles[lowerStatus] || styles.default;
  };

  const ringStyle = getRingStyle(userData.cvStatus);
  
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (userData.cvStatus?.toLowerCase() === "pending") {
      setIsBlinking(true);
      const interval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500); // Change blinking speed (500ms = half a second)

      return () => clearInterval(interval);
    } else {
      setIsBlinking(false);
    }
  }, [userData.cvStatus]);

  return (
    <div className={`p-4 rounded ${darkMode ? "bg-secondary text-white" : "bg-light text-dark"}`}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <FaUser className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
        <h5 className="mb-0">{userData.fullName || "N/A"}</h5>
      </div>

      <hr className={darkMode ? "border-light" : "border-dark"} />

      <p>User status report based on the entered NIC:</p>


      <Form style={{ backgroundColor: darkMode ? "black" : "white", borderColor: darkMode ? "gray" : "lightgray", borderWidth: '1px', borderStyle: 'solid' }}>

        <div className="d-flex align-items-center gap-2 mb-4 mx-3 mt-3">
          <CgUser className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
          <h5 className="mb-0">User CV Details</h5>
        </div>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        <div className="text-center my-4">
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "16px",
              textTransform: "capitalize",
              border: `8px solid ${ringStyle.borderColor}`,
              color: ringStyle.color,
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
              margin: "auto",
              opacity: isBlinking ? 0.5 : 1,
              transition: "opacity 0.5s ease",
            }}
          >
            <span>{userData.cvStatus || "N/A"}</span>
          </div>
        </div>

        <Form.Group controlId="nicNumber" className="mb-4 mx-3">
          <Form.Label><strong>NIC Number:</strong></Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={userData.nic || "N/A"}
            style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
          />
        </Form.Group>

        <Form.Group controlId="refNo" className="mb-4 mx-3">
          <Form.Label><strong>Reference Number:</strong></Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={userData.refNo || "N/A"}
            style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
          />
        </Form.Group>

        <Form.Group controlId="emailAddress" className="mb-4 mx-3">
          <Form.Label><strong>Email:</strong></Form.Label>
          <Form.Control
            type="email"
            readOnly
            value={userData.emailAddress || "N/A"}
            style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
          />
        </Form.Group>

        <Form.Group controlId="mobileNumber" className="mb-4 mx-3">
          <Form.Label><strong>Contact Number:</strong></Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={userData.mobileNumber || "N/A"}
            style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
          />
        </Form.Group>

        <Form.Group controlId="selectedRole" className="mb-4 mx-3">
          <Form.Label><strong>Intern Type:</strong></Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={userData.selectedRole || "N/A"}
            style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
          />
        </Form.Group>
        
        <Form.Group controlId="institute" className="mb-4 mx-3">
          <Form.Label><strong>Institute:</strong></Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={userData.institute || "N/A"}
            style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
          />
        </Form.Group>
      </Form>

      {userData.cvStatus?.toLowerCase() === "assigned" && (
        <Form style={{ backgroundColor: darkMode ? "black" : "white", borderColor: darkMode ? "gray" : "lightgray", borderWidth: '1px', borderStyle: 'solid', marginTop: '10px' }}>

          <div className="d-flex align-items-center gap-2 mb-4 mx-3 mt-3">
            <CgFile className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
            <h5 className="mb-0">Intern Placements Details</h5>
          </div>

          <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />


          <Form.Group controlId="internId " className="mb-4 mx-3">
            <Form.Label><strong>Intern ID:</strong></Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={userData.internId || "N/A"}
              style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
            />
          </Form.Group>

          <Form.Group controlId="currentPlacement" className="mb-4 mx-3">
            <Form.Label><strong>Current Placement:</strong></Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={userData.currentPlacement || "N/A"}
              style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
            />
          </Form.Group>

          <Form.Group controlId="supervisorName" className="mb-4 mx-3">
            <Form.Label><strong>Supervisor Name:</strong></Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={userData.supervisorName || "N/A"}
              style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
            />
          </Form.Group>

          <Form.Group controlId="supervisorDesignation" className="mb-4 mx-3">
            <Form.Label><strong>Supervisor Designation:</strong></Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={userData.supervisorDesignation || "N/A"}
              style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
            />
          </Form.Group>

          <Form.Group controlId="supervisorOrganization" className="mb-4 mx-3">
            <Form.Label><strong>Supervisor Organization:</strong></Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={userData.supervisorOrganization || "N/A"}
              style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
            />
          </Form.Group>
          
          <Form.Group controlId="supervisorServiceNumber" className="mb-4 mx-3">
            <Form.Label><strong>Supervisor Service Number:</strong></Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={userData.supervisorServiceNumber || "N/A"}
              style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
            />
          </Form.Group>

          <Form.Group controlId="startDate" className="mb-4 mx-3">
            <Form.Label><strong>Start Date:</strong></Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={userData.startDate || "N/A"}
              style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
            />
          </Form.Group>

          <Form.Group controlId="endDate" className="mb-4 mx-3">
            <Form.Label><strong>End Date:</strong></Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={userData.endDate || "N/A"}
              style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
            />
          </Form.Group>

          <Form.Group controlId="acceptanceLetterDate" className="mb-4 mx-3">
            <Form.Label><strong>Acceptance Letter Date:</strong></Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={userData.acceptanceLetterDate || "N/A"}
              style={{ backgroundColor: darkMode ? "#343a40" : "white", color: darkMode ? "white" : "black" }}
            />
          </Form.Group>
        </Form>
      )}

      <Button variant="danger" className="mt-3" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </div>
  );
};

export default UserDetails; */
