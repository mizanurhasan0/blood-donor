import { CircleAlert, Droplet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleSignInButton } from "@/features/auth/components/sign-in-prompt";
import { getViewer, type Viewer } from "@/features/auth/viewer";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in or sign up to BloodLink with your Google account.",
  robots: { index: false, follow: false },
};

type SearchParams = PageProps<"/login">["searchParams"];

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Sign-in was cancelled, or your Google email isn't verified. Please try again.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
  Verification: "That sign-in link has expired. Please try again.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Only same-site relative paths are allowed as post-login destinations. */
function safeCallbackUrl(value: string | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value.startsWith("/login") ? fallback : value;
}

async function safeViewer(): Promise<Viewer | null> {
  try {
    return await getViewer();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[login] could not resolve viewer", error);
    return null;
  }
}

async function LoginPanel({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const signup = first(params.mode) === "signup";
  const rawCallback = first(params.callbackUrl);
  const callbackUrl = safeCallbackUrl(rawCallback, signup ? "/become-donor" : "/account");
  const errorCode = first(params.error);
  const viewer = await safeViewer();

  if (viewer) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">You&apos;re signed in</h1>
        <p className="text-sm text-muted">
          Signed in as <span className="text-foreground">{viewer.email}</span>.
        </p>
        <div className="flex flex-col gap-3">
          <ButtonLink href={callbackUrl}>Continue</ButtonLink>
          {!viewer.donor && callbackUrl !== "/become-donor" && (
            <ButtonLink href="/become-donor" variant="secondary">
              Become a donor
            </ButtonLink>
          )}
          {callbackUrl !== "/account" && (
            <ButtonLink href="/account" variant="ghost">
              My account
            </ButtonLink>
          )}
        </div>
      </div>
    );
  }

  const switchParams = new URLSearchParams(signup ? {} : { mode: "signup" });
  if (rawCallback && callbackUrl === rawCallback) switchParams.set("callbackUrl", callbackUrl);
  const query = switchParams.toString();
  const switchHref = query ? `/login?${query}` : "/login";

  return (
    <div className="flex flex-col gap-5 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {signup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted">
          {signup
            ? "Sign up with Google to register as a blood donor or post a request for someone in need."
            : "Log in to manage your donor profile, follow your blood requests and join the conversation."}
        </p>
      </div>
      {errorCode && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-button border border-brand/40 bg-brand/10 px-4 py-3 text-left text-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-brand-bright" aria-hidden="true" />
          {ERROR_MESSAGES[errorCode] ?? "We couldn't sign you in. Please try again."}
        </p>
      )}
      <GoogleSignInButton
        callbackUrl={callbackUrl}
        label={signup ? "Sign up with Google" : "Continue with Google"}
      />
      <p className="text-sm text-muted">
        {signup ? "Already have an account? " : "New to BloodLink? "}
        <Link href={switchHref} className="font-medium text-brand-bright underline-offset-4 hover:underline">
          {signup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}

function LoginPanelSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-2 h-12 w-full rounded-pill" />
    </div>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Container className="flex flex-1 items-center justify-center py-12 sm:py-20">
      <Card className="flex w-full max-w-md flex-col gap-6 p-6 sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand/15 text-brand-bright">
          <Droplet className="size-6" aria-hidden="true" />
        </span>
        <Suspense fallback={<LoginPanelSkeleton />}>
          <LoginPanel searchParams={searchParams} />
        </Suspense>
        <p className="border-t border-outline/60 pt-5 text-center text-xs text-muted">
          Google is our only sign-in method, so there are no passwords to manage. We only use your Google
          name, email and photo, and never post on your behalf.
        </p>
      </Card>
    </Container>
  );
}
