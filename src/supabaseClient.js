import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://izxadmxzrxestdkbsfkw.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable_i8wugyephsu2Bt31fuWke-Q_kKmaDG9h";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
