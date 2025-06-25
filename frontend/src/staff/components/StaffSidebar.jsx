import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { List } from "react-bootstrap-icons";
import { 
  FiMenu, FiX, FiHome, FiFileText, FiList, FiFilePlus, 
  FiCheckCircle, FiCalendar, FiAward, FiUsers, FiRepeat, 
  FiLayers, FiMail, FiClipboard, FiBriefcase, FiDatabase, 
  FiCodepen, FiCreditCard, FiBarChart, FiHelpCircle, FiChevronDown,
  FiFile, FiUpload, FiCheck, FiLayout, FiUserPlus, FiClock,
  FiBook, FiBookOpen, FiFileMinus, FiFilePlus as FiFilePlusAlt,
  FiUserCheck, FiUserX, FiMapPin, FiSettings, FiTruck, FiDollarSign,
  FiPieChart, FiMessageSquare, FiGrid, FiPackage, FiPlus,
  FiPenTool,
  FiDivideCircle
} from "react-icons/fi";
import { FaBuildingColumns } from "react-icons/fa6";
import logo from "../../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const StaffSidebar = ({ darkMode }) => {
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const location = useLocation();

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  // Theme configuration
  const theme = {
    backgroundColor: darkMode ? "#000000" : "#f8fafc",
    sidebarBackground: darkMode ? "#1E1E1E" : "rgba(255, 255, 255, 0.95)",
    toggleBackground: darkMode ? "#2c3e50" : "rgba(255, 255, 255, 0.9)",
    accentColor: darkMode ? "#2563eb" : "#10b981",
    textPrimary: darkMode ? "#E1E1E1" : "#1e293b",
    textSecondary: darkMode ? "#A0A0A0" : "#64748b",
    border: darkMode ? "#333333" : "rgba(0, 0, 0, 0.1)",
    gradientStart: darkMode ? "#2563eb" : "#10b981",
    gradientEnd: darkMode ? "#1e40af" : "#059669",
    hoverBackground: darkMode ? "#007bff" : "#10b981",
    activeBorder: darkMode ? "#2563eb" : "#10b981",
    dropdownBackground: darkMode ? "#2a2a2a" : "#f8f9fa",
    dropdownHover: darkMode ? "#3a3a3a" : "#e9ecef",
  };

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(hoverTimeoutRef.current);
      setShow(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      hoverTimeoutRef.current = setTimeout(() => {
        if (!sidebarRef.current?.matches(':hover')) {
          setShow(false);
          closeAllDropdowns();
        }
      }, 300);
    }
  };

  const toggleSidebar = () => {
    setShow(!show);
    if (!show) {
      closeAllDropdowns();
    }
  };

  const toggleDropdown = (key) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleNavLinkClick = () => {
    if (isMobile) {
      setShow(false);
    }
    closeAllDropdowns();
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && show && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const toggleButton = document.querySelector('[data-sidebar-toggle]');
        if (toggleButton && !toggleButton.contains(event.target)) {
          setShow(false);
          closeAllDropdowns();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [show, isMobile]);

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const isActiveRoute = (route) => {
    return location.pathname === route;
  };

  // Navigation items configuration with icons for dropdown items
  const navItems = [
    {
      title: "Home",
      icon: FiHome,
      route: "/staff-home",
      key: "home"
    },
    
    
    {
      title: "Intern Request",
      icon: FiPenTool,
      key: "intern-request",
      hasDropdown: true,
      dropdownItems: [
        { title: "Create Request", route:"/create-intern-request", icon: FiFilePlus },
        { title: "View My Requests", route:"/view-my-requests", icon: FiList },
      ]
    },
    {
      title: "My Interns Pending",
      icon: FiDivideCircle,
      route: "/my-interns-pending",
      key: "my-interns-pending"
    },
    {
      title: "My Interns Placemet",
      icon: FiBriefcase,
      route: "/my-interns-placement",
      key: "my-interns-placement"
    },
    {
      title: " My Interns Allocations",
      icon: FaBuildingColumns,
      route: "/my-interns-allocations",
      key: "my-interns-allocations"
    },
    {
      title: "My Certificate Request",
      icon: FiClipboard,
      route: "/my-certificate-request",
      key: "my-certificate-request",
    },
    {
      title: "Help & Support",
      icon: FiHelpCircle,
      key: "staff-help-support",
      route:"/staff-help-support",
    },
    
  ];

  return (
    <>
      {/* Sidebar Toggle Button */}
      <motion.div 
        data-sidebar-toggle
        className="position-fixed"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          left: show ? '260px' : '10px',
          top: '5px',
          zIndex: 2000,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: theme.toggleBackground,
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '10px',
          boxShadow: darkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          cursor: 'pointer',
          border: `1px solid ${theme.border}`
        }}
        onClick={toggleSidebar}
        onMouseEnter={() => !isMobile && !show && setShow(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {show ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiX size={24} color={theme.textPrimary} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiMenu size={24} color={theme.textPrimary} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
            }}
            onClick={() => {
              setShow(false);
              closeAllDropdowns();
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {show && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '280px',
              height: '100vh',
              background: theme.sidebarBackground,
              backdropFilter: 'blur(20px)',
              color: theme.textPrimary,
              zIndex: isMobile ? 1001 : 1000,
              overflowY: 'auto',
              boxShadow: darkMode 
                ? '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}
          >
            {/* Custom Scrollbar */}
            <style>{`
              ::-webkit-scrollbar {
                width: 6px;
              }
              ::-webkit-scrollbar-track {
                background: transparent;
              }
              ::-webkit-scrollbar-thumb {
                background: ${theme.accentColor}40;
                border-radius: 10px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: ${theme.accentColor}60;
              }
            `}</style>

            {/* Sidebar Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: `linear-gradient(135deg, ${theme.gradientStart}10, ${theme.gradientEnd}10)`,
                padding: "24px 20px",
                display: 'flex',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.border}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={logo}
                  alt="Logo"
                  style={{ 
                    width: "90px", 
                    height: "35px", 
                    marginRight: "15px",
                    filter: darkMode ? 'brightness(1.2) contrast(0.9)' : 'brightness(1)'
                  }}
                />
                <div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      fontSize: "0.85rem",
                      color: theme.textPrimary,
                      display: "block",
                      fontWeight: "700",
                      letterSpacing: "0.5px"
                    }}
                  >
                    Sri Lanka Telecom
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      fontSize: "0.95rem",
                      color: theme.textSecondary,
                      display: "block",
                      fontWeight: "500"
                    }}
                  >
                    Mobitel
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Sidebar Body */}
            <div style={{
              height: "calc(100vh - 120px)",
              padding: "20px 0",
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Navigation Links */}
              <div style={{ flex: 1 }}>
                <Nav className="flex-column">
                  {navItems.map((item, index) => {
                    const isActive = isActiveRoute(item.route) || 
                                    (item.hasDropdown && item.dropdownItems.some(di => isActiveRoute(di.route)));
                    const isHovered = hovered === item.key;
                    const isDropdownOpen = activeDropdown === item.key;
                    
                    return (
                      <motion.div 
                        key={item.key} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <div style={{ position: 'relative' }}>
                          <Nav.Link
                            as={item.hasDropdown ? 'div' : Link}
                            to={!item.hasDropdown ? item.route : null}
                            onClick={() => {
                              if (item.hasDropdown) {
                                toggleDropdown(item.key);
                              } else {
                                handleNavLinkClick();
                              }
                            }}
                            onMouseEnter={() => !isMobile && setHovered(item.key)}
                            onMouseLeave={() => !isMobile && setHovered(null)}
                            style={{
                              color: isActive || isHovered ? "#fff" : theme.textPrimary,
                              background: isActive 
                                ? `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`
                                : isHovered 
                                  ? `linear-gradient(135deg, ${theme.gradientStart}90, ${theme.gradientEnd}90)`
                                  : "transparent",
                              borderRadius: isDropdownOpen ? "12px 12px 0 0" : "12px",
                              padding: "14px 20px",
                              margin: "4px 16px",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '1rem',
                              fontWeight: isActive ? '600' : '500',
                              textDecoration: 'none',
                              position: 'relative',
                              overflow: 'hidden',
                              border: isActive ? `1px solid ${theme.activeBorder}40` : 'none',
                              boxShadow: isActive 
                                ? `0 8px 25px ${theme.accentColor}30`
                                : isHovered 
                                  ? `0 4px 15px ${theme.accentColor}20`
                                  : 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeIndicator"
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: '4px',
                                  background: '#fff',
                                  borderRadius: '0 4px 4px 0'
                                }}
                              />
                            )}
                            
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              style={{
                                marginRight: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px'
                              }}
                            >
                              <item.icon size={20} />
                            </motion.div>
                            
                            <span style={{ 
                              letterSpacing: '0.3px',
                              flex: 1
                            }}>
                              {item.title}
                            </span>

                            {item.hasDropdown && (
                              <motion.div
                                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                                style={{ 
                                  marginLeft: 'auto',
                                  transition: 'transform 0.2s ease' 
                                }}
                              >
                                <FiChevronDown size={16} />
                              </motion.div>
                            )}

                            {isHovered && !isActive && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: `radial-gradient(circle at center, ${theme.accentColor}, transparent)`,
                                  pointerEvents: 'none'
                                }}
                              />
                            )}
                          </Nav.Link>

                          {/* Dropdown Content with enhanced hover effects */}
                          {item.hasDropdown && isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                background: theme.dropdownBackground,
                                borderRadius: '0 0 12px 12px',
                                margin: '0 16px',
                                overflow: 'hidden',
                                boxShadow: darkMode 
                                  ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                                  : '0 4px 6px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              {item.dropdownItems.map((dropdownItem, idx) => {
                                const isDropdownItemActive = isActiveRoute(dropdownItem.route);
                                const dropdownItemHoverBg = darkMode 
                                  ? 'rgba(59, 130, 246, 0.2)' 
                                  : 'rgba(16, 185, 129, 0.1)';
                                
                                return (
                                  <motion.div
                                    key={idx}
                                    whileHover={{ 
                                      backgroundColor: dropdownItemHoverBg,
                                      transition: { duration: 0.1 }
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                      background: isDropdownItemActive ? theme.dropdownHover : 'transparent',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <Nav.Link
                                      as={Link}
                                      to={dropdownItem.route}
                                      onClick={handleNavLinkClick}
                                      style={{
                                        padding: '12px 20px 12px 52px',
                                        color: isDropdownItemActive ? theme.accentColor : theme.textPrimary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '0.9rem',
                                        fontWeight: isDropdownItemActive ? '600' : '400',
                                        textDecoration: 'none',
                                        position: 'relative'
                                      }}
                                    >
                                      {/* Active indicator for dropdown items */}
                                      {isDropdownItemActive && (
                                        <motion.div
                                          layoutId="dropdownActiveIndicator"
                                          style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '4px',
                                            background: theme.accentColor,
                                            borderRadius: '0 4px 4px 0'
                                          }}
                                        />
                                      )}

                                      {/* Dropdown item icon with hover effect */}
                                      <motion.div
                                        style={{ 
                                          marginRight: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '20px'
                                        }}
                                        whileHover={{ 
                                          scale: 1.1,
                                          color: theme.accentColor
                                        }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                      >
                                        <dropdownItem.icon 
                                          size={16} 
                                          color={isDropdownItemActive ? theme.accentColor : theme.textPrimary}
                                        />
                                      </motion.div>
                                      
                                      {/* Dropdown item text */}
                                      <motion.span
                                        whileHover={{ 
                                          x: 2,
                                          color: theme.accentColor
                                        }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                      >
                                        {dropdownItem.title}
                                      </motion.span>
                                    </Nav.Link>
                                  </motion.div>
                                );
                              })}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </Nav>
              </div>

              {/* Footer decoration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderTop: `1px solid ${theme.border}`,
                  background: `linear-gradient(135deg, ${theme.gradientStart}05, ${theme.gradientEnd}05)`
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  color: theme.textSecondary,
                  fontWeight: '500'
                }}>
                  Staff Portal v1.0
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StaffSidebar;