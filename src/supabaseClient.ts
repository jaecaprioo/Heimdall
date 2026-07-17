import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://izxadmxzrxestdkbsfkw.supabase.co";
const SUPABASE_PUBLIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_i8wugyephsu2Bt31fuWkeQ_kKmaDG9h";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
