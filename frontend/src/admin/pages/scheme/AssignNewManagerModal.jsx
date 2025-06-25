import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Badge, Table, Card, Spinner } from "react-bootstrap";
import { CheckCircle, ExclamationCircle, Person, Building, ChevronDown, ChevronRight, Diagram3 } from "react-bootstrap-icons";

const AssignNewManagerModal = ({ 
  show, 
  onClose, 
  onAssignManager, 
  scheme, 
  employees = [],
  hierarchyData = [],
  darkMode = false 
}) => {

  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [employeeHierarchy, setEmployeeHierarchy] = useState({});
  const [expandedLevels, setExpandedLevels] = useState(new Set([1])); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  
  useEffect(() => {
    if (show) {
      setSelectedEmployees({});
      setError(null);
      setSearchTerm('');
      setExpandedLevels(new Set([1]));
    }
  }, [show]);

  // Build hierarchy structure from employee data
  const buildHierarchyMap = () => {
    const hierarchy = {};
    
    // Group employees by hierarchy level (1-6)
    employees.forEach(emp => {
      const level = emp.hierarchyLevel || 1;
      if (level >= 1 && level <= 6) { 
        if (!hierarchy[level]) {
          hierarchy[level] = [];
        }
        hierarchy[level].push(emp);
      }
    });

    return hierarchy;
  };

  // Get direct subordinates of a specific employee (using subordinates array)
  const getDirectSubordinates = (managerId) => {
    if (!managerId) return [];
    
    const manager = employees.find(emp => emp.id === managerId);
    if (!manager || !manager.subordinates) return [];
    
    return employees.filter(emp => 
      manager.subordinates.includes(emp.id)
    );
  };

  // Get all subordinates at a specific level under a manager (recursive)
  const getSubordinatesAtLevel = (managerId, targetLevel) => {
    const manager = employees.find(emp => emp.id === managerId);
    if (!manager) return [];

    // If we've reached the target level, return the employee if they match
    if (manager.hierarchyLevel === targetLevel) {
      return [manager];
    }

    // Otherwise, look through their subordinates
    let result = [];
    const directSubs = getDirectSubordinates(managerId);
    
    for (const sub of directSubs) {
      if (sub.hierarchyLevel === targetLevel) {
        result.push(sub);
      } else if (sub.hierarchyLevel < targetLevel) {
        result = result.concat(getSubordinatesAtLevel(sub.id, targetLevel));
      }
    }

    return result;
  };

  // Get available employees for a specific level based on parent selection
  const getAvailableEmployeesForLevel = (level) => {
    if (level === 1) {
      return employeeHierarchy[1] || [];
    }
    
    // For other levels, check if there's a parent selected at the previous level
    const parentLevel = level - 1;
    const parentEmployee = selectedEmployees[parentLevel];
    
    if (!parentEmployee) {
      // If no parent selected, show all employees at this level
      return employeeHierarchy[level] || [];
    }
    
    // If parent is selected, show only their subordinates at this level
    return getSubordinatesAtLevel(parentEmployee.id, level);
  };

  // Get available levels (1-6)
  const getAvailableLevels = () => {
    const levels = [...new Set(employees.map(emp => emp.hierarchyLevel || 1))]
      .filter(level => level >= 1 && level <= 6)
      .sort((a, b) => a - b);
    return levels;
  };

  // Handle employee selection at a specific level
  const handleEmployeeSelect = (level, employee) => {
    setSelectedEmployees(prev => {
      const newSelected = { ...prev };
      
      // Clear selections at all lower levels when selecting at a higher level
      const levels = getAvailableLevels();
      const currentLevelIndex = levels.indexOf(level);
      levels.slice(currentLevelIndex + 1).forEach(lowerLevel => {
        delete newSelected[lowerLevel];
      });
      
      // Set new selection
      newSelected[level] = {
        ...employee,
        allocationCount: 0
      };
      
      return newSelected;
    });

    // Auto-expand next level if there are potential subordinates
    const nextLevel = level + 1;
    if (getAvailableLevels().includes(nextLevel) && nextLevel <= 6) {
      setExpandedLevels(prev => new Set([...prev, nextLevel]));
    }

    setError(null);
  };

  // Handle allocation count change
  const handleAllocationChange = (level, allocationCount) => {
    setSelectedEmployees(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        allocationCount: parseInt(allocationCount) || 0
      }
    }));
  };

  // Toggle level expansion
  const toggleLevel = (level) => {
    setExpandedLevels(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(level)) {
        newExpanded.delete(level);
      } else {
        newExpanded.add(level);
      }
      return newExpanded;
    });
  };

  // Filter employees based on search
  const filterEmployees = (employeeList) => {
    if (!searchTerm) return employeeList;
    
    return employeeList.filter(emp => 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Validate form
  const validateForm = () => {
    setError(null);
    
    const totalAllocation = Object.values(selectedEmployees)
      .reduce((sum, emp) => sum + (emp.allocationCount || 0), 0);

    if (totalAllocation > (scheme?.totalAllocation || 0)) {
      setError(`Total allocation (${totalAllocation}) cannot exceed scheme's total allocation (${scheme?.totalAllocation || 0}).`);
      return false;
    }

    if (Object.keys(selectedEmployees).length === 0) {
      setError("At least one employee must be selected from the hierarchy.");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    setLoading(true);

    // Convert selected employees to the new level-based format
    const managerData = {};
    
    Object.entries(selectedEmployees)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([level, employee]) => {
        const levelKey = `level${level}Manager`;
        
        managerData[levelKey] = {
          id: employee.id,
          name: employee.name,
          employeeCode: employee.employeeCode,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          hierarchyLevel: parseInt(level),
          allocationCount: employee.allocationCount || 0,
          divisionCode: employee.divisionCode,
          costCenter: employee.costCenter,
          gradeLevel: employee.gradeLevel
        };
      });

    // Call the parent handler
    try {
      onAssignManager(managerData);
    } catch (err) {
      setError("Failed to assign managers: " + err.message);
      setLoading(false);
    }
  };

  // Initialize hierarchy when component mounts or employees change
  useEffect(() => {
    if (employees.length > 0) {
      const hierarchy = buildHierarchyMap();
      setEmployeeHierarchy(hierarchy);
    }
  }, [employees]);

  const availableLevels = getAvailableLevels();

  // Get level display name and color
  const getLevelInfo = (level) => {
    const levelNames = {
      1: { name: 'Executive Level', color: 'danger' },
      2: { name: 'Senior Management', color: 'warning' },
      3: { name: 'Middle Management', color: 'primary' },
      4: { name: 'Team Leadership', color: 'success' },
      5: { name: 'Supervisory Level', color: 'info' },
      6: { name: 'Operational Level', color: 'secondary' }
    };
    
    return levelNames[level] || { name: `Level ${level}`, color: 'dark' };
  };

  // Employee selection component for a specific level
  const LevelEmployeeSelector = ({ level }) => {
    const isExpanded = expandedLevels.has(level);
    const selectedEmployee = selectedEmployees[level];
    
    // Get available employees for this level
    const levelEmployees = getAvailableEmployeesForLevel(level);
    const availableEmployees = filterEmployees(levelEmployees);

    const levelInfo = getLevelInfo(level);
    
    // Determine if this level should be shown
    const shouldShowLevel = level === 1 || selectedEmployees[level - 1];

    if (!shouldShowLevel && level > 1) {
      return null;
    }

    // Get parent info for display
    const parentLevel = level - 1;
    const parentEmployee = selectedEmployees[parentLevel];
    const isFiltered = level > 1 && parentEmployee;

    return (
      <Card className={`mb-3 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
        <Card.Header 
          className={`bg-${levelInfo.color} text-white d-flex justify-content-between align-items-center`}
          style={{ cursor: 'pointer' }}
          onClick={() => toggleLevel(level)}
        >
          <span>
            <Person className="me-2" />
            Level {level} - {levelInfo.name}
            {isFiltered && (
              <Badge bg="light" text="dark" className="ms-2">
                Reports to {parentEmployee.name}
              </Badge>
            )}
            {availableEmployees.length > 0 && (
              <Badge bg="light" text="dark" className="ms-2">
                {availableEmployees.length} available
              </Badge>
            )}
          </span>
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </Card.Header>
        
        {isExpanded && (
          <Card.Body>
            {availableEmployees.length === 0 ? (
              <Alert variant="info">
                {isFiltered ? 
                  `No subordinates found at level ${level} for ${parentEmployee.name}.` :
                  `No employees available at level ${level}.`
                }
                {level > 1 && isFiltered && (
                  <div className="mt-2">
                    <small>
                      This means {parentEmployee.name} doesn't have any direct or indirect subordinates at Level {level}.
                    </small>
                    <br />
                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      className="mt-2"
                      onClick={() => {
                        // Clear parent selection to show all level employees
                        setSelectedEmployees(prev => {
                          const newSelected = { ...prev };
                          delete newSelected[parentLevel];
                          return newSelected;
                        });
                      }}
                    >
                      Show All Level {level} Employees
                    </Button>
                  </div>
                )}
              </Alert>
            ) : (
              <>
                {/* Employee Selection Table */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="mb-3">
                  <Table striped bordered hover size="sm" variant={darkMode ? "dark" : "light"}>
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Subordinates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableEmployees.map((employee) => {
                        const subordinateCount = getDirectSubordinates(employee.id).length;
                        
                        return (
                          <tr key={employee.id}>
                            <td>
                              <Form.Check
                                type="radio"
                                name={`level${level}Select`}
                                checked={selectedEmployee?.id === employee.id}
                                onChange={() => handleEmployeeSelect(level, employee)}
                              />
                            </td>
                            <td>
                              <strong>{employee.name}</strong>
                              {selectedEmployee?.id === employee.id && (
                                <Badge bg="success" className="ms-2">Selected</Badge>
                              )}
                            </td>
                            <td>
                              <Badge bg="secondary">{employee.employeeCode}</Badge>
                            </td>
                            <td>{employee.department}</td>
                            <td>{employee.position}</td>
                            <td>
                              <Badge bg="info" className="text-white">
                                {subordinateCount}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>

                {/* Selected Employee Details and Allocation */}
                {selectedEmployee && (
                  <div className={`p-3 rounded ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <strong>Selected: </strong>
                        <Badge bg={levelInfo.color} className="me-2">{selectedEmployee.name}</Badge>
                        <small className="text-muted">
                          <Building className="me-1" />{selectedEmployee.department} | 
                          Code: {selectedEmployee.employeeCode} | 
                          Subordinates: {getDirectSubordinates(selectedEmployee.id).length}
                        </small>
                      </div>
                      <div className="col-md-4">
                        <Form.Group>
                          <Form.Label>Allocation Count</Form.Label>
                          <Form.Control
                            type="number"
                            value={selectedEmployee.allocationCount || 0}
                            onChange={(e) => handleAllocationChange(level, e.target.value)}
                            placeholder="Enter allocation"
                            className={darkMode ? "bg-dark text-white" : ""}
                            min="0"
                          />
                        </Form.Group>
                      </div>
                    </div>
                    
                    {/* Preview subordinates at next level */}
                    {availableLevels.includes(level + 1) && level < 6 && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <strong>Will show subordinates at Level {level + 1}:</strong> {
                            getSubordinatesAtLevel(selectedEmployee.id, level + 1).length
                          } employees
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Card.Body>
        )}
      </Card>
    );
  };

  const totalSelectedAllocation = Object.values(selectedEmployees)
    .reduce((sum, emp) => sum + (emp.allocationCount || 0), 0);

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="xl" 
      centered 
      data-bs-theme={darkMode ? "dark" : "light"}
    >
      <Modal.Header closeButton className={darkMode ? "bg-dark text-white" : ""}>
        <Modal.Title>
          <Diagram3 className="me-2" />
          6-Level Hierarchy Manager Assignment
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={darkMode ? "bg-dark text-white" : ""} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {error && (
          <Alert variant="danger" className="mb-3">
            <ExclamationCircle className="me-2" />
            {error}
          </Alert>
        )}
        
        {/* Scheme Information */}
        <div className={`mb-4 p-3 rounded ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
          <h6 className="mb-2">Scheme Details</h6>
          <div className="row">
            <div className="col-md-4">
              <strong>Scheme:</strong> {scheme?.schemeName || 'N/A'}
            </div>
            <div className="col-md-4">
              <strong>Total Allocation:</strong> 
              <Badge bg="primary" className="ms-2">{scheme?.totalAllocation || 0}</Badge>
            </div>
            <div className="col-md-4">
              <strong>Available Positions:</strong> 
              <Badge bg="success" className="ms-2">{scheme?.totalEmptyCount || 0}</Badge>
            </div>
          </div>
        </div>

        {/* Employee System Connection Status */}
        <Alert variant={employees.length > 0 ? "success" : "warning"} className="mb-4">
          <Building className="me-2" />
          Employee System Status: {employees.length > 0 ? 
            `Connected - ${employees.length} employees loaded across ${availableLevels.length} levels (L1-L6)` : 
            "No employee data available"
          }
          {employees.length > 0 && (
            <div className="mt-1">
              <small>
                Levels available: {availableLevels.join(', ')} | 
                Level distribution: {availableLevels.map(level => 
                  `L${level}:${(employeeHierarchy[level] || []).length}`
                ).join(', ')}
              </small>
            </div>
          )}
        </Alert>

        {/* Search Box */}
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search employees by name, code, department, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={darkMode ? "bg-secondary text-white" : ""}
          />
        </Form.Group>

        {employees.length === 0 ? (
          <Alert variant="warning">
            <ExclamationCircle className="me-2" />
            No employee data available. Please ensure the Employee Management System is connected.
          </Alert>
        ) : (
          <>
            {/* Hierarchy Level Selectors (1-6) */}
            {[1, 2, 3, 4, 5, 6].filter(level => availableLevels.includes(level)).map((level) => (
              <LevelEmployeeSelector key={level} level={level} />
            ))}

            {/* Selection Summary */}
            {Object.keys(selectedEmployees).length > 0 && (
              <Card className={`mt-4 ${darkMode ? 'bg-secondary text-white border-secondary' : 'bg-light'}`}>
                <Card.Header>
                  <h6 className="mb-0">Selection Summary & Hierarchy Preview</h6>
                </Card.Header>
                <Card.Body>
                  <div className="row mb-3">
                    {Object.entries(selectedEmployees)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([level, employee]) => {
                        const levelInfo = getLevelInfo(parseInt(level));
                        return (
                        <div key={level} className="col-md-6 col-lg-4 mb-3">
                          <div className="text-center">
                            <div className="h5 text-primary">{employee.allocationCount || 0}</div>
                            <small>Level {level}: {employee.name}</small>
                            <br />
                            <Badge bg={levelInfo.color} className="mt-1">{employee.employeeCode}</Badge>
                            <br />
                            <small className="text-muted">
                              {levelInfo.name} | {getDirectSubordinates(employee.id).length} subordinates
                            </small>
                          </div>
                        </div>
                      )})}
                    <div className="col-md-6 col-lg-4 mb-3">
                      <div className="text-center">
                        <div className={`h4 ${
                          totalSelectedAllocation > (scheme?.totalAllocation || 0)
                            ? 'text-danger' : 'text-success'
                        }`}>
                          {totalSelectedAllocation}
                        </div>
                        <small>Total Allocation</small>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="progress">
                      <div 
                        className={`progress-bar ${
                          totalSelectedAllocation > (scheme?.totalAllocation || 0)
                            ? 'bg-danger' : 'bg-success'
                        }`}
                        role="progressbar"
                        style={{
                          width: `${Math.min(100, (totalSelectedAllocation / (scheme?.totalAllocation || 1)) * 100)}%`
                        }}
                      >
                        {Math.round((totalSelectedAllocation / (scheme?.totalAllocation || 1)) * 100)}%
                      </div>
                    </div>
                    <small className="text-muted">
                      {totalSelectedAllocation} / {scheme?.totalAllocation || 0} allocated
                    </small>
                  </div>
                </Card.Body>
              </Card>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer className={darkMode ? "bg-dark text-white" : ""}>
        <div className="d-flex justify-content-between w-100 align-items-center">
          <small className="text-muted">
            <i>6-Level Hierarchy System Active</i>
          </small>
          <div>
            <Button 
              variant={darkMode ? "outline-light" : "secondary"} 
              onClick={onClose}
              className="me-2"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant={darkMode ? "outline-primary" : "primary"} 
              onClick={handleSubmit}
              disabled={loading || Object.keys(selectedEmployees).length === 0}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="me-2" /> 
                  Assign Selected Managers
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignNewManagerModal;