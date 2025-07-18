import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Database, 
  Activity,
  Download,
  Filter,
  Settings
} from 'lucide-react';
import DataPipelineMonitor from './DataPipelineMonitor';
import RealtimeAnalytics from './RealtimeAnalytics';

import { useAuth } from '@/contexts/AuthContext';
import ReportDownloadPanel from "@/components/reports/ReportDownloadPanel";

interface AdvancedAnalyticsDashboardProps {
  filters: {
    term: string;
  };
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({ filters }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const isSystemAdmin = false; // Admin roles removed for school app
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive data insights and pipeline monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Live Data
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add Report download for edufam admin users */}
      {isSystemAdmin && (
        <ReportDownloadPanel hideCard={false} showAll />
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Pipeline
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Overview Analytics</h3>
              <p className="text-muted-foreground">
                School-specific analytics and performance metrics are displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime">
          <RealtimeAnalytics />
        </TabsContent>

        <TabsContent value="pipeline">
          {isSystemAdmin ? (
            <DataPipelineMonitor />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pipeline Monitoring</h3>
                <p className="text-muted-foreground">
                  Data pipeline monitoring is available for system administrators only.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">📈 Grade Performance</h4>
                    <p className="text-sm text-green-700">
                      Average grades have improved by 12% this term compared to last term.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">👥 Attendance Trends</h4>
                    <p className="text-sm text-blue-700">
                      Attendance rates are consistently above 90% across all schools.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">💰 Finance Patterns</h4>
                    <p className="text-sm text-purple-700">
                      Mobile payment adoption has increased by 35% this quarter.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Database Performance</span>
                    <Badge variant="default" className="bg-green-500">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">API Response Time</span>
                    <Badge variant="default" className="bg-green-500">245ms</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Error Rate</span>
                    <Badge variant="outline">0.12%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">User Satisfaction</span>
                    <Badge variant="default" className="bg-blue-500">4.7/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🎯 Focus Areas</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Improve attendance tracking in Grade 7 classes</li>
                      <li>• Optimize fee collection reminders</li>
                      <li>• Enhance parent engagement metrics</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">⚡ Quick Wins</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Enable SMS notifications for low attendance</li>
                      <li>• Implement automated fee payment reminders</li>
                      <li>• Create weekly performance summary reports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
