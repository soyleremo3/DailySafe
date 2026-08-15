# DailySafe

**How much can I safely spend today?**

DailySafe is a privacy-first personal finance app for iOS, Android and web. It answers one question every time you open it: given your balance, upcoming bills, savings goals and next payday, how much can you actually spend right now without wrecking the rest of the period?

Everything runs on-device. There is no backend, no account, no cloud sync, and no analytics — your financial data never leaves your phone.

## Features

- **Guided onboarding** — currency, current balance, paydays, recurring bills/subscriptions and a savings target, with a live preview of your safe-to-spend number before you finish.
- **Safe-to-spend engine** — reserves upcoming bills, savings and big-expense sinking funds out of your balance, then divides what's left across the days until your next payday (or a rolling 30-day window if no payday is set).
- **2–3 second entry** — a single-screen quick-add sheet for expenses and income: amount, category, optional note, save.
- **Bills & subscriptions** — recurring items with local reminder notifications (no push service involved).
- **"Can I afford this?"** — type a price, see the before/after impact on your daily safe-to-spend and a clear safe / tight / unsafe verdict.
- **Goals & big-expense planning** — set a target amount and date; DailySafe automatically spreads a sinking-fund contribution across every pay period so the goal doesn't blindside your budget when it's due.
- **Insights** — weekly/monthly spend vs. income, a daily spending chart, and a category breakdown.
- **Light/dark/system theming**, animated transitions, and empty/error states throughout.
- **Free tier + tasteful Pro paywall** — a `DailySafe Pro` screen and a **development-only mock entitlement** toggle in Settings. No payment provider is wired up.

## Tech stack

- [Expo](https://expo.dev) SDK 54 + React Native + TypeScript (strict mode)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for local-first storage, no backend
- [Zustand](https://github.com/pmndrs/zustand) for app state, backed by SQLite repositories
- [React Navigation](https://reactnavigation.org) (native-stack + bottom-tabs)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) + [react-native-svg](https://github.com/software-mansion/react-native-svg) for animation and charts
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) for local-only bill reminders
- Jest + jest-expo + Testing Library for tests, ESLint (`eslint-config-expo`) for linting

No paid services, ad SDKs, tracking libraries, or external APIs are used anywhere in the app — including for currency: DailySafe operates in one user-selected currency at a time and never fetches exchange rates.

## Getting started

```bash
npm install
npm start
```

Then press `i` for iOS Simulator, `a` for Android emulator, or `w` for web — or scan the QR code with Expo Go on a physical device.

### Scripts

| Script | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run android` / `npm run web` | Start on a specific platform |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `expo lint` (ESLint) |
| `npm test` | Run the Jest test suite |
| `npm run test:coverage` | Run tests with coverage (domain logic only) |

## Project structure

```
src/
  domain/        Pure, framework-free business logic (safe-to-spend engine,
                  purchase simulator, goal projections, date/money helpers).
                  No React Native imports — fast to test, easy to trust.
  db/             SQLite schema, migrations and repositories.
  store/          Zustand store wiring the domain layer to persisted data.
  notifications/  Local bill-reminder scheduling (expo-notifications).
  theme/          Design tokens + light/dark ThemeProvider.
  navigation/     React Navigation stacks/tabs and route types.
  components/     Shared, themed UI primitives.
  features/       Screens grouped by feature (onboarding, dashboard, entry,
                  bills, simulator, planning, insights, settings).
  hooks/          Small cross-cutting hooks (e.g. entitlement checks).
  constants/      Static app data (categories, free-tier limits).
```

The **domain layer is the trust boundary** of this app: `src/domain/safeToSpend.ts` computes the number the whole product exists to answer, and it's covered by an extensive Jest suite in `src/domain/__tests__`. If you change the calculation, change the tests first.

## Privacy

- No account, no login, no cloud sync.
- No analytics or crash-reporting SDKs.
- No ads.
- No network requests of any kind — the app has no server to talk to.
- All data lives in a local SQLite database on your device. Deleting the app deletes your data. Settings → Danger zone → **Reset all data** does the same without uninstalling.

See [SECURITY.md](SECURITY.md) for the full policy and how to report a vulnerability.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for setup, coding conventions and how to submit a change. Please also read the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT — see [LICENSE](LICENSE).
