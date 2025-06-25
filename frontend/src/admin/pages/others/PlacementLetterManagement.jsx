import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form, Badge } from "react-bootstrap";
import { FaFilePdf, FaChevronLeft, FaChevronRight, FaEye, FaDownload, FaSearch } from 'react-icons/fa';
import DeleteModal from "../../../components/notifications/DeleteModal"; 
import logo from "../../../assets/logo.png";

const PlacementLetterManagement = ({ darkMode }) => {
  const [placementLetters, setPlacementLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [nicSearch, setNicSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlacementLetters();
  }, [currentPage]);

  const fetchPlacementLetters = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/placementletters?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        // Non-paginated response
        setPlacementLetters(data);
        setTotalPages(1);
        setTotalItems(data.length);
      } else {
        // Paginated response
        setPlacementLetters(data.docs || []);
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalDocs || 0);
      }
    } catch (error) {
      setError("Failed to fetch placement letters.");
      console.error("Error fetching placement letters:", error.message);
      console.error("Full error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (letterId) => {
    try {
      // Open PDF in new tab
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/placementletters/${letterId}/download`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: 'blob'
        }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL object
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error viewing PDF:", error.message);
      alert("Failed to view PDF file.");
    }
  };

  const handleDownload = async (letterId, fileName) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/placementletters/${letterId}/download`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: 'blob'
        }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error.message);
      alert("Failed to download PDF file.");
    }
  };

  const handleDeleteClick = (letter) => {
    setSelectedLetter(letter);
    setShowDeleteModal(true); 
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLetter) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/placementletters/${selectedLetter.letterId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      // Refresh the list after deletion
      fetchPlacementLetters();
      setShowDeleteModal(false);
      setSelectedLetter(null);
    } catch (error) {
      console.error("Error deleting placement letter:", error.message);
      alert("Failed to delete placement letter.");
    }
  };

  const handleSearchByNIC = async () => {
    if (!nicSearch.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/placementletters/search?nic=${nicSearch}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setPlacementLetters(data || []);
      setTotalItems(data.length || 0);
      setCurrentPage(1);
      setTotalPages(1);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPlacementLetters([]);
        setTotalItems(0);
        setError("No placement letters found for this NIC.");
      } else {
        setError("Failed to search placement letters.");
        console.error("Error searching placement letters:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setNicSearch("");
    setError("");
    setCurrentPage(1);
    fetchPlacementLetters();
  };

  const filteredLetters = placementLetters.filter((letter) => {
    const searchTerm = filter.toLowerCase();
    return (
      letter.fileName.toLowerCase().includes(searchTerm) ||
      letter.letterId.toLowerCase().includes(searchTerm) ||
      letter.nicValue.toLowerCase().includes(searchTerm) ||
      (letter.letterData?.letterName && letter.letterData.letterName.toLowerCase().includes(searchTerm))
    );
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    "#",
    "Letter ID",
    "File Name",
    "NIC Value",
    "Letter Name",
    "File Size",
    "Created Date",
    "Status",
    "View",
    "Download",
    "Delete"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">PLACEMENT LETTERS MANAGEMENT</h3>
      </Container>

      <Container 
        className="mt-4 p-4 rounded" 
        style={{ 
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da"
        }}
      >
        <h5 className="mb-3">
          <FaFilePdf className="me-2" style={{ fontSize: '1.2rem', color: darkMode ? 'white' : 'black' }} />
          Placement Letter Documents
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Search and Filter Section */}
        <div className="row mb-3">
          <div className="col-md-6">
            <Form.Group controlId="filterInput" className="mb-2">
              <Form.Label>Filter by File Name, Letter ID, or NIC</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter search term..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group controlId="nicSearch" className="mb-2">
              <Form.Label>Search by NIC</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter NIC number..."
                  value={nicSearch}
                  onChange={(e) => setNicSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchByNIC()}
                />
                <Button variant="outline-primary" onClick={handleSearchByNIC}>
                  <FaSearch />
                </Button>
                {nicSearch && (
                  <Button variant="outline-secondary" onClick={handleClearSearch}>
                    Clear
                  </Button>
                )}
              </div>
            </Form.Group>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
            <p className="mt-2">Loading placement letters...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">{error}</Alert>
        ) : (
          <>
            <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} style={{ whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLetters.length > 0 ? (
                  filteredLetters.map((letter, index) => (
                    <tr key={letter._id || index}>
                      <td>{((currentPage - 1) * itemsPerPage) + index + 1}</td>
                      <td style={{ fontFamily: 'monospace' }}>{letter.letterId || "N/A"}</td>
                      <td title={letter.fileName}>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <FaFilePdf className="me-1 text-danger" />
                          {letter.fileName || "N/A"}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{letter.nicValue || "N/A"}</td>
                      <td>{letter.letterData?.letterName || "N/A"}</td>
                      <td>{letter.fileSize ? formatFileSize(letter.fileSize) : "N/A"}</td>
                      <td style={{ fontSize: '0.85em' }}>{formatDate(letter.createdAt)}</td>
                      <td>
                        <Badge 
                          bg={letter.status === 'active' ? 'success' : letter.status === 'archived' ? 'warning' : 'secondary'}
                          text={letter.status === 'active' ? 'white' : 'dark'}
                        >
                          {letter.status?.toUpperCase() || 'ACTIVE'}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          onClick={() => handleView(letter.letterId)}
                          className="fw-semibold d-flex align-items-center"
                          title="View PDF"
                        >
                          <FaEye className="me-1" />
                          View
                        </Button>
                      </td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-success" 
                          onClick={() => handleDownload(letter.letterId, letter.fileName)}
                          className="fw-semibold d-flex align-items-center"
                          title="Download PDF"
                        >
                          <FaDownload className="me-1" />
                          Download
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDeleteClick(letter)} 
                          className="fw-semibold"
                          title="Delete Letter"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      <FaFilePdf className="mb-2" style={{ fontSize: '2rem', color: '#6c757d' }} />
                      <p className="mb-0">No placement letters found.</p>
                      {filter || nicSearch ? (
                        <small className="text-muted">Try adjusting your search criteria.</small>
                      ) : null}
                    </td>
                  </tr>
                )}
              </tbody>
              
              {/* Table Footer with Pagination */}
              <tfoot>
                <tr>
                  <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                      <div className="flex-grow-1 text-center">
                        <span>{filteredLetters.length} application(s) in total</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
                        >
                          <FaChevronLeft /><FaChevronLeft />
                        </Button>
                        <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
                        >
                          <FaChevronRight /><FaChevronRight />
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

      {/* Delete Modal */}
      <DeleteModal 
        show={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onDelete={handleDeleteConfirm} 
        itemName={selectedLetter?.fileName || ""} 
        darkMode={darkMode} 
      />
    </div>
  );
};

export default PlacementLetterManagement;