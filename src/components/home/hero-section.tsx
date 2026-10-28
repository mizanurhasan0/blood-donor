import { ArrowRight, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BangladeshVisual } from "./bangladesh-visual";

function SupportCard() {
  return (
    <div className="absolute top-[2%] -right-2 hidden animate-fade-up items-center gap-3 rounded-card border border-outline/60 bg-elevated/90 px-4 py-3 shadow-popover backdrop-blur-sm [animation-delay:300ms] lg:flex xl:-right-8">
      <span className="grid size-10 place-items-center rounded-full bg-brand/15 text-brand">
        <Users className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm leading-tight">
        <span className="block font-semibold">Real People.</span>
        <span className="block font-semibold">Real Support.</span>
        <span className="text-muted">Across Bangladesh</span>
      </p>
    </div>
  );
}

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <Container className="relative grid items-center gap-10 pt-10 pb-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-14 lg:pb-16">
        <div className="relative z-10 flex flex-col gap-6">
          <p className="animate-fade-up text-xs font-semibold tracking-[0.35em] text-brand uppercase sm:text-sm">
            Save Lives Together
          </p>
          <h1
            id="hero-title"
            className="text-[2.6rem] leading-[1.02] font-bold tracking-tight text-balance min-[380px]:text-5xl sm:text-6xl xl:text-7xl"
          >
            United for <br className="hidden sm:block" />
            Lives Across <br />
            <span className="text-brand">Bangladesh</span>
          </h1>
          <p className="max-w-lg animate-fade-up text-lg text-muted [animation-delay:120ms] sm:text-xl">
            Connect with voluntary blood donors, share urgent requests, and help save lives across Bangladesh.
          </p>
          <div className="flex animate-fade-up flex-col gap-3 [animation-delay:200ms] min-[420px]:flex-row">
            <ButtonLink href="/request/new" size="lg">
              Post Blood Request
              <ArrowRight className="size-5" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/become-donor" variant="secondary" size="lg">
              Become a Donor
            </ButtonLink>
          </div>
        </div>

        {/* On phones the map sits faintly behind the text so CTAs stay above the fold. */}
        <div className="pointer-events-none absolute top-6 -right-24 w-72 opacity-25 sm:-right-10 sm:w-96 lg:pointer-events-auto lg:relative lg:top-auto lg:right-auto lg:mx-auto lg:w-full lg:max-w-md lg:opacity-100">
          <BangladeshVisual className="animate-fade-in [animation-delay:150ms]" />
          <SupportCard />
        </div>
      </Container>
    </section>
  );
}
