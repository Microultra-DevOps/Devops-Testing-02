import { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { FiUser, FiLogOut } from "react-icons/fi";
import { BsSun, BsMoon } from "react-icons/bs";
import { AiOutlineScan } from "react-icons/ai"; 
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const NavbarComp = ({ toggleTheme, darkMode, scrolled }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState({ id: null, username: "User", email: "user@example.com" });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Theme configuration matching footer
  const theme = {
    sidebarBackground: darkMode ? "#1E1E1E" : "rgba(255, 255, 255, 0.95)",
    textPrimary: darkMode ? "#E1E1E1" : "#1e293b",
    accentColor: darkMode ? "#2563eb" : "#10b981",
    border: darkMode ? "#333333" : "rgba(0, 0, 0, 0.1)",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, username: decoded.username, email: decoded.email });
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    } else {
      navigate("/login");
    }

    // Detect fullscreen change
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [navigate]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <Navbar expand="lg" bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} style={navbarStyle(theme, scrolled)}>
      <Container fluid>
        {/* Welcome message and profile icon for small devices */}
        <div className="d-flex d-lg-none ms-auto align-items-center">
          <span style={welcomeStyle(theme)} className="me-3">
            Welcome, {user.username}
          </span>
          
          <Dropdown align="end" show={dropdownOpen} onToggle={toggleDropdown} autoClose="outside">
            <Dropdown.Toggle as={Button} variant="link" className="p-0 border-0 d-flex align-items-center">
              <FiUser size={20} color={theme.textPrimary} />
            </Dropdown.Toggle>
            
            <Dropdown.Menu align="end" style={dropdownStyle(theme)}>
              <div style={userInfoStyle(theme)}>
                <strong>{user.username}</strong>
                <div style={userEmailStyle(theme)}>{user.email}</div>
              </div>

              <div style={separatorStyle(theme)}></div>

              <Dropdown.Item onClick={toggleTheme} style={dropdownItemStyle(theme)}>
                {darkMode ? (
                  <BsSun size={16} style={{ marginRight: "8px" }} />
                ) : (
                  <BsMoon size={16} style={{ marginRight: "8px" }} />
                )}
                Switch to {darkMode ? "Light" : "Dark"} Mode
              </Dropdown.Item>

              <Dropdown.Item onClick={() => navigate(`/change-password/${user.id}`)} style={dropdownItemStyle(theme)}>
                <FiUser size={16} style={{ marginRight: "8px" }} />
                Change Password
              </Dropdown.Item>

              <Dropdown.Item onClick={handleLogout} style={dropdownItemStyle(theme)}>
                <FiLogOut size={16} style={{ marginRight: "8px" }} />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Original navbar content for desktop */}
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto d-flex align-items-center gap-3">
            <span className="d-none d-lg-block" style={welcomeStyle(theme)}>
              Welcome, {user.username}
            </span>

            {/* Other icons visible on desktop only */}
            <Button variant="link" onClick={toggleTheme} className="p-0 border-0 d-none d-lg-block" style={{ fontSize: "20px" }}>
              {darkMode ? <BsSun size={20} color="#ffc107" /> : <BsMoon size={20} color={theme.textPrimary} />}
            </Button>

            <Button variant="link" onClick={toggleFullscreen} className="p-0 border-0 d-none d-lg-block" style={{ fontSize: "20px" }}>
              <AiOutlineScan size={22} color={theme.textPrimary} />
            </Button>

            {/* Profile icon aligned after AiOutlineScan for desktop */}
            <div className="d-none d-lg-block">
              <Dropdown align="end" show={dropdownOpen} onToggle={toggleDropdown} autoClose="outside">
                <Dropdown.Toggle as={Button} variant="link" className="p-0 border-0 d-flex align-items-center" onClick={toggleDropdown}>
                  <FiUser size={20} color={theme.textPrimary} />
                </Dropdown.Toggle>

                <Dropdown.Menu align="end" style={dropdownStyle(theme)}>
                  <div style={userInfoStyle(theme)}>
                    <strong>{user.username}</strong>
                    <div style={userEmailStyle(theme)}>{user.email}</div>
                  </div>

                  <div style={separatorStyle(theme)}></div>

                  <Dropdown.Item onClick={toggleTheme} style={dropdownItemStyle(theme)}>
                    {darkMode ? (
                      <BsSun size={16} style={{ marginRight: "8px" }} />
                    ) : (
                      <BsMoon size={16} style={{ marginRight: "8px" }} />
                    )}
                    Switch to {darkMode ? "Light" : "Dark"} Mode
                  </Dropdown.Item>

                  <Dropdown.Item onClick={() => navigate(`/change-password/${user.id}`)} style={dropdownItemStyle(theme)}>
                    <FiUser size={16} style={{ marginRight: "8px" }} />
                    Change Password
                  </Dropdown.Item>

                  <Dropdown.Item onClick={handleLogout} style={dropdownItemStyle(theme)}>
                    <FiLogOut size={16} style={{ marginRight: "8px" }} />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// Updated styles using theme system
const navbarStyle = (theme, scrolled) => ({
  height: "60px",
  transition: "all 0.3s ease",
  background: theme.sidebarBackground,
  backdropFilter: 'blur(20px)',
  borderBottom: `3px solid ${theme.border}`,
  position: scrolled ? "fixed" : "relative",
  top: 0,
  width: "100%",
  zIndex: 1000,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
});

const welcomeStyle = (theme) => ({
  color: theme.textPrimary,
  fontWeight: "600",
  fontSize: "0.875rem",
});

const dropdownStyle = (theme) => ({
  backgroundColor: theme.sidebarBackground,
  color: theme.textPrimary,
  width: "200px",
  padding: "8px 0",
  border: `1px solid ${theme.border}`,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
});

const userInfoStyle = (theme) => ({
  textAlign: "center",
  padding: "8px 12px",
  color: theme.textPrimary,
});

const userEmailStyle = (theme) => ({
  fontSize: "0.75rem",
  color: theme.textPrimary,
  opacity: 0.7,
});

const separatorStyle = (theme) => ({
  borderTop: `1px solid ${theme.border}`,
  margin: "8px 0",
});

const dropdownItemStyle = (theme) => ({
  backgroundColor: theme.sidebarBackground,
  color: theme.textPrimary,
  padding: "6px 12px",
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "background-color 0.3s ease, color 0.3s ease",
  fontWeight: "500",
});

export default NavbarComp;