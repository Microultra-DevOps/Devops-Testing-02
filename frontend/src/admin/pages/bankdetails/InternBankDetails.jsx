import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Spinner, Alert, Form, InputGroup } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaMoneyBillWave } from "react-icons/fa";
import axios from "axios";
import logo from "../../../assets/logo.png";
import ConfirmDeleteModal from "../../../components/notifications/ConfirmDeleteModal";

const InternBankDetails = ({ darkMode }) => {
  const navigate = useNavigate();
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bankDetailsToDelete, setBankDetailsToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const itemsPerPage = 20;

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/bankDetails`);
      setBankDetails(response.data);
    } catch (error) {
      console.error("Error fetching bank details:", error);
      setError("Failed to load bank details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const confirmDelete = (id) => {
    setBankDetailsToDelete(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBankDetailsToDelete(null);
  };

  const handleDelete = async () => {
    if (!bankDetailsToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/bankDetails/id/${bankDetailsToDelete}`);

      setBankDetails(bankDetails.filter((bd) => bd._id !== bankDetailsToDelete));
      setShowDeleteModal(false);
      setBankDetailsToDelete(null);
    } catch (error) {
      console.error("Error deleting bank details:", error);
      setError("Failed to delete bank details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to format account number as XXXX XXXX XXXX XXXX
  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return "N/A";
    
    // Remove any existing spaces
    const cleaned = accountNumber.replace(/\s/g, '');
    
    // Add space every 4 characters
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const filteredBankDetails = bankDetails.filter((bankDetail) => {
    if (!filter) return true;
    
    const searchTerm = filter.toLowerCase();
    
    // Search across all three fields
    return (
      bankDetail.accountHolderName?.toLowerCase().includes(searchTerm) ||
      bankDetail.internId?.toLowerCase().includes(searchTerm) ||
      bankDetail.nic?.toLowerCase().includes(searchTerm)
    );
  });

  const totalPages = Math.ceil(filteredBankDetails.length / itemsPerPage);
  const indexOfLastBankDetail = currentPage * itemsPerPage;
  const indexOfFirstBankDetail = indexOfLastBankDetail - itemsPerPage;
  const currentBankDetails = filteredBankDetails.slice(
    indexOfFirstBankDetail,
    indexOfLastBankDetail
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img 
          src={logo} 
          alt="SLT Mobitel Logo" 
          className="mx-auto d-block" 
          style={{ height: "50px" }} 
        />
        <h3 className="mt-3">VIEW ALL BANK DETAILS</h3>
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
          <FaMoneyBillWave className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
          All Bank Details
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        <div className="d-flex flex-wrap justify-content-between mb-3">
          <Form.Group style={{ maxWidth: "400px", flex: "1 1 100%" }}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by Name, Intern ID or NIC..."
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={darkMode ? "bg-dark text-white border-secondary" : ""}
                style={darkMode ? { color: "white" } : {}}
              />
            </InputGroup>
          </Form.Group>

          <div className="d-flex flex-wrap justify-content-end align-items-center mt-2 mt-sm-0">
            <Button 
              variant="primary" 
              onClick={() => navigate("/add-bank-details")} 
              className="mx-0 mb-2 mb-sm-0"
            >
              Add New Bank Details
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading bank details...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>NIC</th>
                  <th>Intern ID</th>
                  <th>Account Holder Name</th>
                  <th>Bank Name</th>
                  <th>Branch</th>
                  <th>Account Number</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentBankDetails.length > 0 ? (
                  currentBankDetails.map((bankDetail, index) => (
                    <tr key={bankDetail._id}>
                      <td>{indexOfFirstBankDetail + index + 1}</td>
                      <td>{bankDetail.nic || "N/A"}</td>
                      <td>{bankDetail.internId || "N/A"}</td>
                      <td>{bankDetail.accountHolderName || "N/A"}</td>
                      <td>{bankDetail.bankName || "N/A"}</td>
                      <td>{bankDetail.branch || "N/A"}</td>
                      <td>{formatAccountNumber(bankDetail.accountNumber)}</td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          onClick={() => navigate(`/edit-bank-details/${bankDetail._id}`)} 
                          className="fw-semibold"
                        >
                          Edit
                        </Button>
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-danger" 
                          onClick={() => confirmDelete(bankDetail._id)} 
                          className="fw-semibold"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">No Bank Details found</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={9} style={{ padding: "5px", fontSize: "14px" }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                      <div className="flex-grow-1 text-center">
                        {currentBankDetails.length} of {filteredBankDetails.length} Bank Detail(s) shown
                      </div>
                      <div className="d-flex align-items-center">
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => handlePageChange(currentPage - 1)} 
                          disabled={currentPage === 1} 
                          style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
                        >
                          <FaChevronLeft />
                          <FaChevronLeft />
                        </Button>
                        <span className="mx-2">Page {currentPage} of {totalPages}</span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => handlePageChange(currentPage + 1)} 
                          disabled={currentPage === totalPages} 
                          style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
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
          </>
        )}
      </Container>

      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={handleDelete}
        refNo={
          bankDetails.find((bd) => bd._id === bankDetailsToDelete)?.accountHolderName || "N/A"
        }
        darkMode={darkMode}
      />
    </div>
  );
};

export default InternBankDetails;