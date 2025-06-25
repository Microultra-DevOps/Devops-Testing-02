import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Card,
  Collapse,
  ButtonGroup,
  InputGroup,
} from "react-bootstrap";
import {
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaUsers,
  FaUserTie,
  FaVenusMars,
  FaEraser,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const ReportsFilters = ({
  activeFilters,
  onFilterChange,
  darkMode,
  uniqueDistricts,
  uniqueInstitutes,
  uniqueInternTypes,
  uniqueCvFroms,
  uniqueReferredBy,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    
    // Reset custom dates if date range is not custom
    if (key === "dateRange" && value !== "custom") {
      newFilters.customDateFrom = "";
      newFilters.customDateTo = "";
    }
    
    onFilterChange(newFilters);
  };

  // Reset all filters
  const resetFilters = () => {
    const resetFilters = {
      status: "all",
      dateRange: "all",
      district: "all",
      institute: "all",
      internType: "all",
      cvFrom: "all",
      gender: "all",
      referredBy: "all",
      customDateFrom: "",
      customDateTo: "",
      searchTerm: ""
    };
    onFilterChange(resetFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.entries(activeFilters).some(([key, value]) => {
      if (key === "customDateFrom" || key === "customDateTo") return false;
      return value !== "all" && value !== "";
    });
  };

  return (
    <Card className={`mb-4 ${darkMode ? 'bg-dark border-light' : 'bg-light border-dark'}`}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaFilter className="me-2" />
          <strong>Filters & Search</strong>
        </div>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="me-2"
          >
            Advanced Filters
            {showAdvancedFilters ? <FaChevronUp className="ms-1" /> : <FaChevronDown className="ms-1" />}
          </Button>
          {hasActiveFilters() && (
            <Button
              variant="outline-warning"
              size="sm"
              onClick={resetFilters}
            >
              <FaEraser className="me-1" />
              Reset
            </Button>
          )}
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Search Bar */}
        <Row className="mb-3">
          <Col md={8} sm={12}>
            <Form.Group>
              <Form.Label>
                <FaSearch className="me-1" />
                Search CVs
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, NIC, ref number, district, institute, or referred by..."
                  value={activeFilters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                />
                {activeFilters.searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleFilterChange("searchTerm", "")}
                  >
                    <FaEraser />
                  </Button>
                )}
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        {/* Quick Status Filters */}
        <Row className="mb-3">
          <Col>
            <Form.Label>
              <FaUsers className="me-1" />
              Status Filter
            </Form.Label>
            <div>
              <ButtonGroup className="flex-wrap">
                {[
                  { key: "all", label: "All CVs", variant: "outline-primary" },
                  { key: "cv-approved", label: "Approved", variant: "outline-success" },
                  { key: "cv-pending", label: "Pending", variant: "outline-warning" },
                  { key: "interview-scheduled", label: "Interview Stage", variant: "outline-info" },
                  { key: "cv-rejected", label: "Rejected", variant: "outline-danger" }
                ].map(({ key, label, variant }) => (
                  <Button
                    key={key}
                    variant={activeFilters.status === key ? variant.replace("outline-", "") : variant}
                    size="sm"
                    onClick={() => handleFilterChange("status", key)}
                    className="mb-2"
                  >
                    {label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </Col>
        </Row>

        {/* Date Range Filter */}
        <Row className="mb-3">
          <Col md={6} sm={12}>
            <Form.Group>
              <Form.Label>
                <FaCalendarAlt className="me-1" />
                Date Range
              </Form.Label>
              <Form.Select
                value={activeFilters.dateRange}
                onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this-week">This Week</option>
                <option value="last-week">Last Week</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="this-year">This Year</option>
                <option value="custom">Custom Range</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          {/* Custom Date Range */}
          {activeFilters.dateRange === "custom" && (
            <>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={activeFilters.customDateFrom}
                    onChange={(e) => handleFilterChange("customDateFrom", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={activeFilters.customDateTo}
                    onChange={(e) => handleFilterChange("customDateTo", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </>
          )}
        </Row>

        {/* Advanced Filters */}
        <Collapse in={showAdvancedFilters}>
          <div>
            <hr className={darkMode ? "border-light" : "border-dark"} />
            <Row className="mb-3">
              <Col md={4} sm={6} xs={12} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <FaMapMarkerAlt className="me-1" />
                    District
                  </Form.Label>
                  <Form.Select
                    value={activeFilters.district}
                    onChange={(e) => handleFilterChange("district", e.target.value)}
                  >
                    <option value="all">All Districts</option>
                    {uniqueDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} sm={6} xs={12} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <FaBuilding className="me-1" />
                    Institute
                  </Form.Label>
                  <Form.Select
                    value={activeFilters.institute}
                    onChange={(e) => handleFilterChange("institute", e.target.value)}
                  >
                    <option value="all">All Institutes</option>
                    {uniqueInstitutes.map((institute) => (
                      <option key={institute} value={institute}>
                        {institute}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} sm={6} xs={12} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <FaUserTie className="me-1" />
                    Intern Type
                  </Form.Label>
                  <Form.Select
                    value={activeFilters.internType}
                    onChange={(e) => handleFilterChange("internType", e.target.value)}
                  >
                    <option value="all">All Intern Types</option>
                    {uniqueInternTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4} sm={6} xs={12} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <FaUsers className="me-1" />
                    CV From
                  </Form.Label>
                  <Form.Select
                    value={activeFilters.cvFrom}
                    onChange={(e) => handleFilterChange("cvFrom", e.target.value)}
                  >
                    <option value="all">All Sources</option>
                    {uniqueCvFroms.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} sm={6} xs={12} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <FaVenusMars className="me-1" />
                    Gender
                  </Form.Label>
                  <Form.Select
                    value={activeFilters.gender}
                    onChange={(e) => handleFilterChange("gender", e.target.value)}
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} sm={6} xs={12} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    <FaUserTie className="me-1" />
                    Referred By
                  </Form.Label>
                  <Form.Select
                    value={activeFilters.referredBy}
                    onChange={(e) => handleFilterChange("referredBy", e.target.value)}
                  >
                    <option value="all">All Referrers</option>
                    {uniqueReferredBy.map((referrer) => (
                      <option key={referrer} value={referrer}>
                        {referrer}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Filter Summary */}
            <Row>
              <Col>
                <div className="d-flex flex-wrap align-items-center">
                  <small className="me-2 text-muted">Active Filters:</small>
                  {Object.entries(activeFilters).map(([key, value]) => {
                    if (value === "all" || value === "" || key === "customDateFrom" || key === "customDateTo") return null;
                    
                    const filterLabels = {
                      status: "Status",
                      dateRange: "Date",
                      district: "District",
                      institute: "Institute",
                      internType: "Intern Type",
                      cvFrom: "CV From",
                      gender: "Gender",
                      referredBy: "Referred By",
                      searchTerm: "Search"
                    };
                    
                    return (
                      <span
                        key={key}
                        className="badge bg-secondary me-1 mb-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {filterLabels[key]}: {value}
                        <Button
                          variant="link"
                          size="sm"
                          className="text-white p-0 ms-1"
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => handleFilterChange(key, key === "searchTerm" ? "" : "all")}
                        >
                          ×
                        </Button>
                      </span>
                    );
                  })}
                  {!hasActiveFilters() && (
                    <small className="text-muted">No active filters</small>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default ReportsFilters;