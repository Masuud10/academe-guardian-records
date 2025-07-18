import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save, Upload } from "lucide-react";

interface SchoolDetails {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
  website_url: string;
  motto: string;
  slogan: string;
  principal_name: string;
  principal_contact: string;
}

const SchoolRegistrationDetails = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<SchoolDetails>>({});

  // Get school details
  const { data: school, isLoading } = useQuery({
    queryKey: ["school-details", schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("id", schoolId)
        .single();

      if (error) throw error;

      // Map database fields to component interface
      return {
        id: data.id,
        name: data.name || "",
        location: data.location || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        logo_url: data.logo_url || "",
        website_url: data.website_url || "",
        motto: data.motto || "",
        slogan: data.slogan || "",
        principal_name: data.owner_information || "",
        principal_contact: data.phone || "",
      } as SchoolDetails;
    },
    enabled: !!schoolId,
  });

  // Update form data when school data changes
  useEffect(() => {
    if (school) {
      setFormData(school);
    }
  }, [school]);

  const updateSchoolMutation = useMutation({
    mutationFn: async (updates: Partial<SchoolDetails>) => {
      // Map component fields back to database fields
      const dbUpdates = {
        name: updates.name,
        address: updates.address,
        phone: updates.phone,
        email: updates.email,
        location: updates.location,
        logo_url: updates.logo_url,
        website_url: updates.website_url,
        motto: updates.motto,
        slogan: updates.slogan,
        owner_information: updates.principal_name,
      };

      const { data, error } = await supabase
        .from("schools")
        .update(dbUpdates)
        .eq("id", schoolId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-details"] });
      toast({
        title: "Success",
        description: "School details updated successfully",
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update school details";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof SchoolDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolMutation.mutate(formData);
  };

  const canEdit = ["principal", "school_director", "edufam_admin"].includes(
    user?.role || ""
  );

  if (!canEdit) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            You don't have permission to edit school details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            School Registration Details
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your school's official information for certificates and reports
        </p>
      </div>

      {/* School Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            School Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter school name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="City, County"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="school@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+254 XXX XXXXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={formData.website_url || ""}
                    onChange={(e) =>
                      handleInputChange("website_url", e.target.value)
                    }
                    placeholder="https://www.school.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_url">School Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url || ""}
                    onChange={(e) =>
                      handleInputChange("logo_url", e.target.value)
                    }
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Physical Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter the complete physical address"
                  required
                />
              </div>

              {/* School Branding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="motto">School Motto</Label>
                  <Input
                    id="motto"
                    value={formData.motto || ""}
                    onChange={(e) => handleInputChange("motto", e.target.value)}
                    placeholder="Excellence in Education"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">School Slogan</Label>
                  <Input
                    id="slogan"
                    value={formData.slogan || ""}
                    onChange={(e) =>
                      handleInputChange("slogan", e.target.value)
                    }
                    placeholder="Nurturing Future Leaders"
                  />
                </div>
              </div>

              {/* Principal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="principal_name">Principal Name *</Label>
                  <Input
                    id="principal_name"
                    value={formData.principal_name || ""}
                    onChange={(e) =>
                      handleInputChange("principal_name", e.target.value)
                    }
                    placeholder="Dr. Jane Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="principal_contact">Principal Contact *</Label>
                  <Input
                    id="principal_contact"
                    value={formData.principal_contact || ""}
                    onChange={(e) =>
                      handleInputChange("principal_contact", e.target.value)
                    }
                    placeholder="+254 XXX XXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateSchoolMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateSchoolMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Information Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Building2 className="h-5 w-5 text-yellow-600 mt-0.5" />
            </div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Information</p>
              <p>
                These details will appear on all certificates, reports, and
                official documents. Please ensure all information is accurate
                and up-to-date. Fields marked with * are required.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolRegistrationDetails;
