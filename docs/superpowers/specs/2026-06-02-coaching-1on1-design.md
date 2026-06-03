# Coaching 1-on-1 Request Feature — Design Spec
**Date:** 2026-06-02  
**Status:** Approved

---

## Problem

Users have no way to request a private one-on-one coaching session with an admin. The platform has a support ticket system and messaging system, but no dedicated flow for scheduling and managing coaching sessions.

---

## Goal

Allow any user to request a 1-on-1 coaching session with an admin: submit a request with subject, session type, up to 3 preferred dates, and a free message. The admin reviews and either accepts (picking one of the proposed dates) or rejects the request. Upon acceptance, a private chat thread opens automatically so both parties can coordinate details.

---

## Scope

**In scope:**
- User-facing page `/app/coaching` — list requests + submit new one
- Admin page `/admin/coaching` — review, accept, reject requests
- Sidebar entry for both user and admin
- Request form modal (4 fields)
- Status tracking: pending → accepted/rejected
- Chat thread on accepted requests (reuses `TicketThreadModal`)

**Out of scope:**
- Calendar integration (Google Calendar, Outlook)
- Automated video link generation (Zoom API, Meet API)
- Email/push notifications (can be added later)
- Payment for sessions

---

## Architecture

**New files (frontend):**

| File | Purpose |
|------|---------|
| `src/pages/app/coaching/page.tsx` | User coaching page |
| `src/pages/admin/coaching/page.tsx` | Admin coaching management page |

**Modified files (frontend):**

| File | Change |
|------|--------|
| `src/components/layout/Sidebar.tsx` | Add "Coaching 1-on-1" nav item |
| `src/components/layout/AdminSidebar.tsx` | Add "Coaching" nav item |
| `src/main.tsx` (or router file) | Register new routes |

**Reused components:**
- `TicketThreadModal` — chat thread after acceptance (unchanged)
- `Modal` UI component — wraps request form
- `useToast` — success/error feedback

**Backend API (new endpoints to build):**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/coaching` | User's own requests |
| `POST` | `/api/coaching` | Submit new request |
| `GET` | `/api/admin/coaching` | All requests (admin) |
| `PATCH` | `/api/admin/coaching/:id/status` | Accept or reject |
| `GET` | `/api/coaching/:id/messages` | Chat thread messages |
| `POST` | `/api/coaching/:id/messages` | Send chat message |

---

## Data Model

```ts
interface CoachingRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: 'trades' | 'psychology' | 'plan' | 'other';
  sessionType: 'zoom' | 'meet' | 'phone';
  proposedDates: string[];    // 1-3 ISO datetime strings, at least 1 required
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  confirmedDate?: string;     // admin picks one of proposedDates on accept
  rejectionReason?: string;   // optional message on reject
  createdAt: string;
}
```

---

## User Flow (`/app/coaching`)

**Page layout:**
- Header: "Coaching 1-on-1" title + subtitle + "+ Nouvelle demande" button
- Empty state when no requests: illustration + CTA button
- Request cards showing: subject label, session type icon, submission date, status badge
  - `pending` → yellow "En attente"
  - `accepted` → green "Accepté" + confirmed date + "Ouvrir le chat" button
  - `rejected` → red "Refusé" + rejection reason if provided

**Request form modal (4 fields):**
1. **Sujet** — `<select>`: Analyse de trades / Coaching psychologie / Plan de trading / Autre
2. **Type de session** — radio buttons: Zoom / Google Meet / Téléphone
3. **Disponibilités** — 3 datetime inputs (label: "1ère disponibilité *", "2ème", "3ème") — first one required
4. **Message** — `<textarea>` for context/details (required, min 20 chars)

**On submit:** POST `/api/coaching`, refresh list, close modal, show success toast.

---

## Admin Flow (`/admin/coaching`)

**Page layout:**
- Tab filter bar: Tout | En attente | Accepté | Refusé
- Request cards showing: user name + email, subject, session type, 3 proposed dates, submission date
- Action buttons per card:
  - "Accepter" → opens accept modal (select one of the proposed dates + optional note)
  - "Refuser" → opens reject modal (optional rejection reason textarea)

**Accept flow:**
1. Admin clicks "Accepter"
2. Small modal: radio group with the user's 1-3 proposed dates to select one + optional note
3. On confirm: `PATCH /api/admin/coaching/:id/status` with `{ status: 'accepted', confirmedDate, note }`
4. Card moves to "Accepté" tab, chat thread opens in `TicketThreadModal`

**Reject flow:**
1. Admin clicks "Refuser"
2. Small modal: optional textarea for rejection reason
3. On confirm: `PATCH /api/admin/coaching/:id/status` with `{ status: 'rejected', rejectionReason }`
4. Card moves to "Refusé" tab

---

## Routing

Add these routes in the app router:

```
/app/coaching        → src/pages/app/coaching/page.tsx
/admin/coaching      → src/pages/admin/coaching/page.tsx
```

---

## Sidebar Changes

**User sidebar** (`Sidebar.tsx`): Add entry near "Support & Aide":
```
{ label: 'Coaching 1-on-1', icon: Video, href: '/app/coaching' }
```

**Admin sidebar** (`AdminSidebar.tsx`): Add entry in admin nav:
```
{ label: 'Coaching', icon: Video, href: '/admin/coaching' }
```

---

## Error Handling

- API errors → `useToast` error message
- No proposed dates filled → inline validation before submit
- Message too short (< 20 chars) → inline validation
- Network failure on status update → toast + keep modal open

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/app/coaching/page.tsx` | Create |
| `src/pages/admin/coaching/page.tsx` | Create |
| `src/components/layout/Sidebar.tsx` | Modify — add nav entry |
| `src/components/layout/AdminSidebar.tsx` | Modify — add nav entry |
| `src/main.tsx` | Modify — import + register 2 new routes |
