# RTS Citizen Login and Session Flow

## Overview
The RTS citizen login/session flow is mostly frontend-driven. It uses a small set of server-set cookies, but it is not a true backend-authenticated session yet.

## Route Entry
In `page.tsx`, the login page checks whether the `rts_session` cookie exists. If it does, the app redirects to `/[locale]/service/dashboard`. Otherwise, it renders `CitizenLoginForm.tsx`.

## How Login Works
The login flow is handled by `actions.ts` and `CitizenLoginForm.tsx`.

There are 3 login methods in the UI:
- mobile
- upic
- property

On submit:
- `CitizenLoginForm` calls `sendCitizenOtpAction(...)`
- `sendCitizenOtpAction(...)` validates the input
- It calls `fetchCitizenPropertiesFromApi(...)` from `services.ts` to verify the citizen/property exists
- If found, it extracts the registered mobile number from that property data
- Then it calls `requestOtp(...)`

Important detail:
- `fetchCitizenPropertiesFromApi(...)` is a real external API call
- `requestOtp(...)` is still local/mock OTP logic right now

So OTP generation and verification are mock/local, not real backend auth yet.

## OTP Session
When OTP is sent, `sendCitizenOtpAction(...)` stores temporary cookies:
- `rts_login_mobile`
- `rts_otp_txn`
- `rts_otp_code`
- `rts_otp_expires_at`

These are used only for OTP verification and have a 2-minute TTL.

Then `verifyCitizenOtpAction(...)`:
- reads those OTP cookies
- checks expiry
- compares the entered OTP with the stored OTP
- fetches citizen/property data again
- if valid, creates the RTS citizen session cookies

## What Logged In Means Right Now
On successful OTP verification, `actions.ts` sets:
- `rts_session` (`httpOnly`)
- `rts_logged_in=true`
- `rts_citizen_profile` (`httpOnly` JSON)
- `rts_citizen_properties` (`httpOnly` JSON, if available)

This is the real RTS citizen session state in the current app.

But note:
- `rts_session` is just a locally generated string like `local_<mobile>_<timestamp>`
- it is not issued by a backend auth service
- there is no backend token validation behind it
- there is no refresh-token/access-token flow for RTS citizen login

So this is effectively a frontend app session persisted through cookies, not backend session management.

## How the App Uses That Session
In `CitizenLayout.tsx`:
- it reads `rts_session`
- if present, the user is treated as logged in
- it also reads `rts_citizen_profile` and `rts_citizen_properties`
- those cookies drive the citizen header/profile/property switcher UI

In `CitizenHeader.tsx`:
- logout calls `logoutCitizenAction()`
- property switch calls `switchCitizenPropertyAction(ownerId)`
- property switch rewrites `rts_citizen_profile` from the stored property list cookie

So the “session user” is really cookie-backed profile JSON.

## Middleware Protection
The route gating is in `middleware.ts`.

For citizen routes:
- `/service/login`: if `rts_session` exists, redirect to `/service/dashboard`
- `/service/dashboard`: if `rts_session` is missing, redirect to `/service/login`

Important limitation:
- middleware only strictly protects the dashboard
- it does not currently protect every `/service/[serviceId]` page the same way

That is another sign this flow is still partial/frontend-oriented.

## How This Differs From Admin Login
The app also has a full admin auth system using:
- `auth_token`
- `refresh_token`
- `session_id`
- `is_logged_in`
- `session_expires_at`

Those are separate from RTS citizen login.

`SessionTimeoutGuard.tsx` and `Providers.tsx` watch the admin auth cookies, not `rts_session`.

## Current RTS Session Model
In plain terms:

1. User enters mobile / UPIC / property
2. App checks property details against a real citizen/property API
3. App sends and verifies OTP using local/mock OTP logic
4. On success, app stores cookie-based citizen session/profile locally
5. Middleware and layout use `rts_session` to treat the user as logged in
6. No real backend-issued auth token/session is involved yet

## Logout
`logoutCitizenAction()` simply deletes:
- `rts_session`
- `rts_logged_in`
- `rts_citizen_profile`
- `rts_citizen_properties`

No backend logout API is called for RTS citizen login.

## Bottom Line
The RTS citizen login flow is a hybrid:
- real property/citizen lookup API: yes
- real OTP auth backend: no, still mocked/local
- real backend session/token management: no
- cookie-based frontend session persistence: yes

If you want, this can also be turned into a short workflow diagram.
