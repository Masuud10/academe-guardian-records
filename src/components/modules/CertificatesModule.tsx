import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import CertificateGenerator from "@/components/certificates/CertificateGenerator";
import CertificatesList from "@/components/certificates/CertificatesList";
import CertificateTemplateManager from "@/components/certificates/CertificateTemplateManager";
import RoleGuard from "@/components/common/RoleGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Eye, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CertificatesModule = () => {
  const { user } = useAuth();
  const [showGenerator, setShowGenerator] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("certificates");

  // Role-based content rendering
  const renderContent = () => {
    switch (user?.role) {
      case "principal":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Certificate Management
                </h1>
                <p className="text-muted-foreground">
                  Generate and manage academic certificates for students.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("templates")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "templates"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Templates
                </button>
                <button
                  onClick={() => setActiveTab("certificates")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "certificates"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Certificates
                </button>
                <button
                  onClick={() => setShowGenerator(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Generate Certificate
                </button>
              </div>
            </div>

            {activeTab === "templates" ? (
              <CertificateTemplateManager />
            ) : (
              <CertificatesList />
            )}

            <CertificateGenerator
              open={showGenerator}
              onClose={() => setShowGenerator(false)}
              onCertificateGenerated={() => setShowGenerator(false)}
            />
          </div>
        );

      case "school_director":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                School Certificates
              </h1>
              <p className="text-muted-foreground">
                View academic certificates generated for your school students.
              </p>
            </div>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    You have view-only access to certificates. Only principals
                    can generate new certificates.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <CertificatesList />
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600">
              You don't have permission to access the certificates module.
            </p>
          </div>
        );
    }
  };

  return (
    <RoleGuard
      allowedRoles={["principal", "school_director"]}
      requireSchoolAssignment
    >
      {renderContent()}
    </RoleGuard>
  );
};

export default CertificatesModule;
