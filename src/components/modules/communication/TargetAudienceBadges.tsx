import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  GraduationCap,
  Heart,
  Calculator,
} from "lucide-react";

interface TargetAudienceBadgesProps {
  audiences: string[];
  maxDisplay?: number;
}

const TargetAudienceBadges: React.FC<TargetAudienceBadgesProps> = ({
  audiences,
  maxDisplay = 3,
}) => {
  const getAudienceConfig = (audience: string) => {
    switch (audience) {
      case "school_directors":
        return {
          icon: UserCheck,
          label: "School Directors",
          color: "bg-purple-100 text-purple-700",
        };
      case "principals":
        return {
          icon: UserCheck,
          label: "Principals",
          color: "bg-blue-100 text-blue-700",
        };
      case "teachers":
        return {
          icon: GraduationCap,
          label: "Teachers",
          color: "bg-green-100 text-green-700",
        };
      case "parents":
        return {
          icon: Heart,
          label: "Parents",
          color: "bg-pink-100 text-pink-700",
        };
      case "finance_officers":
        return {
          icon: Calculator,
          label: "Finance Officers",
          color: "bg-orange-100 text-orange-700",
        };
      default:
        return {
          icon: Users,
          label: audience.replace("_", " "),
          color: "bg-gray-100 text-gray-700",
        };
    }
  };

  const displayAudiences = audiences.slice(0, maxDisplay);
  const remainingCount = audiences.length - maxDisplay;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {displayAudiences.map((audience) => {
        const config = getAudienceConfig(audience);
        const Icon = config.icon;

        return (
          <Badge
            key={audience}
            variant="outline"
            className={`${config.color} text-xs border-0`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        );
      })}

      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs text-gray-600">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};

export default TargetAudienceBadges;
