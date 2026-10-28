// Owner: backend area. Email and Telegram text. Used by the notification worker and the Telegram bot webhook only,
// so it is deliberately kept out of the page dictionary. Bangla is the default for recipients.
// Placeholders such as {bloodGroup} are filled with interpolate() from ../format on the server.

export const en = {
  // Email
  emailSubject: "Blood Needed: {bloodGroup} in {district}",
  emailSubjectUrgent: "Urgent: Blood Needed: {bloodGroup} in {district}",
  emailGreeting: "Hi {name},",
  emailLead: "Someone near you needs {bloodGroup} blood.",
  emailLeadUrgent: "Someone near you urgently needs {bloodGroup} blood.",
  emailViewRequest: "View the request: {url}",
  emailViewButton: "View Request",
  emailUnsubscribeText: "Stop these emails: {url}",
  emailUnsubscribeLink: "Stop these emails",
  labelBloodGroup: "Blood group",
  labelHospital: "Hospital",
  labelDistrict: "District",
  labelNeededBy: "Needed by",
  labelUnits: "Units needed",
  safetyNotice:
    "Blood group matching only finds potential volunteers. Final screening, compatibility testing and donation eligibility are decided by medical staff. Never pay or accept payment for blood.",

  // Telegram channel post
  telegramTitle: "{bloodGroup} BLOOD NEEDED",
  telegramUrgent: " · URGENT",
  telegramViewRequest: "View Request:",

  // Telegram bot replies
  botHelp:
    "Hi! To join the BloodLink donor channel, open your BloodLink account page and tap “Link Telegram”.",
  botLinked: "Your Telegram is now linked to your BloodLink donor account.",
  botInviteIntro: "Request to join the private donor channel here:",
  botLinkExpired:
    "This link has expired or was already used. Please generate a new one from your BloodLink account page.",
  botJoinPending:
    "Thanks for your interest! Link your Telegram from your BloodLink account page to be approved automatically. Otherwise an admin will review your request.",
};

export const bn: typeof en = {
  // Email
  emailSubject: "রক্ত প্রয়োজন: {bloodGroup}, {district}",
  emailSubjectUrgent: "জরুরি: রক্ত প্রয়োজন: {bloodGroup}, {district}",
  emailGreeting: "প্রিয় {name},",
  emailLead: "আপনার কাছাকাছি একজন রোগীর {bloodGroup} রক্ত প্রয়োজন।",
  emailLeadUrgent: "আপনার কাছাকাছি একজন রোগীর জরুরিভাবে {bloodGroup} রক্ত প্রয়োজন।",
  emailViewRequest: "অনুরোধটি দেখুন: {url}",
  emailViewButton: "অনুরোধটি দেখুন",
  emailUnsubscribeText: "এই ইমেইল বন্ধ করুন: {url}",
  emailUnsubscribeLink: "এই ইমেইল বন্ধ করুন",
  labelBloodGroup: "রক্তের গ্রুপ",
  labelHospital: "হাসপাতাল",
  labelDistrict: "জেলা",
  labelNeededBy: "প্রয়োজনের তারিখ",
  labelUnits: "প্রয়োজনীয় ইউনিট",
  safetyNotice:
    "রক্তের গ্রুপ মিলিয়ে শুধু সম্ভাব্য স্বেচ্ছাসেবক খোঁজা যায়। চূড়ান্ত পরীক্ষা, রক্তের সামঞ্জস্য যাচাই এবং রক্ত দেওয়ার যোগ্যতা চিকিৎসাকর্মীরা নির্ধারণ করেন। রক্তের বিনিময়ে কখনো টাকা দেবেন না বা নেবেন না।",

  // Telegram channel post
  telegramTitle: "{bloodGroup} রক্ত প্রয়োজন",
  telegramUrgent: " · জরুরি",
  telegramViewRequest: "অনুরোধটি দেখুন:",

  // Telegram bot replies
  botHelp:
    "হ্যালো! BloodLink দাতা চ্যানেলে যুক্ত হতে আপনার BloodLink অ্যাকাউন্ট পেজে যান এবং “টেলিগ্রাম যুক্ত করুন” বোতামে চাপ দিন।",
  botLinked: "আপনার টেলিগ্রাম এখন BloodLink দাতা অ্যাকাউন্টের সঙ্গে যুক্ত হয়েছে।",
  botInviteIntro: "ব্যক্তিগত দাতা চ্যানেলে যোগ দিতে এখানে অনুরোধ করুন:",
  botLinkExpired:
    "এই লিংকের মেয়াদ শেষ হয়ে গেছে অথবা আগেই ব্যবহার করা হয়েছে। অনুগ্রহ করে BloodLink অ্যাকাউন্ট পেজ থেকে নতুন লিংক তৈরি করুন।",
  botJoinPending:
    "আগ্রহ দেখানোর জন্য ধন্যবাদ! স্বয়ংক্রিয়ভাবে অনুমোদন পেতে BloodLink অ্যাকাউন্ট পেজ থেকে আপনার টেলিগ্রাম যুক্ত করুন। না হলে একজন অ্যাডমিন আপনার অনুরোধটি দেখবেন।",
};
