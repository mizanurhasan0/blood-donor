// Owner: static pages area (how it works, privacy, terms, contact, not-found, error). Keep en and bn keys identical (bn is type-checked against en).
// Inline markup in these strings is light and parsed by components/shared/rich-text.tsx: **bold**, [label](/path), {name} slots.

export const en = {
  howItWorks: {
    meta: {
      title: "How It Works",
      description:
        "How BloodLink connects patients with voluntary blood donors in Bangladesh: post a request, moderator review, donor alerts by email and Telegram, and safe coordination.",
    },
    eyebrow: "How it works",
    heroTitle: "From a request to a donor, {accent}",
    heroAccent: "safely and for free",
    heroText:
      "BloodLink connects families who need blood with voluntary donors across Bangladesh. Here's what happens at each step — and how we protect everyone's privacy along the way.",
    postRequest: "Post a blood request",
    becomeDonor: "Become a donor",
    requesters: {
      eyebrow: "Patients & families",
      title: "Need blood? Here's how to ask",
      description:
        "Post once and we'll reach donors by email and Telegram, while keeping your contact details private.",
      steps: [
        {
          title: "Post a request",
          text: "Sign in with Google and add the blood group, units, hospital, district and needed date. Attach a prescription if you have one — it stays private.",
        },
        {
          title: "A moderator reviews it",
          text: "Every request is checked by a moderator before it goes public, to keep the platform free of spam and fraud.",
        },
        {
          title: "Donors are notified",
          text: "Available donors with the same blood group nearby get an email, and the request is shared in our private Telegram channel for donors.",
        },
        {
          title: "Coordinate",
          text: "Donors reply in the comments. If you allow it, signed-in donors can reveal your phone number to call you.",
        },
        {
          title: "Mark it fulfilled",
          text: "Once you have the blood you need, mark the request fulfilled so donors know. Requests expire after the needed date.",
        },
      ],
    },
    donors: {
      eyebrow: "Donors",
      title: "Want to help? Here's how to start",
      description:
        "Set up a profile in a couple of minutes and only hear about requests that match your blood group and area.",
      steps: [
        {
          title: "Sign in with Google",
          text: "No new password. We only receive your name, email address and profile photo.",
        },
        {
          title: "Create your profile",
          text: "Add your blood group and district, plus your area and phone number if you like. Your number is never shown to others.",
        },
        {
          title: "Opt in to alerts",
          text: "Choose whether you're available and want email alerts. Every email has a one-click unsubscribe link.",
        },
        {
          title: "Link Telegram",
          text: "Optionally link Telegram from your account page to be approved for the private donor channel.",
        },
        {
          title: "Respond",
          text: "Comment on a request or call the family when they share their number. Confirm details with the hospital before you go.",
        },
      ],
    },
    safety: {
      eyebrow: "Safety & privacy",
      title: "Built to protect people",
      items: [
        {
          title: "Phone numbers stay masked",
          text: "Numbers appear masked, like 017•••••678. Only signed-in donors can reveal one, only if the requester allows it, and every reveal is logged.",
        },
        {
          title: "Documents stay private",
          text: "Prescriptions are stored privately. Only the requester and moderators can open them — and donors, if the requester chooses to share.",
        },
        {
          title: "Never pay for blood",
          text: "Donation here is voluntary and free. Never pay or accept money for blood, and report anyone who asks.",
        },
        {
          title: "Medical staff decide",
          text: "Matching by blood group only finds potential volunteers. Screening, compatibility and eligibility are decided by qualified medical staff.",
        },
      ],
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Is BloodLink free?",
          a: "Yes. BloodLink is a free community platform. Nobody should ever pay or be paid for blood.",
        },
        {
          q: "Do I need to be a donor to post a request?",
          a: "No. Anyone signed in with Google can post a request. You only need a donor profile to receive alerts or to reveal a requester's phone number.",
        },
        {
          q: "Why isn't my request visible yet?",
          a: "New requests wait for a moderator to review them. You can follow the status from your account page.",
        },
        {
          q: "Who can see my phone number?",
          a: "Requesters' numbers are masked for everyone. Signed-in donors can reveal it only if you allowed that when posting. A donor's own profile number is never shown to other users.",
        },
        {
          q: "How do I stop email alerts?",
          a: "Use the unsubscribe link in any alert email, or turn email alerts off on your account page.",
        },
        {
          q: "Can I delete my data?",
          a: "Yes. Go to Account → Delete account. Your profile, your requests and their documents are deleted, and your comments are removed.",
        },
      ],
    },
    cta: {
      title: "Ready when someone needs you",
      text: "Post a request for a patient, or register as a donor so the right request reaches you.",
    },
    stepLabel: "Step {n}: ",
  },
  privacy: {
    meta: {
      title: "Privacy Policy",
      description:
        "What BloodLink collects, who can see it, how phone numbers and documents are protected, and how to delete your data.",
    },
    title: "Privacy Policy",
    updated: "Last updated: {date}",
    intro:
      "BloodLink is a free community platform that connects voluntary blood donors with people in need across Bangladesh. We only collect what we need to make that work, and we never sell your data.",
    collect: {
      heading: "What we collect",
      google: {
        heading: "When you sign in with Google",
        text: "We receive your **name**, **email address** and **profile photo** from Google. We never see your Google password. A secure cookie keeps you signed in.",
      },
      donor: {
        heading: "If you create a donor profile",
        items: [
          "Full name, blood group, division and district, and optionally your area.",
          "Optionally, your phone number. It is encrypted and never shown to other users.",
          "Whether you are available to donate and whether you want email alerts.",
          "If you link Telegram, your Telegram user ID, so we can approve you for the donor channel.",
        ],
      },
      request: {
        heading: "If you post a blood request",
        items: [
          "Blood group, units needed, hospital, district, needed date, urgency and a description.",
          "A contact phone number, encrypted at rest.",
          "Optionally, a prescription or requisition document (JPG, PNG, WEBP or PDF).",
        ],
      },
      usage: {
        heading: "When you use the platform",
        items: [
          "Comments you post and reports you send about requests or comments.",
          "A log each time someone reveals a requester's phone number (who, which request and when).",
          "Short-lived counters used for rate limiting, and records of notification deliveries.",
        ],
      },
      noAds: "We don't use advertising or third-party analytics trackers.",
    },
    who: {
      heading: "Who can see what",
      items: [
        "**Published requests** are public: blood group, units, hospital, district, needed date, urgency, description and comments (with the commenter's name and photo). New requests stay hidden until a moderator approves them.",
        "**Phone numbers** are shown masked (for example 017•••••678). The full number is revealed only to signed-in donors, only if the requester allows it, and every reveal is logged. The requester and moderators can always see it.",
        "**Documents** are kept in a private storage bucket with no public link. Only the requester and moderators can open them — and signed-in donors too, if the requester chooses to share it.",
        "**Moderators** can see pending requests, reports and notification delivery status in order to keep the platform safe.",
      ],
    },
    notify: {
      heading: "How notifications work",
      items: [
        "**Email** alerts are sent through our email provider, Brevo, which receives your name and email address to deliver them. Only donors who turned on email alerts receive them, and every email has a one-click unsubscribe link.",
        "**Telegram** messages in the private donor channel contain only the blood group, hospital, district, units, needed date and a link to the request — never contact details or documents.",
      ],
    },
    share: {
      heading: "Who we share data with",
      text: "We don't sell your data or use it for advertising. We rely on a few service providers to run BloodLink: Google (sign-in and profile photos), Brevo (email), Telegram (the donor channel), and our hosting, database and file storage providers. They only process data needed to provide their service.",
    },
    safe: {
      heading: "Keeping it safe",
      text: "Phone numbers are encrypted at rest, documents are stored privately, and every request is reviewed before it goes public. We rate-limit posting, comments, uploads, phone reveals and reports to prevent abuse. No system is perfectly secure, so please only share what is needed to arrange a donation.",
    },
    choices: {
      heading: "Your choices and deleting your data",
      items: [
        "Turn email alerts or availability on or off from your account page at any time.",
        "Unsubscribe from alerts using the link in any email.",
        "Delete everything from **Account → Delete account**. This removes your account, donor profile, your requests and their documents, your Telegram link and your phone-reveal records. Comments you left on other people's requests are blanked.",
      ],
    },
    changes: {
      heading: "Changes and contact",
      text: "If we change this policy we will update the date at the top of this page. Questions? Visit our [contact page](/contact). See also our [Terms of Use](/terms).",
    },
  },
  terms: {
    meta: {
      title: "Terms of Use",
      description:
        "The simple rules for using BloodLink: a free community platform, no payment for blood, no medical advice and respectful, accurate posts.",
    },
    title: "Terms of Use",
    updated: "Last updated: {date}",
    intro: "By using BloodLink you agree to these terms. They are short on purpose — please read them.",
    free: {
      heading: "A free community platform",
      text: "BloodLink helps people share blood requests and connect with voluntary donors across Bangladesh. It is free to use. BloodLink is not a blood bank, hospital or medical service.",
    },
    pay: {
      heading: "Never pay for blood",
      text: "Blood donation on BloodLink is voluntary. **Never pay or accept payment for blood**, and never ask for money, gifts or favours in return. Requests or comments that involve payment will be removed. Please report them.",
    },
    medical: {
      heading: "No medical advice",
      text: "Matching by blood group only finds potential volunteers. Screening, compatibility testing and donation eligibility are decided by qualified medical staff at the hospital. Nothing on BloodLink is medical advice. In an emergency, contact the hospital directly or call 999.",
    },
    responsibilities: {
      heading: "Your responsibilities",
      items: [
        "Only post genuine requests, and keep the details accurate and up to date.",
        "Mark your request as fulfilled once you have the blood you need.",
        "Only share someone else's details or documents with their permission.",
        "Use any phone number you see only to arrange a donation — never for anything else.",
        "Be respectful. No spam, harassment, hate or misleading content.",
      ],
      text: "You are responsible for what you post and for your own arrangements with other users.",
    },
    moderation: {
      heading: "Moderation",
      text: "Moderators review every request before it is published. We may reject or remove requests and comments, and act on reports, when content breaks these terms or puts people at risk.",
    },
    guarantees: {
      heading: "No guarantees",
      text: "We do our best, but we can't guarantee that a donor will be found, that information posted by users is accurate, or that the service will always be available. BloodLink is provided as is, and we are not responsible for arrangements made between users.",
    },
    account: {
      heading: "Your account",
      text: "You sign in with Google and can delete your account at any time from **Account → Delete account**. How we handle your data is explained in our [Privacy Policy](/privacy).",
    },
    changes: {
      heading: "Changes and contact",
      text: "We may update these terms and will change the date at the top when we do. Questions? Visit our [contact page](/contact).",
    },
  },
  contact: {
    meta: {
      title: "Contact",
      description: "How to reach the BloodLink team, report a problem with a request, or get help.",
    },
    title: "Contact",
    description:
      "Questions, feedback or a problem with a request? Here's the quickest way to reach the people who run BloodLink.",
    touch: {
      title: "Get in touch",
      withEmail: "Email us at {address} and we'll get back to you as soon as we can.",
      noInbox:
        "We don't have a public inbox yet. Comment on the relevant [blood request](/requests), or, if you've joined the private donor Telegram channel, reach the admins there.",
    },
    report: {
      title: "Report a request or comment",
      text: "Use the **Report** button on the request page. It goes straight to our moderators — for example if someone asks for payment or the details look wrong.",
    },
    coordinate: {
      title: "Coordinating a donation",
      text: "Talk to the requester in the comments on their request. Read [how it works](/how-it-works) for tips on staying safe.",
    },
    emergency: {
      title: "Medical emergency",
      text: "BloodLink isn't an emergency service. Contact the hospital directly or call 999.",
    },
  },
  notFound: {
    meta: {
      title: "Page not found",
    },
    eyebrow: "Error {code}",
    title: "We couldn't find that page",
    text: "The link may be broken, or the blood request may have been removed or is not public yet.",
    goHome: "Go home",
    browse: "Browse blood requests",
  },
};

export const bn: typeof en = {
  howItWorks: {
    meta: {
      title: "কীভাবে কাজ করে",
      description:
        "BloodLink কীভাবে বাংলাদেশের রোগীদের স্বেচ্ছাসেবী রক্তদাতাদের সাথে যুক্ত করে: অনুরোধ দেওয়া, মডারেটরের যাচাই, ইমেইল ও Telegram-এ রক্তদাতাদের সতর্কবার্তা, এবং নিরাপদ যোগাযোগ।",
    },
    eyebrow: "কীভাবে কাজ করে",
    heroTitle: "একটি অনুরোধ থেকে একজন রক্তদাতা পর্যন্ত, {accent}",
    heroAccent: "নিরাপদে ও বিনামূল্যে",
    heroText:
      "BloodLink বাংলাদেশজুড়ে রক্তের প্রয়োজন হওয়া পরিবারগুলোকে স্বেচ্ছাসেবী রক্তদাতাদের সাথে যুক্ত করে। প্রতিটি ধাপে কী ঘটে, এবং এর মধ্যে সবার গোপনীয়তা আমরা কীভাবে রক্ষা করি, তা এখানে জানুন।",
    postRequest: "রক্তের অনুরোধ দিন",
    becomeDonor: "রক্তদাতা হোন",
    requesters: {
      eyebrow: "রোগী ও পরিবার",
      title: "রক্ত দরকার? কীভাবে চাইবেন জেনে নিন",
      description:
        "একবার অনুরোধ দিন, আমরা ইমেইল ও Telegram-এর মাধ্যমে রক্তদাতাদের কাছে পৌঁছে দেব, আর আপনার যোগাযোগের তথ্য গোপন রাখব।",
      steps: [
        {
          title: "অনুরোধ দিন",
          text: "Google দিয়ে সাইন ইন করুন, এরপর রক্তের গ্রুপ, ইউনিট, হাসপাতাল, জেলা ও প্রয়োজনের তারিখ লিখুন। প্রেসক্রিপশন থাকলে সেটি যুক্ত করুন — এটি গোপন থাকবে।",
        },
        {
          title: "একজন মডারেটর যাচাই করেন",
          text: "স্প্যাম ও প্রতারণা থেকে প্ল্যাটফর্ম মুক্ত রাখতে, সর্বসাধারণের কাছে প্রকাশের আগে প্রতিটি অনুরোধ একজন মডারেটর যাচাই করেন।",
        },
        {
          title: "রক্তদাতাদের জানানো হয়",
          text: "কাছাকাছি থাকা একই রক্তের গ্রুপের উপলব্ধ রক্তদাতারা ইমেইল পান, এবং অনুরোধটি রক্তদাতাদের জন্য আমাদের ব্যক্তিগত Telegram চ্যানেলেও শেয়ার করা হয়।",
        },
        {
          title: "যোগাযোগ করুন",
          text: "রক্তদাতারা মন্তব্যে সাড়া দেন। আপনি অনুমতি দিলে সাইন-ইন করা রক্তদাতারা আপনাকে ফোন করার জন্য আপনার ফোন নম্বর দেখতে পারেন।",
        },
        {
          title: "পূরণ হয়েছে বলে চিহ্নিত করুন",
          text: "প্রয়োজনীয় রক্ত পেয়ে গেলে অনুরোধটিকে পূরণ হয়েছে বলে চিহ্নিত করুন, যাতে রক্তদাতারা জানতে পারেন। প্রয়োজনের তারিখ পেরোলে অনুরোধের মেয়াদ শেষ হয়ে যায়।",
        },
      ],
    },
    donors: {
      eyebrow: "রক্তদাতা",
      title: "সাহায্য করতে চান? শুরু করার উপায়",
      description:
        "কয়েক মিনিটেই একটি প্রোফাইল তৈরি করুন, আর শুধু আপনার রক্তের গ্রুপ ও এলাকার সাথে মেলে এমন অনুরোধের খবর পান।",
      steps: [
        {
          title: "Google দিয়ে সাইন ইন করুন",
          text: "নতুন কোনো পাসওয়ার্ড লাগবে না। আমরা শুধু আপনার নাম, ইমেইল ঠিকানা ও প্রোফাইল ছবি পাই।",
        },
        {
          title: "প্রোফাইল তৈরি করুন",
          text: "আপনার রক্তের গ্রুপ ও জেলা যোগ করুন, চাইলে এলাকা ও ফোন নম্বরও যোগ করতে পারেন। আপনার নম্বর কখনো অন্যদের দেখানো হয় না।",
        },
        {
          title: "সতর্কবার্তায় যুক্ত হন",
          text: "আপনি উপলব্ধ আছেন কি না এবং ইমেইল সতর্কবার্তা চান কি না, তা বেছে নিন। প্রতিটি ইমেইলে এক ক্লিকে আনসাবস্ক্রাইবের লিংক থাকে।",
        },
        {
          title: "Telegram যুক্ত করুন",
          text: "ব্যক্তিগত রক্তদাতা চ্যানেলে অনুমোদন পেতে চাইলে আপনার অ্যাকাউন্ট পাতা থেকে ঐচ্ছিকভাবে Telegram যুক্ত করুন।",
        },
        {
          title: "সাড়া দিন",
          text: "কোনো অনুরোধে মন্তব্য করুন, অথবা পরিবারটি নম্বর শেয়ার করলে তাদের ফোন করুন। যাওয়ার আগে হাসপাতালের সাথে বিস্তারিত নিশ্চিত করুন।",
        },
      ],
    },
    safety: {
      eyebrow: "নিরাপত্তা ও গোপনীয়তা",
      title: "মানুষের নিরাপত্তার কথা ভেবে তৈরি",
      items: [
        {
          title: "ফোন নম্বর লুকানো থাকে",
          text: "নম্বর আংশিকভাবে লুকানো থাকে, যেমন 017•••••678। শুধু সাইন-ইন করা রক্তদাতারা, এবং অনুরোধকারী অনুমতি দিলেই একটি নম্বর দেখতে পারেন, আর প্রতিটি দেখার তথ্য লগ করা হয়।",
        },
        {
          title: "নথি গোপন থাকে",
          text: "প্রেসক্রিপশন গোপনে সংরক্ষণ করা হয়। শুধু অনুরোধকারী ও মডারেটররা এটি খুলতে পারেন — আর অনুরোধকারী চাইলে রক্তদাতারাও।",
        },
        {
          title: "রক্তের জন্য কখনো টাকা দেবেন না",
          text: "এখানে রক্তদান স্বেচ্ছায় ও বিনামূল্যে। রক্তের বিনিময়ে কখনো টাকা দেবেন না বা নেবেন না, আর যে কেউ টাকা চাইলে তাকে রিপোর্ট করুন।",
        },
        {
          title: "সিদ্ধান্ত নেন চিকিৎসক",
          text: "শুধু রক্তের গ্রুপ মিলিয়ে সম্ভাব্য স্বেচ্ছাসেবী খুঁজে পাওয়া যায়। স্ক্রিনিং, সামঞ্জস্য ও রক্তদানের যোগ্যতা নির্ধারণ করেন যোগ্য চিকিৎসকরা।",
        },
      ],
    },
    faq: {
      title: "সচরাচর জিজ্ঞাসিত প্রশ্ন",
      items: [
        {
          q: "BloodLink কি বিনামূল্যে?",
          a: "হ্যাঁ। BloodLink একটি বিনামূল্যের কমিউনিটি প্ল্যাটফর্ম। রক্তের জন্য কারও টাকা দেওয়া বা নেওয়া উচিত নয়।",
        },
        {
          q: "অনুরোধ দিতে কি রক্তদাতা হতে হবে?",
          a: "না। Google দিয়ে সাইন ইন করা যে কেউ অনুরোধ দিতে পারেন। সতর্কবার্তা পেতে বা কোনো অনুরোধকারীর ফোন নম্বর দেখতে শুধু রক্তদাতার প্রোফাইল লাগে।",
        },
        {
          q: "আমার অনুরোধ এখনো দেখা যাচ্ছে না কেন?",
          a: "নতুন অনুরোধ মডারেটরের যাচাইয়ের অপেক্ষায় থাকে। আপনার অ্যাকাউন্ট পাতা থেকে অবস্থা দেখতে পারবেন।",
        },
        {
          q: "আমার ফোন নম্বর কে দেখতে পারে?",
          a: "অনুরোধকারীদের নম্বর সবার জন্য লুকানো থাকে। অনুরোধ দেওয়ার সময় অনুমতি দিলে সাইন-ইন করা রক্তদাতারা নম্বরটি দেখতে পারেন। রক্তদাতার নিজের প্রোফাইলের নম্বর অন্য ব্যবহারকারীদের কখনো দেখানো হয় না।",
        },
        {
          q: "ইমেইল সতর্কবার্তা কীভাবে বন্ধ করব?",
          a: "যেকোনো সতর্কবার্তা ইমেইলের আনসাবস্ক্রাইব লিংক ব্যবহার করুন, অথবা অ্যাকাউন্ট পাতা থেকে ইমেইল সতর্কবার্তা বন্ধ করুন।",
        },
        {
          q: "আমি কি আমার তথ্য মুছে ফেলতে পারি?",
          a: "হ্যাঁ। অ্যাকাউন্ট → অ্যাকাউন্ট মুছুন-এ যান। আপনার প্রোফাইল, অনুরোধ ও সেগুলোর নথি মুছে যাবে, আর আপনার মন্তব্যগুলো সরিয়ে ফেলা হবে।",
        },
      ],
    },
    cta: {
      title: "কারও প্রয়োজনে যখন আপনি প্রস্তুত",
      text: "একজন রোগীর জন্য অনুরোধ দিন, অথবা রক্তদাতা হিসেবে নিবন্ধন করুন যাতে সঠিক অনুরোধটি আপনার কাছে পৌঁছায়।",
    },
    stepLabel: "ধাপ {n}: ",
  },
  privacy: {
    meta: {
      title: "গোপনীয়তা নীতি",
      description:
        "BloodLink কী তথ্য সংগ্রহ করে, কে তা দেখতে পারে, ফোন নম্বর ও নথি কীভাবে সুরক্ষিত থাকে, এবং কীভাবে আপনার তথ্য মুছে ফেলবেন।",
    },
    title: "গোপনীয়তা নীতি",
    updated: "সর্বশেষ আপডেট: {date}",
    intro:
      "BloodLink একটি বিনামূল্যের কমিউনিটি প্ল্যাটফর্ম, যা বাংলাদেশজুড়ে স্বেচ্ছাসেবী রক্তদাতাদের বিপদে থাকা মানুষের সাথে যুক্ত করে। এটি চালাতে যতটুকু প্রয়োজন, শুধু ততটুকুই আমরা সংগ্রহ করি, এবং আমরা কখনো আপনার তথ্য বিক্রি করি না।",
    collect: {
      heading: "আমরা কী সংগ্রহ করি",
      google: {
        heading: "Google দিয়ে সাইন ইন করলে",
        text: "Google থেকে আমরা আপনার **নাম**, **ইমেইল ঠিকানা** ও **প্রোফাইল ছবি** পাই। আপনার Google পাসওয়ার্ড আমরা কখনো দেখি না। একটি নিরাপদ কুকি আপনাকে সাইন-ইন অবস্থায় রাখে।",
      },
      donor: {
        heading: "রক্তদাতার প্রোফাইল তৈরি করলে",
        items: [
          "পূর্ণ নাম, রক্তের গ্রুপ, বিভাগ ও জেলা, এবং চাইলে আপনার এলাকা।",
          "ঐচ্ছিকভাবে, আপনার ফোন নম্বর। এটি এনক্রিপ্ট করা থাকে এবং অন্য ব্যবহারকারীদের কখনো দেখানো হয় না।",
          "আপনি রক্তদানে উপলব্ধ কি না, এবং ইমেইল সতর্কবার্তা চান কি না।",
          "Telegram যুক্ত করলে আপনার Telegram ইউজার আইডি, যাতে রক্তদাতা চ্যানেলের জন্য আপনাকে অনুমোদন দেওয়া যায়।",
        ],
      },
      request: {
        heading: "রক্তের অনুরোধ দিলে",
        items: [
          "রক্তের গ্রুপ, প্রয়োজনীয় ইউনিট, হাসপাতাল, জেলা, প্রয়োজনের তারিখ, জরুরিতা ও বিবরণ।",
          "একটি যোগাযোগের ফোন নম্বর, যা সংরক্ষণের সময় এনক্রিপ্ট করা থাকে।",
          "ঐচ্ছিকভাবে, একটি প্রেসক্রিপশন বা রিকুইজিশন নথি (JPG, PNG, WEBP বা PDF)।",
        ],
      },
      usage: {
        heading: "প্ল্যাটফর্ম ব্যবহারের সময়",
        items: [
          "আপনার দেওয়া মন্তব্য, এবং অনুরোধ বা মন্তব্য নিয়ে পাঠানো রিপোর্ট।",
          "কেউ কোনো অনুরোধকারীর ফোন নম্বর দেখলে প্রতিবার একটি লগ রাখা হয় (কে, কোন অনুরোধ, এবং কখন)।",
          "অল্প সময়ের জন্য রাখা রেট-লিমিটের হিসাব, এবং নোটিফিকেশন পাঠানোর রেকর্ড।",
        ],
      },
      noAds: "আমরা বিজ্ঞাপন বা তৃতীয় পক্ষের বিশ্লেষণ ট্র্যাকার ব্যবহার করি না।",
    },
    who: {
      heading: "কে কী দেখতে পারে",
      items: [
        "**প্রকাশিত অনুরোধ** সর্বসাধারণের জন্য উন্মুক্ত: রক্তের গ্রুপ, ইউনিট, হাসপাতাল, জেলা, প্রয়োজনের তারিখ, জরুরিতা, বিবরণ এবং মন্তব্য (মন্তব্যকারীর নাম ও ছবিসহ)। নতুন অনুরোধ মডারেটর অনুমোদন না দেওয়া পর্যন্ত লুকানো থাকে।",
        "**ফোন নম্বর** আংশিকভাবে লুকানো থাকে (যেমন 017•••••678)। সাইন-ইন করা রক্তদাতারা শুধু তখনই পুরো নম্বর দেখতে পারেন, যদি অনুরোধকারী অনুমতি দেন, এবং প্রতিটি দেখার তথ্য লগ করা হয়। অনুরোধকারী ও মডারেটররা সবসময় নম্বরটি দেখতে পারেন।",
        "**নথি** একটি ব্যক্তিগত স্টোরেজে রাখা হয়, যেখানে কোনো সর্বজনীন লিংক নেই। শুধু অনুরোধকারী ও মডারেটররা এগুলো খুলতে পারেন — আর অনুরোধকারী চাইলে সাইন-ইন করা রক্তদাতারাও।",
        "**মডারেটররা** প্ল্যাটফর্ম নিরাপদ রাখতে অপেক্ষমান অনুরোধ, রিপোর্ট এবং নোটিফিকেশন পাঠানোর অবস্থা দেখতে পারেন।",
      ],
    },
    notify: {
      heading: "নোটিফিকেশন কীভাবে কাজ করে",
      items: [
        "**ইমেইল** সতর্কবার্তা আমাদের ইমেইল প্রদানকারী Brevo-র মাধ্যমে পাঠানো হয়। পৌঁছে দিতে তারা আপনার নাম ও ইমেইল ঠিকানা পায়। যেসব রক্তদাতা ইমেইল সতর্কবার্তা চালু রেখেছেন, শুধু তারাই এগুলো পান, এবং প্রতিটি ইমেইলে এক ক্লিকে আনসাবস্ক্রাইবের লিংক থাকে।",
        "ব্যক্তিগত রক্তদাতা চ্যানেলে **Telegram** বার্তায় শুধু রক্তের গ্রুপ, হাসপাতাল, জেলা, ইউনিট, প্রয়োজনের তারিখ এবং অনুরোধের একটি লিংক থাকে — কখনো যোগাযোগের তথ্য বা নথি নয়।",
      ],
    },
    share: {
      heading: "আমরা কার সাথে তথ্য ভাগ করি",
      text: "আমরা আপনার তথ্য বিক্রি করি না বা বিজ্ঞাপনের কাজে ব্যবহার করি না। BloodLink চালাতে আমরা কয়েকটি সেবা-প্রদানকারীর উপর নির্ভর করি: Google (সাইন-ইন ও প্রোফাইল ছবি), Brevo (ইমেইল), Telegram (রক্তদাতা চ্যানেল), এবং আমাদের হোস্টিং, ডেটাবেস ও ফাইল স্টোরেজ প্রদানকারীরা। তারা শুধু তাদের সেবা দেওয়ার জন্য প্রয়োজনীয় তথ্যই প্রক্রিয়া করে।",
    },
    safe: {
      heading: "নিরাপদ রাখা",
      text: "ফোন নম্বর সংরক্ষণের সময় এনক্রিপ্ট করা থাকে, নথি ব্যক্তিগতভাবে সংরক্ষিত হয়, এবং সর্বসাধারণের কাছে প্রকাশের আগে প্রতিটি অনুরোধ যাচাই করা হয়। অপব্যবহার ঠেকাতে আমরা অনুরোধ দেওয়া, মন্তব্য, আপলোড, ফোন নম্বর দেখা ও রিপোর্টের উপর সীমা রাখি। কোনো ব্যবস্থাই পুরোপুরি নিরাপদ নয়, তাই রক্তদানের ব্যবস্থা করতে যতটুকু দরকার, শুধু ততটুকুই শেয়ার করুন।",
    },
    choices: {
      heading: "আপনার পছন্দ ও তথ্য মুছে ফেলা",
      items: [
        "যেকোনো সময় আপনার অ্যাকাউন্ট পাতা থেকে ইমেইল সতর্কবার্তা বা উপলব্ধতা চালু বা বন্ধ করুন।",
        "যেকোনো ইমেইলের লিংক ব্যবহার করে সতর্কবার্তা থেকে আনসাবস্ক্রাইব করুন।",
        "**অ্যাকাউন্ট → অ্যাকাউন্ট মুছুন** থেকে সবকিছু মুছে ফেলুন। এতে আপনার অ্যাকাউন্ট, রক্তদাতা প্রোফাইল, আপনার অনুরোধ ও সেগুলোর নথি, Telegram যোগ এবং ফোন দেখার রেকর্ড মুছে যায়। অন্যদের অনুরোধে আপনার করা মন্তব্যগুলো খালি করে দেওয়া হয়।",
      ],
    },
    changes: {
      heading: "পরিবর্তন ও যোগাযোগ",
      text: "এই নীতিতে পরিবর্তন হলে আমরা এই পাতার শুরুতে থাকা তারিখ আপডেট করব। প্রশ্ন আছে? আমাদের [যোগাযোগের পাতা](/contact) দেখুন। আরও দেখুন আমাদের [ব্যবহারের শর্তাবলি](/terms)।",
    },
  },
  terms: {
    meta: {
      title: "ব্যবহারের শর্তাবলি",
      description:
        "BloodLink ব্যবহারের সহজ নিয়মাবলি: এটি একটি বিনামূল্যের কমিউনিটি প্ল্যাটফর্ম, রক্তের জন্য টাকা লেনদেন নিষিদ্ধ, এখানে চিকিৎসা-পরামর্শ দেওয়া হয় না, এবং পোস্ট হতে হবে সম্মানজনক ও সঠিক।",
    },
    title: "ব্যবহারের শর্তাবলি",
    updated: "সর্বশেষ আপডেট: {date}",
    intro:
      "BloodLink ব্যবহার করে আপনি এই শর্তগুলো মানতে সম্মত হচ্ছেন। এগুলো ইচ্ছাকৃতভাবেই সংক্ষিপ্ত রাখা হয়েছে — অনুগ্রহ করে পড়ুন।",
    free: {
      heading: "একটি বিনামূল্যের কমিউনিটি প্ল্যাটফর্ম",
      text: "BloodLink বাংলাদেশজুড়ে মানুষকে রক্তের অনুরোধ শেয়ার করতে এবং স্বেচ্ছাসেবী রক্তদাতাদের সাথে যুক্ত হতে সাহায্য করে। এটি ব্যবহার করা বিনামূল্যে। BloodLink কোনো ব্লাড ব্যাংক, হাসপাতাল বা চিকিৎসা সেবা নয়।",
    },
    pay: {
      heading: "রক্তের জন্য কখনো টাকা নয়",
      text: "BloodLink-এ রক্তদান স্বেচ্ছায় হয়। **রক্তের বিনিময়ে কখনো টাকা দেবেন না বা নেবেন না**, এবং প্রতিদানে কখনো টাকা, উপহার বা সুবিধা চাইবেন না। টাকা-পয়সা জড়িত এমন অনুরোধ বা মন্তব্য সরিয়ে ফেলা হবে। দয়া করে সেগুলো রিপোর্ট করুন।",
    },
    medical: {
      heading: "চিকিৎসা-পরামর্শ নয়",
      text: "শুধু রক্তের গ্রুপ মিলিয়ে সম্ভাব্য স্বেচ্ছাসেবী খুঁজে পাওয়া যায়। স্ক্রিনিং, সামঞ্জস্য পরীক্ষা ও রক্তদানের যোগ্যতা হাসপাতালের যোগ্য চিকিৎসকরা নির্ধারণ করেন। BloodLink-এর কোনো কিছুই চিকিৎসা-পরামর্শ নয়। জরুরি অবস্থায় সরাসরি হাসপাতালে যোগাযোগ করুন বা 999-এ কল করুন।",
    },
    responsibilities: {
      heading: "আপনার দায়িত্ব",
      items: [
        "শুধু সত্যিকারের অনুরোধ দিন, এবং বিবরণ সঠিক ও হালনাগাদ রাখুন।",
        "প্রয়োজনীয় রক্ত পেয়ে গেলে আপনার অনুরোধটিকে পূরণ হয়েছে বলে চিহ্নিত করুন।",
        "অন্য কারও তথ্য বা নথি শুধু তাদের অনুমতি নিয়ে শেয়ার করুন।",
        "যেকোনো ফোন নম্বর শুধু রক্তদানের ব্যবস্থার জন্য ব্যবহার করুন — অন্য কোনো কাজে কখনো নয়।",
        "সম্মানজনক আচরণ করুন। স্প্যাম, হয়রানি, বিদ্বেষ বা ভুল তথ্য দেওয়া যাবে না।",
      ],
      text: "আপনি যা পোস্ট করেন এবং অন্য ব্যবহারকারীদের সাথে নিজের ব্যবস্থাপনার দায়িত্ব আপনার নিজের।",
    },
    moderation: {
      heading: "মডারেশন",
      text: "প্রকাশের আগে মডারেটররা প্রতিটি অনুরোধ যাচাই করেন। এই শর্তাবলি ভাঙলে বা মানুষকে ঝুঁকিতে ফেললে আমরা অনুরোধ ও মন্তব্য প্রত্যাখ্যান বা সরিয়ে ফেলতে পারি, এবং রিপোর্টের ভিত্তিতে ব্যবস্থা নিতে পারি।",
    },
    guarantees: {
      heading: "কোনো নিশ্চয়তা নেই",
      text: "আমরা যথাসাধ্য চেষ্টা করি, তবে কোনো রক্তদাতা পাওয়া যাবেই, ব্যবহারকারীদের দেওয়া তথ্য সঠিক, বা সেবা সবসময় চালু থাকবে — এমন নিশ্চয়তা আমরা দিতে পারি না। BloodLink যেমন আছে তেমনই দেওয়া হয়েছে, এবং ব্যবহারকারীদের মধ্যকার ব্যবস্থাপনার জন্য আমরা দায়ী নই।",
    },
    account: {
      heading: "আপনার অ্যাকাউন্ট",
      text: "আপনি Google দিয়ে সাইন ইন করেন, এবং **অ্যাকাউন্ট → অ্যাকাউন্ট মুছুন** থেকে যেকোনো সময় অ্যাকাউন্ট মুছে ফেলতে পারেন। আমরা আপনার তথ্য কীভাবে ব্যবহার করি, তা আমাদের [গোপনীয়তা নীতি](/privacy)-তে ব্যাখ্যা করা আছে।",
    },
    changes: {
      heading: "পরিবর্তন ও যোগাযোগ",
      text: "আমরা এই শর্তাবলি হালনাগাদ করতে পারি, এবং করলে এই পাতার শুরুর তারিখ বদলে দেব। প্রশ্ন আছে? আমাদের [যোগাযোগের পাতা](/contact) দেখুন।",
    },
  },
  contact: {
    meta: {
      title: "যোগাযোগ",
      description:
        "BloodLink টিমের সাথে কীভাবে যোগাযোগ করবেন, কোনো অনুরোধ নিয়ে সমস্যা জানাবেন, বা সাহায্য পাবেন।",
    },
    title: "যোগাযোগ",
    description:
      "প্রশ্ন, মতামত, বা কোনো অনুরোধ নিয়ে সমস্যা? BloodLink যাঁরা চালান, তাঁদের সাথে দ্রুত যোগাযোগের উপায় এখানে।",
    touch: {
      title: "যোগাযোগ করুন",
      withEmail: "আমাদের {address} ঠিকানায় ইমেইল করুন, আমরা যত দ্রুত সম্ভব উত্তর দেব।",
      noInbox:
        "এখনো আমাদের কোনো পাবলিক ইনবক্স নেই। সংশ্লিষ্ট [রক্তের অনুরোধে](/requests) মন্তব্য করুন, অথবা যদি আপনি ব্যক্তিগত রক্তদাতা Telegram চ্যানেলে যুক্ত থাকেন, সেখানে অ্যাডমিনদের সাথে যোগাযোগ করুন।",
    },
    report: {
      title: "অনুরোধ বা মন্তব্য রিপোর্ট করুন",
      text: "কোনো অনুরোধের পাতায় থাকা **রিপোর্ট** বোতামটি ব্যবহার করুন। এটি সরাসরি আমাদের মডারেটরদের কাছে যায় — যেমন কেউ টাকা চাইলে বা তথ্য ভুল মনে হলে।",
    },
    coordinate: {
      title: "রক্তদানের ব্যবস্থা করা",
      text: "অনুরোধের মন্তব্যে অনুরোধকারীর সাথে কথা বলুন। নিরাপদ থাকার টিপসের জন্য [কীভাবে কাজ করে](/how-it-works) পড়ুন।",
    },
    emergency: {
      title: "জরুরি চিকিৎসা",
      text: "BloodLink একটি জরুরি সেবা নয়। সরাসরি হাসপাতালে যোগাযোগ করুন বা 999-এ কল করুন।",
    },
  },
  notFound: {
    meta: {
      title: "পাতাটি পাওয়া যায়নি",
    },
    eyebrow: "ত্রুটি {code}",
    title: "পাতাটি খুঁজে পাওয়া যায়নি",
    text: "লিংকটি ভাঙা হতে পারে, অথবা রক্তের অনুরোধটি সরানো হয়েছে বা এখনো সর্বসাধারণের জন্য প্রকাশ করা হয়নি।",
    goHome: "হোম পেজে যান",
    browse: "রক্তের অনুরোধ দেখুন",
  },
};

/**
 * The error boundary is a Client Component, so it reads this small block directly
 * instead of the whole pages dictionary (keeps the client bundle lean).
 */
const enErrorPage = {
  title: "Something went wrong",
  text: "This page couldn't load right now. It's usually temporary — please try again.",
  retry: "Try again",
  home: "Go home",
  reference: "Reference: {digest}",
};

const bnErrorPage: typeof enErrorPage = {
  title: "কিছু একটা সমস্যা হয়েছে",
  text: "এই পাতাটি এখন লোড করা যাচ্ছে না। সাধারণত এটি সাময়িক সমস্যা — দয়া করে আবার চেষ্টা করুন।",
  retry: "আবার চেষ্টা করুন",
  home: "হোম পেজে যান",
  reference: "রেফারেন্স: {digest}",
};

export const errorPage = { en: enErrorPage, bn: bnErrorPage };
