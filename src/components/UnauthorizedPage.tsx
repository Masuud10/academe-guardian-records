import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RouteGuard } from "@/utils/routeGuard";

const UnauthorizedPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    if (user) {
      const sections = RouteGuard.getUserAccessibleSections(user);
      if (sections.primarySection === "school") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F5F6FA] p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Access Denied
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <Lock className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              You don't have permission to access this area. This section is
              restricted to authorized users only.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              {user ? (
                <>
                  You are logged in as <strong>{user.name}</strong> ({user.role}
                  ).
                  <br />
                  Please contact support if you believe this is an error.
                </>
              ) : (
                "Please log in with appropriate credentials to access this area."
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>

            <Button
              onClick={handleGoHome}
              className="w-full bg-[#1A237E] hover:bg-blue-900"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>

            {user && (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              If you continue to experience issues, please contact support at{" "}
              <a
                href="mailto:support@edufam.co.ke"
                className="text-blue-600 hover:underline"
              >
                support@edufam.co.ke
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
