
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "../../assets/logo.png";

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2"/>
    <path d="M12 21v2"/>
    <path d="M4.22 4.22l1.42 1.42"/>
    <path d="M18.36 18.36l1.42 1.42"/>
    <path d="M1 12h2"/>
    <path d="M21 12h2"/>
    <path d="M4.22 19.78l1.42-1.42"/>
    <path d="M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5l7 7-7 7"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/>
    <path d="M12 19l-7-7 7-7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
    <polyline points="17,6 23,6 23,12"/>
  </svg>
);

const AwardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
  </svg>
);

const LearnMorePage = ({ darkMode: propDarkMode, toggleTheme: propToggleTheme }) => {
  const [internalDarkMode, setInternalDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Use prop darkMode if provided, otherwise use internal state
  const darkMode = propDarkMode !== undefined ? propDarkMode : internalDarkMode;

  const darkTheme = {
    backgroundColor: "#0a192f",
    color: "white",
    accentColor: "#00aaff",
    textSecondary: "#94a3b8",
    cardBg: "rgba(15, 30, 55, 0.3)",
    darkMode: true,
  };

  const lightTheme = {
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    accentColor: "#00cc66",
    textSecondary: "#64748b",
    cardBg: "rgba(255, 255, 255, 0.4)",
    darkMode: false,
  };

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    setTimeout(() => setIsVisible(true), 100);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      const newDarkMode = !internalDarkMode;
      setInternalDarkMode(newDarkMode);
    }
  };

  
  const handleApplyNow = () => {
      window.location.href = '/login';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const programFeatures = [
    {
      icon: <UsersIcon />,
      title: "Mentorship Program",
      description: "Get paired with experienced professionals who will guide you throughout your internship journey."
    },
    {
      icon: <BookIcon />,
      title: "Comprehensive Training",
      description: "Access cutting-edge training materials and workshops covering the latest technologies and industry practices."
    },
    {
      icon: <TrendingUpIcon />,
      title: "Career Development",
      description: "Build your professional network and develop skills that will accelerate your career growth."
    },
    {
      icon: <AwardIcon />,
      title: "Recognition & Certification",
      description: "Receive official certificates and recognition for your contributions and achievements."
    }
  ];

  const internshipTracks = [
    {
      title: "Software Development",
      duration: "6 months",
      skills: ["React", "Node.js", "Python", "Database Management"],
      description: "Work on real-world applications and contribute to SLT-Mobitel's digital transformation initiatives."
    },
    {
      title: "Network Engineering",
      duration: "6 months",
      skills: ["5G Technology", "Network Security", "IoT", "Cloud Infrastructure"],
      description: "Gain hands-on experience with telecommunications infrastructure and emerging network technologies."
    },
    {
      title: "Data Analytics",
      duration: "4-6 months",
      skills: ["Machine Learning", "Data Visualization", "Big Data", "Business Intelligence"],
      description: "Analyze customer data and business metrics to drive strategic decision-making."
    },
    {
      title: "Cybersecurity",
      duration: "6 months",
      skills: ["Ethical Hacking", "Risk Assessment", "Security Protocols", "Incident Response"],
      description: "Protect critical infrastructure and customer data through advanced security measures."
    }
  ];

  const benefits = [
    "Competitive monthly stipend",
    "Flexible working arrangements",
    "Access to company facilities and resources",
    "Professional development workshops",
    "Networking opportunities with industry leaders",
    "Potential for full-time employment",
    "Certificate of completion",
    "Mentorship from senior professionals"
  ];

  const stats = [
    { number: "500+", label: "Successful Interns" },
    { number: "85%", label: "Conversion Rate" },
    { number: "50+", label: "Partner Universities" },
    { number: "4.8/5", label: "Program Rating" }
  ];

  const faqData = [
    {
      q: "How long is the internship program?",
      a: "Our internship programs typically run for 4-6 months, depending on the track you choose. This duration allows for comprehensive learning and meaningful project contributions."
    },
    {
      q: "Is the internship paid?",
      a: "Yes, all our interns receive a competitive monthly stipend along with other benefits such as transport allowance and access to company facilities."
    },
    {
      q: "Can international students apply?",
      a: "Yes, we welcome applications from international students who are currently studying in Sri Lanka or have the necessary work permits."
    },
    {
      q: "What is the selection process?",
      a: "The selection process includes online application screening, technical assessments, and interviews. We evaluate candidates based on academic performance, technical skills, and cultural fit."
    },
    {
      q: "Are there opportunities for full-time employment?",
      a: "Yes, outstanding interns have the opportunity to be considered for full-time positions upon graduation, with an 85% conversion rate for top performers."
    }
  ];

  const timelineData = [
    { step: "1", title: "Apply Online", desc: "Submit your application through our portal", date: "Rolling Basis" },
    { step: "2", title: "Initial Screening", desc: "Review of applications and documents", date: "1-2 weeks" },
    { step: "3", title: "Interview Process", desc: "Technical and behavioral interviews", date: "2-3 weeks" },
    { step: "4", title: "Program Starts", desc: "Begin your internship journey", date: "Next intake" }
  ];

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.color,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      {/* Background Effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.1,
        pointerEvents: 'none',
        background: darkMode 
          ? 'radial-gradient(circle at 20% 50%, #00aaff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0066ff 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, #00cc66 0%, transparent 50%), radial-gradient(circle at 80% 20%, #00aa88 0%, transparent 50%)'
      }} />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Enhanced Navbar */}
        <nav style={{ 
          background: "transparent", 
          position: "fixed", 
          top: 0,
          width: "100%",
          padding: isMobile ? "1rem" : "1rem 2rem",
          zIndex: 10,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto"
          }}>
            {/* Logo and Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              
            <div 
              onClick={() => window.location.reload()} 
              style={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
                <img 
                  src={Logo} 
                  alt="Logo" 
                  style={{ height: '40px', width: 'auto' }} 
                />
            </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "1rem" }}>
              <button 
                onClick={toggleTheme}
                style={{ 
                  background: "transparent",
                  border: "none",
                  color: theme.color,
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "50%",
                  transition: "all 0.3s ease",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {darkMode ? <SunIcon /> : <MoonIcon />}
              </button>
              
              <button 
                style={{ 
                  background: "transparent", 
                  color: theme.color,
                  border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backdropFilter: 'blur(10px)',
                  transition: "all 0.3s ease",
                  fontSize: '0.9rem'
                }} 
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Container */}
        <div style={{ 
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "100px 1rem 2rem" : "100px 2rem 2rem"
        }}>
          {/* Hero Section */}
          <div 
            style={{ 
              textAlign: 'center', 
              marginBottom: '4rem',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease'
            }}
          >
            <h1 style={{ 
              fontSize: isMobile ? "2rem" : isTablet ? "2.5rem" : "3rem", 
              color: theme.accentColor,
              lineHeight: 1.2,
              fontWeight: "800",
              marginBottom: "1.5rem",
              textShadow: `0 0 15px ${theme.accentColor}40`
            }}>
              INTERNSHIP PROGRAM
            </h1>
            <p style={{ 
              color: theme.textSecondary,
              fontSize: isMobile ? "1rem" : "1.2rem",
              marginBottom: "2rem",
              lineHeight: 1.6,
              maxWidth: "800px",
              margin: "0 auto 2rem"
            }}>
              Join Sri Lanka's leading telecommunications company and kickstart your career with hands-on experience, 
              mentorship, and real-world projects that make a difference.
            </p>
          </div>

          {/* Statistics Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '2rem',
            marginBottom: '4rem',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.2s'
          }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  background: theme.cardBg,
                  padding: '2rem 1rem',
                  borderRadius: '16px',
                  textAlign: 'center',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  boxShadow: `0 8px 25px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ 
                  fontSize: isMobile ? '1.8rem' : '2.5rem', 
                  fontWeight: '800', 
                  color: theme.accentColor,
                  marginBottom: '0.5rem'
                }}>
                  {stat.number}
                </div>
                <div style={{ 
                  color: theme.textSecondary, 
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Program Features */}
          <section 
            style={{ 
              marginBottom: '4rem',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease 0.4s'
            }}
          >
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              fontWeight: '700',
              color: theme.color,
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              Why Choose Our Program?
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
              gap: '2rem'
            }}>
              {programFeatures.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    background: theme.cardBg,
                    padding: '2rem',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    boxShadow: `0 8px 25px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    color: theme.accentColor,
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {feature.icon}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>
                      {feature.title}
                    </h3>
                  </div>
                  <p style={{
                    color: theme.textSecondary,
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Internship Tracks */}
          <section 
            style={{ 
              marginBottom: '4rem',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease 0.6s'
            }}
          >
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              fontWeight: '700',
              color: theme.color,
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              Internship Tracks
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
              gap: '2rem'
            }}>
              {internshipTracks.map((track, index) => (
                <div
                  key={index}
                  style={{
                    background: theme.cardBg,
                    padding: '2rem',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    boxShadow: `0 8px 25px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <h3 style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: '600', 
                      color: theme.accentColor,
                      margin: 0
                    }}>
                      {track.title}
                    </h3>
                    <span style={{
                      background: theme.accentColor,
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {track.duration}
                    </span>
                  </div>
                  
                  <p style={{
                    color: theme.textSecondary,
                    lineHeight: 1.6,
                    marginBottom: '1.5rem'
                  }}>
                    {track.description}
                  </p>
                  
                  <div>
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: theme.color,
                      marginBottom: '0.5rem'
                    }}>
                      Key Skills:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {track.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          style={{
                            background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            color: theme.textSecondary,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section 
            style={{ 
              marginBottom: '4rem',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease 0.8s'
            }}
          >
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              fontWeight: '700',
              color: theme.color,
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              Program Benefits
            </h2>
            
            <div style={{
              background: theme.cardBg,
              padding: '2rem',
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: `0 8px 25px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0'
                    }}
                  >
                    <div style={{ color: theme.accentColor, flexShrink: 0 }}>
                      <CheckIcon />
                    </div>
                    <span style={{ color: theme.textSecondary, fontSize: '0.95rem' }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section style={{ 
            textAlign: 'center',
            background: theme.cardBg,
            padding: '3rem 2rem',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: `0 8px 25px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              fontWeight: '700',
              color: theme.color,
              marginBottom: '1rem'
            }}>
              Ready to Start Your Journey?
            </h2>
            <p style={{
              color: theme.textSecondary,
              fontSize: '1.1rem',
              marginBottom: '2rem',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Applications are now open for our next internship cohort. Don't miss this opportunity to 
              jumpstart your career with Sri Lanka's telecommunications leader.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleApplyNow}
                style={{
                  background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                  color: "white",
                  border: "none",
                  padding: isMobile ? "0.8rem 1.5rem" : "1rem 2rem",
                  borderRadius: "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: `0 8px 25px ${theme.accentColor}40`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                Apply Now <ArrowRightIcon />
              </button>
              
              <button
                onClick={() => window.open('mailto:internships@slt.lk', '_blank')}
                style={{
                  background: 'transparent',
                  color: theme.accentColor,
                  border: `2px solid ${theme.accentColor}`,
                  padding: isMobile ? "0.8rem 1.5rem" : "1rem 2rem",
                  borderRadius: "12px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  backdropFilter: 'blur(10px)',
                  transition: "all 0.3s ease"
                }}
              >
                Contact Us
              </button>
            </div>
          </section>

          {/* Application Timeline */}
          <motion.section style={{ marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              fontWeight: '700',
              color: theme.color,
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              Application Timeline
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: '2rem',
              position: 'relative'
            }}>
              {[
                { step: "1", title: "Apply Online", desc: "Submit your application through our portal", date: "Rolling Basis" },
                { step: "2", title: "Initial Screening", desc: "Review of applications and documents", date: "1-2 weeks" },
                { step: "3", title: "Interview Process", desc: "Technical and behavioral interviews", date: "2-3 weeks" },
                { step: "4", title: "Program Starts", desc: "Begin your internship journey", date: "Next intake" }
              ].map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                  style={{
                    background: theme.cardBg,
                    padding: '2rem 1.5rem',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    boxShadow: `0 8px 25px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                  }}>
                    {phase.step}
                  </div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: theme.color,
                    marginBottom: '0.5rem'
                  }}>
                    {phase.title}
                  </h3>
                  <p style={{
                    color: theme.textSecondary,
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    marginBottom: '1rem'
                  }}>
                    {phase.desc}
                  </p>
                  <div style={{
                    background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    color: theme.textSecondary,
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {phase.date}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Requirements Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            style={{ marginBottom: '4rem' }}
          >
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              fontWeight: '700',
              color: theme.color,
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              Eligibility Requirements
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '2rem'
            }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                style={{
                  background: theme.cardBg,
                  padding: '2rem',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  boxShadow: `0 8px 25px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`
                }}
              >
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: theme.accentColor,
                  marginBottom: '1.5rem'
                }}>
                  Academic Requirements
                </h3>
                <ul style={{
                  color: theme.textSecondary,
                  lineHeight: 1.8,
                  paddingLeft: '1.5rem'
                }}>
                  <li>Currently enrolled in a recognized university</li>
                  <li>Pursuing a degree in Engineering, IT, or related field</li>
                  <li>Minimum GPA of 3.0 or equivalent</li>
                  <li>Completed at least 2 years of undergraduate studies</li>
                  <li>Strong academic performance in relevant subjects</li>
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                style={{
                  background: theme.cardBg,
                  padding: '2rem',
                  borderRadius: '16px',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  boxShadow: `0 8px 25px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`
                }}
              >
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: theme.accentColor,
                  marginBottom: '1.5rem'
                }}>
                  Personal Requirements
                </h3>
                <ul style={{
                  color: theme.textSecondary,
                  lineHeight: 1.8,
                  paddingLeft: '1.5rem'
                }}>
                  <li>Excellent communication skills in English</li>
                  <li>Strong problem-solving and analytical abilities</li>
                  <li>Ability to work in a team environment</li>
                  <li>Passion for technology and innovation</li>
                  <li>Commitment to the full internship duration</li>
                </ul>
              </motion.div>
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            style={{ marginBottom: '4rem' }}
          >
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.2rem',
              fontWeight: '700',
              color: theme.color,
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              Frequently Asked Questions
            </h2>
            
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {[
                {
                  q: "How long is the internship program?",
                  a: "Our internship programs typically run for 4-6 months, depending on the track you choose. This duration allows for comprehensive learning and meaningful project contributions."
                },
                {
                  q: "Is the internship paid?",
                  a: "Yes, all our interns receive a competitive monthly stipend along with other benefits such as transport allowance and access to company facilities."
                },
                {
                  q: "Can international students apply?",
                  a: "Yes, we welcome applications from international students who are currently studying in Sri Lanka or have the necessary work permits."
                },
                {
                  q: "What is the selection process?",
                  a: "The selection process includes online application screening, technical assessments, and interviews. We evaluate candidates based on academic performance, technical skills, and cultural fit."
                },
                {
                  q: "Are there opportunities for full-time employment?",
                  a: "Yes, outstanding interns have the opportunity to be considered for full-time positions upon graduation, with an 85% conversion rate for top performers."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.7 + index * 0.1 }}
                  style={{
                    background: theme.cardBg,
                    padding: '2rem',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    boxShadow: `0 8px 25px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                    marginBottom: '1.5rem'
                  }}
                >
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: theme.color,
                    marginBottom: '1rem'
                  }}>
                    {faq.q}
                  </h3>
                  <p style={{
                    color: theme.textSecondary,
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Final CTA */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            style={{
              textAlign: 'center',
              background: `linear-gradient(135deg, ${theme.accentColor}20, ${darkMode ? '#0066ff20' : '#00aa8820'})`,
              padding: '3rem 2rem',
              borderRadius: '20px',
              border: `1px solid ${theme.accentColor}40`,
              marginBottom: '2rem'
            }}
          >
            <h2 style={{
              fontSize: isMobile ? '1.5rem' : '1.8rem',
              fontWeight: '700',
              color: theme.color,
              marginBottom: '1rem'
            }}>
              Take the Next Step in Your Career
            </h2>
            <p style={{
              color: theme.textSecondary,
              fontSize: '1rem',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              Join hundreds of successful graduates who started their careers with SLT-Mobitel
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApplyNow}
              style={{
                background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                color: "white",
                border: "none",
                padding: isMobile ? "1rem 2rem" : "1.2rem 2.5rem",
                borderRadius: "12px",
                fontSize: isMobile ? "1rem" : "1.1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: `0 8px 25px ${theme.accentColor}40`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              Start Your Application <ArrowRightIcon />
            </motion.button>
          </motion.section>
        </div>
      </div>

      {/* Enhanced Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body {
          overflow-x: hidden;
        }
        
        button:hover {
          transform: translateY(-1px);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#0a192f' : '#f1f5f9'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme.accentColor};
          border-radius: 3px;
        }
        
        /* List styling */
        ul {
          list-style: none;
        }
        
        ul li {
          position: relative;
          padding-left: 0;
        }
        
        ul li::before {
          content: '•';
          color: ${theme.accentColor};
          font-weight: bold;
          position: absolute;
          left: -1.5rem;
        }
      `}</style>
    </div>
  );
};

export default LearnMorePage; 