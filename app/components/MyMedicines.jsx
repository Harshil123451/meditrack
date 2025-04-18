'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, PlusCircle, Calendar, Filter } from 'lucide-react';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
import { supabase } from '../utils/supabase';

export default function MyMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const router = useRouter();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
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
      setMedicines(data || []);
    } catch (error) {
      toast.error('Failed to fetch medicines');
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkForDonation = async (medicineId) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .update({ marked_for_donation: true })
        .eq('id', medicineId);

      if (error) throw error;
      toast.success('Medicine marked for donation');
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to mark medicine for donation');
      console.error('Error marking medicine for donation:', error);
    }
  };

  const filteredMedicines = medicines.filter((medicine) => {
    const expiryDate = new Date(medicine.expiry_date);
    const today = new Date();

    switch (filter) {
      case 'expiring':
        return differenceInDays(expiryDate, today) <= 7 && isAfter(expiryDate, today);
      case 'expired':
        return isBefore(expiryDate, today);
      default:
        return true;
    }
  });

  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    const dateA = new Date(a.expiry_date);
    const dateB = new Date(b.expiry_date);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">No medicines found</p>
        <button
          onClick={() => router.push('/add-medicine')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" />
          Add Medicine
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My Medicines</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Medicines</option>
              <option value="expiring">Expiring in 7 days</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {sortOrder === 'asc' ? 'Soonest First' : 'Latest First'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedMedicines.map((medicine) => {
          const expiryDate = new Date(medicine.expiry_date);
          const today = new Date();
          const daysUntilExpiry = differenceInDays(expiryDate, today);
          const isExpired = isBefore(expiryDate, today);
          const isExpiringSoon = daysUntilExpiry <= 7 && !isExpired;

          return (
            <div
              key={medicine.id}
              className={`rounded-lg border bg-card p-4 shadow-sm ${
                isExpired ? 'border-destructive' : isExpiringSoon ? 'border-yellow-500' : ''
              }`}
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{medicine.name}</h3>
                {medicine.barcode && (
                  <p className="text-sm text-muted-foreground">
                    Barcode: {medicine.barcode}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={`text-sm ${
                      isExpired
                        ? 'text-destructive'
                        : isExpiringSoon
                        ? 'text-yellow-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Expires: {format(expiryDate, 'MMM dd, yyyy')}
                    {isExpiringSoon && !isExpired && ` (${daysUntilExpiry} days)`}
                  </span>
                </div>
                {!medicine.marked_for_donation && (
                  <button
                    onClick={() => handleMarkForDonation(medicine.id)}
                    className="mt-4 w-full rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                  >
                    Mark for Donation
                  </button>
                )}
                {medicine.marked_for_donation && (
                  <div className="mt-4 rounded-lg bg-green-100 px-4 py-2 text-center text-sm font-medium text-green-800">
                    Marked for Donation
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 