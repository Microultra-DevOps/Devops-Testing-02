import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { Table, Button, Container, Spinner, Alert, Form, Modal } from "react-bootstrap";
import { FaUser, FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import DeleteModal from "../../../components/notifications/DeleteModal"; 
import logo from "../../../assets/logo.png";

const API_URL = `${import.meta.env.VITE_BASE_URL}/api/employees`;

const ViewEmployees = ({ darkMode }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const navigate = useNavigate();

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-CA') : '';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      const employeesWithId = res.data.filter(emp => emp._id);
      setEmployees(employeesWithId);

      const map = {};
      employeesWithId.forEach(emp => {
        map[emp._id] = emp.full_name;
      });
      setEmployeeMap(map);

      setEmployeeOptions(
        employeesWithId.map(emp => ({
          id: emp._id,
          name: emp.full_name,
        }))
      );
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees');
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="ms-1" style={{ opacity: 0.5 }} />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="ms-1" /> : 
      <FaSortDown className="ms-1" />;
  };

  const sortedEmployees = React.useMemo(() => {
    let sortableEmployees = [...employees];
    if (sortConfig.key) {
      sortableEmployees.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';
        
        // Convert to lowercase for case-insensitive sorting
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableEmployees;
  }, [employees, sortConfig]);

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;

    try {
      await axios.delete(`${API_URL}/${selectedEmployee._id}`);
      setEmployees(prevData => prevData.filter(emp => emp._id !== selectedEmployee._id));
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Error deleting employee:", error.message);
      setError("Failed to delete employee");
    }
  };

  const openEditModal = (emp) => {
    setSelectedEmployee({ ...emp });
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    const { _id, ...updateData } = selectedEmployee;
    try {
      setLoading(true);
      await axios.put(`${API_URL}/${_id}`, updateData);
      setEditModal(false);
      setSelectedEmployee(null);
      await fetchEmployees();
      setLoading(false);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError('Failed to update employee');
      setLoading(false);
    }
  };

  const employeeOptionsFiltered = employeeOptions
    .filter(option => option.id !== selectedEmployee?._id)
    .map(emp => ({ value: emp.id, label: emp.name }));

  const selectedSubordinates = selectedEmployee?.subordinates?.map((id) => {
    const emp = employeeOptions.find((e) => e.id === id);
    return emp ? { value: emp.id, label: emp.name } : null;
  })?.filter(Boolean) || [];

  const getStatusBadge = (status) => {
    const colorMap = {
      active: 'success',
      inactive: 'secondary',
      terminated: 'danger',
    };
    const color = colorMap[status] || 'dark';
    return <span className={`badge bg-${color}`}>{status}</span>;
  };

  const filteredEmployees = sortedEmployees.filter((employee) =>
    employee.full_name.toLowerCase().includes(filter.toLowerCase()) ||
    employee.employee_code.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const columns = [
    { key: "#", label: "#", sortable: false },
    { key: "employee_code", label: "Employee Code", sortable: true },
    { key: "full_name", label: "Full Name", sortable: true },
    { key: "email", label: "Email", sortable: false },
    { key: "department", label: "Department", sortable: false },
    { key: "job_title", label: "Job Title", sortable: false },
    { key: "hierarchy_level", label: "Hierarchy Level", sortable: false },
    { key: "division_code", label: "Division", sortable: false },
    { key: "cost_center", label: "Cost Center", sortable: false },
    { key: "grade_level", label: "Grade", sortable: false },
    { key: "joining_date", label: "Join Date", sortable: false },
    { key: "subordinates", label: "Subordinates", sortable: false },
    { key: "status", label: "Status", sortable: false },
    { key: "edit", label: "Edit", sortable: false },
    { key: "delete", label: "Delete", sortable: false }
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ALL EMPLOYEES</h3>
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
          <FaUser className="me-2" style={{ fontSize: '1.2rem', color: darkMode ? 'white' : 'black' }} />
          Employee Management Details
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        <div className="d-flex flex-wrap gap-1 justify-content-between align-items-center mb-3">
          <Form.Group controlId="filterInput" className="mb-0 me-2" style={{ flexGrow: 1 }}>
            <Form.Control
              type="text"
              placeholder="Filter by Employee Name or Code"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: '250px', width: '100%' }} 
            />
          </Form.Group>
          <Button variant="primary" onClick={() => navigate('/add-employees')}>
            Add New Employee
          </Button>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">{error}</Alert>
        ) : (
          <>
            <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th 
                      key={column.key} 
                      style={{ 
                        cursor: column.sortable ? 'pointer' : 'default',
                        userSelect: 'none'
                      }}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{column.label}</span>
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((employee, index) => (
                    <tr key={employee._id || index}>
                      <td>{indexOfFirstEmployee + index + 1}</td>
                      <td>{employee.employee_code || "N/A"}</td>
                      <td>{employee.full_name || "N/A"}</td>
                      <td>{employee.email || "N/A"}</td>
                      <td>{employee.department || "N/A"}</td>
                      <td>{employee.job_title || "N/A"}</td>
                      <td>{employee.hierarchy_level || "N/A"}</td>
                      <td>{employee.division_code || "N/A"}</td>
                      <td>{employee.cost_center || "N/A"}</td>
                      <td>{employee.grade_level || "N/A"}</td>
                      <td>{formatDate(employee.joining_date)}</td>
                      <td>
                        {employee.subordinates?.length ? (
                          <ul className="mb-0 ps-3">
                            {employee.subordinates.map(subId => (
                              <li key={subId}>{employeeMap[subId] || subId}</li>
                            ))}
                          </ul>
                        ) : <small>No subordinates</small>}
                      </td>
                      <td>{getStatusBadge(employee.status)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => openEditModal(employee)}
                          className="fw-semibold" 
                        >
                          Edit
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDeleteClick(employee)} 
                          className="fw-semibold" 
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center">No employees found.</td>
                  </tr>
                )}
              </tbody>
              {/* Table Footer with Pagination */}
              <tfoot>
                <tr>
                  <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                      <div className="flex-grow-1 text-center">
                        <span>{filteredEmployees.length} employee(s) in total</span>
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

      {/* Edit Modal */}
      {editModal && selectedEmployee && (
        <Modal show={editModal} onHide={() => setEditModal(false)} centered backdrop="static" size="xl">
          <Modal.Header
            closeButton
            className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
          >
            <Modal.Title>
              <FaUser className="me-2" />
              Edit Employee - {selectedEmployee.full_name}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body
            className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
          >
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <div className="row g-3">
              {[
                'employee_code', 'full_name', 'email', 'department', 'job_title',
                'hierarchy_level', 'division_code', 'cost_center', 'grade_level'
              ].map((field) => (
                <div className="col-md-6" key={field}>
                  <Form.Group>
                    <Form.Label className="text-capitalize fw-semibold">
                      {field.replace(/_/g, ' ')}
                    </Form.Label>
                    <Form.Control
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      value={selectedEmployee[field] || ''}
                      onChange={handleEditChange}
                      disabled={field === 'employee_code'}
                      className={darkMode ? "bg-dark text-white border-info" : ""}
                      placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                    />
                  </Form.Group>
                </div>
              ))}

              <div className="col-12">
                <Form.Group>
                  <Form.Label className="fw-semibold">Subordinates</Form.Label>
                  <Select
                    isMulti
                    name="subordinates"
                    options={employeeOptionsFiltered}
                    value={selectedSubordinates}
                    onChange={(selected) => {
                      const selectedIds = selected ? selected.map((item) => item.value) : [];
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        subordinates: selectedIds,
                      }));
                    }}
                    classNamePrefix="select"
                    placeholder="Select subordinates..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: darkMode ? '#343a40' : 'white',
                        borderColor: darkMode ? '#17a2b8' : '#ced4da',
                        color: darkMode ? 'white' : 'black',
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: darkMode ? '#343a40' : 'white',
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused 
                          ? (darkMode ? '#495057' : '#e9ecef') 
                          : (darkMode ? '#343a40' : 'white'),
                        color: darkMode ? 'white' : 'black',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: darkMode ? '#495057' : '#e9ecef',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: darkMode ? 'white' : 'black',
                      }),
                    }}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Control
                    as="select"
                    name="status"
                    value={selectedEmployee.status || 'active'}
                    onChange={handleEditChange}
                    className={darkMode ? "bg-dark text-white border-info" : ""}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </Form.Control>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="fw-semibold">Join Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="joining_date"
                    value={selectedEmployee.joining_date ? 
                      new Date(selectedEmployee.joining_date).toISOString().split('T')[0] : ''
                    }
                    onChange={handleEditChange}
                    className={darkMode ? "bg-dark text-white border-info" : ""}
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer
            className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
          >
            <Button
              variant={darkMode ? "outline-light" : "secondary"}
              onClick={() => {
                setEditModal(false);
                setSelectedEmployee(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleEditSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Delete Modal */}
      <DeleteModal 
        show={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onDelete={handleDeleteConfirm} 
        itemName={selectedEmployee?.full_name || ""} 
        darkMode={darkMode} 
      />
    </div>
  );
};

export default ViewEmployees;