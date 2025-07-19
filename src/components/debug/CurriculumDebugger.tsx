import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, BookOpen, Target, Award, AlertTriangle } from "lucide-react";
import { useClassCurriculum } from "@/hooks/useClassCurriculum";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import {
  detectCurriculumType,
  validateCurriculumType,
} from "@/utils/curriculum-detector";

interface ClassData {
  id: string;
  name: string;
  curriculum_type: string;
  school_id: string;
}

export const CurriculumDebugger: React.FC = () => {
  const { schoolId } = useSchoolScopedData();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    curriculumType,
    loading: curriculumLoading,
    error: curriculumError,
    classData,
    refreshCurriculum,
  } = useClassCurriculum(selectedClassId);

  // Load classes for the school
  useEffect(() => {
    const loadClasses = async () => {
      if (!schoolId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("classes")
          .select("id, name, curriculum_type, school_id")
          .eq("school_id", schoolId)
          .order("name");

        if (error) throw error;
        setClasses(data || []);
      } catch (error) {
        console.error("Error loading classes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [schoolId]);

  const getCurriculumIcon = (type: string) => {
    switch (type) {
      case "cbc":
        return <Target className="w-4 h-4 text-green-600" />;
      case "igcse":
        return <Award className="w-4 h-4 text-purple-600" />;
      case "standard":
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getCurriculumColor = (type: string) => {
    switch (type) {
      case "cbc":
        return "bg-green-100 text-green-800 border-green-200";
      case "igcse":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "standard":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Curriculum Detection Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Class
              </label>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class to test" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <div className="flex items-center gap-2 p-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading classes...
                    </div>
                  ) : (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex items-center gap-2">
                          {cls.name}
                          <Badge
                            variant="outline"
                            className={getCurriculumColor(cls.curriculum_type)}
                          >
                            {cls.curriculum_type || "None"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Actions</label>
              <Button
                onClick={refreshCurriculum}
                disabled={!selectedClassId || curriculumLoading}
                className="w-full"
              >
                {curriculumLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Refreshing...
                  </>
                ) : (
                  "Refresh Curriculum Data"
                )}
              </Button>
            </div>
          </div>

          {selectedClassId && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Curriculum Detection Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {curriculumLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold">
                            Detecting Curriculum
                          </h3>
                          <p className="text-sm text-gray-600">
                            Analyzing class configuration...
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : curriculumError ? (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-800">
                        Curriculum Error
                      </AlertTitle>
                      <AlertDescription className="text-red-700">
                        {curriculumError}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">
                            Raw Database Data
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                            <div>
                              <strong>Class ID:</strong> {classData?.id}
                            </div>
                            <div>
                              <strong>Class Name:</strong> {classData?.name}
                            </div>
                            <div>
                              <strong>Raw Curriculum Type:</strong>{" "}
                              {classData?.curriculum_type || "None"}
                            </div>
                            <div>
                              <strong>School ID:</strong> {classData?.school_id}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">
                            Processed Results
                          </h4>
                          <div className="bg-blue-50 p-3 rounded-lg space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <strong>Detected Type:</strong>
                              <Badge
                                className={getCurriculumColor(curriculumType)}
                              >
                                {getCurriculumIcon(curriculumType)}
                                {curriculumType}
                              </Badge>
                            </div>
                            <div>
                              <strong>Validation:</strong>{" "}
                              {validateCurriculumType(curriculumType).isValid
                                ? "Valid"
                                : "Invalid"}
                            </div>
                            <div>
                              <strong>Detection Method:</strong>{" "}
                              {detectCurriculumType(curriculumType)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Validation Details</h4>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(
                              validateCurriculumType(curriculumType),
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    All Classes in School
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {classes.map((cls) => (
                      <div
                        key={cls.id}
                        className={`p-3 rounded-lg border ${
                          cls.id === selectedClassId
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{cls.name}</span>
                            <Badge
                              variant="outline"
                              className={getCurriculumColor(
                                cls.curriculum_type
                              )}
                            >
                              {getCurriculumIcon(cls.curriculum_type)}
                              {cls.curriculum_type || "None"}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedClassId(cls.id)}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
