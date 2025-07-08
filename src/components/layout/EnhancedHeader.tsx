import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useQuery } from "@tanstack/react-query";
import { NotificationService } from "@/services/NotificationService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Activity,
  User,
  Settings,
  LogOut,
  Shield,
  Database,
  BarChart3,
  FileText,
  Calendar,
  BookOpen,
  Users,
  Building,
  BellOff,
  BellRing,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import AuditLogsViewer from "@/components/audit/AuditLogsViewer";

interface EnhancedHeaderProps {
  onMenuToggle: () => void;
  isMobile: boolean;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  onMenuToggle,
  isMobile,
}) => {
  const { user, signOut } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [auditLogsOpen, setAuditLogsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  const { data: unreadNotifications } = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };
      return await NotificationService.getUserNotifications(
        user.id,
        1,
        100,
        true
      );
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update unread count when data changes
  useEffect(() => {
    if (unreadNotifications) {
      setUnreadCount(unreadNotifications.count);
    }
  }, [unreadNotifications]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign out";
      toast({
        title: "Error signing out",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  // Get role-based icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "principal":
        return <Building className="h-4 w-4" />;
      case "teacher":
        return <BookOpen className="h-4 w-4" />;
      case "parent":
        return <Users className="h-4 w-4" />;
      case "student":
        return <User className="h-4 w-4" />;
      case "edufam_admin":
        return <Shield className="h-4 w-4" />;
      case "school_owner":
        return <Building className="h-4 w-4" />;
      case "finance_officer":
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo/Brand */}
        <div className="flex items-center space-x-2 mr-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                E
              </span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">
              EduFam
            </span>
          </div>
        </div>

        {/* Search bar - hidden on mobile */}
        {!isMobile && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                {theme === "system" && <Monitor className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="h-4 w-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Audit Logs Button - Only for admins and principals */}
          {(user?.role === "edufam_admin" ||
            user?.role === "principal" ||
            user?.role === "school_owner") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuditLogsOpen(true)}
              className="relative"
            >
              <Activity className="h-4 w-4" />
              {isMobile && <span className="ml-2 text-xs">Audit</span>}
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationCenterOpen(true)}
            className="relative"
          >
            {unreadCount > 0 ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
            {isMobile && <span className="ml-2 text-xs">Notifications</span>}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt={user?.email}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getRoleIcon(user?.role || "")}
                    <span className="text-xs capitalize">
                      {user?.role?.replace("_", " ") || "User"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />

      {/* Audit Logs Viewer */}
      <AuditLogsViewer
        isOpen={auditLogsOpen}
        onClose={() => setAuditLogsOpen(false)}
      />
    </header>
  );
};

export default EnhancedHeader;
