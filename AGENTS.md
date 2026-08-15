# DailySafe

Local-first personal finance app. Answers one question on open: "how much can I safely spend today?"
Full context lives in [README.md](README.md).

## Hard rules

- Local-only. No backend, no accounts, no cloud sync, no analytics, no ads, no tracking. Nothing leaves the device.
- No FX/exchange-rate API. The app operates in a single user-selected currency at a time; it never converts between currencies.
- Stay on Expo SDK 54 until Expo Go's physical-device support has clearly moved past it — don't upgrade just because a newer SDK exists.
- Billing is a mock/dev entitlement only (`settings.isProDev`, toggled in Settings → DailySafe Pro). Do not wire up a real payment provider without being asked.
- Notifications are local-scheduled only (`expo-notifications`) — no push token, no FCM/APNs, no backend. Never schedule/cancel a bill reminder directly from a screen — always go through `reconcileBillReminders()` in `src/notifications/scheduler.ts` so scheduling stays idempotent.
- The safe-to-spend calculation (`src/domain/safeToSpend.ts`) is the product's core trust surface. It's pure, dependency-free TypeScript — keep it that way, and keep it covered by `src/domain/__tests__`.
- State: Zustand (`src/store/useAppStore.ts`) backed by SQLite (`src/db`). The store is the only thing screens should read/write through — don't call repositories directly from a screen.
