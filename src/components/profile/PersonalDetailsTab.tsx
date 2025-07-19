import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Edit, Save, X, Mail, Phone, User, FileText } from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  bio: string | null;
}

interface PersonalDetailsTabProps {
  profileData: ProfileData;
  onUpdate: () => void;
}

export const PersonalDetailsTab: React.FC<PersonalDetailsTabProps> = ({
  profileData,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profileData.name || '',
    phone: profileData.phone || '',
    bio: profileData.bio || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: profileData.name || '',
      phone: profileData.phone || '',
      bio: profileData.bio || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profileData.name || '',
      phone: profileData.phone || '',
      bio: profileData.bio || '',
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('my-profile', {
        method: 'PATCH',
        body: formData,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Personal details updated successfully",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update personal details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Personal Details</h3>
          <p className="text-sm text-muted-foreground">
            Update your personal information and contact details
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-4 w-4 text-primary" />
            </div>
            <Label className="text-sm font-medium">Full Name</Label>
          </div>
          {isEditing ? (
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{profileData.name || 'Not provided'}</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <Label className="text-sm font-medium">Email Address</Label>
          </div>
          <p className="text-sm text-muted-foreground">{profileData.email}</p>
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <Label className="text-sm font-medium">Phone Number</Label>
          </div>
          {isEditing ? (
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              type="tel"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{profileData.phone || 'Not provided'}</p>
          )}
        </Card>

        <Card className="p-4 md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <Label className="text-sm font-medium">Bio</Label>
          </div>
          {isEditing ? (
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us a bit about yourself..."
              rows={3}
            />
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {profileData.bio || 'No bio provided'}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};