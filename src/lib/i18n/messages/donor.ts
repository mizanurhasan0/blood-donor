// Owner: donors & account area (become donor, donor form, Telegram, unsubscribe). Keep en and bn keys identical (bn is type-checked against en).

export const en = {
  becomeDonor: {
    metaTitle: "Become a Blood Donor",
    metaDescription:
      "Register as a voluntary blood donor in Bangladesh. Add your blood group and district, and get an email when someone near you needs your help.",
    eyebrow: "Voluntary blood donors",
    heroTitle: "Become a Donor.",
    heroHighlight: "Make a Difference.",
    heroText:
      "Patients across Bangladesh need blood for surgery, childbirth, accidents and ongoing treatment, and families often search for donors under pressure. When you register, people nearby can reach a willing donor faster.",
    whyRegister: "Why register",
    benefitAlertsTitle: "Alerts that matter",
    benefitAlertsText:
      "Emails only for approved requests that match your blood group in your district or division.",
    benefitControlTitle: "You stay in control",
    benefitControlText: "Pause availability or stop alerts any time from your account.",
    benefitPrivateTitle: "Private by default",
    benefitPrivateText: "Your phone number and email are never shown publicly.",
    storedTitle: "What we store and why",
    storedItems: [
      { item: "Blood group, district and area", why: "to match you with nearby requests." },
      { item: "Availability and alert choice", why: "so we only contact you when you want." },
      { item: "Mobile number (optional)", why: "stored encrypted and never shown publicly." },
      { item: "Google name and email", why: "to sign you in and send the alerts you opt into." },
    ],
    storedNote: "You can edit or delete everything from your account at any time.",
    signInTitle: "Sign in to register",
    signInText: "Use your Google account to create your donor profile. No passwords needed.",
  },

  form: {
    title: "Your donor details",
    intro: "Takes about a minute. You can edit or delete your profile at any time.",
    fullName: "Full name",
    bloodGroup: "Blood group",
    district: "District",
    districtHint: "Search all {count} districts.",
    districtPlaceholder: "Search your district",
    division: "Division",
    divisionAuto: "Set from district",
    area: "Area",
    areaHint: "Neighbourhood or upazila.",
    areaPlaceholder: "e.g. Mirpur",
    phone: "Mobile number",
    phoneHint: "Kept private. Never shown publicly. Not verified.",
    phonePlaceholder: "01XXXXXXXXX",
    available: "I'm available to donate now",
    availableHint:
      "Turn this off after donating or while you can't donate. Alerts only go to available donors.",
    emailOptIn: "Email me when someone near me needs my blood group",
    emailOptInHint:
      "Only for approved requests in your district or division. Stop any time from your account or any alert email.",
    register: "Register as donor",
    saveChanges: "Save changes",
    registeredTitle: "You're registered as a donor",
    registeredEmailOn: "Thank you. We'll email you when an approved request near you needs your blood group.",
    registeredEmailOff:
      "Thank you. Email alerts are off; you can turn them on from your account at any time.",
    alreadyTitle: "You're already registered",
    alreadyText: "Your donor profile is active. Update your details or alert settings from your account.",
    seeRequests: "See blood requests",
    manageProfile: "Manage my profile",
  },

  profile: {
    availability: "Availability",
    availableNow: "Available to donate",
    notAvailable: "Not available right now",
    emailAlerts: "Email alerts",
    on: "On",
    off: "Off",
    telegram: "Telegram",
    linked: "Linked",
    notLinked: "Not linked",
    region: "{district}, {division} Division",
  },

  preferences: {
    availableLabel: "Available to donate",
    availableHint:
      "Turn off after donating or while you can't donate. Alerts pause while you're unavailable.",
    emailLabel: "Email alerts",
    emailHint: "Emails about approved requests for your blood group in your district or division.",
    stopAll: "Stop all notifications",
    noEmails: "You won't get any alert emails.",
    saved: "Preferences saved",
  },

  telegram: {
    title: "Private Telegram donor channel",
    linkedBadge: "Linked",
    intro:
      "Approved blood requests are also posted to a private Telegram channel, if you prefer alerts there.",
    comingSoon: "Telegram community coming soon. Email alerts work in the meantime.",
    linkStepTitle: "Link your Telegram account",
    linkedText: "Your Telegram account is linked to your donor profile.",
    registerFirst: "Register as a donor first, then link Telegram here.",
    linkButton: "Link Telegram",
    newLink: "Get a new link",
    checkAgain: "I've tapped Start, check again",
    linkHint: "If Telegram didn't open, {openLink} and tap {start}. It works once, for 15 minutes.",
    openLink: "open your link",
    startLabel: "Start",
    joinStepTitle: "Request to join the channel",
    requestToJoin: "Request to join",
    opensTelegram: "(opens Telegram)",
    joinNoteAutoApproved:
      "Requests from linked donors are approved automatically. Others are reviewed by an admin.",
    joinNoteAdminReview: "Join requests are reviewed by an admin.",
  },

  unsubscribe: {
    metaTitle: "Unsubscribe",
    heading: "Stop blood request emails?",
    text: "You'll stop getting emails about requests that match your blood group. Your donor profile stays active, and you can turn alerts back on from your account at any time.",
    incomplete: "This unsubscribe link is incomplete. You can turn off email alerts from your account.",
    manageAlerts: "Manage alerts",
    confirmStop: "Yes, stop emails",
    keepReceiving: "Keep receiving them",
    done: "You're unsubscribed.",
    changedMind: "Changed your mind? {link} from your account.",
    turnBackOn: "Turn alerts back on",
  },

  deleteAccount: {
    removesIntro: "Deleting your account permanently removes:",
    removes: [
      "Your donor profile, alert settings and Telegram link",
      "Your blood requests and any documents you uploaded with them",
      "The text of your comments on other requests (they show as deleted)",
    ],
    irreversible: "This can't be undone.",
    dialogTitle: "Delete your account?",
    dialogText:
      "Your profile, requests, documents and Telegram link are deleted, and your comments are blanked. This can't be undone.",
    typeToConfirm: "Type {word} to confirm",
    deleteButton: "Delete my account",
    confirmButton: "Delete permanently",
  },
};

export const bn: typeof en = {
  becomeDonor: {
    metaTitle: "রক্তদাতা হোন",
    metaDescription:
      "বাংলাদেশে স্বেচ্ছাসেবী রক্তদাতা হিসেবে নিবন্ধন করুন। আপনার রক্তের গ্রুপ ও জেলা যোগ করুন, আর কাছের কেউ সাহায্য চাইলে ইমেইল পান।",
    eyebrow: "স্বেচ্ছাসেবী রক্তদাতারা",
    heroTitle: "রক্তদাতা হোন।",
    heroHighlight: "পরিবর্তন আনুন।",
    heroText:
      "বাংলাদেশের রোগীদের অস্ত্রোপচার, প্রসব, দুর্ঘটনা ও নিয়মিত চিকিৎসার জন্য রক্তের প্রয়োজন হয়, আর বিপদের সময় পরিবারগুলো প্রায়ই রক্তদাতা খুঁজতে হিমশিম খায়। আপনি নিবন্ধন করলে কাছের মানুষ দ্রুত একজন ইচ্ছুক রক্তদাতার কাছে পৌঁছাতে পারবেন।",
    whyRegister: "কেন নিবন্ধন করবেন",
    benefitAlertsTitle: "দরকারি বিজ্ঞপ্তি",
    benefitAlertsText:
      "শুধু অনুমোদিত অনুরোধের ইমেইল পাবেন, যেগুলো আপনার জেলা বা বিভাগে এবং আপনার রক্তের গ্রুপের সাথে মেলে।",
    benefitControlTitle: "নিয়ন্ত্রণ আপনার হাতে",
    benefitControlText: "আপনার অ্যাকাউন্ট থেকে যেকোনো সময় প্রাপ্যতা বন্ধ বা বিজ্ঞপ্তি থামিয়ে দিতে পারেন।",
    benefitPrivateTitle: "ডিফল্টভাবে গোপন",
    benefitPrivateText: "আপনার ফোন নম্বর ও ইমেইল কখনো প্রকাশ্যে দেখানো হয় না।",
    storedTitle: "আমরা কী সংরক্ষণ করি এবং কেন",
    storedItems: [
      { item: "রক্তের গ্রুপ, জেলা ও এলাকা", why: "কাছের অনুরোধের সাথে আপনাকে মেলানোর জন্য।" },
      { item: "প্রাপ্যতা ও বিজ্ঞপ্তির পছন্দ", why: "যাতে আপনি চাইলেই শুধু আপনার সাথে যোগাযোগ করা হয়।" },
      { item: "মোবাইল নম্বর (ঐচ্ছিক)", why: "এনক্রিপ্টেড অবস্থায় রাখা হয়, কখনো প্রকাশ্যে দেখানো হয় না।" },
      {
        item: "Google-এর নাম ও ইমেইল",
        why: "সাইন ইন করাতে এবং আপনি যে বিজ্ঞপ্তিতে সম্মতি দিয়েছেন সেগুলো পাঠাতে।",
      },
    ],
    storedNote: "আপনার অ্যাকাউন্ট থেকে যেকোনো সময় সবকিছু সম্পাদনা বা মুছে ফেলতে পারবেন।",
    signInTitle: "নিবন্ধনের জন্য সাইন ইন করুন",
    signInText: "রক্তদাতা প্রোফাইল তৈরি করতে আপনার Google অ্যাকাউন্ট ব্যবহার করুন। কোনো পাসওয়ার্ড লাগবে না।",
  },

  form: {
    title: "আপনার রক্তদাতার তথ্য",
    intro: "এতে এক মিনিটের মতো সময় লাগে। আপনি যেকোনো সময় প্রোফাইল সম্পাদনা বা মুছে ফেলতে পারবেন।",
    fullName: "পূর্ণ নাম",
    bloodGroup: "রক্তের গ্রুপ",
    district: "জেলা",
    districtHint: "সব {count}টি জেলায় খুঁজুন।",
    districtPlaceholder: "আপনার জেলা খুঁজুন",
    division: "বিভাগ",
    divisionAuto: "জেলা থেকে নির্ধারিত হবে",
    area: "এলাকা",
    areaHint: "মহল্লা বা উপজেলা।",
    areaPlaceholder: "যেমন: মিরপুর",
    phone: "মোবাইল নম্বর",
    phoneHint: "গোপন রাখা হয়। কখনো প্রকাশ্যে দেখানো হয় না। যাচাই করা হয়নি।",
    phonePlaceholder: "01XXXXXXXXX",
    available: "আমি এখন রক্ত দিতে প্রস্তুত",
    availableHint:
      "রক্তদানের পর বা রক্ত দিতে না পারলে এটি বন্ধ রাখুন। শুধু প্রস্তুত রক্তদাতারাই বিজ্ঞপ্তি পান।",
    emailOptIn: "কাছের কেউ আমার রক্তের গ্রুপের জন্য রক্ত খুঁজলে আমাকে ইমেইল পাঠান",
    emailOptInHint:
      "শুধু আমার জেলা বা বিভাগের অনুমোদিত অনুরোধের জন্য। অ্যাকাউন্ট বা যেকোনো বিজ্ঞপ্তি ইমেইল থেকে যেকোনো সময় বন্ধ করা যাবে।",
    register: "রক্তদাতা হিসেবে নিবন্ধন করুন",
    saveChanges: "পরিবর্তন সংরক্ষণ করুন",
    registeredTitle: "আপনি রক্তদাতা হিসেবে নিবন্ধিত হয়েছেন",
    registeredEmailOn: "ধন্যবাদ। কাছের কোনো অনুমোদিত অনুরোধে আপনার রক্তের গ্রুপ লাগলে আমরা ইমেইল পাঠাব।",
    registeredEmailOff:
      "ধন্যবাদ। ইমেইল বিজ্ঞপ্তি বন্ধ আছে; আপনি যেকোনো সময় অ্যাকাউন্ট থেকে চালু করতে পারবেন।",
    alreadyTitle: "আপনি ইতিমধ্যে নিবন্ধিত আছেন",
    alreadyText:
      "আপনার রক্তদাতা প্রোফাইল সক্রিয় আছে। অ্যাকাউন্ট থেকে আপনার তথ্য বা বিজ্ঞপ্তির সেটিং হালনাগাদ করুন।",
    seeRequests: "রক্তের অনুরোধ দেখুন",
    manageProfile: "আমার প্রোফাইল পরিচালনা করুন",
  },

  profile: {
    availability: "প্রাপ্যতা",
    availableNow: "রক্ত দিতে প্রস্তুত",
    notAvailable: "এখন প্রস্তুত নন",
    emailAlerts: "ইমেইল বিজ্ঞপ্তি",
    on: "চালু",
    off: "বন্ধ",
    telegram: "Telegram",
    linked: "যুক্ত",
    notLinked: "যুক্ত নয়",
    region: "{district}, {division} বিভাগ",
  },

  preferences: {
    availableLabel: "রক্ত দিতে প্রস্তুত",
    availableHint: "রক্তদানের পর বা রক্ত দিতে না পারলে বন্ধ করুন। প্রস্তুত না থাকলে বিজ্ঞপ্তি বন্ধ থাকে।",
    emailLabel: "ইমেইল বিজ্ঞপ্তি",
    emailHint: "আপনার জেলা বা বিভাগে, আপনার রক্তের গ্রুপের অনুমোদিত অনুরোধ নিয়ে ইমেইল।",
    stopAll: "সব বিজ্ঞপ্তি বন্ধ করুন",
    noEmails: "আপনি আর কোনো বিজ্ঞপ্তি ইমেইল পাবেন না।",
    saved: "পছন্দ সংরক্ষিত হয়েছে",
  },

  telegram: {
    title: "ব্যক্তিগত Telegram রক্তদাতা চ্যানেল",
    linkedBadge: "যুক্ত",
    intro: "আপনি চাইলে অনুমোদিত রক্তের অনুরোধগুলো একটি ব্যক্তিগত Telegram চ্যানেলেও পাবেন।",
    comingSoon: "Telegram কমিউনিটি শীঘ্রই আসছে। ততদিন ইমেইল বিজ্ঞপ্তি কাজ করবে।",
    linkStepTitle: "আপনার Telegram অ্যাকাউন্ট যুক্ত করুন",
    linkedText: "আপনার Telegram অ্যাকাউন্ট রক্তদাতা প্রোফাইলের সাথে যুক্ত আছে।",
    registerFirst: "আগে রক্তদাতা হিসেবে নিবন্ধন করুন, তারপর এখানে Telegram যুক্ত করুন।",
    linkButton: "টেলিগ্রাম যুক্ত করুন",
    newLink: "নতুন লিংক নিন",
    checkAgain: "Start চাপা হয়েছে, আবার দেখুন",
    linkHint:
      "Telegram না খুললে, {openLink} এবং {start} ট্যাপ করুন। এটি শুধু একবার কাজ করবে, ১৫ মিনিটের জন্য।",
    openLink: "আপনার লিংকটি খুলুন",
    startLabel: "Start",
    joinStepTitle: "চ্যানেলে যোগ দিতে অনুরোধ করুন",
    requestToJoin: "যোগ দেওয়ার অনুরোধ করুন",
    opensTelegram: "(Telegram খুলবে)",
    joinNoteAutoApproved:
      "যুক্ত রক্তদাতাদের অনুরোধ স্বয়ংক্রিয়ভাবে অনুমোদন পায়। অন্যদের অনুরোধ অ্যাডমিন দেখেন।",
    joinNoteAdminReview: "যোগ দেওয়ার অনুরোধ অ্যাডমিন যাচাই করেন।",
  },

  unsubscribe: {
    metaTitle: "সদস্যতা বাতিল",
    heading: "রক্তের অনুরোধের ইমেইল বন্ধ করবেন?",
    text: "আপনার রক্তের গ্রুপের সাথে মেলে এমন অনুরোধের ইমেইল আর পাবেন না। আপনার রক্তদাতা প্রোফাইল সক্রিয় থাকবে, আর আপনি যেকোনো সময় অ্যাকাউন্ট থেকে বিজ্ঞপ্তি আবার চালু করতে পারবেন।",
    incomplete: "এই সদস্যতা বাতিলের লিংকটি অসম্পূর্ণ। আপনি অ্যাকাউন্ট থেকে ইমেইল বিজ্ঞপ্তি বন্ধ করতে পারেন।",
    manageAlerts: "বিজ্ঞপ্তি পরিচালনা করুন",
    confirmStop: "হ্যাঁ, ইমেইল বন্ধ করুন",
    keepReceiving: "ইমেইল চালু রাখুন",
    done: "আপনার সদস্যতা বাতিল হয়েছে।",
    changedMind: "মত বদলালে আপনার অ্যাকাউন্ট থেকে {link}।",
    turnBackOn: "বিজ্ঞপ্তি আবার চালু করুন",
  },

  deleteAccount: {
    removesIntro: "অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেললে এগুলো মুছে যাবে:",
    removes: [
      "আপনার রক্তদাতা প্রোফাইল, বিজ্ঞপ্তির সেটিং ও Telegram যুক্তি",
      "আপনার রক্তের অনুরোধ ও সেগুলোর সাথে আপলোড করা যেকোনো নথি",
      "অন্য অনুরোধে আপনার মন্তব্যের লেখা (মন্তব্যগুলো মুছে ফেলা হয়েছে হিসেবে দেখাবে)",
    ],
    irreversible: "এটি আর ফেরানো যাবে না।",
    dialogTitle: "আপনার অ্যাকাউন্ট মুছবেন?",
    dialogText:
      "আপনার প্রোফাইল, অনুরোধ, নথি ও Telegram যুক্তি মুছে যাবে, আর আপনার মন্তব্যের লেখা খালি করা হবে। এটি আর ফেরানো যাবে না।",
    typeToConfirm: "নিশ্চিত করতে {word} লিখুন",
    deleteButton: "আমার অ্যাকাউন্ট মুছুন",
    confirmButton: "স্থায়ীভাবে মুছুন",
  },
};
