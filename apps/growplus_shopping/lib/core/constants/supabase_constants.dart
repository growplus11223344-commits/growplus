class SupabaseConstants {
  SupabaseConstants._();

  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://zjolitbzviahchueaofv.supabase.co',
  );

  static const String anonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'sb_publishable__1nG6JUm8p_z4VxptC09QA_CFrqbYPW',
  );

  // Deep link callback for Shopping app
  static const String mobileRedirectUrl = 'growplus://shopping/auth/callback';
}
