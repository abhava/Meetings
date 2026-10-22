(function () {
  const SUPABASE_URL = "https://xwgtjwpvmbyubmhnviks.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_13rrPSp80vFNKTz3A3d1_A_7xa1Za7R";

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Our Meetings: Supabase library did not load.");
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );

  console.info("Our Meetings: Supabase client initialized.");
})();