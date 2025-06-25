import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Row, Col, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

const RotationalApiFirst = ({ darkMode }) => {
  const [allCVs, setAllCVs] = useState([]);
  const [pendingCVs, setPendingCVs] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [stationAssignments, setStationAssignments] = useState([
    {
      stationId: '',
      startDate: '',
      endDate: ''
    }
  ]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [selectedCVForHistory, setSelectedCVForHistory] = useState(null);
  const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Update the fetchAllData function to use consistent API_BASE_URL
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allResponse, pendingResponse, analyticsResponse, stationsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/rotational/all-rotational`),
        axios.get(`${API_BASE_URL}/rotational/pending-rotational`),
        axios.get(`${API_BASE_URL}/rotational/analytics`),
        axios.get(`${API_BASE_URL}/rotational/stations`)
      ]);

      setAllCVs(allResponse.data);
      setPendingCVs(pendingResponse.data);
      setAnalytics(analyticsResponse.data);
      setStations(stationsResponse.data.data || stationsResponse.data); 
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCVSelect = (cvId) => {
    setSelectedCVs(prev => {
      if (prev.includes(cvId)) {
        return prev.filter(id => id !== cvId);
      }
      return [...prev, cvId];
    });
  };

  // Function to handle opening the assignment modal
  const handleOpenAssignModal = () => {
    setShowAssignModal(true);
  };

  // Function to add another station assignment
  const handleAddStation = () => {
    setStationAssignments([
      ...stationAssignments,
      {
        stationId: '',
        startDate: '',
        endDate: ''
      }
    ]);
  };

  // Function to update station assignment details
  const handleStationAssignmentChange = (index, field, value) => {
    const updatedAssignments = [...stationAssignments];
    updatedAssignments[index][field] = value;
    setStationAssignments(updatedAssignments);
  };

  // Updated assignment function using API_BASE_URL
  const handleAssignToStations = async () => {
    try {
      // Validate all assignments have required fields
      const isValid = stationAssignments.every(assignment => 
        assignment.stationId && assignment.startDate && assignment.endDate
      );

      if (!isValid) {
        alert('Please fill all station assignment details');
        return;
      }

      // Format the stations array with all assignments
      const formattedStations = stationAssignments.map(assignment => ({
        stationId: assignment.stationId,
        startDate: assignment.startDate,
        endDate: assignment.endDate
      }));

      const response = await axios.post(
        `${API_BASE_URL}/rotational/assign-to-multiple-stations`,
        {
          cvIds: selectedCVs,
          stations: formattedStations // Send all station assignments
        }
      );

      if (response.data.successfulAssignments.length > 0) {
        alert(`Successfully assigned ${response.data.successfulAssignments.length} CVs to ${formattedStations.length} stations`);
        setShowAssignModal(false);
        setStationAssignments([{ stationId: '', startDate: '', endDate: '' }]);
        setSelectedCVs([]); // Clear selected CVs
        fetchAllData(); // Refresh the data
      }
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Error assigning stations: ' + (error.response?.data?.error || error.message));
    }
  };

  // Add a function to remove a station assignment
  const handleRemoveStation = (index) => {
    if (stationAssignments.length > 1) {
      setStationAssignments(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Responsive card component for mobile CV display
 const CVCard = ({ cv, isPending = false, showSelect = false }) => (
    <Card className={`mb-3 ${darkMode ? "bg-dark text-white border-secondary" : ""}`}>
      <Card.Body>
        {showSelect && (
          <div className="mb-2">
            <Form.Check
              type="checkbox"
              label="Select"
              checked={selectedCVs.includes(cv._id)}
              onChange={() => handleCVSelect(cv._id)}
              className={darkMode ? "text-white" : ""}
            />
          </div>
        )}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start">
          <div className="mb-2 mb-sm-0">
            <h6 className="mb-1">{cv.fullName}</h6>
            <small className={darkMode ? "text-light" : "text-muted"}>Ref: {cv.refNo}</small>
          </div>
          <div className="d-flex flex-column align-items-start align-items-sm-end">
            <Badge bg={
              cv.rotationalAssignment?.status === 'station-assigned' ? 'success' : 'warning'
            } className="mb-2">
              {cv.rotationalAssignment?.status || 'Pending'}
            </Badge>
            <Button 
              variant="info" 
              size="sm" 
              onClick={() => handleViewHistory(cv._id)}
            >
              View History
            </Button>
          </div>
        </div>
        {!isPending && (
          <div className="mt-2">
            <small className={darkMode ? "text-light" : "text-muted"}>Current Station: </small>
            <span className="fw-bold">
              {cv.rotationalAssignment?.assignedStations?.find(
                station => station.isCurrent
              )?.station?.stationName || 'Not Assigned'}
            </span>
          </div>
        )}
      </Card.Body>
    </Card>
  );


  // Add this new component for the assignment modal
  const AssignmentModal = () => (
    <Modal 
      show={showAssignModal} 
      onHide={() => setShowAssignModal(false)} 
      size="lg"
      data-bs-theme={darkMode ? "dark" : "light"}
      className="modal-fullscreen-sm-down"
    >
      <Modal.Header 
        closeButton 
        className={darkMode ? "bg-dark text-white border-secondary" : ""}
      >
        <Modal.Title className="fs-6 fs-sm-5">Assign Stations to Selected CVs</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${darkMode ? "bg-dark text-white" : ""} p-2 p-sm-3`}>
        <div className="mb-3">
          <strong>Selected CVs: </strong> 
          {selectedCVs.length} CVs selected
        </div>
        
        {stationAssignments.map((assignment, index) => (
          <Card 
            key={index} 
            className={`mb-3 ${darkMode ? "bg-secondary text-white border-secondary" : ""}`}
          >
            <Card.Body className="p-2 p-sm-3">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-2">
                <h6 className="mb-1 mb-sm-0">Station Assignment {index + 1}</h6>
                {stationAssignments.length > 1 && (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleRemoveStation(index)}
                    className="mt-1 mt-sm-0"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <Row className="g-2">
                <Col xs={12} md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Select Station</Form.Label>
                    <Form.Select
                      value={assignment.stationId}
                      onChange={(e) => handleStationAssignmentChange(index, 'stationId', e.target.value)}
                      className={`${darkMode ? "bg-dark text-white border-secondary" : ""} form-select-sm`}
                    >
                      <option value="">Choose station...</option>
                      {stations.map(station => (
                        <option key={station._id} value={station._id}>
                          {station.stationName} ({station.availableSeats} seats, {station.timePeriod}w)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={6} md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={assignment.startDate}
                      onChange={(e) => handleStationAssignmentChange(index, 'startDate', e.target.value)}
                      className={darkMode ? "bg-dark text-white border-secondary" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col xs={6} md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">End Date</Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={assignment.endDate}
                      onChange={(e) => handleStationAssignmentChange(index, 'endDate', e.target.value)}
                      className={darkMode ? "bg-dark text-white border-secondary" : ""}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
        
        <Button 
          variant={darkMode ? "outline-light" : "secondary"} 
          size="sm"
          onClick={handleAddStation} 
          className="mb-3 w-100 w-sm-auto"
        >
          Add Another Station
        </Button>
      </Modal.Body>
      <Modal.Footer className={`${darkMode ? "bg-dark text-white border-secondary" : ""} p-2 p-sm-3`}>
        <div className="d-flex flex-column flex-sm-row w-100 gap-2">
          <Button 
            variant={darkMode ? "outline-light" : "secondary"} 
            size="sm"
            onClick={() => setShowAssignModal(false)}
            className="w-100 w-sm-auto"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleAssignToStations}
            disabled={stationAssignments.some(assignment => 
              !assignment.stationId || !assignment.startDate || !assignment.endDate
            )}
            className="w-100 w-sm-auto"
          >
            Assign Stations
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );

  // Updated handleViewHistory function to use API_BASE_URL
  const handleViewHistory = async (cvId) => {
    try {
      setSelectedCVForHistory(cvId);
      setShowHistoryModal(true);
      const response = await axios.get(`${API_BASE_URL}/rotational/assignment-history/${cvId}`);
      const currentDate = new Date();

      // Categorize stations based on current date
      const categorizedHistory = response.data.map(assignment => {
        const startDate = new Date(assignment.startDate);
        const endDate = new Date(assignment.endDate);

        if (currentDate >= startDate && currentDate <= endDate) {
          return { ...assignment, status: 'Currently Working' };
        } else if (currentDate > endDate) {
          return { ...assignment, status: 'Completed' };
        } else if (currentDate < startDate) {
          return { ...assignment, status: 'Upcoming' };
        }
        return assignment;
      });

      setAssignmentHistory(categorizedHistory);
    } catch (error) {
      console.error('Error fetching assignment history:', error);
      alert('Failed to fetch assignment history');
    }
  };

  // Responsive history card component
  const HistoryCard = ({ assignment, index }) => (
    <Card className={`mb-2 ${darkMode ? "bg-secondary text-white border-secondary" : ""}`}>
      <Card.Body className="p-2">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start">
          <div className="mb-2 mb-sm-0">
            <h6 className="mb-1">{assignment.station?.stationName || 'Unknown'}</h6>
            <small className="text-muted">
              {assignment.station?.timePeriod || 'N/A'} weeks
            </small>
          </div>
          <Badge bg={
            assignment.status === 'Currently Working' ? 'success' :
            assignment.status === 'Completed' ? 'secondary' :
            'warning'
          }>
            {assignment.status}
          </Badge>
        </div>
        <div className="mt-2">
          <small className="text-muted">
            {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
          </small>
        </div>
      </Card.Body>
    </Card>
  );

  const HistoryModal = () => (
    <Modal 
      show={showHistoryModal} 
      onHide={() => setShowHistoryModal(false)} 
      size="lg"
      data-bs-theme={darkMode ? "dark" : "light"}
      className="modal-fullscreen-sm-down"
    >
      <Modal.Header 
        closeButton 
        className={darkMode ? "bg-dark text-white border-secondary" : ""}
      >
        <Modal.Title className="fs-6 fs-sm-5">Assignment History</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${darkMode ? "bg-dark text-white" : ""} p-2 p-sm-3`}>
        {assignmentHistory.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="d-none d-md-block">
              <Table 
                striped 
                bordered 
                hover 
                variant={darkMode ? "dark" : ""}
                size="sm"
              >
                <thead>
                  <tr>
                    <th>Station Name</th>
                    <th>Time Period (weeks)</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentHistory.map((assignment, index) => (
                    <tr key={index}>
                      <td>{assignment.station?.stationName || 'Unknown'}</td>
                      <td>{assignment.station?.timePeriod || 'N/A'}</td>
                      <td>{new Date(assignment.startDate).toLocaleDateString()}</td>
                      <td>{new Date(assignment.endDate).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={
                          assignment.status === 'Currently Working' ? 'success' :
                          assignment.status === 'Completed' ? 'secondary' :
                          'warning'
                        }>
                          {assignment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            
            {/* Mobile Card View */}
            <div className="d-md-none">
              {assignmentHistory.map((assignment, index) => (
                <HistoryCard key={index} assignment={assignment} index={index} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p>No assignment history available for this CV.</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className={`${darkMode ? "bg-dark text-white border-secondary" : ""} p-2 p-sm-3`}>
        <Button 
          variant={darkMode ? "outline-light" : "secondary"} 
          size="sm"
          onClick={() => setShowHistoryModal(false)}
          className="w-100 w-sm-auto"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div 
      className={`
        min-vh-100 
        ${darkMode ? "bg-dark text-white" : "bg-white text-dark"}
      `}
    >
      <Container fluid className="py-2 py-sm-4 px-2 px-sm-3">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Analytics Section */}
            <Card className={`mb-3 mb-sm-4 ${darkMode ? "bg-secondary text-white border-secondary" : ""}`}>
              <Card.Header className={`${darkMode ? "bg-dark text-white border-secondary" : ""} p-2 p-sm-3`}>
                <h6 className="mb-0">Station Analytics</h6>
              </Card.Header>
              <Card.Body className="p-2 p-sm-3">
                <Row className="g-2">
                  {analytics.map(station => (
                    <Col xs={12} sm={6} lg={4} key={station.stationId}>
                      <Card className={`${darkMode ? "bg-dark text-white border-secondary" : ""} h-100`}>
                        <Card.Body className="p-2 p-sm-3">
                          <Card.Title className="fs-6 mb-2">{station.stationName}</Card.Title>
                          <div className="small">
                            <div className="d-flex justify-content-between mb-1">
                              <span>Assigned CVs:</span>
                              <strong>{station.assignedCVs}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span>Available Seats:</span>
                              <strong>{station.availableSeats}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>Utilization:</span>
                              <strong>{station.utilizationPercentage}%</strong>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Pending CVs Section */}
            <Card className={`mb-3 mb-sm-4 ${darkMode ? "bg-secondary text-white border-secondary" : ""}`}>
              <Card.Header className={`${darkMode ? "bg-dark text-white border-secondary" : ""} p-2 p-sm-3`}>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                  <h6 className="mb-1 mb-sm-0">Pending CVs</h6>
                  <Button 
                    variant={darkMode ? "light" : "primary"} 
                    size="sm" 
                    disabled={selectedCVs.length === 0}
                    onClick={handleOpenAssignModal}
                    className="mt-1 mt-sm-0 w-20 w-sm-auto"
                  >
                    Assign Selected CVs ({selectedCVs.length})
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-2 p-sm-3">
                {/* Desktop Table View */}
                <div className="d-none d-lg-block">
                  <Table 
                    striped 
                    bordered 
                    hover 
                    variant={darkMode ? "dark" : ""}
                    size="sm"
                  >
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Select</th>
                        <th>Name</th>
                        <th>Reference No</th>
                        <th>Status</th>
                        <th style={{ width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCVs.map(cv => (
                        <tr key={cv._id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedCVs.includes(cv._id)}
                              onChange={() => handleCVSelect(cv._id)}
                            />
                          </td>
                          <td>{cv.fullName}</td>
                          <td>{cv.refNo}</td>
                          <td>
                            <Badge bg="warning">
                              {cv.rotationalAssignment?.status || 'Pending'}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="info" 
                              size="sm" 
                              onClick={() => handleViewHistory(cv._id)}
                            >
                              View History
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="d-lg-none">
                  {pendingCVs.map(cv => (
                    <CVCard key={cv._id} cv={cv} isPending={true} showSelect={true} />
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* All Rotational CVs Section */}
            <Card className={darkMode ? "bg-dark text-white border-secondary" : ""}>
              <Card.Header className={`${darkMode ? "bg-secondary text-white border-secondary" : ""} p-2 p-sm-3`}>
                <h6 className="mb-0">All Rotational CVs</h6>
              </Card.Header>
              <Card.Body className="p-2 p-sm-3">
                {/* Desktop Table View */}
                <div className="d-none d-lg-block">
                  <Table 
                    striped 
                    bordered 
                    hover 
                    variant={darkMode ? "dark" : ""}
                    size="sm"
                  >
                    <thead>
                      <tr>
                        <th className={darkMode ? "text-white" : ""}>Name</th>
                        <th className={darkMode ? "text-white" : ""}>Reference No</th>
                        <th className={darkMode ? "text-white" : ""}>Current Station</th>
                        <th className={darkMode ? "text-white" : ""}>Status</th>
                        <th style={{ width: '120px' }} className={darkMode ? "text-white" : ""}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCVs.map(cv => (
                        <tr key={cv._id}>
                          <td className={darkMode ? "text-white" : ""}>{cv.fullName}</td>
                          <td className={darkMode ? "text-white" : ""}>{cv.refNo}</td>
                          <td className={darkMode ? "text-white" : ""}>
                            {cv.rotationalAssignment?.assignedStations?.find(
                              station => station.isCurrent
                            )?.station?.stationName || 'Not Assigned'}
                          </td>
                          <td>
                            <Badge bg={
                              cv.rotationalAssignment?.status === 'station-assigned' 
                                ? 'success' 
                                : 'warning'
                            }>
                              {cv.rotationalAssignment?.status || 'Pending'}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="info" 
                              size="sm" 
                              onClick={() => handleViewHistory(cv._id)}
                            >
                              View History
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="d-lg-none">
                  {allCVs.map(cv => (
                    <CVCard key={cv._id} cv={cv} />
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Add the modal components */}
            <AssignmentModal />
            <HistoryModal />
          </>
        )}
      </Container>
    </div>
  );
};

export default RotationalApiFirst;