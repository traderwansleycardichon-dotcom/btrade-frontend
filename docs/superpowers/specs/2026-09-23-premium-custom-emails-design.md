# Premium custom admin emails

Approved by the user on 2026-09-23. Only admin-created email templates receive the new presentation; every built-in transactional template keeps its current HTML.

Use Haitian Wall Street branding, orange #F36C00, a dark header, a white content card on a pale background, readable paragraphs and a branded footer. Render links as accessible orange buttons, preserving descriptive anchor labels. Plain URLs receive a readable domain label. Accept plain text and existing basic HTML; preserve line breaks and supported formatting while removing unsafe HTML and unsafe URL schemes.

Render on the backend at delivery time, keeping the original editable body in the database. A preview API uses the same renderer as tests and bulk campaigns. Subject overrides also appear in the email heading. Platform logo settings are used when compatible with email image loading; the brand wordmark remains visible when images are unavailable.

The admin sees a debounced, sandboxed desktop/mobile preview and can insert a named link without writing HTML. Existing automatic-template editing remains unchanged. No live emails are sent as part of development.

Validation: renderer tests for links, escaping, variables and scope; delivery-path tests; frontend component tests; production build; desktop/mobile visual inspection. Gmail inbox rendering requires a real test delivery after deployment.
