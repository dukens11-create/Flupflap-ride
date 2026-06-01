# Third-party Integrations

## Payment gateway
- Use `/api/payments/create-intent`, `/capture`, `/refund`, `/stripe-webhook`.
- Keep webhook secret in `STRIPE_WEBHOOK_SECRET`.

## Maps/GPS
- Configure Mapbox token via `MAPBOX_PUBLIC_TOKEN` (backend) or `NEXT_PUBLIC_MAPBOX_TOKEN` (web) or `EXPO_PUBLIC_MAPBOX_TOKEN` / `expo.extra.mapboxToken` (mobile).
- The project's Mapbox public token (`pk.*`) is pre-configured as the default in all apps; override in env files for custom accounts.
- Validate geocoding and route rendering in staging.

## SMS
- Configure Twilio SID/token/from-number.
- Use OTP flows under `/api/2fa/sms-otp/*`.

## Email
- Configure SendGrid API key/from email.
- Use email templates for auth/notifications.

## Push notifications
- Configure FCM server key for backend push dispatch.
- Validate on Android and iOS staging builds.

## Analytics
- Integrate dashboard events and screen telemetry from apps.
