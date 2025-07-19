import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import ContentRenderer from "./layout/ContentRenderer";
import AuthErrorCard from "./layout/AuthErrorCard";
import { useNavigation } from "@/contexts/NavigationContext";

const ElimshaLayout = () => {
  const { user, signOut } = useAuth();
  const { currentSchool } = useSchool();
  const { activeSection } = useNavigation();

  console.log(
    "🏗️ ElimshaLayout: Rendering for user role:",
    user?.role,
    "active section:",
    activeSection
  );

  if (!user) {
    console.error("🏗️ ElimshaLayout: No user found, this should not happen");
    return (
      <AuthErrorCard
        title="Authentication Error"
        description="User authentication failed. Please try logging in again."
      />
    );
  }

  if (!user.role) {
    console.error("🏗️ ElimshaLayout: User has no role assigned:", user.email);
    const details = (
      <>
        <p className="text-sm text-red-600 mb-4">
          Your account does not have a role assigned. Please contact your
          administrator.
        </p>
        <div className="text-xs text-gray-400 mb-4 bg-gray-100 p-2 rounded text-left">
          <strong>Debug Information:</strong>
          <br />
          Email: {user.email}
          <br />
          Role: {user.role || "None"}
          <br />
          User ID: {user.id?.slice(0, 8)}...
          <br />
          School ID: {user.school_id || "None"}
        </div>
      </>
    );
    return (
      <AuthErrorCard
        title="Role Configuration Error"
        description="Your account role is missing and needs to be configured."
        details={details}
      />
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleModalOpen = (modalType: string) => {
    console.log("🎭 ElimshaLayout: Modal open requested:", modalType);
  };

  const transformedSchool = currentSchool
    ? {
        id: currentSchool.id,
        name: currentSchool.name,
        ownerId: currentSchool.owner_id || "",
        principalId: currentSchool.principal_id || "",
        address: currentSchool.address || "",
        phone: currentSchool.phone || "",
        email: currentSchool.email || "",
        logo: currentSchool.logo_url,
        settings: {
          academicYear: new Date().getFullYear().toString(),
          terms: [],
          gradeReleaseEnabled: true,
          attendanceEnabled: true,
        },
      }
    : null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <DashboardContainer
            user={user}
            currentSchool={transformedSchool}
            onLogout={handleLogout}
            showHeader={true}
            showGreetings={activeSection === "dashboard"}
          >
            <ContentRenderer
              activeSection={activeSection}
              onModalOpen={handleModalOpen}
            />
          </DashboardContainer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ElimshaLayout;
