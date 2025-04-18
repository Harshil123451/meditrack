'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { supabase } from '../utils/supabase';
import { Loader2, User, Mail, Key, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
    } catch (error) {
      toast.error('Failed to fetch user data');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Error signing out:', error);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      });
      if (error) throw error;
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      toast.error('Failed to send password reset email');
      console.error('Error sending password reset:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Account Information</h2>
              <p className="text-sm text-muted-foreground">Manage your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={handlePasswordReset}
                className="text-sm text-primary hover:underline"
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 