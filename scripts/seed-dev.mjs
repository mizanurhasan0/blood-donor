// Seeds realistic test data into the LOCAL development database.
//
// Every seeded document carries seedBatch: "dev-seed-v1". Running the script again
// replaces only that data, so real accounts (e.g. your Google sign-in) are never touched.
// Phone numbers are encrypted with DATA_ENCRYPTION_KEY, exactly like the app does,
// so the "show number" feature works on seeded requests. No notification jobs are created.
//
// Usage: npm run seed:dev   (reads MONGODB_URI, MONGODB_DB and DATA_ENCRYPTION_KEY from .env.local)

import { createCipheriv, randomBytes } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";

const SEED_BATCH = "dev-seed-v1";
const EMAIL_DOMAIN = "seed.bloodlink.test";
const DAY_MS = 86_400_000;
const BD_OFFSET_MS = 6 * 60 * 60 * 1000;

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "bloodlink";
const dataKey = process.env.DATA_ENCRYPTION_KEY;

if (!uri || !dataKey) {
  console.error("MONGODB_URI and DATA_ENCRYPTION_KEY must be set (run through npm run seed:dev).");
  process.exit(1);
}
// Safety: only ever seed a database on this machine.
if (!/^mongodb:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(uri)) {
  console.error("Refusing to seed: MONGODB_URI does not point at a local database.");
  process.exit(1);
}

// Deterministic randomness, so the same run always produces the same records.
let seed = 20261028;
function rand() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const pick = (items) => items[Math.floor(rand() * items.length)];
const chance = (p) => rand() < p;
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = int(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Same format as src/lib/security/crypto.ts: "iv.tag.ciphertext", base64url parts.
const cipherKey = Buffer.from(dataKey, "base64");
function encryptPhone(plain) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cipherKey, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}
const maskPhone = (p) => `${p.slice(0, 3)}${"•".repeat(p.length - 6)}${p.slice(-3)}`;
const randomPhone = () =>
  `01${pick(["3", "4", "5", "6", "7", "8", "9"])}${String(int(0, 99_999_999)).padStart(8, "0")}`;

// Bangladesh time is a fixed UTC+6 offset, the same rule the app uses.
const bdDate = (ms) => new Date(ms + BD_OFFSET_MS).toISOString().slice(0, 10);
const addDaysIso = (iso, days) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
const endOfBdDay = (iso) => new Date(Date.parse(`${iso}T23:59:59.999Z`) - BD_OFFSET_MS);

const DIVISIONS = {
  Barishal: ["Barguna", "Barishal", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur"],
  Chattogram: [
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cox's Bazar",
    "Cumilla",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  Dhaka: [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],
  Khulna: [
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  Rajshahi: ["Bogura", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna", "Rajshahi", "Sirajganj"],
  Rangpur: [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
  ],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
};
const DISTRICTS = Object.entries(DIVISIONS).flatMap(([division, names]) =>
  names.map((district) => ({ district, division })),
);
// Dhaka division is weighted up, as most users and requests are there.
const pickDistrict = () =>
  chance(0.35) ? { district: pick(DIVISIONS.Dhaka), division: "Dhaka" } : pick(DISTRICTS);

const GROUP_WEIGHTS = [
  ["O+", 34],
  ["B+", 24],
  ["A+", 16],
  ["AB+", 6],
  ["O-", 7],
  ["B-", 5],
  ["A-", 4],
  ["AB-", 4],
];
function weightedGroup() {
  let roll = rand() * 100;
  for (const [group, weight] of GROUP_WEIGHTS) {
    roll -= weight;
    if (roll < 0) return group;
  }
  return "O+";
}

const DONOR_NAMES = [
  "Md. Rahim Uddin",
  "Sumaiya Akter",
  "Tanvir Hasan",
  "Nusrat Jahan",
  "Mahmudul Hasan",
  "Farzana Rahman",
  "Imran Hossain",
  "Rokeya Begum",
  "Sabbir Ahmed",
  "Mehedi Hasan Rony",
  "Ayesha Siddika",
  "Jahidul Islam",
  "Shahinur Rahman",
  "Lamia Haque",
  "Arif Chowdhury",
  "Tasnim Jerin",
  "Kamrul Hasan",
  "Nasrin Sultana",
  "Rafiqul Islam",
  "Sadia Afrin",
  "Monir Hossain",
  "Israt Jahan Mim",
  "Zahidul Karim",
  "Tahmina Akter",
  "Shamim Reza",
  "Rubaiya Islam",
  "Anisur Rahman",
  "Mousumi Khatun",
  "Sohel Rana",
  "Bithi Sarkar",
  "Golam Mostofa",
  "Afsana Mou",
  "Jewel Hossain",
  "Shirin Akter",
  "Nazmul Huda",
  "Riya Das",
  "Parvez Alam",
  "Hasina Begum",
  "Rashed Khan",
  "Sharmin Sultana",
  "Abdul Mannan",
  "Priyanka Roy",
  "Zakir Hossain",
  "Taslima Nasrin Ema",
  "Biplob Kumar Saha",
  "Fatema Tuz Zohra",
  "Iqbal Mahmud",
  "Nabila Tabassum",
  "Shohag Ali",
  "Ruma Akhter",
  "Faisal Ahmed",
  "Mita Dey",
  "Ashraful Alam",
  "Sultana Razia",
  "Tariqul Islam",
];
const PATIENT_NAMES = [
  "Abdul Karim",
  "Shefali Begum",
  "Jamil Mridha",
  "Parveen Akter",
  "Kawsar Ahmed",
  "Lipi Khatun",
  "Nurul Amin",
  "Rehana Parvin",
  "Selim Mia",
  "Ferdous Hossain",
  "Moriom Akter",
  "Badal Chandra",
  "Hosneara Begum",
  "Tuhin Sheikh",
  "Anwara Begum",
  "Mizanur Rahman",
  "Joshna Rani",
  "Delwar Hossain",
];
const AREAS = [
  "Mirpur",
  "Uttara",
  "Dhanmondi",
  "Mohammadpur",
  "Badda",
  "Gulshan",
  "Savar",
  "Agrabad",
  "Pahartali",
  "Zindabazar",
  "Ambarkhana",
  "Shahjalal Uposhahar",
  "Kadamtali",
  "Sadar",
  "Station Road",
  "Bazar Area",
];
const HOSPITAL_TEMPLATES = [
  (d) => `Sadar Hospital, ${d}`,
  (d) => `${d} General Hospital`,
  (d) => `${d} Medical Centre`,
  (d) => `Upazila Health Complex, ${d}`,
];
const DESCRIPTIONS = [
  "Patient needs blood before a surgery scheduled for the morning. Please call after 8 PM if possible.",
  "Post-delivery bleeding. Mother is stable now but needs transfusion. Family is waiting at the ward.",
  "Thalassemia patient on regular transfusion. Donors who can give every few months, please share availability.",
  "Road accident, emergency surgery. Attendant will meet donors at the blood bank counter.",
  "সিজারিয়ান অপারেশনের আগে রক্ত প্রয়োজন। রোগীর স্বজনরা হাসপাতালের ব্লাড ব্যাংকের সামনে অপেক্ষা করবেন।",
  "Dengue with low platelets. Blood needed as advised by the doctor. Ward 4, bed 12.",
  "Open heart surgery next week. Pre-booking donors please, we will confirm the date soon.",
  "কিডনি রোগী, নিয়মিত রক্ত লাগছে। যারা নিয়মিত দিতে পারবেন তাদের অগ্রাধিকার দেওয়া হবে।",
  "Severe anaemia during pregnancy. Blood needed at the time of delivery.",
  "Child patient (6 years) under treatment. A healthy donor's help would mean a lot to the family.",
  "Accident at the local market, multiple fractures. Blood needed for the operation theatre tonight.",
  "ডেলিভারির প্রস্তুতি চলছে। যারা দিতে পারবেন, দয়া করে কমেন্টে জানাবেন।",
  "Stomach bleeding, urgent case. The attendant will answer calls at the number given.",
  "Hip replacement scheduled. Blood is reserved but two more units are needed.",
  "Blood needed for a family member after surgery. Please contact through the comments first.",
  "অপারেশনের জন্য ২ ব্যাগ রক্ত দরকার। ধন্যবাদ সবাইকে।",
  "Pre-operative cross-match needed for a liver procedure. Donors with a valid ID please.",
  "Severe anaemia, patient is in the medicine ward. Please bring a donor who has not donated in the last 3 months.",
];
const COMMENTS = [
  "I'm B+ and can come tomorrow morning. Which ward is it?",
  "আমি O+ গ্রুপের, আগামীকাল সকালে যেতে পারব। ওয়ার্ড কোনটা?",
  "Praying for a quick recovery.",
  "আল্লাহ সবাইকে সুস্থ রাখুক। আমি আজ বিকেলে হাসপাতালে যাচ্ছি।",
  "Can you share the blood bank contact? I'll call directly.",
  "Please confirm once the donor is arranged so others don't come unnecessarily.",
  "I donated last month, so I'm not eligible yet. Sharing this with my group.",
  "Tried calling, no answer. Will try again this evening.",
  "ধন্যবাদ, আমার এক বন্ধু আছে যে দিতে পারবে। কখন যেতে হবে?",
  "Hope the surgery goes well.",
  "I'm free this weekend if the date moves.",
  "অপারেশন কখন? সকালে না বিকেলে?",
  "Done. My friend from Mirpur is going to the hospital now.",
  "Thank you everyone. The need looks covered for now.",
  "Is the donor still needed? I'm O- and can come.",
  "রোগীর অবস্থা এখন কেমন? কেউ আপডেট দিতে পারবেন?",
];
const REPLIES = [
  "Please go to the blood bank counter at the main entrance.",
  "Sent you a message. Please check.",
  "ধন্যবাদ, যোগাযোগ করছি।",
  "Still needed. Please call the attendant before coming.",
  "Yes, we still need one more donor for tomorrow.",
  "অবস্থা ভালো, তবে আরও একজন দাতা লাগবে।",
];
const MODERATION_NOTES = [
  "Details could not be verified. Please post again with the ward name and bed number.",
  "The hospital name looks incomplete. Please add the full name and area.",
  "Duplicate of a request already active for the same patient.",
];

const now = new Date();
const today = bdDate(now.getTime());

// ---- Users -------------------------------------------------------------
const donors = DONOR_NAMES.map((name, i) => {
  const loc = pickDistrict();
  const createdAt = new Date(now.getTime() - int(20, 200) * DAY_MS);
  const phone = randomPhone();
  return {
    _id: new ObjectId(),
    googleId: `seed-donor-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `donor${String(i + 1).padStart(3, "0")}@${EMAIL_DOMAIN}`,
    role: "user",
    donorProfile: {
      fullName: name,
      bloodGroup: weightedGroup(),
      division: loc.division,
      district: loc.district,
      area: pick(AREAS),
      phone: encryptPhone(phone),
      available: chance(0.85),
      emailNotifications: chance(0.9),
      telegramLinked: false,
      createdAt,
      updatedAt: createdAt,
    },
    createdAt,
    updatedAt: createdAt,
    seedBatch: SEED_BATCH,
  };
});

const patients = PATIENT_NAMES.map((name, i) => {
  const createdAt = new Date(now.getTime() - int(15, 120) * DAY_MS);
  return {
    _id: new ObjectId(),
    googleId: `seed-patient-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `patient${String(i + 1).padStart(3, "0")}@${EMAIL_DOMAIN}`,
    role: "user",
    createdAt,
    updatedAt: createdAt,
    seedBatch: SEED_BATCH,
  };
});

// ---- Requests ----------------------------------------------------------
const STATUS_PLAN = shuffle([
  ...Array(24).fill("published"),
  ...Array(9).fill("pending"),
  ...Array(7).fill("fulfilled"),
  ...Array(8).fill("expired"),
  ...Array(7).fill("rejected"),
]);

const requests = STATUS_PLAN.map((status) => {
  const loc = pickDistrict();
  const phone = randomPhone();
  const base = {
    _id: new ObjectId(),
    creatorId: pick(patients)._id,
    bloodGroup: weightedGroup(),
    units: pick([1, 1, 2, 2, 2, 3, 4]),
    hospitalName: pick(HOSPITAL_TEMPLATES)(loc.district),
    division: loc.division,
    district: loc.district,
    contactPhone: encryptPhone(phone),
    contactPhoneMasked: maskPhone(phone),
    allowPhoneReveal: chance(0.8),
    shareDocumentWithDonors: false,
    description: pick(DESCRIPTIONS),
    urgency: chance(0.4) ? "urgent" : "normal",
    status,
    commentCount: 0,
    seedBatch: SEED_BATCH,
  };

  if (status === "pending") {
    const createdAt = new Date(now.getTime() - int(1, 60) * 3_600_000);
    return { ...base, neededAt: endOfBdDay(addDaysIso(today, int(2, 10))), createdAt, updatedAt: createdAt };
  }

  if (status === "rejected") {
    const createdAt = new Date(now.getTime() - int(1, 15) * DAY_MS);
    return {
      ...base,
      neededAt: endOfBdDay(addDaysIso(today, int(2, 10))),
      createdAt,
      updatedAt: createdAt,
      reviewedAt: new Date(createdAt.getTime() + 3 * 3_600_000),
      moderationNote: pick(MODERATION_NOTES),
    };
  }

  if (status === "published") {
    const createdAt = new Date(now.getTime() - int(1, 20) * DAY_MS - int(0, 23) * 3_600_000);
    const publishedAt = new Date(createdAt.getTime() + int(1, 6) * 3_600_000);
    return {
      ...base,
      neededAt: endOfBdDay(addDaysIso(today, int(1, 12))),
      createdAt,
      updatedAt: publishedAt,
      publishedAt,
      reviewedAt: publishedAt,
    };
  }

  // fulfilled and expired: the needed date is already in the past.
  const createdAt = new Date(now.getTime() - int(6, 25) * DAY_MS);
  const publishedAt = new Date(createdAt.getTime() + 2 * 3_600_000);
  const neededAt = endOfBdDay(bdDate(createdAt.getTime() + int(0, 2) * DAY_MS));
  const doc = { ...base, neededAt, createdAt, updatedAt: publishedAt, publishedAt, reviewedAt: publishedAt };
  if (status === "fulfilled") doc.fulfilledAt = new Date(createdAt.getTime() + int(1, 3) * DAY_MS);
  return doc;
});

// ---- Comments ----------------------------------------------------------
const comments = [];
const commentCounts = new Map();
const countFor = (requestId) => commentCounts.set(requestId, (commentCounts.get(requestId) ?? 0) + 1);

for (const request of requests) {
  if (request.status !== "published" && request.status !== "fulfilled") continue;
  const topCount = chance(0.25) ? 0 : int(1, 4);
  for (let i = 0; i < topCount; i++) {
    const authorId = chance(0.85) ? pick(donors)._id : pick(patients)._id;
    const createdAt = new Date(
      request.publishedAt.getTime() + rand() * (now.getTime() - request.publishedAt.getTime()),
    );
    const top = {
      _id: new ObjectId(),
      requestId: request._id,
      authorId,
      parentId: null,
      content: pick(COMMENTS),
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      seedBatch: SEED_BATCH,
    };
    comments.push(top);
    countFor(request._id);

    if (chance(0.35)) {
      // Replies are allowed one level deep, as in the app.
      const replyAt = new Date(Math.min(now.getTime(), createdAt.getTime() + int(5, 300) * 60_000));
      const replyAuthor = chance(0.5) ? request.creatorId : pick(donors)._id;
      comments.push({
        _id: new ObjectId(),
        requestId: request._id,
        authorId: replyAuthor,
        parentId: top._id,
        content: pick(REPLIES),
        createdAt: replyAt,
        updatedAt: replyAt,
        deletedAt: null,
        seedBatch: SEED_BATCH,
      });
      countFor(request._id);
    }
  }
}
for (const request of requests) request.commentCount = commentCounts.get(request._id) ?? 0;

// ---- Write -------------------------------------------------------------
const client = await MongoClient.connect(uri, { appName: "bloodlink-seed" });
try {
  const db = client.db(dbName);
  const users = db.collection("users");
  const requestsCol = db.collection("blood_requests");
  const commentsCol = db.collection("comments");

  const removed = await Promise.all([
    users.deleteMany({ seedBatch: SEED_BATCH }),
    requestsCol.deleteMany({ seedBatch: SEED_BATCH }),
    commentsCol.deleteMany({ seedBatch: SEED_BATCH }),
  ]);
  await users.insertMany([...donors, ...patients], { ordered: true });
  await requestsCol.insertMany(requests, { ordered: true });
  if (comments.length) await commentsCol.insertMany(comments, { ordered: true });

  const byStatus = requests.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});
  const replies = comments.filter((c) => c.parentId).length;
  console.log(
    `Database: ${dbName}. Replaced previous seed data: ${removed.map((r) => r.deletedCount).join(" / ")} (users / requests / comments).`,
  );
  console.log(`Donors: ${donors.length}   Requesters: ${patients.length}   Requests: ${requests.length}`);
  console.log(
    `  by status: ${Object.entries(byStatus)
      .map(([k, v]) => `${k} ${v}`)
      .join(", ")}`,
  );
  console.log(`Comments: ${comments.length} (${replies} replies)`);
} finally {
  await client.close();
}
