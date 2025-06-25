import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { PersonPlus, ExclamationCircle, Diagram3 } from "react-bootstrap-icons";
import AssignNewManagerModal from "./AssignNewManagerModal";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export const SchemeManagers = ({ darkMode = false }) => {
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [levelWiseManagers, setLevelWiseManagers] = useState({});
  const { schemeId } = useParams();
  const navigate = useNavigate();

  // Fetch scheme details from your system
  const fetchSchemeDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/schemes/${schemeId}`);

      if (response.data && response.data.success) {
        setScheme(response.data.data);
      } else if (response.data) {
        setScheme(response.data);
      } else {
        throw new Error('Invalid response format');
      }
      
      console.log('Scheme loaded:', response.data);
    } catch (err) {
      console.error("Error fetching scheme:", err);
      throw new Error("Failed to load scheme details: " + (err.response?.data?.message || err.message));
    }
  };

  // Fetch employees from the Employee Management API
  const fetchEmployees = async () => {
    try {
      console.log('Starting to fetch employees and hierarchy data...');
      const [employeesResponse, hierarchyResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/employees`, {
          params: {
            status: 'active',
            sort_by: 'hierarchy_level',
            sort_order: 'asc'
          }
        }),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/employees/hierarchy`)
      ]);
      
      console.log('Raw employees response:', employeesResponse.data);
      console.log('Raw hierarchy response:', hierarchyResponse.data);
      
      // Handle employees data
      let employeeData = [];
      if (employeesResponse.data && employeesResponse.data.success) {
        employeeData = employeesResponse.data.data || [];
      } else if (Array.isArray(employeesResponse.data)) {
        employeeData = employeesResponse.data;
      } else {
        console.warn('Unexpected employees response format:', employeesResponse.data);
        employeeData = [];
      }

      // Handle hierarchy data
      let hierarchyDataResponse = [];
      if (hierarchyResponse.data && hierarchyResponse.data.success) {
        hierarchyDataResponse = hierarchyResponse.data.data || [];
      } else if (Array.isArray(hierarchyResponse.data)) {
        hierarchyDataResponse = hierarchyResponse.data;
      } else {
        console.warn('Unexpected hierarchy response format:', hierarchyResponse.data);
        hierarchyDataResponse = [];
      }

      console.log('Processed employee data:', employeeData.length, 'employees');
      console.log('Processed hierarchy data:', hierarchyDataResponse.length, 'hierarchy nodes');

      // Process employee data to match expected format
      const processedEmployees = employeeData.map(employee => ({
        id: employee._id,
        name: employee.full_name,
        email: employee.email,
        department: employee.department,
        position: employee.job_title,
        hierarchyLevel: employee.hierarchy_level || 1,
        subordinates: employee.subordinates || [],
        subordinateCount: employee.subordinates?.length || 0,
        isActive: employee.status === 'active',
        employeeCode: employee.employee_code,
        divisionCode: employee.division_code,
        costCenter: employee.cost_center,
        gradeLevel: employee.grade_level,
        joiningDate: employee.joining_date,
        lastUpdated: employee.last_updated,
        createdAt: employee.created_at
      }));

      // Process hierarchy data to ensure consistent structure
      const processedHierarchy = hierarchyDataResponse.map(node => ({
        ...node,
        id: node._id,
        name: node.full_name,
        employeeCode: node.employee_code,
        children: node.children || []
      }));

      setEmployees(processedEmployees);
      setHierarchyData(processedHierarchy);
      
      console.log('Final processed employees:', processedEmployees.length);
      console.log('Final processed hierarchy:', processedHierarchy.length);
      
      // Calculate dashboard stats from employee data
      const stats = calculateDashboardStats(processedEmployees);
      setDashboardStats(stats);
      
    } catch (err) {
      console.error("Error fetching employees:", err);
      throw new Error("Failed to connect to Employee Management system: " + (err.response?.data?.message || err.message));
    }
  };

  // Calculate dashboard statistics from employee data
  const calculateDashboardStats = (employeeData) => {
    const stats = {
      total_employees: employeeData.length,
      by_department: {},
      by_hierarchy_level: {},
      by_division: {},
      by_status: {}
    };

    employeeData.forEach(emp => {
      // Department stats
      const dept = emp.department || 'Unknown';
      stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;
      
      // Hierarchy level stats
      const level = emp.hierarchyLevel || 1;
      stats.by_hierarchy_level[level] = (stats.by_hierarchy_level[level] || 0) + 1;
      
      // Division stats
      if (emp.divisionCode) {
        stats.by_division[emp.divisionCode] = (stats.by_division[emp.divisionCode] || 0) + 1;
      }
      
      // Status stats
      const status = emp.isActive ? 'active' : 'inactive';
      stats.by_status[status] = (stats.by_status[status] || 0) + 1;
    });

    // Convert objects to arrays for easier display
    stats.by_department = Object.entries(stats.by_department).map(([dept, count]) => ({ department: dept, count }));
    stats.by_hierarchy_level = Object.entries(stats.by_hierarchy_level).map(([level, count]) => ({ level: parseInt(level), count }));
    stats.by_division = Object.entries(stats.by_division).map(([division, count]) => ({ division, count }));

    return stats;
  };

  // Process scheme managers into level-wise structure for 6-level system
  const processLevelWiseManagers = (schemeData) => {
    const levelManagers = {};
    
    if (!schemeData) return levelManagers;

    // Process 6-level manager structure
    for (let level = 1; level <= 6; level++) {
      const managerKey = `level${level}Manager`;
      const manager = schemeData[managerKey];
      
      if (manager && manager.employeeId) {
        if (!levelManagers[level]) {
          levelManagers[level] = [];
        }
        
        levelManagers[level].push({
          ...manager,
          role: managerKey,
          roleTitle: `Level ${level} Manager`,
          level: level
        });
      }
    }

    console.log('Processed level-wise managers:', levelManagers);
    return levelManagers;
  };

  // Get level colors for consistent styling
  const getLevelColor = (level) => {
    const colors = {
      1: 'danger',
      2: 'primary',
      3: 'success',
      4: 'warning',
      5: 'info',
      6: 'secondary'
    };
    return colors[level] || 'secondary';
  };

  // Get employee details by ID
  const getEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/employees/${employeeId}`);
      if (response.data && response.data.success) {
        const employee = response.data.data;
        return {
          id: employee._id,
          name: employee.full_name,
          email: employee.email,
          department: employee.department,
          position: employee.job_title,
          hierarchyLevel: employee.hierarchy_level || 1,
          subordinates: employee.subordinates || [],
          subordinateCount: employee.subordinates?.length || 0,
          isActive: employee.status === 'active',
          employeeCode: employee.employee_code,
          divisionCode: employee.division_code,
          costCenter: employee.cost_center,
          gradeLevel: employee.grade_level,
          joiningDate: employee.joining_date
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching employee details:", err);
      return null;
    }
  };

  // Initialize data when component mounts
  useEffect(() => {
    const initializeData = async () => {
      if (!schemeId) {
        setError("No scheme ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('Initializing data for scheme:', schemeId);
        
        // Load both scheme and employee data
        await Promise.all([
          fetchSchemeDetails(),
          fetchEmployees()
        ]);
        
        console.log('Data initialization completed successfully');
      } catch (err) {
        console.error("Error initializing data:", err);
        setError(err.message || "Failed to initialize application data");
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [schemeId]);

  // Update level-wise managers when scheme changes
  useEffect(() => {
    if (scheme) {
      const levelManagers = processLevelWiseManagers(scheme);
      setLevelWiseManagers(levelManagers);
      console.log('Level-wise managers processed:', levelManagers);
    }
  }, [scheme]);

  // Updated handler for 6-level manager assignment
  const handleAssignManager = async (managerData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Assigning managers with data:', managerData);

      // Extract manager assignments for 6-level system
      const managerAssignments = {};

      // Process each level (1-6)
      for (let level = 1; level <= 6; level++) {
        const levelKey = `level${level}Manager`;
        const managerInfo = managerData[levelKey];
        
        if (managerInfo && managerInfo.id) {
          // Find full employee details from our loaded employees
          let employee = employees.find(emp => emp.id === managerInfo.id);
          if (!employee) {
            employee = await getEmployeeDetails(managerInfo.id);
          }
          
          if (employee) {
            managerAssignments[levelKey] = {
              id: employee.id,
              name: employee.name,
              employeeCode: employee.employeeCode,
              email: employee.email,
              department: employee.department,
              position: employee.position,
              hierarchyLevel: employee.hierarchyLevel,
              allocationCount: managerInfo.allocationCount || 0,
              divisionCode: employee.divisionCode,
              costCenter: employee.costCenter,
              gradeLevel: employee.gradeLevel
            };
          }
        }
      }

      // Prepare assignment data
      const assignManagerData = {
        ...managerAssignments,
        assignedDate: new Date().toISOString(),
        assignedBy: localStorage.getItem('current_user_id') || 'system',
        schemeId: schemeId,
        totalAllocation: scheme?.totalAllocation || 0
      };

      console.log("Sending 6-level manager assignment data:", assignManagerData);

      // Update your scheme system
      const assignResponse = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/schemes/${schemeId}/assign-managers`,
        assignManagerData
      );

      if (!assignResponse.data.success) {
        throw new Error(assignResponse.data.message || 'Failed to assign managers');
      }

      // Refresh data
      await fetchSchemeDetails();
      setIsModalOpen(false);
      
      console.log("Managers assigned successfully");
      
    } catch (err) {
      console.error("Error assigning managers:", err);
      setError("Failed to assign managers: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Chart Data for Available Allocation and Assigned Interns
  const chartData = (managerData) => {
    const totalAllocation = managerData?.allocationCount || 0;
    const assignedCount = managerData?.assignedCount || 0;
    const availableAllocation = Math.max(0, totalAllocation - assignedCount);

    return {
      labels: ["Available Allocation", "Assigned Interns"],
      datasets: [
        {
          label: "Count",
          data: [availableAllocation, assignedCount],
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)", 
            "rgba(75, 192, 192, 0.8)"
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)", 
            "rgba(75, 192, 192, 1)"
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: darkMode ? "white" : "black",
          font: { size: 12 },
          padding: 15
        },
      },
      tooltip: {
        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.9)",
        titleColor: darkMode ? "white" : "black",
        bodyColor: darkMode ? "white" : "black",
        borderColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          }
        }
      },
    },
    cutout: "65%",
  };

  // Refresh data function
  const refreshData = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await Promise.all([
        fetchSchemeDetails(),
        fetchEmployees()
      ]);
    } catch (err) {
      setError("Failed to refresh data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading && !scheme && !employees.length) {
    return (
      <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Container className="text-center mt-5">
          <Spinner animation="border" size="lg" className={darkMode ? "text-light" : "text-primary"} />
          <p className="mt-3">Loading employee data and scheme details...</p>
          <small className="text-muted">Connecting to Employee Management System...</small>
        </Container>
      </div>
    );
  }

  // Error State
  if (error && !scheme) {
    return (
      <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Container className="mt-5">
          <Alert variant="danger">
            <ExclamationCircle className="me-2" />
            <strong>Connection Error:</strong> {error}
          </Alert>
          <div className="d-flex gap-2">
            <Button
              variant={darkMode ? "outline-light" : "primary"}
              onClick={refreshData}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Retrying...
                </>
              ) : (
                'Retry Connection'
              )}
            </Button>
            <Button
              variant={darkMode ? "outline-secondary" : "secondary"}
              onClick={() => navigate("/schemes")}
            >
              Back to Schemes
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // No Scheme Found State
  if (!scheme && !loading) {
    return (
      <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Container className="mt-5">
          <Alert variant="warning">
            <ExclamationCircle className="me-2" />
            No scheme found with ID: {schemeId}
          </Alert>
          <Button
            variant={darkMode ? "outline-light" : "primary"}
            onClick={() => navigate("/schemes")}
          >
            Back to Schemes
          </Button>
        </Container>
      </div>
    );
  }

  // Get all unique levels that have managers assigned
  const assignedLevels = Object.keys(levelWiseManagers).map(Number).sort((a, b) => a - b);

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        
        {/* Loading Overlay */}
        {loading && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
               style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
            <div className="text-center text-white">
              <Spinner animation="border" size="lg" />
              <p className="mt-2">Updating...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
            <ExclamationCircle className="me-2" />
            {error}
          </Alert>
        )}
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">
              <Diagram3 className="me-2" />
              6-Level Manager Assignment System
            </h4>
            <small className="text-muted">
              Connected to Employee Database | {employees.length} employees loaded
              {hierarchyData && ` | ${hierarchyData.length} hierarchy nodes`}
              {assignedLevels.length > 0 && ` | ${assignedLevels.length} levels with managers`}
            </small>
          </div>
          <Button
            variant={darkMode ? "outline-light" : "primary"}
            onClick={() => setIsModalOpen(true)}
            disabled={loading || employees.length === 0}
          >
            <PersonPlus className="me-2" /> Assign Manager
          </Button>
        </div>

        <hr className={darkMode ? "border-light" : "border-dark"} />

        {/* Employee System Stats */}
        {dashboardStats && (
          <Row className="mb-4">
            <Col md={12}>
              <Card className={darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark"}>
                <Card.Body>
                  <h6 className="mb-3">Employee System Overview</h6>
                  <Row>
                    <Col md={3}>
                      <div className="text-center">
                        <div className="h4 text-primary">{dashboardStats.total_employees}</div>
                        <small>Total Active Employees</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <div className="h4 text-success">{dashboardStats.by_department?.length || 0}</div>
                        <small>Departments</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <div className="h4 text-warning">{dashboardStats.by_hierarchy_level?.length || 0}</div>
                        <small>Hierarchy Levels</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <div className="h4 text-info">{assignedLevels.length}</div>
                        <small>Levels with Managers</small>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Scheme Information */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className={darkMode ? "bg-dark text-white border-secondary" : "bg-light text-dark"}>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label><strong>Scheme Name</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={scheme?.schemeName || 'Loading...'}
                        readOnly
                        className={`${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} border-0`}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label><strong>Total Allocation</strong></Form.Label>
                      <Form.Control
                        type="number"
                        value={scheme?.totalAllocation || 0}
                        readOnly
                        className={`${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} border-0`}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label><strong>Available Positions</strong></Form.Label>
                      <Form.Control
                        type="number"
                        value={scheme?.totalEmptyCount || 0}
                        readOnly
                        className={`${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} border-0`}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 6-Level Manager Cards */}
        {assignedLevels.length > 0 ? (
          <Row className="mb-4">
            {assignedLevels.map((level) => {
              const managers = levelWiseManagers[level];
              const levelColor = getLevelColor(level);
              
              return managers.map((manager, index) => (
                <Col key={`${level}-${index}`} md={4} className="mb-3">
                  <Card className={`bg-${darkMode ? 'dark' : 'light'} text-${darkMode ? 'white' : 'dark'} h-100 border-0 shadow`}>
                    <Card.Header className={`bg-${levelColor} text-white`}>
                      <h5 className="mb-0">
                        {manager?.position || `Level ${level} Manager`}
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>Employee:</strong>
                          <span className={manager?.name ? "text-success" : "text-warning"}>
                            {manager?.name || "Not Assigned"}
                          </span>
                        </div>
                        
                        {manager?.employeeCode && (
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>Employee Code:</strong>
                            <code className="bg-secondary text-white px-2 py-1 rounded">
                              {manager.employeeCode}
                            </code>
                          </div>
                        )}
                        
                        {manager?.department && (
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>Department:</strong>
                            <span>{manager.department}</span>
                          </div>
                        )}

                        {manager?.email && (
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>Email:</strong>
                            <small>{manager.email}</small>
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>Hierarchy Level:</strong>
                          <span className={`badge bg-${levelColor}`}>{manager.hierarchyLevel || level}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>Allocation:</strong>
                          <span className="badge bg-info">{manager?.allocationCount || 0}</span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <strong>Assigned:</strong>
                          <span className="badge bg-success">{manager?.assignedCount || 0}</span>
                        </div>
                      </div>

                      {/* Chart */}
                      <div style={{ height: "180px", position: "relative" }}>
                        <Doughnut data={chartData(manager)} options={chartOptions} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ));
            })}
          </Row>
        ) : (
          /* No Managers Assigned State */
          <Row className="mb-4">
            <Col md={12}>
              <Alert variant="info" className="text-center">
                <Diagram3 size={48} className="mb-3" />
                <h5>No Managers Assigned Yet</h5>
                <p>Use the "Assign Manager" button above to assign managers at different hierarchy levels (Level 1-6).</p>
                <small className="text-muted">
                  The 6-level system supports comprehensive hierarchical management assignments.
                </small>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Action Buttons */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <Button 
              variant={darkMode ? "outline-light" : "secondary"} 
              onClick={() => navigate(-1)} 
              disabled={loading}
            >
              Go Back
            </Button>
            
            <Button 
              variant={darkMode ? "outline-info" : "info"} 
              onClick={refreshData}
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-1" />
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
            </Button>
          </div>
          
          <div className="text-muted small">
            <i>Last updated: {new Date().toLocaleString()}</i>
            {employees.length > 0 && (
              <span className="ms-2">
                | Employee data: {employees.length} records
              </span>
            )}
            {assignedLevels.length > 0 && (
              <span className="ms-2">
                | Managers: {assignedLevels.reduce((sum, level) => sum + levelWiseManagers[level].length, 0)} assigned
              </span>
            )}
          </div>
        </div>
      </Container>

      {/* Employee Management Modal */}
      {scheme && employees.length > 0 && (
        <AssignNewManagerModal
          show={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAssignManager={handleAssignManager}
          scheme={scheme}
          employees={employees}
          hierarchyData={hierarchyData}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};