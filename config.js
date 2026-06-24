// StaySync — PUBLIC deploy config (GitHub Pages /docs).
// This file is served on the public internet. It contains ONLY browser-safe values:
//   • SUPABASE_ANON_KEY is the *publishable* key (sb_publishable_…) — designed to ship in
//     client code; RLS in Postgres is the real security boundary.
//   • EMAILJS_PUBLIC_KEY / SERVICE_ID / TEMPLATE_IDs are public by design (used from the browser).
// NO SECRETS HERE. The EmailJS PRIVATE key and Supabase SERVICE_ROLE key live ONLY in the
// staysync-codes / admin-user Edge Function secrets, never in this file.
//
// Telegram is intentionally BLANK in the public build: after Phase 2 the operator
// Telegram notice is sent SERVER-SIDE by the staysync-codes Edge Function (which holds the
// bot token as a secret). HAS_TELEGRAM evaluates false here, so the browser sends nothing —
// keeping the bot token off the public page and avoiding a duplicate notification.
const CONFIG = {
  SUPABASE_URL:               'https://hfrehnjupjbjmurfjczm.supabase.co',
  SUPABASE_ANON_KEY:          'sb_publishable_dgAAjlVGLAJ0D8Gx79iruQ_hy5GfeqS',
  EMAILJS_PUBLIC_KEY:         'vm9DTEAlgXMMYOQYF',
  EMAILJS_SERVICE_ID:         'service_5ru8wwp',
  EMAILJS_TEMPLATE_ID:        'template_szn2sru',
  EMAILJS_INVITE_TEMPLATE_ID: 'template_na4vt2u',
  TELEGRAM_BOT_TOKEN:         '',
  TELEGRAM_CHAT_ID:           '',
};
