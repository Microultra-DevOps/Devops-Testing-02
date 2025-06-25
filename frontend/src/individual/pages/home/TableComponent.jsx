import React from "react";
import { Table } from "react-bootstrap";

const TableComponent = ({ tableData, columns, footerText, darkMode, className = "" }) => {

  const theme = {
    backgroundColor: darkMode ? "#000000" : "#f8fafc",
    cardBackground: darkMode ? "#1E1E1E" : "rgba(255, 255, 255, 0.4)",
    accentColor: darkMode ? "#2563eb" : "#00cc66", 
    textPrimary: darkMode ? "#E1E1E1" : "#1e293b",
    textSecondary: darkMode ? "#A0A0A0" : "#64748b",
    border: darkMode ? "#333333" : "rgba(0, 0, 0, 0.1)",
    gradientStart: darkMode ? "#2563eb" : "#00cc66", 
    gradientEnd: darkMode ? "#1e40af" : "#00aa88", 
    buttonHover: darkMode ? "#1d4ed8" : "#008844",
    statusApproved: darkMode ? "#03DAC6" : "#10b981",
    statusRejected: darkMode ? "#CF6679" : "#ef4444",
    statusPending: darkMode ? "#FFB74D" : "#f59e0b",
    statusDefault: darkMode ? "#757575" : "#6b7280",
    tableBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    hoverBackground: darkMode ? "rgba(37, 99, 235, 0.1)" : "rgba(0, 204, 102, 0.05)",
    stripedBackground: darkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)"
  };

  return (
    <div className={className}>
      <div
        style={{
          background: theme.cardBackground,
          backdropFilter: 'blur(20px)',
          borderRadius: "20px", 
          overflow: "hidden",
          border: `1px solid ${theme.border}`,
          boxShadow: `0 20px 40px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`, 
          transition: 'all 0.3s ease', 
          position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${theme.accentColor}05, ${theme.gradientEnd}05)`,
          pointerEvents: 'none'
        }} />
        
        <Table
          responsive
          className="mb-0"
          style={{
            backgroundColor: "transparent",
            color: theme.textPrimary,
            border: "none",
            fontSize: "0.95rem",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            position: 'relative',
            zIndex: 1
          }}
        >
          <thead>
            <tr
              style={{
                background: `linear-gradient(135deg, ${theme.gradientStart}20, ${theme.gradientEnd}20)`, 
                borderBottom: `2px solid ${theme.accentColor}40`
              }}
            >
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{
                    color: theme.textPrimary,
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    padding: "1.5rem 1rem", 
                    border: "none",
                    textAlign: "center",
                    background: "transparent",
                    position: 'relative'
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  borderBottom: `1px solid ${theme.tableBorder}`,
                  backgroundColor: rowIndex % 2 === 1 ? theme.stripedBackground : "transparent",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
                  cursor: "default"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.hoverBackground;
                  e.currentTarget.style.transform = "translateY(-2px)"; 
                  e.currentTarget.style.boxShadow = `0 8px 25px ${darkMode ? 'rgba(37, 99, 235, 0.15)' : 'rgba(0, 204, 102, 0.15)'}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = rowIndex % 2 === 1 ? theme.stripedBackground : "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      padding: "1.25rem 1rem", 
                      border: "none",
                      textAlign: "center",
                      verticalAlign: "middle",
                      fontSize: "0.95rem", 
                      fontWeight: "500",
                      lineHeight: 1.5 
                    }}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {footerText && (
            <tfoot>
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    background: `linear-gradient(135deg, ${theme.gradientStart}15, ${theme.gradientEnd}15)`, 
                    color: theme.textSecondary,
                    fontWeight: "600", 
                    fontSize: "0.95rem",
                    padding: "1.5rem 1rem", 
                    textAlign: "center",
                    border: "none",
                    borderTop: `1px solid ${theme.tableBorder}`,
                    borderRadius: "0 0 20px 20px" 
                  }}
                >
                  {footerText}
                </td>
              </tr>
            </tfoot>
          )}
        </Table>
      </div>
    </div>
  );
};

export default TableComponent;