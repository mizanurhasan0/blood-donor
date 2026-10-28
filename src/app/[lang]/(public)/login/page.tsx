import { CircleAlert, Droplet } from "lucide-react";
import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleSignInButton } from "@/features/auth/components/sign-in-prompt";
import { getViewer, type Viewer } from "@/features/auth/viewer";
import { Rich } from "@/features/donors/components/rich-text";
import { LocalizedLink } from "@/lib/i18n/localized-link";
import { localeAlternates, localizedPath } from "@/lib/i18n/paths";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  const lang = await getLocale();
  return {
    title: t.auth.login.metaTitle,
    description: t.auth.login.metaDescription,
    alternates: localeAlternates(lang, "/login"),
    robots: { index: false, follow: false },
  };
}

type SearchParams = PageProps<"/[lang]/login">["searchParams"];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Only same-site relative paths are allowed as post-login destinations. */
function safeCallbackUrl(value: string | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  // Compare without the language prefix, so "/bn/login" is treated like "/login".
  const path = value.replace(/^\/(?:bn|en)(?=[/?#]|$)/, "");
  return path.startsWith("/login") ? fallback : value;
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
  const t = await getDictionary();
  const lang = await getLocale();
  const copy = t.auth.login;
  const params = await searchParams;
  const signup = first(params.mode) === "signup";
  const rawCallback = first(params.callbackUrl);
  const callbackPath = safeCallbackUrl(rawCallback, signup ? "/become-donor" : "/account");
  const callbackUrl = localizedPath(lang, callbackPath);
  const errorCode = first(params.error);
  const viewer = await safeViewer();

  if (viewer) {
    const becomeDonorUrl = localizedPath(lang, "/become-donor");
    const accountUrl = localizedPath(lang, "/account");
    return (
      <div className="flex flex-col gap-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{copy.signedInTitle}</h1>
        <p className="text-sm text-muted">
          <Rich
            text={copy.signedInAs}
            values={{ email: <span className="text-foreground">{viewer.email}</span> }}
          />
        </p>
        <div className="flex flex-col gap-3">
          <ButtonLink href={callbackUrl}>{copy.continue}</ButtonLink>
          {!viewer.donor && callbackUrl !== becomeDonorUrl && (
            <ButtonLink href="/become-donor" variant="secondary">
              {copy.becomeDonor}
            </ButtonLink>
          )}
          {callbackUrl !== accountUrl && (
            <ButtonLink href="/account" variant="ghost">
              {copy.myAccount}
            </ButtonLink>
          )}
        </div>
      </div>
    );
  }

  const switchParams = new URLSearchParams(signup ? {} : { mode: "signup" });
  if (rawCallback && callbackPath === rawCallback) switchParams.set("callbackUrl", callbackPath);
  const query = switchParams.toString();
  // Unprefixed: LocalizedLink adds the visitor's language.
  const switchHref = query ? `/login?${query}` : "/login";
  const errorMessage =
    errorCode && Object.hasOwn(copy.errors, errorCode)
      ? copy.errors[errorCode as keyof typeof copy.errors]
      : copy.genericError;

  return (
    <div className="flex flex-col gap-5 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {signup ? copy.signupTitle : copy.loginTitle}
        </h1>
        <p className="text-sm text-muted">{signup ? copy.signupText : copy.loginText}</p>
      </div>
      {errorCode && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-button border border-brand/40 bg-brand/10 px-4 py-3 text-left text-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-brand-bright" aria-hidden="true" />
          {errorMessage}
        </p>
      )}
      <GoogleSignInButton
        callbackUrl={callbackUrl}
        label={signup ? copy.signUpWithGoogle : t.auth.continueWithGoogle}
      />
      <p className="text-sm text-muted">
        <Rich
          text={signup ? copy.alreadyHaveAccount : copy.newHere}
          values={{
            link: (
              <LocalizedLink
                href={switchHref}
                className="font-medium text-brand-bright underline-offset-4 hover:underline"
              >
                {signup ? copy.logIn : copy.signUp}
              </LocalizedLink>
            ),
          }}
        />
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

export default async function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  const t = await getDictionary();
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
          {t.auth.login.footerNote}
        </p>
      </Card>
    </Container>
  );
}
