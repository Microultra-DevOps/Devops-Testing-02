import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import logo from "../../../assets/logo.png";

const StaffHelp = ({ darkMode }) => {
  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">HELP AND SUPPORT</h3>
      </Container>

      {/* Main Content */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          {/* Support Details Section */}
          <Col md={12}>
            <h4>Support Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Card.Text><strong>Internship Management System Information:</strong></Card.Text>
                <p>Company Name: SLT Mobitel</p>
                <p>Internship Program: Talent Development Program </p>
                <p>Program Coordinator: John Doe</p>
                <p>Email: support@sltmobitel.lk</p>

                <Card.Text><strong>System Support:</strong></Card.Text>
                <p>Platform Version: 1.2.3</p>
                <p>Last Update: 2024-07-01</p>
                <p>System Status: Operational</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <hr />

        {/* Contact Us Section */}
        <div>
          <h4>Contact Us</h4>
          <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
            <Card.Body>
              <Card.Text><strong>Chat with IT Support</strong></Card.Text>
              <p>Need help? Get real-time assistance from our support team.</p>
              <a
                href="https://wa.me/94710755777?text=Hello%20SLT%20Mobitel%20Support,%20I%20need%20assistance."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button style={{ backgroundColor: darkMode ? "blue" : "green", border: "none" }}>
                  Chat Now
                </Button>
              </a>
            </Card.Body>
          </Card>

          <Card className={`mt-3 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
            <Card.Body>
              <Card.Text><strong>Call SLT Mobitel Support</strong></Card.Text>
              <p>For assistance, contact our IT support team at:</p>
              <p><strong>Phone:</strong> +94 112 345 678</p>
              <p><strong>Email:</strong> it-support@sltmobitel.lk</p>
              <p>Support Hours: Monday to Friday, 9 AM - 5 PM</p>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default StaffHelp;
