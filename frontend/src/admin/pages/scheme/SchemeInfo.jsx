import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import { Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SchemeInfo = ({ darkMode }) => {
  const { schemeId } = useParams();
  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchSchemeDetails = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/schemes/${schemeId}`);
        
        // Check if the response is successful
        if (response.data && response.data.success) {
          setSchemeData(response.data.data); 
        } else {
          throw new Error(response.data?.message || "Failed to fetch scheme details");
        }
        
      } catch (err) {
        console.error("Error fetching scheme details:", err);
        setError(
          err.response?.data?.message || 
          err.message || 
          "Failed to load scheme details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (schemeId) {
      fetchSchemeDetails();
    } else {
      setError("No scheme ID provided");
      setLoading(false);
    }
  }, [schemeId]);

  // Calculate chart data based on scheme data
  const getChartData = () => {
    if (!schemeData) {
      return {
        totalAllocatedCount: 0,
        totalEmptyCount: 0,
        totalAllocation: 0
      };
    }

    const totalAllocatedCount = schemeData.totalAllocatedCount || 0;
    const totalAllocation = schemeData.totalAllocation || 0;
    const totalEmptyCount = Math.max(0, totalAllocation - totalAllocatedCount);

    return {
      totalAllocatedCount,
      totalEmptyCount,
      totalAllocation
    };
  };

  const { totalAllocatedCount, totalEmptyCount, totalAllocation } = getChartData();

  // Half Donut chart configuration
  const donutChartData = {
    labels: ['Allocated', 'Empty'],
    datasets: [
      {
        data: [totalAllocatedCount, totalEmptyCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? 'white' : 'black',
          font: {
            size: 14
          }
        },
      },
      title: {
        display: true,
        text: 'Allocation Status',
        color: darkMode ? 'white' : 'black',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? 'white' : 'black',
        bodyColor: darkMode ? 'white' : 'black',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = totalAllocation;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
    rotation: -90,
    circumference: 180,
  };

  // Pie chart configuration
  const pieChartData = {
    labels: ['Allocated', 'Empty'],
    datasets: [
      {
        data: [totalAllocatedCount, totalEmptyCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? 'white' : 'black',
          font: {
            size: 14
          }
        },
      },
      title: {
        display: true,
        text: 'Current Allocation',
        color: darkMode ? 'white' : 'black',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? 'white' : 'black',
        bodyColor: darkMode ? 'white' : 'black',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = totalAllocation;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Calculate percentage values for labels
  const calculatePercentage = () => {
    if (totalAllocation === 0) return { allocated: '0%', empty: '0%' };
    
    const allocatedPercentage = Math.round((totalAllocatedCount / totalAllocation) * 100);
    const emptyPercentage = 100 - allocatedPercentage;
    
    return {
      allocated: `${allocatedPercentage}%`,
      empty: `${emptyPercentage}%`
    };
  };

  const percentages = calculatePercentage();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  // Capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Main Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <h4>View Scheme Details</h4>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" size="lg" />
            <p className="mt-3">Loading scheme details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Error</Alert.Heading>
            {error}
          </Alert>
        )}

        {/* Success State - Show content only when data is loaded */}
        {!loading && !error && schemeData && (
          <>
            {/* Summary Cards */}
            <Row className="mb-4">
              <Col md={3}>
                <Card className={`${darkMode ? "bg-dark text-white border-info" : "bg-light text-dark border-primary"} h-100 text-center`}>
                  <Card.Body>
                    <h5 className="text-primary">Total Allocation</h5>
                    <h2 className="text-info">{totalAllocation}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className={`${darkMode ? "bg-dark text-white border-success" : "bg-light text-dark border-success"} h-100 text-center`}>
                  <Card.Body>
                    <h5 className="text-success">Allocated</h5>
                    <h2 className="text-success">{totalAllocatedCount}</h2>
                    <small>{percentages.allocated}</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className={`${darkMode ? "bg-dark text-white border-warning" : "bg-light text-dark border-warning"} h-100 text-center`}>
                  <Card.Body>
                    <h5 className="text-warning">Available</h5>
                    <h2 className="text-warning">{totalEmptyCount}</h2>
                    <small>{percentages.empty}</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className={`${darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark border-secondary"} h-100 text-center`}>
                  <Card.Body>
                    <h5 className="text-secondary">Utilization</h5>
                    <h2 className="text-secondary">{percentages.allocated}</h2>
                    <small>of total capacity</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Charts Section */}
            <Row className="mb-4">
              <Col md={6}>
                <Card className={`${darkMode ? "bg-dark text-white" : "bg-light text-dark"} h-100`}>
                  <Card.Body>
                    <div style={{ height: '300px', position: 'relative' }}>
                      <Doughnut data={donutChartData} options={donutChartOptions} />
                      <div 
                        style={{ 
                          position: 'absolute', 
                          bottom: '40%', 
                          left: '0', 
                          right: '0',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <div style={{ fontSize: '14px', color: darkMode ? 'white' : 'black' }}>
                          Allocated
                        </div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: 'rgba(75, 192, 192, 1)'
                        }}>
                          {percentages.allocated}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className={`${darkMode ? "bg-dark text-white" : "bg-light text-dark"} h-100`}>
                  <Card.Body>
                    <div style={{ height: '300px', position: 'relative' }}>
                      <Pie data={pieChartData} options={pieChartOptions} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Scheme Details Form */}
            <Row>
              <Col md={12}>
                <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
                  <Card.Body>
                    <h5 className="mb-4">Scheme Information</h5>
                    
                    <Form>
                      <Row>
                        <Col md={6}>
                          {/* Scheme Name */}
                          <Form.Group controlId="schemeName" className="mb-3">
                            <Form.Label>Scheme Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={schemeData.schemeName || ''}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>

                          {/* Total Allocation */}
                          <Form.Group controlId="totalAllocation" className="mb-3">
                            <Form.Label>Total Allocation</Form.Label>
                            <Form.Control
                              type="number"
                              value={schemeData.totalAllocation || 0}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>

                          {/* Per Head Allowance */}
                          <Form.Group controlId="perHeadAllowance" className="mb-3">
                            <Form.Label>Per Head Allowance</Form.Label>
                            <Form.Control
                              type="number"
                              value={schemeData.perHeadAllowance || 0}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>

                          {/* Allowance Frequency */}
                          <Form.Group controlId="allowanceFrequency" className="mb-3">
                            <Form.Label>Allowance Frequency</Form.Label>
                            <Form.Control
                              type="text"
                              value={capitalize(schemeData.allowanceFrequency || '')}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          {/* Start Date */}
                          <Form.Group controlId="schemeStartDate" className="mb-3">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={formatDate(schemeData.schemeStartDate)}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>

                          {/* End Date */}
                          <Form.Group controlId="schemeEndDate" className="mb-3">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={formatDate(schemeData.schemeEndDate)}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>

                          {/* Minimum Qualifications */}
                          <Form.Group controlId="minimumQualifications" className="mb-3">
                            <Form.Label>Minimum Qualifications</Form.Label>
                            <Form.Control
                              type="text"
                              value={schemeData.minimumQualifications || ''}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>
                          
                          {/* Status */}
                          <Form.Group controlId="status" className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                              type="text"
                              value={schemeData.isActive ? 'Active' : 'Inactive'}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Scheme Type Row */}
                      <Row className="mb-3">
                        <Col md={12}>
                          <h6>Scheme Type</h6>
                          <hr />
                        </Col>
                        {["onRequest", "recurring", "rotational"].map((field) => (
                          <Col md={4} key={field}>
                            <Form.Group controlId={field} className="mb-3">
                              <Form.Label className="font-weight-bold">
                                {field === "onRequest" ? "On Request" : capitalize(field)}
                              </Form.Label>
                              <div className="d-flex gap-4">
                                <Form.Check
                                  type="radio"
                                  id={`${field}-yes`}
                                  label="Yes"
                                  name={field}
                                  value="yes"
                                  checked={schemeData[field] === "yes"}
                                  readOnly
                                  disabled
                                />
                                <Form.Check
                                  type="radio"
                                  id={`${field}-no`}
                                  label="No"
                                  name={field}
                                  value="no"
                                  checked={schemeData[field] === "no"}
                                  readOnly
                                  disabled
                                />
                              </div>
                            </Form.Group>
                          </Col>
                        ))}
                      </Row>

                      {/* Scheme Description */}
                      <Form.Group controlId="description" className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          value={schemeData.description || ''}
                          readOnly
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                          rows={4}
                        />
                      </Form.Group>

                      {/* Metadata */}
                      <Row className="mt-4">
                        <Col md={6}>
                          <Form.Group controlId="createdAt" className="mb-3">
                            <Form.Label>Created At</Form.Label>
                            <Form.Control
                              type="text"
                              value={schemeData.createdAt ? new Date(schemeData.createdAt).toLocaleString() : ''}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="updatedAt" className="mb-3">
                            <Form.Label>Last Updated</Form.Label>
                            <Form.Control
                              type="text"
                              value={schemeData.updatedAt ? new Date(schemeData.updatedAt).toLocaleString() : ''}
                              readOnly
                              className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Action Buttons - Only Go Back button */}
        <div className="d-flex justify-content-start mt-4">
            <Button 
              variant={darkMode ? "outline-light" : "secondary"} 
              onClick={() => navigate(-1)} 
              disabled={loading}
            >
              Go Back
            </Button>
        </div>
      </Container>
    </div>
  );
};

SchemeInfo.propTypes = {
  darkMode: PropTypes.bool.isRequired, 
};

export default SchemeInfo;