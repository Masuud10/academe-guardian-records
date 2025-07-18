
import React from 'react';
import { User } from '@/types/auth';
import { School } from '@/types/school';

interface DashboardGreetingProps {
  user: User;
  currentSchool?: School | null;
}

const DashboardGreeting = ({ user, currentSchool }: DashboardGreetingProps) => {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Get first name from user name
  const getFirstName = (fullName: string) => {
    return fullName?.split(" ")[0] || "User";
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      // Admin roles removed for school application
      case "school_director":
        return "Monitor your school's financial and operational performance.";
      case "principal":
        return "Oversee daily operations and academic excellence at your school.";
      case "teacher":
        return "Manage your classes, grades, and student interactions.";
      case "parent":
        return "Stay updated on your child's academic progress and school activities.";
      case "finance_officer":
        return "Manage financial operations and fee collection for your school.";
      default:
        return "Here's what's happening in your school today.";
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="space-y-2">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
          {getGreeting()}, {getFirstName(user?.name || "User")}! 👋
        </h1>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl lg:max-w-4xl">
          {getRoleDescription()}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
            {user?.role?.replace('_', ' ').toUpperCase()}
          </span>
          {currentSchool && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {currentSchool.name}
            </span>
          )}
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardGreeting;
