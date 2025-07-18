import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DeactivatedAccountMessage: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleContactSupport = () => {
    // You can customize this to open a support ticket form or redirect to support page
    window.location.href = "/support";
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            🔒 Account Deactivated
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-red-700">
            <p className="mb-2">
              Your account has been deactivated by the system.
            </p>
            <p>
              If you believe this is a mistake or require further assistance,
              please contact support.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContactSupport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeactivatedAccountMessage;
