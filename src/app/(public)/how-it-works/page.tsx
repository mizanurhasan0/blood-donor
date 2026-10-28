import {
  Ban,
  BellRing,
  ChevronDown,
  CircleCheckBig,
  Droplet,
  FileLock,
  FilePlus,
  HeartHandshake,
  Hospital,
  Lock,
  LogIn,
  Mail,
  MessagesSquare,
  Send,
  ShieldCheck,
  Stethoscope,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { SafetyNotice } from "@/components/shared/safety-notice";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How BloodLink connects patients with voluntary blood donors in Bangladesh: post a request, moderator review, donor alerts by email and Telegram, and safe coordination.",
  alternates: { canonical: "/how-it-works" },
};

interface Item {
  icon: LucideIcon;
  title: string;
  text: string;
}

const REQUESTER_STEPS: Item[] = [
  {
    icon: FilePlus,
    title: "Post a request",
    text: "Sign in with Google and add the blood group, units, hospital, district and needed date. Attach a prescription if you have one — it stays private.",
  },
  {
    icon: ShieldCheck,
    title: "A moderator reviews it",
    text: "Every request is checked by a moderator before it goes public, to keep the platform free of spam and fraud.",
  },
  {
    icon: BellRing,
    title: "Donors are notified",
    text: "Available donors with the same blood group nearby get an email, and the request is shared in our private Telegram channel for donors.",
  },
  {
    icon: MessagesSquare,
    title: "Coordinate",
    text: "Donors reply in the comments. If you allow it, signed-in donors can reveal your phone number to call you.",
  },
  {
    icon: CircleCheckBig,
    title: "Mark it fulfilled",
    text: "Once you have the blood you need, mark the request fulfilled so donors know. Requests expire after the needed date.",
  },
];

const DONOR_STEPS: Item[] = [
  {
    icon: LogIn,
    title: "Sign in with Google",
    text: "No new password. We only receive your name, email address and profile photo.",
  },
  {
    icon: UserRoundPlus,
    title: "Create your profile",
    text: "Add your blood group and district, plus your area and phone number if you like. Your number is never shown to others.",
  },
  {
    icon: Mail,
    title: "Opt in to alerts",
    text: "Choose whether you're available and want email alerts. Every email has a one-click unsubscribe link.",
  },
  {
    icon: Send,
    title: "Link Telegram",
    text: "Optionally link Telegram from your account page to be approved for the private donor channel.",
  },
  {
    icon: HeartHandshake,
    title: "Respond",
    text: "Comment on a request or call the family when they share their number. Confirm details with the hospital before you go.",
  },
];

const SAFETY: Item[] = [
  {
    icon: Lock,
    title: "Phone numbers stay masked",
    text: "Numbers appear masked, like 017•••••678. Only signed-in donors can reveal one, only if the requester allows it, and every reveal is logged.",
  },
  {
    icon: FileLock,
    title: "Documents stay private",
    text: "Prescriptions are stored privately. Only the requester and moderators can open them — and donors, if the requester chooses to share.",
  },
  {
    icon: Ban,
    title: "Never pay for blood",
    text: "Donation here is voluntary and free. Never pay or accept money for blood, and report anyone who asks.",
  },
  {
    icon: Stethoscope,
    title: "Medical staff decide",
    text: "Matching by blood group only finds potential volunteers. Screening, compatibility and eligibility are decided by qualified medical staff.",
  },
];

const FAQ = [
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
];

function StepList({ steps }: { steps: Item[] }) {
  return (
    <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map(({ icon: Icon, title, text }, index) => (
        <li
          key={title}
          className="relative flex flex-col gap-3 rounded-card border border-outline/70 bg-card p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <span className="grid size-11 place-items-center rounded-full bg-brand/15 text-brand-bright">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span aria-hidden="true" className="text-3xl font-semibold text-muted tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="font-semibold">
            <span className="sr-only">Step {index + 1}: </span>
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted">{text}</p>
        </li>
      ))}
    </ol>
  );
}

function Eyebrow({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 rounded-pill border border-outline/70 bg-surface px-3 py-1 text-xs font-medium tracking-wide text-muted uppercase">
      <Icon className="size-3.5 text-brand-bright" aria-hidden="true" />
      {children}
    </p>
  );
}

function Actions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <ButtonLink href="/request/new" size="lg">
        Post a blood request
      </ButtonLink>
      <ButtonLink href="/become-donor" variant="secondary" size="lg">
        Become a donor
      </ButtonLink>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-outline/60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-radial from-brand/15 to-transparent to-70%"
        />
        <Container className="relative flex flex-col items-start gap-5 py-14 sm:py-20">
          <Eyebrow icon={Droplet}>How it works</Eyebrow>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            From a request to a donor, <span className="text-brand-bright">safely and for free</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted">
            BloodLink connects families who need blood with voluntary donors across Bangladesh. Here&apos;s
            what happens at each step — and how we protect everyone&apos;s privacy along the way.
          </p>
          <Actions />
        </Container>
      </section>

      <Container className="flex flex-col gap-16 py-14 sm:gap-20 sm:py-20">
        <section aria-labelledby="requesters">
          <Eyebrow icon={Hospital}>Patients &amp; families</Eyebrow>
          <SectionHeading
            id="requesters"
            title="Need blood? Here's how to ask"
            description="Post once and we'll reach donors by email and Telegram, while keeping your contact details private."
          />
          <StepList steps={REQUESTER_STEPS} />
        </section>

        <section aria-labelledby="donors">
          <Eyebrow icon={HeartHandshake}>Donors</Eyebrow>
          <SectionHeading
            id="donors"
            title="Want to help? Here's how to start"
            description="Set up a profile in a couple of minutes and only hear about requests that match your blood group and area."
          />
          <StepList steps={DONOR_STEPS} />
        </section>

        <section aria-labelledby="safety">
          <Eyebrow icon={ShieldCheck}>Safety &amp; privacy</Eyebrow>
          <SectionHeading id="safety" title="Built to protect people" />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {SAFETY.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-card border border-outline/70 bg-surface/60 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-elevated text-brand-bright">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <SafetyNotice className="mt-4" />
        </section>

        <section aria-labelledby="faq" className="mx-auto w-full max-w-3xl">
          <SectionHeading id="faq" title="Frequently asked questions" />
          <div className="mt-8 flex flex-col gap-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-card border border-outline/70 bg-card transition-colors open:border-muted/40"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-card px-5 py-3 font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown
                    className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="cta"
          className="relative overflow-hidden rounded-card border border-outline/70 bg-card px-6 py-10 text-center shadow-card sm:px-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-radial from-brand/20 to-transparent to-70%"
          />
          <div className="relative flex flex-col items-center gap-4">
            <h2 id="cta" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready when someone needs you
            </h2>
            <p className="max-w-xl text-muted">
              Post a request for a patient, or register as a donor so the right request reaches you.
            </p>
            <Actions />
          </div>
        </section>
      </Container>
    </>
  );
}
