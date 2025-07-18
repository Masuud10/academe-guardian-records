import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BeautifulReportGenerationProps {
  userRole:
    | "principal"
    | "school_director"
    | "finance_officer"
    | "teacher"
    | "parent"
    | "edufam_admin";
}

const BeautifulReportGeneration = ({
  userRole,
}: BeautifulReportGenerationProps) => {
  const [activeCategory, setActiveCategory] = useState("academic");
  const [reportType, setReportType] = useState("");
  const [format, setFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState("current_term");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getReportCategories = () => {
    const categories = {
      academic: {
        icon: BarChart3,
        label: "Academic Reports",
        color: "blue",
        reports: [
          {
            value: "grade_summary",
            label: "Grade Summary Report",
            description: "Comprehensive academic performance overview",
          },
          {
            value: "attendance_summary",
            label: "Attendance Summary",
            description: "Student attendance tracking and analysis",
          },
          {
            value: "class_performance",
            label: "Class Performance",
            description: "Subject-wise class performance metrics",
          },
        ],
      },
      financial: {
        icon: DollarSign,
        label: "Financial Reports",
        color: "green",
        reports: [
          {
            value: "fee_collection",
            label: "Fee Collection Report",
            description: "Fee payment status and collection analytics",
          },
          {
            value: "outstanding_fees",
            label: "Outstanding Fees",
            description: "Unpaid fees and defaulter tracking",
          },
          {
            value: "expense_summary",
            label: "Expense Summary",
            description: "School expenditure breakdown and analysis",
          },
        ],
      },
      administrative: {
        icon: Users,
        label: "Administrative Reports",
        color: "purple",
        reports: [
          {
            value: "staff_summary",
            label: "Staff Summary",
            description: "Teacher and staff management overview",
          },
          {
            value: "student_enrollment",
            label: "Student Enrollment",
            description: "Student registration and demographic data",
          },
          {
            value: "school_analytics",
            label: "School Analytics",
            description: "Comprehensive school performance metrics",
          },
        ],
      },
    };

    // Filter categories based on user role
    switch (userRole) {
      case "parent":
        return {
          academic: {
            ...categories.academic,
            reports: [
              {
                value: "child_grades",
                label: "Child Grade Report",
                description: "Your child's academic performance",
              },
              {
                value: "child_attendance",
                label: "Child Attendance",
                description: "Your child's attendance record",
              },
            ],
          },
        };
      case "teacher":
        return {
          academic: {
            ...categories.academic,
            reports: categories.academic.reports.filter(
              (r) => r.value !== "school_analytics"
            ),
          },
        };
      case "finance_officer":
        return { financial: categories.financial };
      default:
        return categories;
    }
  };

  const categories = getReportCategories();

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast({
        title: "Please select a report",
        description: "Choose a report type before generating",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const selectedReport = Object.values(categories)
        .flatMap((cat) => cat.reports)
        .find((r) => r.value === reportType);

      toast({
        title: "Report Generated Successfully",
        description: `${
          selectedReport?.label
        } has been exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description:
          "An error occurred while generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const CategoryIcon =
    categories[activeCategory as keyof typeof categories]?.icon || FileText;
  const categoryColor =
    categories[activeCategory as keyof typeof categories]?.color || "blue";

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50/50 border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              `bg-${categoryColor}-600 text-white`
            )}
          >
            <FileText className="w-6 h-6" />
          </div>
          Beautiful Report Generation
        </CardTitle>
        <p className="text-muted-foreground">
          Generate comprehensive reports with modern, professional formatting
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex items-center gap-2 p-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(categories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-2 mb-4">
                  <category.icon
                    className={`w-5 h-5 text-${category.color}-600`}
                  />
                  <h3 className="text-lg font-semibold">{category.label}</h3>
                </div>

                <div className="grid gap-3">
                  {category.reports.map((report) => (
                    <div
                      key={report.value}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                        reportType === report.value
                          ? `border-${category.color}-500 bg-${category.color}-50/50`
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setReportType(report.value)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{report.label}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        </div>
                        {reportType === report.value && (
                          <Badge
                            variant="default"
                            className={`bg-${category.color}-600`}
                          >
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50/50 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_term">Current Term</SelectItem>
                <SelectItem value="current_year">Current Year</SelectItem>
                <SelectItem value="last_term">Last Term</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Export Format
            </label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generation Actions */}
        <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Generated reports include professional formatting and branding
            </span>
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || !reportType}
            className="flex items-center gap-2 min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>

        {/* Status Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium">
              Professional Report Features
            </p>
            <p className="text-blue-700 mt-1">
              All reports include charts, tables, school branding, and are
              optimized for printing and digital sharing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeautifulReportGeneration;
