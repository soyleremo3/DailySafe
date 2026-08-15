# Security Policy

## Our model

DailySafe is a local-first app: it has no backend, no server, no user accounts, and makes no network requests. All financial data is stored exclusively in a local SQLite database on the user's own device. There is no attack surface involving data-in-transit or a hosted service, because there is no service.

That said, "local-only" is not the same as "no risk." Things we do care about:

- Data stored on-device should not be readable by other apps or leaked via backups in ways the user wouldn't expect.
- The app should not request more device permissions (e.g. notifications) than it needs, and should degrade gracefully if permissions are denied.
- Dependencies should be kept reasonably up to date and free of known critical vulnerabilities.
- No third-party analytics, ad, or tracking SDK should ever be added without this policy being updated first.

## Supported versions

DailySafe is pre-1.0 and under active development. Only the `master` branch / latest release receives security fixes.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for a security vulnerability.

Instead, report it privately using one of:

1. **GitHub Security Advisories** (preferred): open the [Security tab](../../security/advisories/new) on this repository and click "Report a vulnerability."
2. **Email**: unityclaude1@gmail.com — include a description of the issue, steps to reproduce, and the potential impact.

We'll acknowledge reports within a few days and aim to have a fix or mitigation plan within 30 days, depending on severity. Please give us a reasonable amount of time to address the issue before any public disclosure.

## Scope

In scope: the DailySafe mobile/web app source code in this repository.

Out of scope: vulnerabilities in third-party dependencies that don't have a demonstrated impact on DailySafe specifically (please report those upstream), and social-engineering or physical-access attacks against a user's own device.
