// ── TELEGRAM MESSAGE TEMPLATES ────────────────────────
// Edit these strings freely — no need to touch index.html.
//
// Available variables:
//   {name}        → guest full name       e.g. "John Smith"
//   {firstName}   → guest first name      e.g. "John"
//   {apt}         → apartment code        e.g. "4A"
//   {code}        → door code             e.g. "7823"
//   {checkin}     → check-in date         e.g. "14 Apr"
//   {checkout}    → check-out date        e.g. "17 Apr"
//   {nights}      → number of nights      e.g. "3"
//   {email}       → guest email address
//
// HTML tags supported: <b>bold</b>  <i>italic</i>

const TG_TEMPLATES = {

  codeSent:
    `🔑 <b>Code sent — Nuntui</b>\n`+
    `──────────────────\n`+
    `Guest: <b>{name}</b>\n`+
    `Email: {email}\n`+
    `──────────────────\n`+
    `Apt: <b>{apt}</b>  ·  Code: <b>{code}</b>\n`+
    `Check-in: {checkin}  →  Check-out: {checkout}\n`+
    `Duration: {nights} night{nightsPlural}`,

  emailFailed:
    `⚠️ <b>Email failed — Nuntui</b>\n`+
    `──────────────────\n`+
    `Guest: <b>{name}</b>\n`+
    `Email: {email}\n`+
    `Apt: {apt}  ·  Code: {code}\n`+
    `Check-in: {checkin}  →  Check-out: {checkout}\n`+
    `──────────────────\n`+
    `Open the dashboard to retry.`,

};
