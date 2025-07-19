import React, {
  useState,
  useEffect,
  startTransition,
  Suspense,
  useCallback,
} from "react";
import { AuthUser } from "@/types/auth";
import { usePrincipalDashboardData } from "@/hooks/usePrincipalDashboardData";
import CertificateGenerator from "@/components/certificates/CertificateGenerator";
import TimetableGenerator from "@/components/timetable/TimetableGenerator";
import PrincipalReportGenerator from "@/components/reports/PrincipalReportGenerator";
import { useToast } from "@/hooks/use-toast";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";


// Section components
import PrincipalStatsSection from "./principal/sections/PrincipalStatsSection";
import PrincipalAnalyticsSection from "./principal/sections/PrincipalAnalyticsSection";
import PrincipalGradesSection from "./principal/sections/PrincipalGradesSection";
import PrincipalFinanceSection from "./principal/sections/PrincipalFinanceSection";
import PrincipalCertificatesSection from "./principal/sections/PrincipalCertificatesSection";

interface PrincipalDashboardProps {
  user: AuthUser;
  onModalOpen?: (modalType: string) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({
  user,
  onModalOpen,
}) => {
  console.log("🎓 PrincipalDashboard: Rendering for principal:", user.email);

  const { schoolId, isReady, validateSchoolAccess } = useSchoolScopedData();
  const { stats, loading, error, loadingTimeout, refetch } =
    usePrincipalDashboardData(schoolId);
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { activeSection } = useNavigation();

  // Memoized handlers to prevent unnecessary re-renders
  const handleModalOpen = useCallback(
    (modalType: string) => {
      console.log(
        "🎭 PrincipalDashboard: Opening modal:",
        modalType,
        "for school:",
        schoolId
      );

      // Validate modal access based on school context
      if (!schoolId) {
        toast({
          title: "Access Error",
          description: "Cannot open modal - no school context available.",
          variant: "destructive",
        });
        return;
      }

      setActiveModal(modalType);

      // Delegate specific modals to parent if available
      if (
        onModalOpen &&
        ["studentAdmission", "teacherAdmission", "addClass"].includes(modalType)
      ) {
        onModalOpen(modalType);
      }
    },
    [schoolId, toast, onModalOpen]
  );

  const handleModalClose = useCallback(() => {
    console.log("🎭 PrincipalDashboard: Closing modal:", activeModal);
    setActiveModal(null);
  }, [activeModal]);

  const handleSuccess = useCallback(
    (message?: string) => {
      console.log("✅ PrincipalDashboard: Operation completed successfully");
      toast({
        title: "Success",
        description: message || "Operation completed successfully.",
      });
      setActiveModal(null);

      // Refresh dashboard data after successful operations
      if (refetch) {
        refetch();
      }
    },
    [toast, refetch]
  );

  const handleRetry = useCallback(() => {
    console.log("🔄 PrincipalDashboard: Retrying data fetch");
    if (refetch) {
      refetch();
    }
  }, [refetch]);

  // Check for timetable modal flag on component mount and section changes
  useEffect(() => {
    console.log(
      "🎓 PrincipalDashboard: activeSection changed to:",
      activeSection
    );

    // Check if timetable modal should be opened (from sidebar click)
    const shouldOpenTimetableModal =
      sessionStorage.getItem("openTimetableModal");
    if (shouldOpenTimetableModal === "true") {
      console.log(
        "🎓 PrincipalDashboard: Opening TimetableGenerator modal from sidebar"
      );
      // Clear the flag first
      sessionStorage.removeItem("openTimetableModal");
      // Set modal with startTransition to prevent suspension
      startTransition(() => {
        setActiveModal("generate-timetable");
      });
      return;
    }

    // Fallback for direct timetable section access
    if (activeSection === "timetable") {
      console.log("🎓 PrincipalDashboard: Opening TimetableGenerator modal");
      startTransition(() => {
        setActiveModal("generate-timetable");
      });
    }
  }, [activeSection]);

  // Cleanup sessionStorage on unmount
  useEffect(() => {
    return () => {
      // Clean up any leftover sessionStorage flags
      sessionStorage.removeItem("openTimetableModal");
    };
  }, []);

  // Enhanced school assignment validation
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!schoolId) {
    console.error(
      "❌ Principal Dashboard: No school assignment found for user:",
      user.email
    );
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No school assignment found. Please contact your administrator to
            assign you to a school.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Validate user has access to this school
  if (!validateSchoolAccess(schoolId)) {
    console.error("❌ Principal Dashboard: Access denied to school:", schoolId);
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You do not have permission to view this school's
            data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <PrincipalStatsSection
          stats={stats}
          loading={loading}
          error={error}
          loadingTimeout={loadingTimeout}
          onRetry={handleRetry}
        />

        <PrincipalAnalyticsSection />

        <PrincipalGradesSection
          schoolId={schoolId}
          onModalOpen={handleModalOpen}
        />

        <PrincipalFinanceSection />

        <PrincipalCertificatesSection />
      </div>

      {/* Enhanced Modal Management with School Context */}
      {activeModal === "generate-certificate" && (
        <CertificateGenerator
          open={true}
          onClose={handleModalClose}
          onCertificateGenerated={handleSuccess}
        />
      )}

      {activeModal === "generate-timetable" && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading timetable generator...
                </p>
              </div>
            </div>
          }
        >
          <TimetableGenerator
            open={true}
            onClose={handleModalClose}
            onTimetableGenerated={handleSuccess}
          />
        </Suspense>
      )}

      {activeModal === "reports" && (
        <PrincipalReportGenerator
          open={true}
          onClose={handleModalClose}
          onReportGenerated={handleSuccess}
        />
      )}
    </div>
  );
};

export default PrincipalDashboard;
