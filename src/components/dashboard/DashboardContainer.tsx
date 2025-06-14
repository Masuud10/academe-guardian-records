
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User, Bell, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthUser } from '@/types/auth';
import { School } from '@/types/school';
import DashboardGreeting from './DashboardGreeting';

interface DashboardContainerProps {
  user: AuthUser;
  currentSchool: School | null;
  onLogout: () => void;
  showHeader?: boolean;
  children: React.ReactNode;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  user,
  currentSchool,
  onLogout,
  showHeader = true,
  children
}) => {
  console.log('🏗️ DashboardContainer: Rendering with user:', user?.email, 'school:', currentSchool?.name);

  if (!user) {
    console.log('🏗️ DashboardContainer: No user provided, showing error');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'edufam_admin':
        return 'EduFam Admin';
      case 'school_owner':
        return 'School Owner';
      case 'principal':
        return 'Principal';
      case 'teacher':
        return 'Teacher';
      case 'finance_officer':
        return 'Finance Officer';
      case 'parent':
        return 'Parent';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'edufam_admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'school_owner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'principal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'teacher':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'finance_officer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'parent':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getFirstName = (fullName: string) => {
    return fullName?.split(" ")[0] || "User";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Greetings Container */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            
            {/* Left side - Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduFam
                </span>
                <div className="text-sm text-gray-500 font-medium">School Management</div>
              </div>
            </div>

            {/* Center - Main Greeting and Info */}
            <div className="flex-1 mx-8 text-center">
              <div className="space-y-3">
                {/* Main Greeting */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {getGreeting()}, {getFirstName(user?.name || "User")}! 👋
                </h1>
                
                {/* Role and School Info */}
                <div className="flex items-center justify-center space-x-3">
                  <Badge className={`${getRoleBadgeColor(user.role)} font-medium px-3 py-1`}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                  {currentSchool && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700 font-medium">{currentSchool.name}</span>
                    </>
                  )}
                </div>

                {/* Date */}
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </div>
              </div>
            </div>

            {/* Right side - User Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-2 bg-white/50 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-sm">
                  <div className="font-medium text-gray-900">{user.email?.split('@')[0]}</div>
                </div>
              </div>

              {/* Settings */}
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors">
                <Settings className="h-5 w-5" />
              </Button>
              
              {/* Logout */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardContainer;
