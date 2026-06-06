# Coaching 1-on-1 — Slot-Based Booking System

**Date:** 2026-06-06  
**Status:** Approved

## Overview

Replace the current free-form date proposal system with an admin-defined slot system. Admin publishes specific available time slots each week; users pick one slot when submitting a coaching request.

## Data Model

### New: `CoachingSlot`

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `datetime` | ISO 8601 string | Date and time of the slot |
| `status` | enum | `available` \| `pending` \| `confirmed` \| `blocked` |

### Slot lifecycle

```
available → (user picks it)     → pending
pending   → (admin accepts)     → confirmed
pending   → (admin rejects)     → blocked
```

- Once rejected, a slot stays `blocked` — it does not return to `available`.
- Only `available` slots are shown to users.
- Only `available` slots can be deleted by admin.

### Modified: `CoachingRequest`

- Remove: `proposedDates: string[]`
- Add: `slotId: string`
- Add to response shape: `slot: { id: string; datetime: string }`

## API Contract

### New endpoints

| Method | URL | Actor | Description |
|---|---|---|---|
| `GET` | `/api/coaching/slots` | User | Returns slots with `status = available` only |
| `GET` | `/api/admin/coaching/slots` | Admin | Returns all slots with their current status |
| `POST` | `/api/admin/coaching/slots` | Admin | Creates a slot — body: `{ datetime: string }` |
| `DELETE` | `/api/admin/coaching/slots/:id` | Admin | Deletes slot — only allowed if `status = available` |

### Modified endpoints

- `POST /api/coaching` — body changes from `{ proposedDates[], ... }` to `{ slotId, subject, sessionType, message }`
- `PATCH /api/admin/coaching/:id/status` — on `accepted`: backend sets slot to `confirmed`; on `rejected`: backend sets slot to `blocked`. Admin no longer selects a date.

## Frontend Changes

### Admin page (`/admin/coaching`)

Add two tabs to the existing page:

**Tab 1 — "Créneaux"**
- Button "Ajouter un créneau" opens a modal with a single `datetime-local` input.
- List of all slots showing: formatted date/time, status badge, and a delete button (shown only when `status = available`).
- Status badge colors: `available` → green, `pending` → amber, `confirmed` → blue, `blocked` → red.

**Tab 2 — "Demandes"** (unchanged behavior)
- Existing request management UI.
- Accept modal simplified: removes date selection (date is already fixed by the chosen slot), keeps optional note field only.

### User page (`/app/coaching`)

Request form changes:

- Remove the 3 `datetime-local` inputs for proposed dates.
- Add a slot picker: fetch `/api/coaching/slots` on modal open, display results as selectable cards showing formatted date/time.
- Slot selection is required before submission.
- If no slots are available, show: "Aucun créneau disponible pour le moment. Revenez bientôt."

Request list changes:

- Replace "Dates proposées" display with a single confirmed slot date/time.

## Scope

This spec covers only frontend changes. Backend implementation (new endpoints, slot lifecycle management) is handled separately.
