import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not set. Please check your .env.local file and Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || ''); 