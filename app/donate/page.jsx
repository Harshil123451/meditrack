'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { supabase } from '../utils/supabase';
import { Loader2, Heart, MapPin, Phone, Mail } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';

export default function DonatePage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donationCenters, setDonationCenters] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchMedicines();
    fetchDonationCenters();
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
        .eq('marked_for_donation', true)
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

  const fetchDonationCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_centers')
        .select('*');

      if (error) throw error;

      setDonationCenters(data || []);
    } catch (error) {
      toast.error('Failed to fetch donation centers');
      console.error('Error fetching donation centers:', error);
    }
  };

  const handleRemoveFromDonation = async (id) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .update({ marked_for_donation: false })
        .eq('id', id);

      if (error) throw error;

      toast.success('Medicine removed from donation list');
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to update medicine status');
      console.error('Error updating medicine:', error);
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
      <h1 className="text-2xl font-bold">Donate Medicines</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Your Donations</h2>
                <p className="text-sm text-muted-foreground">
                  Medicines you've marked for donation
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
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
                        <p className="text-sm text-muted-foreground">
                          Quantity: {medicine.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromDonation(medicine.id)}
                        className="rounded-lg bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/20"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}

              {medicines.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No medicines marked for donation. Mark medicines for donation in your inventory.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Donation Centers</h2>
                <p className="text-sm text-muted-foreground">
                  Find a center near you to donate your medicines
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {donationCenters.map((center) => (
                <div
                  key={center.id}
                  className="rounded-lg border p-4"
                >
                  <h3 className="text-lg font-semibold">{center.name}</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{center.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{center.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{center.email}</span>
                    </div>
                  </div>
                </div>
              ))}

              {donationCenters.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No donation centers available at the moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 