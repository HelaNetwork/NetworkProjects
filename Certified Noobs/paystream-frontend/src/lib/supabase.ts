import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://fldqwetobjsjfsjxdcck.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZHF3ZXRvYmpzamZzanhkY2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNDI3OTUsImV4cCI6MjA4NjYxODc5NX0.XJ8x6uLqHXdXqA-HPBIW21yjvx3U8BbyVV7MKTi-7J0";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
