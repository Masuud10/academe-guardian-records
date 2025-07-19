import React from "react";
import PrincipalAnalyticsOverview from "../PrincipalAnalyticsOverview";
import DashboardAttendanceAnalytics from "@/components/attendance/DashboardAttendanceAnalytics";

const PrincipalAnalyticsSection: React.FC = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        School Analytics Overview
      </h2>
      <div className="bg-white rounded-lg border shadow-sm">
        <PrincipalAnalyticsOverview />
      </div>

      {/* Attendance Analytics */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <DashboardAttendanceAnalytics role="principal" />
      </div>
    </section>
  );
};

export default PrincipalAnalyticsSection;
