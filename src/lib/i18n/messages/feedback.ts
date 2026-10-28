// Owner: backend (validation and action messages, keys used by translate()). Keep en and bn keys identical (bn is type-checked against en).
// Server code (validators, services, actions, route handlers) returns these keys; screens show them with translate(t.feedback, key).
// Texts that mention a number (e.g. "Keep it under 600 characters") are fixed, so keep them in step with LIMITS in lib/constants/site.ts.

export const en = {
  // General
  somethingWentWrong: "Something went wrong. Please try again.",
  notConfigured: "This feature isn't configured yet. Please contact the site admin.",
  unauthorized: "Unauthorized",
  notFound: "Not found.",
  "Invalid id": "Invalid id",
  "This field is required": "This field is required",
  pleaseSignIn: "Please sign in.",
  "You do not have permission to do that.": "You do not have permission to do that.",
  formerMember: "Former member",

  // Request form
  bloodGroupRequired: "Select a blood group",
  districtRequired: "Select a district",
  unitsRequired: "Enter the number of units",
  unitsWhole: "Enter a whole number of units",
  unitsTooFew: "At least 1 unit",
  unitsTooMany: "At most 10 units",
  hospitalRequired: "Enter the hospital or institute name",
  hospitalTooLong: "Keep it under 120 characters",
  neededDateRequired: "Choose the date blood is needed",
  neededDatePast: "The date cannot be in the past",
  neededDateTooFar: "Choose a date within the next 60 days",
  bdPhoneInvalid: "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
  descriptionTooLong: "Keep it under 600 characters",
  documentKeyInvalid: "Upload the document again",

  // Donor profile and account
  fullNameRequired: "Enter your full name",
  fullNameTooLong: "Keep it under 80 characters",
  areaTooLong: "Keep it under 80 characters",
  phoneInvalid: "Enter a valid Bangladeshi mobile number",
  donorProfileRequired: "Complete your donor profile first.",
  donorProfileSaved: "Your donor profile is saved.",
  preferencesSaved: "Preferences saved.",
  telegramNotConfigured: "Telegram linking isn't set up yet.",
  telegramLinkRateLimited: "Too many attempts. Please try again later.",
  unsubscribeInvalid: "This unsubscribe link is invalid.",
  unsubscribed: "You won't receive blood request emails any more.",

  // Comments
  "Write a little more": "Write a little more",
  "Keep it under 1000 characters": "Keep it under 1000 characters",
  "Comments are closed for this request.": "Comments are closed for this request.",
  "You can't reply to this comment.": "You can't reply to this comment.",
  "You're commenting too quickly. Please wait a moment.":
    "You're commenting too quickly. Please wait a moment.",
  "You already posted this comment.": "You already posted this comment.",
  "This comment no longer exists.": "This comment no longer exists.",
  "You can only delete your own comments.": "You can only delete your own comments.",
  "Comment posted.": "Comment posted.",
  "Comment deleted.": "Comment deleted.",

  // Requests
  "This request no longer exists.": "This request no longer exists.",
  documentUploadAgain: "Upload the document again.",
  documentMissing: "We couldn't find your uploaded document. Please upload it again.",
  requestRateLimited: "You've posted several requests today. Please try again tomorrow.",
  pendingRequestLimit: "You already have requests waiting for review. Please wait for them to be checked.",
  "This request was already reviewed.": "This request was already reviewed.",
  "This request can no longer be rejected.": "This request can no longer be rejected.",
  "Only the person who posted this request can mark it fulfilled.":
    "Only the person who posted this request can mark it fulfilled.",
  "This request is no longer active.": "This request is no longer active.",
  "The requester hasn't shared their number.": "The requester hasn't shared their number.",
  "Register as a donor to see contact numbers.": "Register as a donor to see contact numbers.",
  "You've viewed many numbers recently. Please try again later.":
    "You've viewed many numbers recently. Please try again later.",
  "You've sent many reports today.": "You've sent many reports today.",
  "Thanks — a moderator will take a look.": "Thanks — a moderator will take a look.",
  "Your request was submitted and is waiting for a quick review.":
    "Your request was submitted and is waiting for a quick review.",
  "Marked as fulfilled. Thank you for letting the community know.":
    "Marked as fulfilled. Thank you for letting the community know.",

  // Moderation
  "Published. Notifications are queued.": "Published. Notifications are queued.",
  "Request rejected.": "Request rejected.",
  "Reports dismissed.": "Reports dismissed.",

  // Documents and uploads
  fileEmpty: "The file is empty.",
  documentTooLarge: "The file is larger than 5 MB.",
  fileTypeInvalid: "Upload a JPG, PNG, WEBP or PDF file.",
  fileTypeMismatch: "The file type does not match its contents.",
  storageUnavailable: "File storage is unavailable right now. Please try again.",
  uploadRateLimited: "Too many uploads. Please try again later.",
  chooseFile: "Choose a file to upload.",

  // English text used directly as a key by the donor screens (same wording as the keys above).
  "Enter your full name": "Enter your full name",
  "Keep it under 80 characters": "Keep it under 80 characters",
  "Enter a valid Bangladeshi mobile number": "Enter a valid Bangladeshi mobile number",
  "Please check the highlighted fields.": "Please check the highlighted fields.",
  "Please sign in to continue.": "Please sign in to continue.",
  "Too many attempts. Please try again later.": "Too many attempts. Please try again later.",
  "Something went wrong. Please try again.": "Something went wrong. Please try again.",
  "Complete your donor profile first.": "Complete your donor profile first.",
  "Telegram linking isn't set up yet.": "Telegram linking isn't set up yet.",
  "This feature isn't configured yet. Please contact the site admin.":
    "This feature isn't configured yet. Please contact the site admin.",
  "This unsubscribe link is invalid.": "This unsubscribe link is invalid.",
  "You won't receive blood request emails any more.": "You won't receive blood request emails any more.",
};

export const bn: typeof en = {
  // General
  somethingWentWrong: "কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
  notConfigured: "এই সুবিধাটি এখনও চালু হয়নি। অনুগ্রহ করে সাইট অ্যাডমিনের সঙ্গে যোগাযোগ করুন।",
  unauthorized: "অনুমতি নেই",
  notFound: "খুঁজে পাওয়া যায়নি।",
  "Invalid id": "আইডি সঠিক নয়",
  "This field is required": "এই ঘরটি পূরণ করা আবশ্যক",
  pleaseSignIn: "অনুগ্রহ করে সাইন ইন করুন।",
  "You do not have permission to do that.": "এই কাজটি করার অনুমতি আপনার নেই।",
  formerMember: "প্রাক্তন সদস্য",

  // Request form
  bloodGroupRequired: "রক্তের গ্রুপ বেছে নিন",
  districtRequired: "জেলা বেছে নিন",
  unitsRequired: "কত ইউনিট রক্ত লাগবে তা লিখুন",
  unitsWhole: "ইউনিটের সংখ্যা পূর্ণ সংখ্যায় লিখুন",
  unitsTooFew: "কমপক্ষে ১ ইউনিট",
  unitsTooMany: "সর্বোচ্চ ১০ ইউনিট",
  hospitalRequired: "হাসপাতাল বা প্রতিষ্ঠানের নাম লিখুন",
  hospitalTooLong: "১২০ অক্ষরের মধ্যে লিখুন",
  neededDateRequired: "কোন তারিখে রক্ত লাগবে তা বেছে নিন",
  neededDatePast: "তারিখটি অতীত হতে পারবে না",
  neededDateTooFar: "আগামী ৬০ দিনের মধ্যে একটি তারিখ বেছে নিন",
  bdPhoneInvalid: "সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন (01XXXXXXXXX)",
  descriptionTooLong: "৬০০ অক্ষরের মধ্যে লিখুন",
  documentKeyInvalid: "নথিটি আবার আপলোড করুন",

  // Donor profile and account
  fullNameRequired: "আপনার পুরো নাম লিখুন",
  fullNameTooLong: "৮০ অক্ষরের মধ্যে লিখুন",
  areaTooLong: "৮০ অক্ষরের মধ্যে লিখুন",
  phoneInvalid: "সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন",
  donorProfileRequired: "আগে আপনার দাতা প্রোফাইল সম্পূর্ণ করুন।",
  donorProfileSaved: "আপনার দাতা প্রোফাইল সংরক্ষণ করা হয়েছে।",
  preferencesSaved: "পছন্দগুলো সংরক্ষণ করা হয়েছে।",
  telegramNotConfigured: "টেলিগ্রাম সংযুক্তি এখনও চালু হয়নি।",
  telegramLinkRateLimited: "অনেকবার চেষ্টা করা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
  unsubscribeInvalid: "এই আনসাবস্ক্রাইব লিংকটি সঠিক নয়।",
  unsubscribed: "আপনি আর রক্তের অনুরোধের ইমেইল পাবেন না।",

  // Comments
  "Write a little more": "আর একটু লিখুন",
  "Keep it under 1000 characters": "১০০০ অক্ষরের মধ্যে লিখুন",
  "Comments are closed for this request.": "এই অনুরোধে এখন আর মন্তব্য করা যাবে না।",
  "You can't reply to this comment.": "এই মন্তব্যের উত্তর দেওয়া যাবে না।",
  "You're commenting too quickly. Please wait a moment.": "খুব দ্রুত মন্তব্য করছেন। একটু অপেক্ষা করুন।",
  "You already posted this comment.": "এই মন্তব্যটি আপনি আগেই দিয়েছেন।",
  "This comment no longer exists.": "এই মন্তব্যটি আর নেই।",
  "You can only delete your own comments.": "শুধু নিজের মন্তব্য মুছতে পারবেন।",
  "Comment posted.": "মন্তব্য পোস্ট করা হয়েছে।",
  "Comment deleted.": "মন্তব্য মুছে ফেলা হয়েছে।",

  // Requests
  "This request no longer exists.": "এই অনুরোধটি আর নেই।",
  documentUploadAgain: "নথিটি আবার আপলোড করুন।",
  documentMissing: "আপলোড করা নথিটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে আবার আপলোড করুন।",
  requestRateLimited: "আজ আপনি একাধিক অনুরোধ পোস্ট করেছেন। অনুগ্রহ করে আগামীকাল আবার চেষ্টা করুন।",
  pendingRequestLimit:
    "আপনার আগের অনুরোধগুলো এখনও যাচাইয়ের অপেক্ষায় আছে। যাচাই শেষ হওয়া পর্যন্ত অপেক্ষা করুন।",
  "This request was already reviewed.": "এই অনুরোধটি আগেই যাচাই করা হয়েছে।",
  "This request can no longer be rejected.": "এই অনুরোধটি আর বাতিল করা যাবে না।",
  "Only the person who posted this request can mark it fulfilled.":
    "যিনি অনুরোধটি দিয়েছেন, শুধু তিনিই এটি পূরণ হয়েছে বলে চিহ্নিত করতে পারবেন।",
  "This request is no longer active.": "এই অনুরোধটি আর সক্রিয় নেই।",
  "The requester hasn't shared their number.": "অনুরোধকারী তাঁর নম্বর শেয়ার করেননি।",
  "Register as a donor to see contact numbers.": "যোগাযোগের নম্বর দেখতে দাতা হিসেবে নিবন্ধন করুন।",
  "You've viewed many numbers recently. Please try again later.":
    "আপনি সম্প্রতি অনেক নম্বর দেখেছেন। একটু পরে আবার চেষ্টা করুন।",
  "You've sent many reports today.": "আজ আপনি অনেক রিপোর্ট পাঠিয়েছেন।",
  "Thanks — a moderator will take a look.": "ধন্যবাদ, একজন মডারেটর বিষয়টি দেখবেন।",
  "Your request was submitted and is waiting for a quick review.":
    "আপনার অনুরোধ জমা হয়েছে। দ্রুত যাচাইয়ের জন্য অপেক্ষা করছে।",
  "Marked as fulfilled. Thank you for letting the community know.":
    "অনুরোধটি পূরণ হয়েছে বলে চিহ্নিত করা হয়েছে। সবাইকে জানানোর জন্য ধন্যবাদ।",

  // Moderation
  "Published. Notifications are queued.": "প্রকাশ করা হয়েছে। বিজ্ঞপ্তি পাঠানোর জন্য সারিতে রাখা হয়েছে।",
  "Request rejected.": "অনুরোধটি বাতিল করা হয়েছে।",
  "Reports dismissed.": "রিপোর্টগুলো খারিজ করা হয়েছে।",

  // Documents and uploads
  fileEmpty: "ফাইলটি খালি।",
  documentTooLarge: "ফাইলটি ৫ MB-এর চেয়ে বড়।",
  fileTypeInvalid: "JPG, PNG, WEBP বা PDF ফাইল আপলোড করুন।",
  fileTypeMismatch: "ফাইলের ধরন এবং ভেতরের বিষয়বস্তু মিলছে না।",
  storageUnavailable: "ফাইল সংরক্ষণের ব্যবস্থা এখন কাজ করছে না। অনুগ্রহ করে আবার চেষ্টা করুন।",
  uploadRateLimited: "অনেক বেশি আপলোড হয়েছে। একটু পরে আবার চেষ্টা করুন।",
  chooseFile: "আপলোড করতে একটি ফাইল বেছে নিন।",

  // English text used directly as a key by the donor screens (same wording as the keys above).
  "Enter your full name": "আপনার পুরো নাম লিখুন",
  "Keep it under 80 characters": "৮০ অক্ষরের মধ্যে লিখুন",
  "Enter a valid Bangladeshi mobile number": "সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন",
  "Please check the highlighted fields.": "চিহ্নিত ঘরগুলো আবার দেখে নিন।",
  "Please sign in to continue.": "চালিয়ে যেতে অনুগ্রহ করে সাইন ইন করুন।",
  "Too many attempts. Please try again later.": "অনেকবার চেষ্টা করা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
  "Something went wrong. Please try again.": "কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
  "Complete your donor profile first.": "আগে আপনার দাতা প্রোফাইল সম্পূর্ণ করুন।",
  "Telegram linking isn't set up yet.": "টেলিগ্রাম সংযুক্তি এখনও চালু হয়নি।",
  "This feature isn't configured yet. Please contact the site admin.":
    "এই সুবিধাটি এখনও চালু হয়নি। অনুগ্রহ করে সাইট অ্যাডমিনের সঙ্গে যোগাযোগ করুন।",
  "This unsubscribe link is invalid.": "এই আনসাবস্ক্রাইব লিংকটি সঠিক নয়।",
  "You won't receive blood request emails any more.": "আপনি আর রক্তের অনুরোধের ইমেইল পাবেন না।",
};
