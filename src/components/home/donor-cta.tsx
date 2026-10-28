import { BellRing, HeartHandshake, Send } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BloodDrop } from "@/components/layout/logo";

const POINTS = [
  { icon: BellRing, text: "Email alerts only for your blood group and area" },
  { icon: Send, text: "Optional private Telegram community for registered donors" },
  { icon: HeartHandshake, text: "Your number stays private — you choose when to help" },
];

export function DonorCallToAction() {
  return (
    <Container className="pb-16 sm:pb-20">
      <section
        aria-labelledby="donor-cta-title"
        className="relative grid gap-8 overflow-hidden rounded-card border border-outline/70 bg-card px-6 py-10 shadow-card sm:px-10 lg:grid-cols-[1.4fr_1fr] lg:items-center"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-radial from-brand/20 to-transparent to-70%" />
        <div className="relative flex flex-col gap-4">
          <BloodDrop className="h-10 w-8" />
          <h2 id="donor-cta-title" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Become a Donor. <span className="text-brand-bright">Make a Difference.</span>
          </h2>
          <p className="max-w-xl text-lg text-muted">
            Join a community of people ready to help when blood is needed.
          </p>
          <div>
            <ButtonLink href="/become-donor" size="lg">
              Register as Donor
            </ButtonLink>
          </div>
        </div>
        <ul className="relative flex flex-col gap-3">
          {POINTS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-button border border-outline/60 bg-surface/60 p-3.5 text-sm"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
