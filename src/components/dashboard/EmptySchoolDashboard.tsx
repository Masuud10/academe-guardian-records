import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@/types/auth";
import {
  Building2,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  BarChart3,
} from "lucide-react";

interface EmptySchoolDashboardProps {
  user: User;
  schoolName?: string;
}

const EmptySchoolDashboard = ({
  user,
  schoolName,
}: EmptySchoolDashboardProps) => {
  const getRoleBasedWelcomeMessage = () => {
    switch (user.role) {
      case "school_director":
        return "As the school director, you can manage all aspects of your school including staff, students, and administrative settings.";
      case "principal":
        return "As the principal, you can oversee academic activities, manage staff, and monitor student progress.";
      case "teacher":
        return "As a teacher, you can manage your classes, track student attendance, input grades, and communicate with parents.";
      case "finance_officer":
        return "As the finance officer, you can manage fee collection, generate financial reports, and track payment records.";
      case "parent":
        return "As a parent, you can view your child's progress, communicate with teachers, and stay updated on school activities.";
      default:
        return "Welcome to your school dashboard. Start by exploring the available features.";
    }
  };

  const getNextSteps = () => {
    switch (user.role) {
      case "school_director":
      case "principal":
        return [
          { icon: Users, text: "Add teachers and staff members" },
          { icon: BookOpen, text: "Create classes and subjects" },
          { icon: Users, text: "Enroll students" },
          { icon: Calendar, text: "Set up academic calendar" },
        ];
      case "teacher":
        return [
          {
            icon: Users,
            text: "Wait for students to be assigned to your classes",
          },
          { icon: BookOpen, text: "Prepare your subject materials" },
          { icon: Calendar, text: "Check your teaching schedule" },
          { icon: MessageSquare, text: "Connect with other teachers" },
        ];
      case "finance_officer":
        return [
          { icon: BarChart3, text: "Set up fee structures" },
          { icon: Users, text: "Wait for student enrollment" },
          { icon: Calendar, text: "Plan billing cycles" },
          { icon: MessageSquare, text: "Coordinate with administration" },
        ];
      case "parent":
        return [
          { icon: Users, text: "Wait for your child to be enrolled" },
          { icon: MessageSquare, text: "Connect with teachers" },
          { icon: Calendar, text: "Check school events" },
          { icon: BarChart3, text: "Monitor academic progress" },
        ];
      default:
        return [];
    }
  };

  const nextSteps = getNextSteps();

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Building2 className="h-5 w-5" />
            Welcome to {schoolName || "Your School"}!
          </CardTitle>
          <CardDescription className="text-blue-700">
            Hello {user.name || user.email}, this is your clean, fresh start.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">{getRoleBasedWelcomeMessage()}</p>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              Your Role: {user.role?.replace("_", " ").toUpperCase()}
            </h4>
            <p className="text-sm text-blue-700">
              You are currently logged into the {schoolName || "school"} tenant.
              All data you see and manage will be specific to this school only.
            </p>
          </div>
        </CardContent>
      </Card>

      {nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
            <CardDescription>
              Here's what you can do to get started with your school dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {nextSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <step.icon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">{step.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Isolation Notice</CardTitle>
          <CardDescription>
            Understanding your school's data privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p>
                All data you create and access is isolated to your school only
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p>You cannot see or access data from other schools</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p>Your role determines what features and data you can manage</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p>
                This ensures complete privacy and security for your school's
                information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptySchoolDashboard;
