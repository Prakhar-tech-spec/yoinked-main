import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://czmcpuebpngomznfpyvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bWNwdWVicG5nb216bmZweXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDE0NTQsImV4cCI6MjA2NDQxNzQ1NH0.2t4Vct3LcaZ1POATPSQsDqAgwBRprqmsBIweWqqiHJQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 