# Premium Custom Emails Implementation Plan

> Execute inline with test-driven development and verification-before-completion.

**Goal:** Deliver premium branded custom admin emails with button links and an accurate preview.

**Architecture:** Add a backend custom-email renderer invoked by renderTemplate only for IDs outside DEFAULT_TEMPLATES. Keep source bodies unchanged. Add a preview endpoint and use it in a small React editor/preview component.

**Tech Stack:** CommonJS, sanitize-html, htmlparser2, linkify-it, Express, React/TypeScript, node:test, Vitest.

- [x] Add backend renderer tests covering plain paragraphs, HTML links, naked URLs, query parameters, punctuation, malicious HTML/URLs, and literal variable values; run failing tests with `node --test tests/email/custom-email.test.cjs`.
- [x] Implement `src/core/email/custom-email.js`: sanitize basic HTML, parse nodes, render allowed text/formatting, convert safe links to inline-styled buttons, wrap in a responsive table layout. Preserve descriptive labels and prevent nested buttons.
- [x] Integrate `renderTemplate` in `email.service.js`, excluding all built-in IDs and escaping recipient variables for custom emails. Pass effective subjects and logo settings to preview, single sends and campaign batches. Add `POST /preview` ahead of wildcard routes. Verify these paths with mocked delivery tests without network/email traffic.
- [x] Add `CustomEmailEditor.tsx` with plain text/HTML editing, named link insertion, debounced preview requests, cancellation/stale-response handling, desktop/mobile widths, sandboxed iframe, and visible loading/error states. Use it only for custom templates and show the selected campaign preview.
- [x] Add frontend tests for link insertion, preview API payload and stale/error behavior. Run `npm test -- --run` and `npm run build`; inspect rendering at mobile and desktop widths.
- [x] Review diffs, mark completed work and report local implementation and deployment/inbox-test limitations.

## Verification — 2026-09-23

- Backend: 13 email renderer and mocked-delivery tests passed. Local HTTP tests require permission to bind a listener in sandboxed environments. Run `npm run test:email`.
- Frontend: all 69 tests across 11 files passed.
- Production build passed; existing large-bundle and lottie eval warnings remain.
- Generated preview: `Behind-The-Trades-1.00/artifacts/custom-email-preview.html`. Browser inspection includes a 375px viewport with no horizontal overflow.
- Changes remain local. No real email was sent; Gmail inbox validation is still required after deploying both backend and frontend.
