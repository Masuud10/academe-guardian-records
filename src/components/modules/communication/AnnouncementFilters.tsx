import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { AnnouncementFilters as FiltersType } from "@/hooks/useEnhancedAnnouncements";

interface AnnouncementFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

const AnnouncementFilters: React.FC<AnnouncementFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const audienceOptions = [
    { value: "school_directors", label: "School Directors" },
    { value: "principals", label: "Principals" },
    { value: "teachers", label: "Teachers" },
    { value: "parents", label: "Parents" },
    { value: "finance_officers", label: "Finance Officers" },
  ];

  const regionOptions = [
    { value: "nairobi", label: "Nairobi" },
    { value: "central", label: "Central Kenya" },
    { value: "coast", label: "Coast" },
    { value: "eastern", label: "Eastern" },
    { value: "north_eastern", label: "North Eastern" },
    { value: "nyanza", label: "Nyanza" },
    { value: "rift_valley", label: "Rift Valley" },
    { value: "western", label: "Western" },
  ];

  const handleAudienceChange = (value: string, checked: boolean) => {
    const currentAudience = filters.target_audience || [];
    const newAudience = checked
      ? [...currentAudience, value]
      : currentAudience.filter((item) => item !== value);

    onFiltersChange({
      ...filters,
      target_audience: newAudience.length > 0 ? newAudience : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      is_archived: filters.is_archived,
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => key !== "is_archived" && filters[key as keyof FiltersType]
  ).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium">Priority</Label>
            <Select
              value={filters.priority || ""}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  priority: value || undefined,
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any priority</SelectItem>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Region</Label>
            <Select
              value={filters.region || ""}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  region: value || undefined,
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Any region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any region</SelectItem>
                {regionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Target Audience
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {audienceOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`filter-${option.value}`}
                    checked={
                      filters.target_audience?.includes(option.value) || false
                    }
                    onCheckedChange={(checked) =>
                      handleAudienceChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`filter-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Active Filters
              </Label>
              <div className="flex flex-wrap gap-1">
                {filters.priority && (
                  <Badge variant="secondary" className="text-xs">
                    Priority: {filters.priority}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() =>
                        onFiltersChange({ ...filters, priority: undefined })
                      }
                    />
                  </Badge>
                )}
                {filters.region && (
                  <Badge variant="secondary" className="text-xs">
                    Region: {filters.region}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() =>
                        onFiltersChange({ ...filters, region: undefined })
                      }
                    />
                  </Badge>
                )}
                {filters.target_audience?.map((audience) => (
                  <Badge key={audience} variant="secondary" className="text-xs">
                    {audience}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleAudienceChange(audience, false)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AnnouncementFilters;
