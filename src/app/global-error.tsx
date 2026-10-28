"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary that replaces the root layout, so global CSS isn't
 * loaded. Minimal inline layout only; `color-scheme: dark` lets the browser
 * pick readable dark defaults without hardcoding theme colours.
 *
 * It renders outside the [lang] layout, so it has no language context. Both
 * languages are shown together, each span marked with its own `lang`.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1.5,
        }}
      >
        <title>কিছু সমস্যা হয়েছে · Something went wrong | BloodLink</title>
        <main
          style={{
            maxWidth: "32rem",
            margin: "0 auto",
            padding: "4rem 1rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.75rem" }}>
            <span lang="bn" style={{ display: "block" }}>
              কিছু সমস্যা হয়েছে
            </span>
            <span lang="en" style={{ display: "block", fontSize: "1.25rem", opacity: 0.75 }}>
              Something went wrong
            </span>
          </h1>
          <p role="alert" style={{ margin: "0 0 1.5rem" }}>
            <span lang="bn" style={{ display: "block" }}>
              BloodLink লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।
            </span>
            <span lang="en" style={{ display: "block", opacity: 0.75 }}>
              BloodLink couldn&apos;t load. Please try again in a moment.
            </span>
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              minHeight: "2.75rem",
              padding: "0 1.5rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            <span lang="bn">আবার চেষ্টা করুন</span> / <span lang="en">Try again</span>
          </button>
          <p style={{ marginTop: "1.5rem" }}>
            {/* A plain anchor on purpose: the app router may be the thing that failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">
              <span lang="bn">হোম পেজে যান</span> / <span lang="en">Go to the homepage</span>
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
