# Launch Now

This app is ready for a cheap PWA beta launch once Vercel authentication is fixed.

## 1. Log in to Vercel

Run:

```bash
npx vercel login
```

Choose your provider or email, then finish the login link in your browser/email.

## 2. Deploy Production

Run from the project root:

```bash
set -a; source .env; set +a
npx vercel --prod --yes --env SUPABASE_URL="$SUPABASE_URL" --env SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
```

Vercel will print a production URL like:

```text
https://your-project.vercel.app
```

## 3. Supabase Auth URLs

In Supabase dashboard, open Authentication > URL Configuration.

Set:

```text
Site URL: https://your-project.vercel.app
```

Add Redirect URLs:

```text
https://your-project.vercel.app
https://your-project.vercel.app/**
```

If you add a custom domain later, add that domain here too.

## 4. Phone Install Test

iPhone:

1. Open the Vercel URL in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Open the home screen app.

Android:

1. Open the Vercel URL in Chrome.
2. Tap Install app if prompted.
3. If not prompted, open the three-dot menu and tap Add to Home screen.

## 5. Soft Launch Copy

Send this to testers:

```text
I am testing a phone-installable symptom tracker for veterans. Open this link on your phone. On iPhone, use Safari > Share > Add to Home Screen. On Android, use Chrome > Install app or Add to Home screen.
```
