import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffgwbgosxgvinwlmeeqo.supabase.co';
const supabasePublishableKey = 'sb_publishable_-udtJBvhzszZKrbEEUXP4A_KeHf2QnA';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
