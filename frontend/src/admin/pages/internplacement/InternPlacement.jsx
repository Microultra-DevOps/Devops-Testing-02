import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from "react-icons/fa";
import logo from "../../../assets/logo.png";

const InternPlacement = ({ darkMode }) => {
  const navigate = useNavigate();
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const itemsPerPage = 20;

  // Dummy data
  const dummyPlacements = [
    {
      _id: "1",
      internName: "John Doe",
      nic: "987654321V",
      managerName: "Jane Smith",
      schemeName: "Summer Internship 2023",
      startDate: "2023-06-01",
      endDate: "2023-08-31",
      period: "3"
    },
    {
      _id: "2",
      internName: "Alice Johnson",
      nic: "123456789V",
      managerName: "Bob Brown",
      schemeName: "Engineering Trainee",
      startDate: "2023-05-15",
      endDate: "2023-11-15",
      period: "6"
    },
    {
      _id: "3",
      internName: "Michael Chen",
      nic: "456789123V",
      managerName: "Sarah Wilson",
      schemeName: "Tech Graduate Program",
      startDate: "2023-01-10",
      endDate: "2023-07-10",
      period: "6"
    },
    {
      _id: "4",
      internName: "Emily Davis",
      nic: "789123456V",
      managerName: "David Miller",
      schemeName: "Marketing Internship",
      startDate: "2023-03-01",
      endDate: "2023-09-01",
      period: "6"
    },
    {
      _id: "5",
      internName: "Robert Wilson",
      nic: "321654987V",
      managerName: "Lisa Taylor",
      schemeName: "Finance Trainee",
      startDate: "2023-02-15",
      endDate: "2023-08-15",
      period: "6"
    }
  ];

  // Simulate API call with timeout
  const fetchPlacements = () => {
    setTimeout(() => {
      setPlacements(dummyPlacements);
      setLoading(false);
    }, 1000); // 1 second delay to simulate network request
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  // Filter placements based on Intern Name or NIC
  const filteredPlacements = placements.filter((placement) =>
    placement.internName?.toLowerCase().includes(filter.toLowerCase()) ||
    placement.nic?.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPlacements.length / itemsPerPage);
  const indexOfLastPlacement = currentPage * itemsPerPage;
  const indexOfFirstPlacement = indexOfLastPlacement - itemsPerPage;
  const currentPlacements = filteredPlacements.slice(
    indexOfFirstPlacement,
    indexOfLastPlacement
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
          alt="Company Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">INTERN PLACEMENT MANAGEMENT</h3>
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
          <FaCalendarCheck
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          All Placements
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Filter Section */}
        <div className="d-flex flex-wrap justify-content-between mb-3">
          <Form.Group
            className="mb-0"
            style={{ maxWidth: "300px", flex: "1 1 100%" }}
          >
            <Form.Control
              type="text"
              placeholder="Filter by Intern Name or NIC"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            />
          </Form.Group>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading details...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Table
            striped
            bordered
            hover
            variant={darkMode ? "dark" : "light"}
            responsive
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Intern Name</th>
                <th>NIC</th>
                <th>Manager Name</th>
                <th>Scheme Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration (Months)</th>
                <th>View CV</th>
              </tr>
            </thead>
            <tbody>
              {currentPlacements.length > 0 ? (
                currentPlacements.map((placement, index) => (
                  <tr key={placement._id}>
                    <td>{indexOfFirstPlacement + index + 1}</td>
                    <td>{placement.internName || "N/A"}</td>
                    <td>{placement.nic || "N/A"}</td>
                    <td>{placement.managerName || "N/A"}</td>
                    <td>{placement.schemeName || "N/A"}</td>
                    <td>{formatDate(placement.startDate)}</td>
                    <td>{formatDate(placement.endDate)}</td>
                    <td>{placement.period || "N/A"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/view-cv/${placement._id}`)}
                        className="fw-semibold"
                      >
                        View 
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No Placement Details found
                  </td>
                </tr>
              )}
            </tbody>

            {/* Pagination Footer */}
            <tfoot>
              <tr>
                <td colSpan={9} style={{ padding: "5px", fontSize: "14px" }}>
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ minHeight: "30px" }}
                  >
                    <div className="flex-grow-1 text-center">
                      {currentPlacements.length} of {filteredPlacements.length}{" "}
                      Placement Details(s) shown
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        style={{
                          color: darkMode ? "white" : "black",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        <FaChevronLeft />
                        <FaChevronLeft />
                      </Button>
                      <span className="mx-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        style={{
                          color: darkMode ? "white" : "black",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        <FaChevronRight />
                        <FaChevronRight />
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </Table>
        )}
      </Container>
    </div>
  );
};

export default InternPlacement;