const url = process.env.DATABASE_URL?.trim();

if (process.env.VERCEL) {
  if (!url) {
    console.error(
      "\n[worker-pay] Build blocked: DATABASE_URL is not set on Vercel.\n" +
        "Create a Turso database and add DATABASE_URL + DATABASE_AUTH_TOKEN in Vercel.\n" +
        "See docs/VERCEL_DEPLOYMENT.md\n"
    );
    process.exit(1);
  }

  if (url.startsWith("file:")) {
    console.error(
      "\n[worker-pay] Build blocked: file: DATABASE_URL cannot run on Vercel.\n" +
        "Use a Turso libsql:// URL instead.\n"
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_AUTH_TOKEN?.trim()) {
    console.error(
      "\n[worker-pay] Build blocked: DATABASE_AUTH_TOKEN is required for Turso on Vercel.\n"
    );
    process.exit(1);
  }
}
