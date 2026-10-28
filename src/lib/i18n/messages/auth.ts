// Owner: donors & account area (login, sign-in prompt). Keep en and bn keys identical (bn is type-checked against en).

export const en = {
  login: {
    metaTitle: "Login",
    metaDescription: "Log in or sign up to BloodLink with your Google account.",
    signupTitle: "Create your account",
    signupText: "Sign up with Google to register as a blood donor or post a request for someone in need.",
    loginTitle: "Welcome back",
    loginText: "Log in to manage your donor profile, follow your blood requests and join the conversation.",
    genericError: "We couldn't sign you in. Please try again.",
    errors: {
      AccessDenied: "Sign-in was cancelled, or your Google email isn't verified. Please try again.",
      Configuration: "Sign-in is temporarily unavailable. Please try again later.",
      Verification: "That sign-in link has expired. Please try again.",
    },
    signedInTitle: "You're signed in",
    signedInAs: "Signed in as {email}.",
    continue: "Continue",
    becomeDonor: "Become a donor",
    myAccount: "My account",
    signUpWithGoogle: "Sign up with Google",
    alreadyHaveAccount: "Already have an account? {link}",
    newHere: "New to BloodLink? {link}",
    logIn: "Log in",
    signUp: "Sign up",
    footerNote:
      "Google is our only sign-in method, so there are no passwords to manage. We only use your Google name, email and photo, and never post on your behalf.",
  },

  continueWithGoogle: "Continue with Google",

  prompt: {
    note: "We only use your Google name, email and photo. We never post on your behalf.",
  },
};

export const bn: typeof en = {
  login: {
    metaTitle: "লগইন",
    metaDescription: "আপনার Google অ্যাকাউন্ট দিয়ে BloodLink-এ লগইন বা সাইন আপ করুন।",
    signupTitle: "আপনার অ্যাকাউন্ট তৈরি করুন",
    signupText:
      "রক্তদাতা হিসেবে নিবন্ধন করতে, বা বিপদে থাকা কারও জন্য রক্তের অনুরোধ দিতে Google দিয়ে সাইন আপ করুন।",
    loginTitle: "আবার স্বাগতম",
    loginText:
      "আপনার রক্তদাতা প্রোফাইল পরিচালনা করতে, রক্তের অনুরোধ অনুসরণ করতে ও আলোচনায় যুক্ত হতে লগইন করুন।",
    genericError: "আপনাকে সাইন ইন করানো যায়নি। আবার চেষ্টা করুন।",
    errors: {
      AccessDenied: "সাইন ইন বাতিল হয়েছে, অথবা আপনার Google ইমেইল যাচাই করা নেই। আবার চেষ্টা করুন।",
      Configuration: "সাইন ইন সাময়িকভাবে বন্ধ আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
      Verification: "এই সাইন ইন লিংকের মেয়াদ শেষ হয়ে গেছে। আবার চেষ্টা করুন।",
    },
    signedInTitle: "আপনি সাইন ইন করা আছেন",
    signedInAs: "সাইন ইন করা আছে: {email}।",
    continue: "চালিয়ে যান",
    becomeDonor: "রক্তদাতা হন",
    myAccount: "আমার অ্যাকাউন্ট",
    signUpWithGoogle: "Google দিয়ে সাইন আপ করুন",
    alreadyHaveAccount: "আগে থেকেই অ্যাকাউন্ট আছে? {link}",
    newHere: "BloodLink-এ নতুন? {link}",
    logIn: "লগইন করুন",
    signUp: "সাইন আপ করুন",
    footerNote:
      "সাইন ইনের জন্য শুধু Google ব্যবহার করা হয়, তাই পাসওয়ার্ড মনে রাখতে হয় না। আমরা শুধু আপনার Google নাম, ইমেইল ও ছবি ব্যবহার করি, এবং কখনো আপনার পক্ষে পোস্ট করি না।",
  },

  continueWithGoogle: "Google দিয়ে চালিয়ে যান",

  prompt: {
    note: "আমরা শুধু আপনার Google নাম, ইমেইল ও ছবি ব্যবহার করি। আমরা কখনো আপনার পক্ষে পোস্ট করি না।",
  },
};
