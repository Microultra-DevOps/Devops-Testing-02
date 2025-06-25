import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Row, Col} from "react-bootstrap";
import NavbarComp from "./components/pages/NavbarComp";
import IndividualSidebar from "./individual/components/IndividualSidebar";
import InstituteSidebar from "./institute/components/InstituteSidebar";
import AdminSidebar from "./admin/components/AdminSidebar";
import StaffSidebar from "./staff/components/StaffSidebar";
import { Footer } from "./components/pages/Footer";
import ConnectivityNotification from "./components/notifications/ConnectivityNotification";
import LandingPage from "./components/login/LandingPage";
import ProtectedRoute from "./components/login/ProtectedRoute";
import LoginPage from "./components/login/LoginPage";
import RegisterPage from "./components/login/RegisterPage";
import IndividualHome from "./individual/pages/home/IndividualHome";
import IndividualAddCV from "./individual/pages/requestinternship/IndividualAddCV";
import BankDetails from "./individual/pages/bank/BankDetails";
import HelpAndSupport from "./individual/pages/Help/HelpAndSupport";
import StatusReport from "./individual/pages/status/StatusReport";
import TrainingCertificateRequest from "./individual/pages/certificaterequest/TrainingCertificateRequest";
import InstituteHome from "./institute/pages/home/InstituteHome";
import InstituteAllApplications from "./institute/pages/instituteapplication/InstituteAllApplications";
import InstituteAddCV from "./institute/pages/requestinternship/InstituteAddCV";
import ViewCV from "./components/pages/ViewCV";
import EditCV from "./components/pages/EditCV";
import InstituteHelp from "./institute/pages/help/InstituteHelp";
import AdminHome from "./admin/pages/home/AdminHome";
import ViewAllCVs from "./admin/pages/managecv/ViewAllCVs";
import DeletedCVsPage  from "./admin/pages/managecv/DeletedCVsPage";
import AdminAddCVs from "./admin/pages/managecv/AdminAddCVs";
import ApproveCVs from "./admin/pages/managecv/ApproveCVs";
import ViewAllInterviews from "./admin/pages/interview/ViewAllInterviews";
import AddNewInterview from "./admin/pages/interview/AddNewInterview";
import ViewInterview from "./admin/pages/interview/ViewInterview";
import EditInterview from "./admin/pages/interview/EditInterview";
import ScheduleInterviews from "./admin/pages/interview/ScheduleInterviews";
import InterviewResults from "./admin/pages/interview/InterviewResults";
import ViewAllInductions from "./admin/pages/induction/ViewAllInductions";
import ViewAllInstitute from "./admin/pages/institute/ViewAllInstitute";
import ViewInstituteDetails from "./admin/pages/institute/ViewInstituteDetails";
import EditInstitute from "./admin/pages/institute/EditInstitute";
import ApproveInstitute from "./admin/pages/institute/ApproveInstitute";
import AddNewInstitute from "./admin/pages/institute/AddNewInstitute";
import AddNewInduction from "./admin/pages/induction/AddNewInduction";
import InductionResults from "./admin/pages/induction/InductionResults";
import ViewAllSchemes from "./admin/pages/scheme/ViewAllSchemes";
import ViewInductionDetails from "./admin/pages/induction/ViewInductionDetails";
import EditInduction from "./admin/pages/induction/EditInduction";
import AddNewScheme from "./admin/pages/scheme/AddNewScheme";
import AddEmployee from './admin/pages/scheme/AddEmployee';
import ViewEmployees from './admin/pages/scheme/ViewEmployee';
import ViewScheme from "./admin/pages/scheme/ViewScheme";
import AddStaff from "./admin/pages/scheme/AddStaff";
import EditScheme from "./admin/pages/scheme/EditScheme";
import EmailConfirmPage from "./components/login/EmailConfirmPage";
import VerifyOTPPage from "./components/login/VerifyOTPPage";
import ScheduleInduction from "./admin/pages/induction/ScheduleInduction";
import ScheduleScheme from "./admin/pages/assignscheme/ScheduleScheme";
import InternLifeCycle from "./admin/pages/lifecycle/InternLifeCycle";
import StaffHome from "./staff/pages/home/StaffHome";

import InternPendingRequests from "./staff/pages/internpendingrequests/InternPendingRequests";
import CertificateRequests from "./staff/pages/certificaterequest/CertificateRequests";
import InternPlacements from "./staff/pages/internplacements/InternPlacements";
import StaffHelp from "./staff/pages/Help/StaffHelp";
import AdminHelp from "./admin/pages/Help/AdminHelp";
import MyInternRequests from "./staff/pages/internrequests/MyInternRequests";
import CreateInternRequest from "./staff/pages/internrequests/CreateInternRequest";
import ViewInternRequest from "./staff/pages/internrequests/ViewInternRequest";
import EditInternRequest from "./staff/pages/internrequests/EditInternRequest";
import StaffInternRequest from "./admin/pages/internrequest/StaffInternRequest";

import AllCertificate from "./admin/pages/templates/AllCertificate";
import AllCertificateLetters from "./admin/pages/templates/AllCertificateLetters";
import AllPlacementLetters from "./admin/pages/templates/AllPlacementLetters";
import AddCertificate from "./admin/pages/templates/AddCertificate";
import AddCertificateLetter from "./admin/pages/templates/AddCertificateLetter";
import AddPlacementLetter from "./admin/pages/templates/AddPlacementLetter";
import EditCertificate from "./admin/pages/templates/EditCertificate";
import EditCertificateLetter from "./admin/pages/templates/EditCertificateLetter";
import EditPlacementLetter from "./admin/pages/templates/EditPlacementLetter";
import ViewCertificate  from "./admin/pages/templates/ViewCertificate";
import ViewPlacementLetter from "./admin/pages/templates/ViewPlacementLetter";
import ViewCertificateLetter from "./admin/pages/templates/ViewCertificateLetter";
import InternsStatus from "./admin/pages/internstatus/InternsStatus";
import InternBankDetails from "./admin/pages/bankdetails/InternBankDetails";
import AddBankDetails  from "./admin/pages/bankdetails/AddBankDetails";
import EditBankDetails  from "./admin/pages/bankdetails/EditBankDetails";
import AddNewStation from "./admin/pages/rotational/AddNewStation";
import AllRotationalStation from "./admin/pages/rotational/AllRotationalStation";
import ViewRotationalStation from "./admin/pages/rotational/ViewRotationalStation";
import EditStation from "./admin/pages/rotational/EditStation";
import ScheduleRotations from "./admin/pages/rotational/ScheduleRotations";
import BulkCVUploadForm from "./institute/pages/bulkUploadCV";
import EmailVerification  from "./components/login/EmailVerification";
import InternCertificateRequest  from "./admin/pages/certificaterequest/InternCertificateRequest";
import ViewCertificateRequest  from "./components/pages/ViewCertificateRequest";
import DownloadCertificate  from "./individual/pages/certificaterequest/DownloadCertificate";
import AdminReports  from "./admin/pages/reports/AdminReports";
import LearnMorePage from "./components/login/LearnMorePage";
import ChangePassword  from "./components/login/ChangePassword";
import InternPlacement from "./admin/pages/internplacement/InternPlacement";
import InternAllocations from "./staff/pages/internallocation/MyInternsAllocation";
import GeneratePlacementLetter  from "./admin/pages/lifecycle/GeneratePlacementLetter";
import ViewGeneratePlacementLetter  from "./admin/pages/lifecycle/ViewGeneratePlacementLetter";
import PlacementLetterManagement  from "./admin/pages/others/PlacementLetterManagement";
import AddNewUniversity  from "./admin/pages/others/AddNewUniversity";
import Rotationalapifirst from "./admin/pages/rotational/RotationalApiFirst";
import RotationalapiSecond from "./admin/pages/rotational/RotationalApiSecond";




function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigationType = useNavigationType();

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  // Apply dark mode to body class
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Detect scroll for Navbar behavior
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Show blinking line when navigating
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname, navigationType]);

  // Define routes that belong to different sections
  const individualRoutes = [
    "/individual-home",
    "/individual-add-cv",
    "/bank-details",
    "/help-support",
    "/status-report",
    "/request-certificate",
    "/download-certificate"
  ];

  const instituteRoutes = [
    "/institute-home",
    "/institute-all-aplications",
    "/institute-add-cv",
    "/view-cv/:cvId",
    "/edit-cv/:cvId",
    "/institute-help-support",
    "/bulk-cv-upload"
  ];

  const adminRoutes = [
    "/admin-home",
    "/view-all-cvs",
    "/delete-cv",
    "/admin-add-cv",
    "/admin-approve-cvs",
    "/view-all-interviews",
    "/add-new-interview",
    "/view-interview/:id",
    "/edit-interview/:id",
    "/schedule-interview",
    "/interview-results",
    "/view-all-inductions",
    "/view-all-institute",
    "/view-institute-details/:id",
    "/edit-institute/:id",
    "/approve-institute",
    "/add-new-institute",
    "/add-new-induction",
    "/view-induction/:id",
    "/edit-induction/:id",
    "/induction-results",
    "/view-all-scheme",
    "/add-new-scheme",
    "/view-scheme",
    "/add-staff",
    "/schedule-induction",
    "/schedule-scheme",
    "/life-cycle",
    "/admin-help-support",
    "/staff-intern-request",
    "/all-certificate",
    "/add-certificate",
    "/edit-certificate/:Id",
    "/view-certificate/:Id",
    "/all-certificate-letters",
    "/add-certificate-letter",
    "/edit-certificate-letter/:Id",
    "/view-certificate-letter/:Id",
    "/all-placement-letters",
    "/add-new-placement-letter",
    "/edit-placement-letter/:Id",
    "/view-placement-letter/:Id",
    "/all-placement-letters",
    "/add-new-placement-letter",
    "/edit-placement-letter/:Id",
    "/view-placement-letter/:Id",
    "/intern-status",
    "/intern-bank-details",
    "/add-bank-details",
    "/edit-bank-details",
    "/intern-certificate-request",
    "/view-certificate-request/:id",
    "/all-rotational-stations",
    "/schedule-rotations",
    "/add-new-station",
    "/view-rotational-stations/:id",
    "/edit-rotational-stations/:id",
    "/admin-reports" ,
    "/add-employees",
    "/view-employees",
    "/intern-placement",
    "/placement-letter-management",
    "/add-new-university",
    "/generate-placement-letter",
    "/rotation-api1",
    "/rotation-api2",
  ];

  const staffRoutes = [
    "/staff-home",
    "/my-interns-pending",
    "/my-certificate-request",
    "/my-interns-placement",
    "/staff-help-support",
    "/view-my-requests",
    "/create-intern-request",
    "/view-intern-request/:id",
    "/edit-intern-request/:id",

    "/my-interns-allocations",
  ];

  // Logic to determine which sidebar to show
  const isAdminRoute = adminRoutes.includes(location.pathname);
  const isInstituteRoute = instituteRoutes.includes(location.pathname);
  const isIndividualRoute = individualRoutes.includes(location.pathname);
  const isStaffRoute = staffRoutes.includes(location.pathname);

  const hideNavAndSidebar = [
    "/",
    "/login",
    "/register",
    "/forgot-password/email-confirm",
    "/forgot-password/verify-otp",
    "/email-verification",
    "/learn-more",
  ].includes(location.pathname);
  const hideFooter = hideNavAndSidebar;

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${darkMode ? "dark-mode" : ""}`}
      style={{ margin: 0, padding: 0 }}
    >
      <ConnectivityNotification />

      {!hideNavAndSidebar && (
        <>
          {/* Navbar with blinking bottom border */}
          <NavbarComp
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            scrolled={scrolled}
          />
          <div
            style={{
              height: "4px",
              width: "100%",
              background: loading ? "blue" : "transparent",
              transition: "background 0.5s ease-in-out",
              animation: loading ? "blink 0.8s infinite alternate" : "none",
            }}
          ></div>

          {/* Sidebar Logic */}
          {isAdminRoute ? (
            <AdminSidebar darkMode={darkMode} />
          ) : isInstituteRoute ? (
            <InstituteSidebar darkMode={darkMode} />
          ) : isIndividualRoute ? (
            <IndividualSidebar darkMode={darkMode} />
          ) : isStaffRoute ? (
            <StaffSidebar darkMode={darkMode} />
          ) : null}
        </>
      )}

      <Row className="flex-grow-1 no-gutters" style={{ margin: 0 }}>
        <Col className="p-0">
        <Routes>
    <Route path="/" element={<LandingPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
    <Route path="/login" element={<LoginPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
    <Route path="/register" element={<RegisterPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
    <Route path="/forgot-password/email-confirm" element={<EmailConfirmPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
    <Route path="/forgot-password/verify-otp" element={<VerifyOTPPage darkMode={darkMode} toggleTheme={toggleTheme} />} />
    <Route path="/email-verification" element={<EmailVerification darkMode={darkMode} toggleTheme={toggleTheme} />} />
    <Route path="/learn-more" element={<LearnMorePage darkMode={darkMode} toggleTheme={toggleTheme} />} />

  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    {/* Individual */}
    <Route path="/individual-home" element={<IndividualHome darkMode={darkMode} />} />
    <Route path="/individual-add-cv" element={<IndividualAddCV darkMode={darkMode} />} />
    <Route path="/bank-details" element={<BankDetails darkMode={darkMode} />} />
    <Route path="/help-support" element={<HelpAndSupport darkMode={darkMode} />} />
    <Route path="/status-report" element={<StatusReport darkMode={darkMode} />} />
    <Route path="/request-certificate" element={<TrainingCertificateRequest darkMode={darkMode} />} />
    <Route path="/download-certificate" element={<DownloadCertificate darkMode={darkMode} />} />
    <Route path="/change-password/:id" element={<ChangePassword darkMode={darkMode} />} />

    {/* Institute */}
    <Route path="/institute-home" element={<InstituteHome darkMode={darkMode} />} />
    <Route path="/institute-all-aplications" element={<InstituteAllApplications darkMode={darkMode} />} />
    <Route path="/institute-add-cv" element={<InstituteAddCV darkMode={darkMode} />} />
    <Route path="/view-cv/:cvId" element={<ViewCV darkMode={darkMode} />} />
    <Route path="/edit-cv/:cvId" element={<EditCV darkMode={darkMode} />} />
    <Route path="/institute-help-support" element={<InstituteHelp darkMode={darkMode} />} />
    <Route path="/bulk-cv-upload" element={<BulkCVUploadForm darkMode={darkMode} />} />

    {/* Admin */}
    <Route path="/admin-home" element={<AdminHome darkMode={darkMode} />} />
    <Route path="/view-all-cvs" element={<ViewAllCVs darkMode={darkMode} />} />
    <Route path="/delete-cv" element={<DeletedCVsPage darkMode={darkMode} />} />
    <Route path="/admin-add-cv" element={<AdminAddCVs darkMode={darkMode} />} />
    <Route path="/admin-approve-cvs" element={<ApproveCVs darkMode={darkMode} />} />
    <Route path="/view-all-interviews" element={<ViewAllInterviews darkMode={darkMode} />} />
    <Route path="/add-new-interview" element={<AddNewInterview darkMode={darkMode} />} />
    <Route path="/view-interview/:id" element={<ViewInterview darkMode={darkMode} />} />
    <Route path="/edit-interview/:id" element={<EditInterview darkMode={darkMode} />} />
    <Route path="/schedule-interview" element={<ScheduleInterviews darkMode={darkMode} />} />
    <Route path="/interview-results" element={<InterviewResults darkMode={darkMode} />} />
    <Route path="/view-all-inductions" element={<ViewAllInductions darkMode={darkMode} />} />
    <Route path="/view-all-institute" element={<ViewAllInstitute darkMode={darkMode} />} />
    <Route path="/view-institute-details/:id" element={<ViewInstituteDetails darkMode={darkMode} />} />
    <Route path="/edit-institute/:id" element={<EditInstitute darkMode={darkMode} />} />
    <Route path="/approve-institute" element={<ApproveInstitute darkMode={darkMode} />} />
    <Route path="/add-new-institute" element={<AddNewInstitute darkMode={darkMode} />} />
    <Route path="/add-new-induction" element={<AddNewInduction darkMode={darkMode} />} />
    <Route path="/schedule-induction" element={<ScheduleInduction darkMode={darkMode} />} />
    <Route path="/view-induction/:id" element={<ViewInductionDetails darkMode={darkMode} />} />
    <Route path="/edit-induction/:id" element={<EditInduction darkMode={darkMode} />} />
    <Route path="/induction-results" element={<InductionResults darkMode={darkMode} />} />
    <Route path="/view-all-scheme" element={<ViewAllSchemes darkMode={darkMode} />} />
    <Route path="/add-employees" element={<AddEmployee darkMode={darkMode} />} />
    <Route path="/view-employees" element={<ViewEmployees darkMode={darkMode} />} />
    <Route path="/add-new-scheme" element={<AddNewScheme darkMode={darkMode} />} />
    <Route path="/view-scheme/:schemeId" element={<ViewScheme darkMode={darkMode} />} />
    <Route path="/add-staff" element={<AddStaff darkMode={darkMode} />} />
    <Route path="/edit-scheme/:schemeId" element={<EditScheme darkMode={darkMode} />} />
    <Route path="/schedule-scheme" element={<ScheduleScheme darkMode={darkMode} />} />
    <Route path="/life-cycle" element={<InternLifeCycle darkMode={darkMode} />} />
    <Route path="/generate-placement-letter" element={<GeneratePlacementLetter darkMode={darkMode} />} />
    <Route path="/view-generate-placement-letter/:id" element={<ViewGeneratePlacementLetter darkMode={darkMode} />} />
    <Route path="/view-generate-placement-letter/preview" element={<ViewGeneratePlacementLetter darkMode={darkMode} isPreview />} />
    <Route path="/admin-help-support" element={<AdminHelp darkMode={darkMode} />} />
    <Route path="/staff-intern-request" element={<StaffInternRequest darkMode={darkMode} />} />
    <Route path="/all-certificate" element={<AllCertificate darkMode={darkMode} />} />
    <Route path="/add-certificate" element={<AddCertificate darkMode={darkMode} />} />
    <Route path="/edit-certificate/:id" element={<EditCertificate darkMode={darkMode} />} />
    <Route path="/view-certificate/:id" element={<ViewCertificate darkMode={darkMode} />} />
    <Route path="/all-certificate-letters" element={<AllCertificateLetters darkMode={darkMode} />} />
    <Route path="/add-certificate-letter" element={<AddCertificateLetter darkMode={darkMode} />} />
    <Route path="/edit-certificate-letter/:id" element={<EditCertificateLetter darkMode={darkMode} />} />
    <Route path="/view-certificate-letter/:id" element={<ViewCertificateLetter darkMode={darkMode} />} />
    <Route path="/all-placement-letters" element={<AllPlacementLetters darkMode={darkMode} />} />
    <Route path="/add-new-placement-letter" element={<AddPlacementLetter darkMode={darkMode} />} />
    <Route path="/edit-placement-letter/:id" element={<EditPlacementLetter darkMode={darkMode} />} />
    <Route path="/view-placement-letter/:id" element={<ViewPlacementLetter darkMode={darkMode} />} />
    <Route path="/intern-status" element={<InternsStatus darkMode={darkMode} />} />
    <Route path="/intern-bank-details" element={<InternBankDetails darkMode={darkMode} />} />
    <Route path="/add-bank-details" element={<AddBankDetails darkMode={darkMode} />} />
    <Route path="/edit-bank-details/:id" element={<EditBankDetails darkMode={darkMode} />} />
    <Route path="/add-new-station" element={<AddNewStation darkMode={darkMode} />} />
    <Route path="/all-rotational-stations" element={<AllRotationalStation darkMode={darkMode} />} />
    <Route path="/view-rotational-stations/:id" element={<ViewRotationalStation darkMode={darkMode} />} />
    <Route path="/edit-rotational-stations/:id" element={<EditStation darkMode={darkMode} />} />
    <Route path="/rotation-api1" element={<Rotationalapifirst darkMode={darkMode} />} />
    <Route path="/rotation-api2" element={<RotationalapiSecond darkMode={darkMode} />} />
    <Route path="/schedule-rotations" element={<ScheduleRotations darkMode={darkMode} />} />
    <Route path="/intern-certificate-request" element={<InternCertificateRequest darkMode={darkMode} />} />
    <Route path="/view-certificate-request/:id" element={<ViewCertificateRequest darkMode={darkMode} />} />
    <Route path="/admin-reports" element={<AdminReports darkMode={darkMode} />} />
    <Route path="/intern-placement" element={<InternPlacement darkMode={darkMode} />} />
    <Route path="/placement-letter-management" element={<PlacementLetterManagement darkMode={darkMode} />} />
    <Route path="/add-new-university" element={<AddNewUniversity darkMode={darkMode} />} />

    {/* Staff */}
    <Route path="/staff-home" element={<StaffHome darkMode={darkMode} />} />
    
    <Route path="/my-interns-pending" element={<InternPendingRequests darkMode={darkMode} />} />
    <Route path="/my-certificate-request" element={<CertificateRequests darkMode={darkMode} />} />
    <Route path="/my-interns-placement" element={<InternPlacements darkMode={darkMode} />} />
    <Route path="/staff-help-support" element={<StaffHelp darkMode={darkMode} />} />
    <Route path="/view-my-requests" element={<MyInternRequests darkMode={darkMode} />} />
    <Route path="/create-intern-request" element={<CreateInternRequest darkMode={darkMode} />} />
    <Route path="/view-intern-request/:id" element={<ViewInternRequest darkMode={darkMode} />} />
    <Route path="/edit-intern-request/:id" element={<EditInternRequest darkMode={darkMode} />} />
    
    <Route path="/my-interns-allocations" element={<InternAllocations darkMode={darkMode} />} />
  </Route>
</Routes>

        </Col>
      </Row>

      {!hideFooter && <Footer darkMode={darkMode} />}
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
