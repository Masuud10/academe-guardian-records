import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Camera, Phone, Mail, Building, Calendar, DollarSign, Shield } from 'lucide-react';
import { PersonalDetailsTab } from '@/components/profile/PersonalDetailsTab';
import { EmploymentDetailsTab } from '@/components/profile/EmploymentDetailsTab';
import { LeaveRequestsTab } from '@/components/profile/LeaveRequestsTab';
import { SecurityTab } from '@/components/profile/SecurityTab';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  school_id: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  status: string;
  schools: { name: string } | null;
  employment_details: {
    salary: number | null;
    total_leave_days_per_year: number;
    leave_days_taken: number;
  } | null;
}

export const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the new RPC function directly for better reliability
      const { data, error: rpcError } = await supabase.rpc('get_my_complete_profile');

      if (rpcError) {
        throw rpcError;
      }

      // The RPC function returns an array, so we take the first element
      const profile = data?.[0];
      
      if (!profile) {
        throw new Error('No profile data found');
      }

      // Transform the RPC result to match the expected interface
      const transformedProfile: ProfileData = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
        school_id: profile.school_id,
        phone: profile.phone,
        bio: null, // Field doesn't exist in current schema
        avatar_url: profile.avatar_url,
        status: profile.status,
        schools: profile.school_name ? { name: profile.school_name } : null,
        employment_details: profile.salary !== null ? {
          salary: profile.salary,
          total_leave_days_per_year: profile.total_leave_days_per_year || 21,
          leave_days_taken: profile.leave_days_taken || 0
        } : null
      };

      setProfileData(transformedProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data. Please try again later.');
      toast({
        title: "Error", 
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploadingPhoto(true);
      
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfileData(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => fetchProfileData()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Could not find your profile information.</p>
          <Button onClick={() => fetchProfileData()}>Reload</Button>
        </div>
      </div>
    );
  }

  const isStaff = profileData.role !== 'parent';
  const remainingLeaveDays = profileData.employment_details 
    ? profileData.employment_details.total_leave_days_per_year - profileData.employment_details.leave_days_taken
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 text-center space-y-4">
            <div className="relative group inline-block">
              <Avatar className="w-32 h-32 mx-auto">
                <AvatarImage src={profileData.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                  {profileData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploadingPhoto}
                />
                <Camera className="h-8 w-8 text-white" />
              </div>
              
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {profileData.role.replace('_', ' ')}
                </Badge>
              </div>
              {profileData.schools && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{profileData.schools.name}</span>
                </div>
              )}
            </div>

            {isStaff && profileData.employment_details && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Leave Days Remaining</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {remainingLeaveDays} / {profileData.employment_details.total_leave_days_per_year}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Details Panel */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal
                </TabsTrigger>
                {isStaff && (
                  <TabsTrigger value="employment" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Employment
                  </TabsTrigger>
                )}
                {isStaff && (
                  <TabsTrigger value="leave" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Leave Requests
                  </TabsTrigger>
                )}
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-6">
                <PersonalDetailsTab 
                  profileData={profileData} 
                  onUpdate={fetchProfileData}
                />
              </TabsContent>

              {isStaff && (
                <TabsContent value="employment" className="mt-6">
                  <EmploymentDetailsTab employmentData={profileData.employment_details} />
                </TabsContent>
              )}

              {isStaff && (
                <TabsContent value="leave" className="mt-6">
                  <LeaveRequestsTab />
                </TabsContent>
              )}

              <TabsContent value="security" className="mt-6">
                <SecurityTab />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};