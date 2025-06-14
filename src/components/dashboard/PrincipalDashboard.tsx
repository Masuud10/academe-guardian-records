
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, BookOpen, TrendingUp, Plus, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getCurrentSchoolId, validateSchoolAccess } = useSchoolScopedData();
  const [stats, setStats] = useState<SchoolStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const schoolId = getCurrentSchoolId();

  console.log('📊 PrincipalDashboard: Initializing for user:', {
    email: user?.email,
    role: user?.role,
    schoolId: schoolId,
    userSchoolId: user?.school_id
  });

  useEffect(() => {
    // Ensure we have proper access before loading data
    const effectiveSchoolId = schoolId || user?.school_id;
    
    if (effectiveSchoolId) {
      console.log('📊 PrincipalDashboard: Loading data for school:', effectiveSchoolId);
      fetchSchoolData();
    } else {
      console.warn('📊 PrincipalDashboard: No school ID available');
      setLoading(false);
      setError('No school assignment found. Please contact your administrator.');
    }
  }, [schoolId, user?.school_id]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const effectiveSchoolId = schoolId || user?.school_id;
      
      if (!effectiveSchoolId) {
        throw new Error('No school ID available for data fetch');
      }

      console.log('📊 PrincipalDashboard: Fetching data for school:', effectiveSchoolId);

      // Validate school access
      if (validateSchoolAccess && !validateSchoolAccess({ school_id: effectiveSchoolId })) {
        throw new Error('Access denied to school data');
      }

      // Fetch all data in parallel with proper error handling
      const [
        studentsResult,
        teachersResult,
        subjectsResult,
        classesResult,
        announcementsResult
      ] = await Promise.allSettled([
        supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('school_id', effectiveSchoolId)
          .eq('is_active', true),
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('school_id', effectiveSchoolId)
          .eq('role', 'teacher'),
        supabase
          .from('subjects')
          .select('id', { count: 'exact' })
          .eq('school_id', effectiveSchoolId),
        supabase
          .from('classes')
          .select('id', { count: 'exact' })
          .eq('school_id', effectiveSchoolId),
        supabase
          .from('announcements')
          .select('id, title, created_at')
          .eq('school_id', effectiveSchoolId)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Process results and handle individual failures gracefully
      const studentsCount = studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0;
      const teachersCount = teachersResult.status === 'fulfilled' ? (teachersResult.value.count || 0) : 0;
      const subjectsCount = subjectsResult.status === 'fulfilled' ? (subjectsResult.value.count || 0) : 0;
      const classesCount = classesResult.status === 'fulfilled' ? (classesResult.value.count || 0) : 0;

      setStats({
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalSubjects: subjectsCount,
        totalClasses: classesCount
      });

      // Process announcements
      const announcements = announcementsResult.status === 'fulfilled' ? (announcementsResult.value.data || []) : [];
      const activities = announcements.map(announcement => ({
        id: announcement.id,
        type: 'announcement',
        description: `New announcement: ${announcement.title || 'Untitled'}`,
        timestamp: announcement.created_at
      }));

      setRecentActivities(activities);

      console.log('📊 PrincipalDashboard: Data loaded successfully:', {
        stats: { studentsCount, teachersCount, subjectsCount, classesCount },
        activitiesCount: activities.length
      });

      // Log any failed requests
      [studentsResult, teachersResult, subjectsResult, classesResult, announcementsResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`📊 PrincipalDashboard: Query ${index} failed:`, result.reason);
        }
      });

    } catch (error: any) {
      console.error('📊 PrincipalDashboard: Error fetching school data:', error);
      setError(error.message || 'Failed to fetch school data');
      
      toast({
        title: "Error",
        description: `Failed to fetch school data: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: "Active students in school",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      description: "Teaching staff members",
      icon: GraduationCap,
      color: "text-green-600"
    },
    {
      title: "Total Subjects",
      value: stats.totalSubjects,
      description: "Subjects offered",
      icon: BookOpen,
      color: "text-purple-600"
    },
    {
      title: "Total Classes",
      value: stats.totalClasses,
      description: "Active class groups",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  // Error state
  if (error && !loading) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Principal Dashboard Error
          </CardTitle>
          <CardDescription>
            There was a problem loading your dashboard data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchSchoolData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Principal Dashboard</h2>
          <p className="text-gray-600">Loading your school data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Principal Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Principal'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-blue-50">
              <Users className="h-6 w-6" />
              <span>Manage Students</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-green-50">
              <GraduationCap className="h-6 w-6" />
              <span>Manage Teachers</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-purple-50">
              <Calendar className="h-6 w-6" />
              <span>View Timetable</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-orange-50">
              <MessageSquare className="h-6 w-6" />
              <span>Announcements</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Latest activities in your school
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">{activity.type}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent activities</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalDashboard;
