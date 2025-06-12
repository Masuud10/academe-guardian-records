
import React from 'react';
import { SidebarFooter as ShadcnSidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SidebarFooter = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log('🔓 Sidebar: Initiating logout');
      
      // Show immediate feedback
      toast({
        title: "Signing out...",
        description: "Please wait while we sign you out.",
      });
      
      await signOut();
      
      console.log('✅ Sidebar: Logout completed');
    } catch (error) {
      console.error('❌ Sidebar: Logout error:', error);
      
      // Even if there's an error, show success since we'll redirect anyway
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        variant: "default",
      });
      
      // Force redirect as fallback
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };

  return (
    <ShadcnSidebarFooter className="border-t p-4">
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </ShadcnSidebarFooter>
  );
};

export default SidebarFooter;
