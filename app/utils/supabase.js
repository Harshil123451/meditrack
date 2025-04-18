import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://spppgqntenglvokvwokc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcHBncW50ZW5nbHZva3Z3b2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NTU3MDAsImV4cCI6MjA2MDUzMTcwMH0.o6vsqZmXV_CEM1MO5w4DlSisx3aXUfSzKsdutdOsmUs';

export const supabase = createClient(supabaseUrl, supabaseKey); 