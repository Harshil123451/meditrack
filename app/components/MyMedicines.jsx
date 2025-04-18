'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { supabase } from '../utils/supabase';
import { Loader2, Trash2, Edit2, Heart } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';

export default function MyMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
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
        .eq('user_id', user.id)
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      setMedicines(data || []);
    } catch (error) {
      toast.error('Failed to fetch medicines');
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Medicine deleted successfully');
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to delete medicine');
      console.error('Error deleting medicine:', error);
    }
  };

  const handleDonate = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .update({ marked_for_donation: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Medicine ${currentStatus ? 'removed from' : 'marked for'} donation`);
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to update donation status');
      console.error('Error updating donation status:', error);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Medicines</h1>
        <button
          onClick={() => router.push('/add-medicine')}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Medicine
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {medicines.map((medicine) => {
          const isExpired = isBefore(new Date(medicine.expiry_date), new Date());
          const isExpiringSoon = !isExpired && isAfter(new Date(medicine.expiry_date), new Date(new Date().setDate(new Date().getDate() + 7)));

          return (
            <div
              key={medicine.id}
              className={`rounded-lg border p-4 ${
                isExpired ? 'border-destructive' : isExpiringSoon ? 'border-yellow-500' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{medicine.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Expires: {format(new Date(medicine.expiry_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">Quantity: {medicine.quantity}</p>
                  {medicine.category && (
                    <p className="text-sm text-muted-foreground">Category: {medicine.category}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDonate(medicine.id, medicine.marked_for_donation)}
                    className={`rounded-full p-2 ${
                      medicine.marked_for_donation
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/edit-medicine/${medicine.id}`)}
                    className="rounded-full bg-muted p-2 text-muted-foreground"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(medicine.id)}
                    className="rounded-full bg-destructive/10 p-2 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {medicine.notes && (
                <p className="mt-2 text-sm text-muted-foreground">{medicine.notes}</p>
              )}
            </div>
          );
        })}
      </div>

      {medicines.length === 0 && (
        <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
          <p className="text-lg text-muted-foreground">No medicines found. Add your first medicine!</p>
        </div>
      )}
    </div>
  );
} 