import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import TeacherReportsModule from "@/components/reports/TeacherReportsModule";
import PrincipalReportsModule from "@/components/reports/PrincipalReportsModule";
import FinanceReportsModule from "@/components/reports/FinanceReportsModule";
import ParentReportsModule from "@/components/reports/ParentReportsModule";

import RoleGuard from "@/components/common/RoleGuard";

const ReportsModule = () => {
  const { user } = useAuth();

  // Teachers get limited reports
  if (user?.role === "teacher") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Teacher Reports
          </h1>
          <p className="text-muted-foreground">
            Generate grade and attendance reports for your classes.
          </p>
        </div>

        <TeacherReportsModule />
      </div>
    );
  }

  // Finance officers get financial reports
  if (user?.role === "finance_officer") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Finance Reports
          </h1>
          <p className="text-muted-foreground">
            Generate financial summaries, fee collection, and transaction
            reports.
          </p>
        </div>

        <FinanceReportsModule />
      </div>
    );
  }

  // Parents get student reports
  if (user?.role === "parent") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Student Reports
          </h1>
          <p className="text-muted-foreground">
            View your child's academic progress and attendance reports.
          </p>
        </div>

        <ParentReportsModule />
      </div>
    );
  }

  // Principals and School Directors get comprehensive reports
  return (
    <RoleGuard
      allowedRoles={["principal", "school_director"]}
      requireSchoolAssignment
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            School Reports
          </h1>
          <p className="text-muted-foreground">
            Generate comprehensive academic, financial, and administrative
            reports.
          </p>
        </div>

        <PrincipalReportsModule />
      </div>
    </RoleGuard>
  );
};

export default ReportsModule;
