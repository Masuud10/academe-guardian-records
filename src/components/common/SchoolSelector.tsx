import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchool } from "@/contexts/SchoolContext";
import { useAuth } from "@/contexts/AuthContext";
import { Building } from "lucide-react";

interface SchoolSelectorProps {
  onSchoolChange?: (schoolId: string) => void;
  className?: string;
}

const SchoolSelector: React.FC<SchoolSelectorProps> = ({
  onSchoolChange,
  className,
}) => {
  const { currentSchool, schools, setCurrentSchool } = useSchool();
  const { user } = useAuth();

  // School selector not available in school application
  return null;

  // Don't show if there's only one school or no schools
  if (schools.length <= 1) {
    return null;
  }

  const handleSchoolChange = (schoolId: string) => {
    const selectedSchool = schools.find((school) => school.id === schoolId);
    if (selectedSchool) {
      setCurrentSchool(selectedSchool);
      onSchoolChange?.(schoolId);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Building className="w-4 h-4 text-muted-foreground" />
      <Select
        value={currentSchool?.id || ""}
        onValueChange={handleSchoolChange}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a school..." />
        </SelectTrigger>
        <SelectContent>
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id}>
              {school.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SchoolSelector;
