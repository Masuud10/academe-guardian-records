import React, {
  memo,
  useMemo,
  useEffect,
  Suspense,
  startTransition,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import ErrorFallback from "@/components/common/ErrorFallback";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import MaintenanceNotification from "@/components/common/MaintenanceNotification";

// Lazy load all dashboard components for better performance
const PrincipalDashboard = React.lazy(
  () => import("@/components/dashboard/PrincipalDashboard")
);
const TeacherDashboard = React.lazy(
  () => import("@/components/dashboard/TeacherDashboard")
);
const ParentDashboard = React.lazy(
  () => import("@/components/dashboard/ParentDashboard")
);
const FinanceOfficerDashboard = React.lazy(
  () => import("@/components/dashboard/FinanceOfficerDashboard")
);
const SchoolOwnerDashboard = React.lazy(
  () => import("@/components/dashboard/SchoolOwnerDashboard")
);
const SchoolDirectorDashboard = React.lazy(
  () => import("@/components/dashboard/SchoolDirectorDashboard")
);
const HRDashboard = React.lazy(
  () => import("@/components/dashboard/HRDashboard")
);
const HRStaffManagement = React.lazy(
  () => import("@/components/hr/HRStaffManagement")
);
const HRReportsModule = React.lazy(
  () => import("@/components/hr/HRReportsModule")
);
const HRAnalyticsOverview = React.lazy(
  () => import("@/components/hr/HRAnalyticsOverview")
);
const HRPayrollModule = React.lazy(
  () => import("@/components/hr/HRPayrollModule")
);
const HRAttendanceModule = React.lazy(
  () => import("@/components/hr/HRAttendanceModule")
);
const HRUserManagementModule = React.lazy(
  () => import("@/components/hr/HRUserManagementModule")
);

// Analytics and Management Components (Admin analytics removed)
const TransportManagement = React.lazy(
  () => import("@/components/transport/TransportManagement")
);
const InventoryManagement = React.lazy(
  () => import("@/components/inventory/InventoryManagement")
);

// Lazy load heavy components with better chunking
const GradesModule = React.lazy(
  () => import("@/components/modules/GradesModule")
);
const AttendanceModule = React.lazy(
  () => import("@/components/modules/AttendanceModule")
);
const StudentsModule = React.lazy(
  () => import("@/components/modules/StudentsModule")
);
const FinanceModule = React.lazy(
  () => import("@/components/modules/FinanceModule")
);
const FeeManagementModule = React.lazy(
  () => import("@/components/modules/FeeManagementModule")
);
const StudentAccountsModule = React.lazy(
  () => import("@/components/modules/StudentAccountsModule")
);
const FinanceSettingsModule = React.lazy(
  () => import("@/components/modules/FinanceSettingsModule")
);
const TimetableModule = React.lazy(
  () => import("@/components/modules/TimetableModule")
);
const AnnouncementsModule = React.lazy(
  () => import("@/components/modules/AnnouncementsModule")
);
const MessagesModule = React.lazy(
  () => import("@/components/modules/MessagesModuleNew")
);
const ReportsModule = React.lazy(
  () => import("@/components/modules/ReportsModule")
);
const SchoolsModule = React.lazy(
  () => import("@/components/modules/SchoolsModule")
);

const BillingModule = React.lazy(
  () => import("@/components/modules/BillingModule")
);
const SystemHealthModule = React.lazy(
  () => import("@/components/modules/SystemHealthModule")
);
const SecurityModule = React.lazy(
  () => import("@/components/modules/SecurityModule")
);
const SupportModule = React.lazy(
  () => import("@/components/modules/SupportModule")
);
const CertificatesModule = React.lazy(
  () => import("@/components/modules/CertificatesModule")
);
const ProjectHubModule = React.lazy(
  () => import("@/components/modules/ProjectHubModule")
);
const CompanyManagementModule = React.lazy(
  () => import("@/components/modules/CompanyManagementModule")
);
const SchoolAnalyticsList = React.lazy(
  () => import("@/components/analytics/SchoolAnalyticsList")
);
const MpesaPaymentsPanel = React.lazy(
  () => import("@/components/finance/MpesaPaymentsPanel")
);
const FinancialReportsPanel = React.lazy(
  () => import("@/components/finance/FinancialReportsPanel")
);
const FinanceAnalyticsPanel = React.lazy(
  () => import("@/components/finance/FinanceAnalyticsPanel")
);
const StudentAccountsPanel = React.lazy(
  () => import("@/components/finance/StudentAccountsPanel")
);
const FinanceSettingsPanel = React.lazy(
  () => import("@/components/finance/FinanceSettingsPanel")
);
const ExpensesPanel = React.lazy(
  () => import("@/components/finance/ExpensesPanel")
);
const SchoolManagementDashboard = React.lazy(
  () => import("@/components/dashboard/principal/SchoolManagementDashboard")
);
const AnalyticsDashboard = React.lazy(
  () => import("@/components/analytics/AnalyticsDashboard")
);
const FinancialOverview = React.lazy(
  () => import("@/components/finance/FinancialOverview")
);
const TeacherGradesModule = React.lazy(
  () => import("@/components/modules/TeacherGradesModule")
);
const PrincipalGradesModule = React.lazy(
  () => import("@/components/modules/PrincipalGradesModule")
);
const TeacherReportsModule = React.lazy(
  () => import("@/components/reports/TeacherReportsModule")
);
const TeacherSupportModule = React.lazy(
  () => import("@/components/modules/TeacherSupportModule")
);
const UniversalSupportModule = React.lazy(
  () => import("@/components/modules/UniversalSupportModule")
);
const TeacherTimetableModule = React.lazy(
  () => import("@/components/timetable/TeacherTimetableView")
);
const ExaminationsModule = React.lazy(
  () => import("@/components/modules/ExaminationsModule")
);
const PrincipalTimetableGenerator = React.lazy(
  () => import("@/components/timetable/PrincipalTimetableGenerator")
);
const ParentFinanceView = React.lazy(
  () => import("@/components/finance/ParentFinanceView")
);
const ParentTimetableView = React.lazy(
  () => import("@/components/timetable/ParentTimetableView")
);
const SchoolOwnerTimetableView = React.lazy(
  () => import("@/components/timetable/SchoolOwnerTimetableView")
);
const SchoolOwnerReportsModule = React.lazy(
  () => import("@/components/reports/SchoolOwnerReportsModule")
);
const SchoolOwnerSupportModule = React.lazy(
  () => import("@/components/modules/SchoolOwnerSupportModule")
);
const AcademicManagementModule = React.lazy(
  () => import("@/components/modules/AcademicManagementModule")
);
const StaffManagement = React.lazy(() =>
  import("@/pages/hr/StaffManagement").then((module) => ({
    default: module.StaffManagement,
  }))
);

interface ContentRendererProps {
  activeSection: string;
  onModalOpen?: (modalType: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = memo(
  ({ activeSection }) => {
    const { user } = useAuth();
    const { setActiveSection } = useNavigation();

    // No redirect needed - principals will get their own timetable page

    console.log(
      "📋 ContentRenderer: Rendering section:",
      activeSection,
      "for user role:",
      user?.role
    );

    // Memoize role-based access checks to prevent unnecessary recalculations
    const hasFinanceAccess = useMemo(() => {
      const financeRoles = [
        "finance_officer",
        "principal",
        "school_director",
        "edufam_admin",
      ];
      return financeRoles.includes(user?.role || "");
    }, [user?.role]);

    // Memoize dashboard component to prevent unnecessary re-renders
    const dashboardComponent = useMemo(() => {
      if (activeSection !== "dashboard") return null;

      switch (user?.role) {
        case "school_director":
          return <SchoolDirectorDashboard />;
        case "principal":
          return <PrincipalDashboard user={user} />;
        case "teacher":
          return <TeacherDashboard user={user} />;
        case "finance_officer":
          return <FinanceOfficerDashboard user={user} />;
        case "hr":
          return <HRDashboard user={user} />;
        case "parent":
          return <ParentDashboard user={user} />;
        default:
          return <div>Unknown user role: {user?.role}</div>;
      }
    }, [activeSection, user?.role, user]);

    // Return dashboard component if it's the dashboard section
    if (dashboardComponent) {
      return (
        <div>
          <MaintenanceNotification />
          {dashboardComponent}
        </div>
      );
    }

    // Render other sections with lazy loading and error boundaries
    const renderLazyComponent = (
      Component: React.LazyExoticComponent<React.ComponentType<any>>,
      componentName?: string,
      props?: any
    ) => {
      return (
        <div>
          <MaintenanceNotification />
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error(
                `🚨 Error in ${componentName || "component"}:`,
                error,
                errorInfo
              );
            }}
          >
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-pulse flex items-center gap-2">
                    <div className="h-6 w-6 bg-primary/20 rounded animate-spin"></div>
                    <span className="text-muted-foreground">
                      Loading {componentName || "component"}...
                    </span>
                  </div>
                </div>
              }
            >
              <Component {...props} />
            </React.Suspense>
          </ErrorBoundary>
        </div>
      );
    };

    // Render unauthorized access message
    const renderUnauthorizedAccess = () => (
      <div>
        <MaintenanceNotification />
        <div className="p-8 text-center text-red-600">
          Access Denied: You don't have permission to view this section.
        </div>
      </div>
    );

    // School Management - Fix access for principals
    if (activeSection === "school-management") {
      if (user?.role === "principal") {
        return renderLazyComponent(
          SchoolManagementDashboard,
          "SchoolManagementDashboard"
        );
      }
      return (
        <div>
          <MaintenanceNotification />
          <div className="p-8 text-center text-red-600">
            Access Denied: Principal access required
          </div>
        </div>
      );
    }

    // System Settings - Only for EduFam Admins
    if (activeSection === "settings") {
      if (user?.role === "edufam_admin") {
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Feature Unavailable
            </h2>
            <p className="text-gray-600">
              System settings are not available in the school application.
            </p>
          </div>
        );
      }
      return (
        <div>
          <MaintenanceNotification />
          <div className="p-8 text-center text-red-600">
            Access Denied: EduFam Admin access required
          </div>
        </div>
      );
    }

    // System Reports for EduFam Admin
    if (activeSection === "system-reports") {
      if (user?.role === "edufam_admin") {
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Feature Unavailable
            </h2>
            <p className="text-gray-600">
              System reports are not available in the school application.
            </p>
          </div>
        );
      }
      return (
        <div>
          <MaintenanceNotification />
          <div className="p-8 text-center text-red-600">
            Access Denied: EduFam Admin access required
          </div>
        </div>
      );
    }

    // Analytics sections - Fix access for teachers, principals, and school directors
    if (activeSection === "analytics") {
      if (user?.role === "edufam_admin" || user?.role === "elimisha_admin") {
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Feature Unavailable
            </h2>
            <p className="text-gray-600">
              Admin analytics are not available in the school application.
            </p>
          </div>
        );
      }
      // Allow principals and school directors to access their school analytics
      if (user?.role === "principal" || user?.role === "school_director") {
        return renderLazyComponent(AnalyticsDashboard, "AnalyticsDashboard");
      }
      // Allow teachers to access their class analytics
      if (user?.role === "teacher") {
        return renderLazyComponent(
          AnalyticsDashboard,
          "TeacherAnalyticsDashboard"
        );
      }
      return (
        <div>
          <MaintenanceNotification />
          <div className="p-8 text-center text-red-600">
            Access Denied: Analytics access restricted
          </div>
        </div>
      );
    }

    // Finance sub-modules
    switch (activeSection) {
      case "fee-management":
        if (hasFinanceAccess) {
          return renderLazyComponent(
            FeeManagementModule,
            "FeeManagementModule"
          );
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Finance access required
            </div>
          </div>
        );
      case "mpesa-payments":
        if (hasFinanceAccess) {
          return renderLazyComponent(MpesaPaymentsPanel, "MpesaPaymentsPanel");
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Finance access required
            </div>
          </div>
        );
      case "expenses":
        // Strict role-based access: only finance officers can access expenses
        if (user?.role === "finance_officer") {
          return renderLazyComponent(ExpensesPanel, "ExpensesPanel");
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Expenses are restricted to Finance Officers only
            </div>
          </div>
        );
      case "financial-reports":
        // Strict role-based access: only finance officers can access financial reports
        if (user?.role === "finance_officer") {
          return renderLazyComponent(
            FinancialReportsPanel,
            "FinancialReportsPanel"
          );
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Financial Reports are restricted to Finance
              Officers only
            </div>
          </div>
        );
      case "financial-analytics":
        if (hasFinanceAccess) {
          return renderLazyComponent(
            FinanceAnalyticsPanel,
            "FinanceAnalyticsPanel"
          );
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Finance access required
            </div>
          </div>
        );
      case "student-accounts":
        if (hasFinanceAccess) {
          return renderLazyComponent(
            StudentAccountsPanel,
            "StudentAccountsPanel"
          );
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Finance access required
            </div>
          </div>
        );
      case "finance":
        // Special case for parents - they get their own finance view
        if (user?.role === "parent") {
          return renderLazyComponent(ParentFinanceView, "ParentFinanceView");
        }
        // For other roles, check finance access
        if (hasFinanceAccess) {
          return renderLazyComponent(FinancialOverview, "FinancialOverview");
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Finance access required
            </div>
          </div>
        );
      case "finance-settings":
        if (hasFinanceAccess) {
          return renderLazyComponent(
            FinanceSettingsPanel,
            "FinanceSettingsPanel"
          );
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Finance access required
            </div>
          </div>
        );

      // Other sections with role-based access
      case "project-hub":
        if (user?.role === "edufam_admin") {
          return renderLazyComponent(ProjectHubModule, "ProjectHubModule");
        }
        return (
          <div>
            <MaintenanceNotification />
            <div>Project Hub access restricted to EduFam administrators</div>
          </div>
        );
      case "school-analytics":
        if (user?.role === "edufam_admin") {
          return renderLazyComponent(
            SchoolAnalyticsList,
            "SchoolAnalyticsList"
          );
        }
        return (
          <div>
            <MaintenanceNotification />
            <div>
              School Analytics access restricted to EduFam administrators
            </div>
          </div>
        );
      case "company-management":
        if (user?.role === "edufam_admin") {
          return renderLazyComponent(
            CompanyManagementModule,
            "CompanyManagementModule"
          );
        }
        return (
          <div>
            <MaintenanceNotification />
            <div>
              Company Management access restricted to EduFam administrators
            </div>
          </div>
        );
      case "grades":
        // Teachers get their own specialized grade management module
        if (user?.role === "teacher") {
          return renderLazyComponent(
            TeacherGradesModule,
            "TeacherGradesModule"
          );
        }
        // Principals get the specialized principal grades module
        if (user?.role === "principal") {
          return renderLazyComponent(
            PrincipalGradesModule,
            "PrincipalGradesModule"
          );
        }
        return renderLazyComponent(GradesModule, "GradesModule");
      case "examinations":
        // Only principals can access examinations
        if (user?.role === "principal") {
          return renderLazyComponent(ExaminationsModule, "ExaminationsModule");
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Only principals can manage examinations
            </div>
          </div>
        );
      case "academic-management":
      case "student-admission":
      case "student-promotion":
      case "student-information":
      case "transfer-management":
      case "exit-management":
        // Only principals can access academic management
        if (user?.role === "principal") {
          return renderLazyComponent(
            AcademicManagementModule,
            "AcademicManagementModule"
          );
        }
        return (
          <div>
            <MaintenanceNotification />
            <div className="p-8 text-center text-red-600">
              Access Denied: Only principals can access Academic Management
            </div>
          </div>
        );
      case "attendance":
        return renderLazyComponent(AttendanceModule, "AttendanceModule");
      case "students":
        return renderLazyComponent(StudentsModule, "StudentsModule");
      case "timetable":
        // For principals, the useEffect above will handle the redirect
        // For other roles, render the appropriate timetable module
        if (user?.role === "teacher") {
          return renderLazyComponent(
            TeacherTimetableModule,
            "TeacherTimetableModule"
          );
        }
        if (user?.role === "principal") {
          return (
            <div>
              <MaintenanceNotification />
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Loading timetable generator...
                      </p>
                    </div>
                  </div>
                }
              >
                <PrincipalTimetableGenerator />
              </Suspense>
            </div>
          );
        }
        // Special case for parents - they get their own timetable view
        if (user?.role === "parent") {
          return renderLazyComponent(
            ParentTimetableView,
            "ParentTimetableView"
          );
        }
        // Special case for school directors - they get a comprehensive timetable viewer
        if (user?.role === "school_director") {
          return renderLazyComponent(
            SchoolOwnerTimetableView,
            "SchoolDirectorTimetableView"
          );
        }
        return renderLazyComponent(TimetableModule, "TimetableModule");
      case "announcements":
        return renderLazyComponent(AnnouncementsModule, "AnnouncementsModule");
      case "messages":
        return renderLazyComponent(MessagesModule, "MessagesModule");
      case "reports":
        // Teachers get restricted access to only grade and attendance reports
        if (user?.role === "teacher") {
          return renderLazyComponent(
            TeacherReportsModule,
            "TeacherReportsModule"
          );
        }
        // School directors get their own comprehensive reports module
        if (user?.role === "school_director") {
          return renderLazyComponent(
            SchoolOwnerReportsModule,
            "SchoolDirectorReportsModule"
          );
        }
        return renderLazyComponent(ReportsModule, "ReportsModule");
      case "schools":
        return renderLazyComponent(SchoolsModule, "SchoolsModule");
      case "users":
        if (user?.role === "hr") {
          return renderLazyComponent(
            HRUserManagementModule,
            "HRUserManagementModule",
            { user }
          );
        } else if (user?.role === "school_director") {
          return renderLazyComponent(
            HRUserManagementModule,
            "HRUserManagementModule", 
            { user }
          );
        }
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Feature Unavailable
            </h2>
            <p className="text-gray-600">
              User management is not available for your role.
            </p>
          </div>
        );
      case "billing":
        return renderLazyComponent(BillingModule, "BillingModule");
      case "system-health":
        return renderLazyComponent(SystemHealthModule, "SystemHealthModule");
      case "security":
        return renderLazyComponent(SecurityModule, "SecurityModule");
      case "support":
        // EduFam admin gets full admin support module
        if (user?.role === "edufam_admin") {
          return renderLazyComponent(SupportModule, "SupportModule");
        }
        // Teachers get their own simplified support module
        if (user?.role === "teacher") {
          return renderLazyComponent(
            TeacherSupportModule,
            "TeacherSupportModule"
          );
        }
        // School directors get their own support module
        if (user?.role === "school_director") {
          return renderLazyComponent(
            SchoolOwnerSupportModule,
            "SchoolDirectorSupportModule"
          );
        }
        // All other roles get universal support module
        return renderLazyComponent(
          UniversalSupportModule,
          "UniversalSupportModule"
        );
      case "system-analytics":
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Feature Unavailable
            </h2>
            <p className="text-gray-600">
              System analytics are not available in the school application.
            </p>
          </div>
        );
      case "transport":
        return renderLazyComponent(TransportManagement, "TransportManagement");
      case "inventory":
        return renderLazyComponent(InventoryManagement, "InventoryManagement");
      case "certificates":
        return renderLazyComponent(CertificatesModule, "CertificatesModule");
      case "hr-dashboard":
        return <HRDashboard user={user} />;
      case "staff-management":
        if (user?.role === "hr") {
          return renderLazyComponent(HRStaffManagement, "HRStaffManagement", {
            user,
          });
        }
        return renderUnauthorizedAccess();
      case "payroll":
        if (user?.role === "hr") {
          return renderLazyComponent(HRPayrollModule, "HRPayrollModule", {
            user,
          });
        }
        return renderUnauthorizedAccess();
      case "attendance-monitoring":
        if (user?.role === "hr") {
          return renderLazyComponent(HRAttendanceModule, "HRAttendanceModule", {
            user,
          });
        }
        return renderUnauthorizedAccess();
      case "hr-reports":
        if (user?.role === "hr") {
          return renderLazyComponent(HRReportsModule, "HRReportsModule", {
            user,
          });
        }
        return renderUnauthorizedAccess();
      case "hr-analytics":
        if (user?.role === "hr") {
          return renderLazyComponent(
            HRAnalyticsOverview,
            "HRAnalyticsOverview",
            { user }
          );
        }
        return renderUnauthorizedAccess();
      case "user-management":
        if (user?.role === "hr") {
          return renderLazyComponent(
            HRUserManagementModule,
            "HRUserManagementModule",
            { user }
          );
        }
        return renderUnauthorizedAccess();
      case "debug":
        // Debug module removed - redirect to unauthorized
        return renderUnauthorizedAccess();
      default:
        console.warn("📋 ContentRenderer: Unknown section:", activeSection);
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Section Not Found: {activeSection}
              </h3>
              <p className="text-gray-600">
                The requested section could not be found or is not available for
                your role.
              </p>
            </div>
          </div>
        );
    }
  }
);

ContentRenderer.displayName = "ContentRenderer";

export default ContentRenderer;
