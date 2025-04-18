'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Home, PlusCircle, Pill, Heart, User, Loader2 } from 'lucide-react';
import { supabase } from './utils/supabase';

const menuItems = [
  {
    title: 'Dashboard',
    description: 'View your medicine overview',
    icon: Home,
    href: '/dashboard',
  },
  {
    title: 'Add Medicine',
    description: 'Add a new medicine to your inventory',
    icon: PlusCircle,
    href: '/add-medicine',
  },
  {
    title: 'My Medicines',
    description: 'Manage your medicine inventory',
    icon: Pill,
    href: '/my-medicines',
  },
  {
    title: 'Donate',
    description: 'View and manage donations',
    icon: Heart,
    href: '/donate',
  },
  {
    title: 'Profile',
    description: 'Manage your account settings',
    icon: User,
    href: '/profile',
  },
];

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw authError;
      }

      setUser(user);
      if (!user) {
        router.push('/login');
      }
    } catch (error) {
      setError(error.message);
      toast.error('Failed to check authentication status. Please try again.');
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      router.push('/login');
      toast.success('Successfully signed out');
    } catch (error) {
      setError(error.message);
      toast.error('Failed to sign out. Please try again.');
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-destructive">An error occurred</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome to MediTrack</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Manage your medicines and donations in one place
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
          >
            Sign out
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() => router.push(item.href)}
                className="group flex flex-col items-start rounded-lg border bg-card p-6 text-left transition-colors hover:bg-accent"
              >
                <div className="mb-4 rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 