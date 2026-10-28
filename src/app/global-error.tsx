"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary that replaces the root layout, so global CSS isn't
 * loaded. Minimal inline layout only; `color-scheme: dark` lets the browser
 * pick readable dark defaults without hardcoding theme colours.
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
        <title>Something went wrong | BloodLink</title>
        <main
          style={{
            maxWidth: "32rem",
            margin: "0 auto",
            padding: "4rem 1rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.75rem" }}>Something went wrong</h1>
          <p role="alert" style={{ margin: "0 0 1.5rem" }}>
            BloodLink couldn&apos;t load. Please try again in a moment.
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
            Try again
          </button>
          <p style={{ marginTop: "1.5rem" }}>
            {/* A plain anchor on purpose: the app router may be the thing that failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Go to the homepage</a>
          </p>
        </main>
      </body>
    </html>
  );
}
