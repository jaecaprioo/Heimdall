import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env?.VITE_SUPABASE_URL || "https://izxadmxzrxestdkbsfkw.supabase.co").trim();
const rawKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_i8wugyephsu2Bt31fuWke-Q_kKmaDG9h").trim();

// Ensure base URL does not include /rest/v1 or trailing slashes
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_PUBLIC_KEY = rawKey;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

