'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, Pills, AlertTriangle, Heart } from 'lucide-react';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
import { supabase } from '../utils/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    expiring: 0,
    expired: 0,
    donated: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const today = new Date();
      const stats = {
        total: data.length,
        expiring: data.filter(medicine => {
          const expiryDate = new Date(medicine.expiry_date);
          return differenceInDays(expiryDate, today) <= 7 && isAfter(expiryDate, today);
        }).length,
        expired: data.filter(medicine => isBefore(new Date(medicine.expiry_date), today)).length,
        donated: data.filter(medicine => medicine.marked_for_donation).length,
      };

      setStats(stats);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Medicines',
      value: stats.total,
      icon: Pills,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiring,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Expired',
      value: stats.expired,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Marked for Donation',
      value: stats.donated,
      icon: Heart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-lg border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-lg ${stat.bgColor} p-2`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 