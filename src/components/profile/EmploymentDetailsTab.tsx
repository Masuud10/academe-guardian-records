import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Calendar, Clock, TrendingUp } from 'lucide-react';

interface EmploymentData {
  salary: number | null;
  total_leave_days_per_year: number;
  leave_days_taken: number;
}

interface EmploymentDetailsTabProps {
  employmentData: EmploymentData | null;
}

export const EmploymentDetailsTab: React.FC<EmploymentDetailsTabProps> = ({
  employmentData,
}) => {
  if (!employmentData) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Employment Details</h3>
          <p className="text-sm text-muted-foreground">
            Your employment information and benefits
          </p>
        </div>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No employment details found. Please contact HR for assistance.
          </p>
        </Card>
      </div>
    );
  }

  const remainingLeaveDays = employmentData.total_leave_days_per_year - employmentData.leave_days_taken;
  const leaveUsagePercentage = (employmentData.leave_days_taken / employmentData.total_leave_days_per_year) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Employment Details</h3>
        <p className="text-sm text-muted-foreground">
          Your employment information and benefits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employmentData.salary && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold">Annual Salary</h4>
                <p className="text-sm text-muted-foreground">Gross annual compensation</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${employmentData.salary.toLocaleString()}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold">Annual Leave Entitlement</h4>
              <p className="text-sm text-muted-foreground">Total days per year</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {employmentData.total_leave_days_per_year} days
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold">Leave Days Used</h4>
              <p className="text-sm text-muted-foreground">Days taken this year</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {employmentData.leave_days_taken} days
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold">Remaining Leave</h4>
              <p className="text-sm text-muted-foreground">Available this year</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {remainingLeaveDays} days
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Leave Usage Progress</h4>
            <span className="text-sm text-muted-foreground">
              {leaveUsagePercentage.toFixed(1)}% used
            </span>
          </div>
          
          <Progress 
            value={leaveUsagePercentage} 
            className="h-3"
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0 days</span>
            <span>{employmentData.total_leave_days_per_year} days</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {employmentData.leave_days_taken}
              </div>
              <div className="text-xs text-muted-foreground">Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {remainingLeaveDays}
              </div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};