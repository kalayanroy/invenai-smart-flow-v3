// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kzsgrvvpozehfdbtlczg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6c2dydnZwb3plaGZkYnRsY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODUxOTQsImV4cCI6MjA2NTc2MTE5NH0.MAuv2ZfV_LT5uiov4rpHji_pWSDS4qFcQLu54P-ofw0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
