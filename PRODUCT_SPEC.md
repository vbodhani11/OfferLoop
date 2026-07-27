# OfferLoop — Product Specification

## 1. What OfferLoop Is

OfferLoop is a fictional career simulator. It is entertainment software, not a job board,
not a recruiting platform, and not a mental-health tool. Every job, company, candidate,
recruiter, application, and offer inside OfferLoop is invented for the simulation.

**Tagline:** A fictional career simulator for real job-search stress.
**Secondary line:** Get the offer. Make the decision. Repeat the loop.

## 2. Two Modes

### Accept Mode (fictional job seeker)

Users browse invented jobs at invented companies, "apply" through an animated review
sequence, and always receive a simulated offer. The point is emotional catharsis: the
"yes" that real job searching rarely gives quickly.

### Reject Mode (fictional recruiter)

Users browse invented candidate profiles and reject, shortlist, or send a simulated offer
to each one. The point is perspective and humor: understanding (and gently mocking) the
other side of the hiring loop.

## 3. Non-Goals / Hard Boundaries

OfferLoop must never:

- Present itself as a real job board or ATS.
- Collect real résumés, SSNs, government ID, banking info, or immigration status.
- Imply a real employer, recruiter, or candidate is involved.
- Be usable to generate a document that could pass as a real offer letter.
- Rank fictional candidates using protected characteristics.
- Use LinkedIn (or any real platform's) branding, layout, or trademarks.

Every surface that could be mistaken for a real transaction carries a visible
"fictional / simulation" disclosure (`SimulationBadge` / `SimulationDisclosure`).

## 4. Primary User Journeys

1. **Guest, Accept Mode:** Land on homepage → Enter Accept Mode → search/filter jobs →
   open a job → Apply → watch review animation → celebrate offer → offer saved to
   localStorage → view it later in My Offers.
2. **Guest, Reject Mode:** Enter Reject Mode → swipe/click through candidate deck →
   reject / shortlist / simulated-offer → undo last action → reset deck.
3. **Guest → Account:** Guest signs up or signs in → prompted to migrate local offers
   and saved jobs into their account → migration is idempotent and safe to retry.
4. **Authenticated user:** Same flows, backed by Supabase instead of localStorage;
   offers and saved jobs are private per user via Row Level Security.

## 5. Modes Comparison

| Aspect          | Accept Mode                      | Reject Mode                                  |
| --------------- | -------------------------------- | -------------------------------------------- |
| Role played     | Fictional applicant              | Fictional recruiter                          |
| Primary content | Fictional jobs                   | Fictional candidates                         |
| Core action     | Apply → review → offer           | Reject / shortlist / offer                   |
| Accent color    | `--accent-accept` (emerald)      | `--accent-reject` (coral)                    |
| Data model      | `jobs`, `applications`, `offers` | `fictional_candidates`, `simulation_actions` |

## 6. Success Criteria

See `IMPLEMENTATION_PLAN.md` for the phased checklist and `TESTING.md` /
`DEPLOYMENT.md` for verification steps. The product is considered feature-complete when
every item in the "Completion Criteria" section of the original build brief is satisfied
in demo mode, with Supabase mode implemented and documented.
