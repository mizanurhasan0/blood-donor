import { encryptForApp, IDS, withDb } from "./fixtures";

const DAY = 86_400_000;

/** Resets the disposable e2e database to a known state before the run. */
export default async function globalSetup() {
  await withDb(async (db) => {
    await db.dropDatabase();
    const now = new Date();
    const user = (id: typeof IDS.donor, name: string, email: string, role = "user") => ({
      _id: id,
      googleId: `google-${id.toHexString()}`,
      name,
      email,
      role,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection("users").insertMany([
      {
        ...user(IDS.donor, "Rahim Uddin", "donor@e2e.test"),
        donorProfile: {
          fullName: "Rahim Uddin",
          bloodGroup: "B+",
          division: "Dhaka",
          district: "Dhaka",
          available: true,
          emailNotifications: true,
          telegramLinked: false,
          createdAt: now,
          updatedAt: now,
        },
      },
      user(IDS.patient, "Karim Ahmed", "patient@e2e.test"),
      user(IDS.newcomer, "Nadia Islam", "newcomer@e2e.test"),
      user(IDS.admin, "Admin", "admin@e2e.test", "admin"),
    ]);

    const request = (
      id: typeof IDS.donor,
      fields: {
        bloodGroup: string;
        district: string;
        division: string;
        hospitalName: string;
        status: string;
      },
    ) => ({
      _id: id,
      creatorId: IDS.patient,
      units: 2,
      neededAt: new Date(now.getTime() + 3 * DAY),
      contactPhone: encryptForApp("01712345678"),
      contactPhoneMasked: "017•••••678",
      allowPhoneReveal: true,
      shareDocumentWithDonors: false,
      description: "Patient admitted for surgery. Please contact via comments.",
      urgency: "urgent",
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      ...fields,
    });

    await db.collection("blood_requests").insertMany([
      request(IDS.requestDhaka, {
        bloodGroup: "B+",
        district: "Dhaka",
        division: "Dhaka",
        hospitalName: "Dhaka Medical College Hospital",
        status: "published",
      }),
      request(IDS.requestChattogram, {
        bloodGroup: "O-",
        district: "Chattogram",
        division: "Chattogram",
        hospitalName: "Chattogram Medical College",
        status: "published",
      }),
      request(IDS.requestPending, {
        bloodGroup: "AB-",
        district: "Sylhet",
        division: "Sylhet",
        hospitalName: "Sylhet MAG Osmani Medical College",
        status: "pending",
      }),
    ]);
  });
}
