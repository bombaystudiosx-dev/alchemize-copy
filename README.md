# Alchemize

AI-powered productivity and wellness app - now running on **Supabase** (migrated from Base44).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Auth | Supabase Auth (email/password + Apple Sign-In) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Functions | Supabase Edge Functions (Deno) |
| Payments | Stripe |

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/bombaystudiosx-dev/alchemize-copy
cd alchemize-copy
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project
```

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy Edge Functions

```bash
supabase functions deploy create-checkout
supabase functions deploy create-portal-session
supabase functions deploy delete-account
supabase functions deploy process-image
supabase functions deploy restore-purchase
supabase functions deploy stripe-webhook
supabase functions deploy verify-session
```

### 5. Set Edge Function secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_ID=price_...
supabase secrets set OPENAI_API_KEY=sk-...
```

## Migration Notes

This project was migrated from Base44 to Supabase. All Base44 SDK references have been removed:

- `@base44/sdk` replaced by `@supabase/supabase-js`
- - `@base44/vite-plugin` removed from build tooling
  - - `src/api/base44Client.js` now exports a Supabase client
    - - `src/api/entities.js` provides a generic Supabase CRUD helper
      - - `src/lib/AuthContext.jsx` uses Supabase Auth exclusively
        - - `base44/functions/*` rewritten as `supabase/functions/*` Edge Functions
          - - Hardcoded credentials removed from `src/components/supabaseClient.jsx`
