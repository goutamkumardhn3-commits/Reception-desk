# Reception Desk

React + strict TypeScript frontend for [Spring PetClinic REST](https://github.com/spring-petclinic/spring-petclinic-rest).

## Run
```bash
# 1. backend (port 9966)
git clone https://github.com/spring-petclinic/spring-petclinic-rest && cd spring-petclinic-rest && ./mvnw spring-boot:run
# 2. frontend
npm install && npm run dev      # http://localhost:5173, /petclinic is proxied to :9966
npm test                        # vitest
npm run typecheck
```

## Workflow
One split-pane workspace, no page navigation: search owners (left) → owner card, pets and the selected pet's visits (right). Edit owner/pet and "Add pet" open inline; "Register visit" is always visible on a selected pet. Creating an owner goes straight to "Add pet".

## Architecture and TypeScript decisions
- `api/types.ts`: domain types with **branded ids** (OwnerId/PetId/VisitId), readonly fields, and `Draft` types derived with `Omit`/`Pick`.
- `api/petclinic.ts`: the only place with wire types and id brands (one `as` per id, at the boundary). `api/client.ts`: single `request<T>` with `ApiError`.
- `api/hooks.ts`: TanStack Query. The owner payload embeds pets and visits, so every write invalidates `owner`/`owners`; no hand-synced client store.
- `lib/validation.ts`: pure validators returning `Validated<T, I>` (discriminated union); `PetInput` (raw string form) is turned into `PetDraft` only after validation.
- UI state is local: selected owner/pet ids and a `Panel` string-literal union.
- Vite proxy avoids touching backend CORS.

## Assumptions
Search is by last name prefix (what the API supports). Telephone: digits only, up to 10 (backend rule). Visit dates in the future are allowed (booking ahead).

## API problems found (verify against your running instance)
| Problem | Workaround | Proposed change |
|---|---|---|
| Search with no match returns 404 | Treated as empty list in `searchOwners` | Return `200 []` |
| Search is last-name prefix only | UI says so | Add `q` over name/phone/pet name |
| No pagination on `/owners` | Not handled | `page`/`size` + total count |
| Error body shapes vary | `errorMessage` probes `detail`/`message`/`title` | One problem+json shape with per-field errors |
| PUT endpoints return 204, no body | Refetch after write | Return the updated resource |
| No edit/delete for visits | Not offered | `PUT/DELETE` on visits |

## Known limitations
No URL routing (refresh loses selection), no delete flows, no optimistic updates, no e2e test, no pagination, light a11y pass only.

## Next
Hash routing for owner/pet, Playwright flow test, MSW-based tests, field-level server errors, visit editing once the API supports it.

## AI usage
Add your prompts/plans/agent notes under `/ai` before submitting (required by the assignment).
