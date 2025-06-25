import React from "react";
import PropTypes from "prop-types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, Row, Col, Alert } from "react-bootstrap";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = ({ stationAnalytics, darkMode }) => {
  if (!stationAnalytics || stationAnalytics.length === 0) {
    return (
      <Alert variant="info" className="mt-3">
        No station analytics data available. Stations may not have any
        assignments yet.
      </Alert>
    );
  }

  return (
    <div className={`mb-4 ${darkMode ? "text-white" : ""}`}>
      <h5 className="mb-3">Station Utilization Overview</h5>
      <hr className={darkMode ? "border-light" : "border-dark"} />

      <Row>
        {stationAnalytics.map((station) => {
          const pieData = [
            { name: "Assigned", value: station.assignedCVs },
            { name: "Available", value: station.availableSeats },
          ];

          return (
            <Col
              key={station.stationId}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="mb-4"
            >
              <Card className={darkMode ? "bg-dark text-white" : ""}>
                <Card.Body className="text-center">
                  <h6>{station.stationName}</h6>

                  {/* Utilization Pie Chart */}
                  <div style={{ height: "250px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          contentStyle={
                            darkMode
                              ? { backgroundColor: "#333", borderColor: "#666" }
                              : {}
                          }
                        />
                        <Legend
                          wrapperStyle={darkMode ? { color: "white" } : {}}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Utilization Summary */}
                  <div className="mt-2">
                    <small className="text-muted">
                      Utilization: {station.utilizationPercentage}% (
                      {station.assignedCVs}/{station.maxStudents})
                    </small>
                  </div>

                  {/* Ending Soon Indicator */}
                  {station.cvsEndingThisWeek.length > 0 && (
                    <div className="mt-2">
                      <small className="text-warning">
                        {station.cvsEndingThisWeek.length} CV(s) ending this
                        week
                      </small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

Dashboard.propTypes = {
  stationAnalytics: PropTypes.arrayOf(
    PropTypes.shape({
      stationId: PropTypes.string.isRequired,
      stationName: PropTypes.string.isRequired,
      assignedCVs: PropTypes.number.isRequired,
      availableSeats: PropTypes.number.isRequired,
      maxStudents: PropTypes.number.isRequired,
      utilizationPercentage: PropTypes.number.isRequired,
      cvsEndingThisWeek: PropTypes.array.isRequired,
    })
  ),
  darkMode: PropTypes.bool.isRequired,
};

Dashboard.defaultProps = {
  stationAnalytics: [],
};

export default Dashboard;
