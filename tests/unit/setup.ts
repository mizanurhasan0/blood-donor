// Run pure date logic under a non-UTC, non-Bangladesh machine timezone so any
// accidental reliance on the server's local time shows up as a failure.
process.env.TZ = "America/New_York";
// SITE.url is read at import time; a trailing slash checks that it is stripped.
process.env.NEXT_PUBLIC_SITE_URL = "https://bloodlink.test/";
