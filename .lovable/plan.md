## Plan: Temporarily disable auth

You'll be able to use `/trade`, `/deposit`, `/account`, etc. without signing in. Nothing is deleted — auth can be flipped back on later by reverting one file.

### Changes

**1. `src/App.tsx` — remove the `RequireAuth` wrapper from all routes**
- Strip `<RequireAuth>...</RequireAuth>` from `/trade`, `/deposit`, `/withdrawal`, `/support`, `/account`.
- Keep the `/auth` route + `AuthProvider` in place so any code that calls `useAuth()` (e.g. `useBalance`, deposit modal) keeps working without crashing.
- Change root `/` redirect to go straight to `/trade`.

**2. Balance / deposits fallback (no DB changes)**
- `useBalance` already returns `0` and exits early when there's no user — no change needed, balance will just show $0.
- `DepositModal` currently inserts a `deposits` row tied to `user.id`. Without auth, that insert will fail RLS. Two options — I'll go with **(a)** unless you say otherwise:
  - **(a)** Guard the deposit flow: if no user, show a small inline message "Sign in to make a real deposit" with a button linking to `/auth`. The Onramper widget itself still works for browsing.
  - **(b)** Make deposits work anonymously (would need RLS + schema changes — bigger scope).

**3. Files kept untouched**
- `src/components/RequireAuth.tsx` — left in place so re-enabling is a one-line revert.
- `src/hooks/useAuth.tsx`, `src/pages/Auth.tsx` — untouched.
- DB tables, RLS policies, webhook — untouched.

### To re-enable later
Just put the `<RequireAuth>` wrappers back in `App.tsx`. One file, ~5 lines.

### What I need from you
Confirm you want option **(a)** for the deposit modal (sign-in prompt when no user) — or tell me to do **(b)** instead.