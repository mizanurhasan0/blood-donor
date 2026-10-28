// Owner: request form area (posting a request). Keep en and bn keys identical (bn is type-checked against en).
// Placeholders such as {count} are filled with interpolate(); numbers go through formatNumber() first.

export const en = {
  pageTitle: "Post a Blood Request",
  pageDescription:
    "Free, reviewed by a moderator before it goes live, then shared with matching donors by email and our private Telegram channel.",
  metaDescription:
    "Post a free blood request on BloodLink. A moderator reviews it, then matching donors across Bangladesh are notified.",
  nextSteps: {
    heading: "What happens next",
    step: "Step {number}",
    submit: "Submit",
    review: "Quick review",
    notified: "Donors notified",
  },
  loading: "Loading the request form…",
  signIn: {
    title: "Sign in to post a request",
    description:
      "Signing in lets you track your request, update it and mark it fulfilled, and helps keep the community free of spam.",
  },
  postingAs: "Posting as {name}.",
  requiredNote: "Everything except the optional fields is required.",
  sections: {
    blood: "Blood needed",
    hospital: "Hospital & contact",
    details: "More details",
  },
  bloodGroup: "Blood group",
  units: {
    label: "Units (bags)",
    hint: "{min} to {max}",
    fewer: "Fewer units",
    more: "More units",
  },
  neededDate: {
    label: "Required date",
    hint: "Today or within the next {days} days",
  },
  urgency: {
    label: "Urgency",
    options: {
      urgent: { label: "Urgent", hint: "Needed as soon as possible" },
      normal: { label: "Normal", hint: "Planned, with time to arrange donors" },
    },
  },
  hospital: {
    label: "Hospital / institute name",
    placeholder: "e.g. Dhaka Medical College Hospital",
  },
  district: {
    label: "District",
    hint: "Type to search",
    placeholder: "Search districts…",
  },
  phone: {
    label: "Contact phone",
    hint: "Only shown to signed-in donors if you allow it",
    placeholder: "01XXXXXXXXX",
  },
  allowPhone: {
    label: "Let signed-in donors see my phone number",
    description: "If you turn this off, donors can still reply in the request's comments.",
  },
  description: {
    label: "Short description",
    hint: "Patient's condition, ward or bed number, who to ask for at the hospital.",
    counter: "{count}/{max} characters",
  },
  document: {
    label: "Prescription or hospital document",
    hint: "Optional, but encouraged: it helps moderators verify the request. It stays private unless you choose to share it.",
    shareLabel: "Let signed-in donors view the document",
    shareReady: "Moderators can always see it.",
    shareNeedsUpload: "Upload a document first.",
    chooseFile: "Choose a file",
    dragHere: "or drag it here",
    accepted: "JPG, PNG, WEBP or PDF · up to {max} MB",
    uploading: "Uploading… {percent}%",
    checking: "Checking the file…",
    uploadingName: "Uploading {name}",
    cancel: "Cancel upload",
    replace: "Replace",
    remove: "Remove",
    uploaded: "Uploaded",
    size: {
      bytes: "{value} B",
      kilobytes: "{value} KB",
      megabytes: "{value} MB",
    },
    errors: {
      empty: "The file is empty.",
      tooLarge: "The file is larger than {max} MB.",
      unsupported: "Upload a JPG, PNG, WEBP or PDF file.",
      sessionExpired: "Your session has expired. Sign in again to upload.",
      network: "Network error. Check your connection and try again.",
      failed: "The upload failed. Please try again.",
    },
  },
  footer: {
    uploading: "Wait for the document to finish uploading.",
    review: "A moderator reviews every request before it goes live.",
  },
  submit: "Submit request",
  submitting: "Submitting…",
  networkError: "We couldn't reach the server. Check your connection and try again.",
  success: {
    title: "Request submitted — waiting for review",
    body: "A moderator will check the details before your request goes live. Once it's approved, it appears on BloodLink and matching donors are notified by email and on our private Telegram channel. You can follow its status from your account.",
    myRequests: "View my requests",
    browse: "Browse requests",
  },
};

export const bn: typeof en = {
  pageTitle: "রক্তের অনুরোধ দিন",
  pageDescription:
    "বিনামূল্যে। প্রকাশের আগে একজন মডারেটর যাচাই করেন, এরপর ইমেইল ও আমাদের ব্যক্তিগত টেলিগ্রাম চ্যানেলে মিলে যাওয়া রক্তদাতাদের জানানো হয়।",
  metaDescription:
    "BloodLink-এ বিনামূল্যে রক্তের অনুরোধ দিন। একজন মডারেটর এটি যাচাই করেন, তারপর বাংলাদেশজুড়ে মিলে যাওয়া রক্তদাতাদের জানানো হয়।",
  nextSteps: {
    heading: "এরপর কী হবে",
    step: "ধাপ {number}",
    submit: "জমা দিন",
    review: "দ্রুত যাচাই",
    notified: "রক্তদাতাদের জানানো হবে",
  },
  loading: "অনুরোধের ফর্ম লোড হচ্ছে…",
  signIn: {
    title: "অনুরোধ দিতে সাইন ইন করুন",
    description:
      "সাইন ইন করলে আপনি আপনার অনুরোধ দেখতে, হালনাগাদ করতে এবং পূরণ হয়েছে বলে চিহ্নিত করতে পারবেন। এতে কমিউনিটি স্প্যামমুক্ত রাখতেও সাহায্য হয়।",
  },
  postingAs: "{name} হিসেবে পোস্ট করা হচ্ছে।",
  requiredNote: "ঐচ্ছিক ঘর ছাড়া সব ঘর পূরণ করা বাধ্যতামূলক।",
  sections: {
    blood: "কত রক্ত লাগবে",
    hospital: "হাসপাতাল ও যোগাযোগ",
    details: "আরও বিস্তারিত",
  },
  bloodGroup: "রক্তের গ্রুপ",
  units: {
    label: "ইউনিট (ব্যাগ)",
    hint: "{min} থেকে {max}",
    fewer: "ইউনিট কমান",
    more: "ইউনিট বাড়ান",
  },
  neededDate: {
    label: "কবে লাগবে",
    hint: "আজ বা আগামী {days} দিনের মধ্যে",
  },
  urgency: {
    label: "জরুরি মাত্রা",
    options: {
      urgent: { label: "খুব জরুরি", hint: "যত দ্রুত সম্ভব লাগবে" },
      normal: { label: "সাধারণ", hint: "আগে থেকে ঠিক করা, রক্তদাতা খোঁজার সময় আছে" },
    },
  },
  hospital: {
    label: "হাসপাতাল / প্রতিষ্ঠানের নাম",
    placeholder: "যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল",
  },
  district: {
    label: "জেলা",
    hint: "খুঁজতে টাইপ করুন",
    placeholder: "জেলা খুঁজুন…",
  },
  phone: {
    label: "যোগাযোগের ফোন নম্বর",
    hint: "আপনি অনুমতি দিলেই শুধু সাইন ইন করা রক্তদাতারা দেখতে পাবেন",
    placeholder: "01XXXXXXXXX",
  },
  allowPhone: {
    label: "সাইন ইন করা রক্তদাতারা আমার ফোন নম্বর দেখতে পারবেন",
    description: "এটি বন্ধ রাখলেও রক্তদাতারা অনুরোধের মন্তব্যে উত্তর দিতে পারবেন।",
  },
  description: {
    label: "সংক্ষিপ্ত বিবরণ",
    hint: "রোগীর অবস্থা, ওয়ার্ড বা বেড নম্বর, হাসপাতালে কার সাথে কথা বলতে হবে।",
    counter: "{count}/{max} অক্ষর",
  },
  document: {
    label: "প্রেসক্রিপশন বা হাসপাতালের কাগজ",
    hint: "ঐচ্ছিক, তবে দেওয়ার পরামর্শ দেওয়া হচ্ছে। এতে মডারেটররা অনুরোধ যাচাই করতে পারেন। আপনি শেয়ার না করলে কাগজটি গোপন থাকে।",
    shareLabel: "সাইন ইন করা রক্তদাতারা কাগজটি দেখতে পারবেন",
    shareReady: "মডারেটররা সব সময় দেখতে পারবেন।",
    shareNeedsUpload: "আগে একটি কাগজ আপলোড করুন।",
    chooseFile: "ফাইল বেছে নিন",
    dragHere: "অথবা এখানে টেনে আনুন",
    accepted: "JPG, PNG, WEBP বা PDF · সর্বোচ্চ {max} মেগাবাইট",
    uploading: "আপলোড হচ্ছে… {percent}%",
    checking: "ফাইল যাচাই করা হচ্ছে…",
    uploadingName: "{name} আপলোড হচ্ছে",
    cancel: "আপলোড বাতিল করুন",
    replace: "বদলান",
    remove: "সরিয়ে দিন",
    uploaded: "আপলোড হয়েছে",
    size: {
      bytes: "{value} বাইট",
      kilobytes: "{value} কিলোবাইট",
      megabytes: "{value} মেগাবাইট",
    },
    errors: {
      empty: "ফাইলটি খালি।",
      tooLarge: "ফাইলটি {max} মেগাবাইটের চেয়ে বড়।",
      unsupported: "JPG, PNG, WEBP বা PDF ফাইল আপলোড করুন।",
      sessionExpired: "আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। আপলোড করতে আবার সাইন ইন করুন।",
      network: "নেটওয়ার্কে সমস্যা হচ্ছে। সংযোগ দেখে আবার চেষ্টা করুন।",
      failed: "আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    },
  },
  footer: {
    uploading: "কাগজ আপলোড শেষ না হওয়া পর্যন্ত অপেক্ষা করুন।",
    review: "প্রকাশের আগে প্রতিটি অনুরোধ একজন মডারেটর যাচাই করেন।",
  },
  submit: "অনুরোধ জমা দিন",
  submitting: "জমা দেওয়া হচ্ছে…",
  networkError: "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। সংযোগ দেখে আবার চেষ্টা করুন।",
  success: {
    title: "অনুরোধ জমা হয়েছে — যাচাইয়ের অপেক্ষায়",
    body: "প্রকাশের আগে একজন মডারেটর তথ্যগুলো যাচাই করবেন। অনুমোদন পেলে অনুরোধটি BloodLink-এ দেখানো হবে এবং মিলে যাওয়া রক্তদাতাদের ইমেইল ও আমাদের ব্যক্তিগত টেলিগ্রাম চ্যানেলে জানানো হবে। আপনার অ্যাকাউন্ট থেকে অনুরোধের অবস্থা দেখতে পারবেন।",
    myRequests: "আমার অনুরোধগুলো দেখুন",
    browse: "অনুরোধগুলো দেখুন",
  },
};
