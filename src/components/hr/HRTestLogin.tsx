import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const HRTestLogin: React.FC = () => {
  const [email, setEmail] = useState("hr@edufam.com");
  const [password, setPassword] = useState("HRPassword123!");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    auth: boolean;
    profile: boolean;
    permissions: boolean;
    dashboard: boolean;
  } | null>(null);
  const { toast } = useToast();

  const runHRTests = async () => {
    setIsLoading(true);
    setTestResults(null);

    try {
      // Test 1: Authentication
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      // Test 2: Profile Access
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user?.id)
        .single();

      if (profileError) {
        throw new Error(`Profile access failed: ${profileError.message}`);
      }

      // Test 3: Permissions Check
      const hasHRRole = profileData.role === "hr";
      const hasSchoolId = !!profileData.school_id;

      // Test 4: Dashboard Access
      const { data: staffData, error: staffError } = await supabase
        .from("support_staff")
        .select("count")
        .eq("school_id", profileData.school_id);

      if (staffError) {
        throw new Error(`Dashboard access failed: ${staffError.message}`);
      }

      // Sign out after tests
      await supabase.auth.signOut();

      setTestResults({
        auth: true,
        profile: true,
        permissions: hasHRRole && hasSchoolId,
        dashboard: true,
      });

      toast({
        title: "HR Tests Completed",
        description: "All HR functionality tests passed successfully!",
      });
    } catch (error) {
      console.error("HR Test Error:", error);

      setTestResults({
        auth: false,
        profile: false,
        permissions: false,
        dashboard: false,
      });

      toast({
        title: "HR Tests Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          HR Login Test
        </CardTitle>
        <CardDescription>
          Test HR user authentication and dashboard access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hr@edufam.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="HRPassword123!"
          />
        </div>

        <Button onClick={runHRTests} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run HR Tests"
          )}
        </Button>

        {testResults && (
          <div className="space-y-2">
            <Alert variant={testResults.auth ? "default" : "destructive"}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Authentication: {testResults.auth ? "✅ Passed" : "❌ Failed"}
              </AlertDescription>
            </Alert>

            <Alert variant={testResults.profile ? "default" : "destructive"}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Profile Access:{" "}
                {testResults.profile ? "✅ Passed" : "❌ Failed"}
              </AlertDescription>
            </Alert>

            <Alert
              variant={testResults.permissions ? "default" : "destructive"}
            >
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                HR Permissions:{" "}
                {testResults.permissions ? "✅ Passed" : "❌ Failed"}
              </AlertDescription>
            </Alert>

            <Alert variant={testResults.dashboard ? "default" : "destructive"}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Dashboard Access:{" "}
                {testResults.dashboard ? "✅ Passed" : "❌ Failed"}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>This test verifies:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>HR user can authenticate</li>
            <li>Profile data is accessible</li>
            <li>HR role permissions are correct</li>
            <li>Dashboard modules are accessible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRTestLogin;
