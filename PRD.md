# PRD — Shopmate (Agentic Commerce Assistant for HOJATHON S1)

## 1. Team & Event

- **Event**: HOJATHON — Agentic AI Hackathon 2026, Series 01, by Hoja Techademy
- **Team size**: 1 (solo)
- **Time budget**: 5 hours, single build session
- **Submission**: Fork of `Hojatechademy/Hojathon-S1` → build inside fork → final PR to official repo before deadline

## 2. Problem Statement

Standard e-commerce apps assume comfort with app navigation, product comparison UI, and digital checkout flows. **First-time digital buyers and low-digital-literacy users in Kerala** (e.g. older users, users more comfortable in casual Malayalam-English mixed text than structured app UI) are effectively excluded from convenient online shopping — not because the products aren't available, but because the interface itself is the barrier.

## 3. Proposed Solution

A **simple web chat interface** agentic commerce assistant: the user describes what they need in free-form, casual language (any mix of English/Malayalam phrasing) in a single-page chat UI. The agent parses the goal, searches for real products, reasons about the best match against stated budget, remembers the user's preferences for future messages, and generates an actual payment link — closing the loop from intent to transaction without requiring the user to touch a traditional shopping UI.

This is explicitly **not** one of the five example categories in the official problem statement (Public Services, Healthcare, Education, Agriculture, Disaster Management) — chosen deliberately to satisfy the brief's "think beyond the examples" note, while still reusing proven backend code from prior projects (Razorpay integration, MongoDB architecture, Gemini API usage).

**Interface decision**: chosen as a simple web chat (not Telegram) because the submission requires a public **Demo URL** — a browser-based chat gives judges a zero-friction, click-and-test experience, versus requiring them to open Telegram to interact with a bot.

## 4. Why This Requires an Agent (not a static script/UI)

Maps directly to the organizer's own definition of "agent" (goal → memory → decision → tools → action):

| Capability             | Implementation                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Goal understanding** | Gemini parses free-form user message into category + budget                                       |
| **Tool use**           | Live call to `fakestoreapi.com/products/category/{category}` — real external API, not mocked      |
| **Decision-making**    | Gemini selects best match against budget, explains reasoning in plain language                    |
| **Memory**             | MongoDB stores user's category/budget preference so repeat messages aren't re-asked               |
| **Action**             | Razorpay test-mode payment link generated and sent — the agent completes a step, not just informs |

## 5. Scope

### Core (must-have — do not cut except per the rule in §7)

1. Goal parsing (Gemini) from free-form text, including casual/mixed-language input
2. Real-time product search via fakestoreapi.com
3. Gemini-driven product selection + plain-language explanation
4. MongoDB preference memory (category, budget, chat ID)
5. Telegram bot interface, full loop wired live
6. Razorpay test-mode payment link generation on confirmation

### Stretch (only if core is fully done with time remaining)

- Price-drop watch: re-check price later, proactively message if it drops
- Order status memory: recall whether a purchase already happened
- Budget guardrail: agent flags/declines if no item fits the stated budget

### Explicitly out of scope

- Multi-product comparison UI/carousel
- Real (non-test-mode) payments
- Any custom UI beyond Telegram's native chat interface
- Multi-language UI localization (beyond Gemini's native handling of mixed input)

## 6. Tech Stack

| Category          | Technology                                  |
| ----------------- | ------------------------------------------- |
| AI/Decision       | Gemini API                                  |
| Tool/Data source  | fakestoreapi.com                            |
| Database          | MongoDB (preference + memory storage)       |
| Payments          | Razorpay (test mode)                        |
| Interface         | Simple web chat UI (Next.js, single page)   |
| Hosting/Deploy    | Vercel (or equivalent, for public Demo URL) |
| Build environment | Antigravity IDE (Agent Manager, Plan mode)  |

## 7. Execution Plan (5-hour window)

| Phase                        | Time      | Deliverable                                                             |
| ---------------------------- | --------- | ----------------------------------------------------------------------- |
| 0 — Setup                    | 0:00–0:15 | Fork cloned, `.env` scaffolding, Team ID confirmed                      |
| 1 — Goal parsing + tool call | 0:15–1:30 | Live fakestoreapi call working, tested with messy input                 |
| 2 — Decision layer           | 1:30–2:15 | Gemini selects + explains match in plain language                       |
| 3 — Memory                   | 2:15–3:00 | MongoDB read/write for preferences; **checkpoint**                      |
| 4 — Web chat interface       | 3:00–3:45 | Full loop wired and tested live in browser chat UI                      |
| 5 — Action (Razorpay)        | 3:45–4:15 | Test-mode payment link generated end-to-end                             |
| 6 — Deploy + package         | 4:15–5:00 | Public Demo URL, README filled in, demo video recorded, final PR opened |

**Cut rule**: if behind schedule at the Phase 3 checkpoint (3:00), skip Phase 5 (Razorpay) and go straight to Phase 6 with Phases 1–4 complete. Memory (Phase 3) is a directly graded rubric capability; payment generation is a differentiator but expendable. Never skip Phase 6 — README, Demo URL, and demo video are required submission artifacts, not optional polish.

## 8. Judging Criteria Alignment (organizer rubric)

| Criterion                         | Weight | Current fit                                                            | Mitigation                                                                                           |
| --------------------------------- | ------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Problem Understanding & Relevance | 15%    | Weak if generic; fixed by naming the underserved user group explicitly | Problem Statement (§2) names Kerala low-digital-literacy buyers specifically                         |
| AI Agent Quality & Intelligence   | 20%    | Strong                                                                 | Full 5-part loop (§4) built and demoed explicitly                                                    |
| Working Prototype                 | 20%    | Strong, conditional on scope discipline                                | Cut rule (§7) protects this from time overrun                                                        |
| Impact & Usefulness               | 15%    | Weak if generic; fixed by same reframe as above                        | Same fix as Problem Understanding                                                                    |
| Innovation & Uniqueness           | 10%    | Medium                                                                 | Outside official example categories; accessibility angle (mixed-language input) adds differentiation |
| Technical Implementation          | 10%    | Strong                                                                 | Real API, real payment gateway, real DB, no mocks                                                    |
| UX & Accessibility                | 5%     | Strong                                                                 | Simple browser chat, no app/account required, accepts casual/mixed-language input                    |
| Presentation & Demo               | 5%     | Controllable                                                           | Demo opens by naming the user before showing code (§9)                                               |

## 9. Demo Script Notes

- Open by naming the target user and the specific barrier they face (not by showing code first)
- Walk through one live message → tool call → decision → memory confirmation → payment link, in real time
- Explicitly name the five agentic capabilities (goal/memory/decision/tools/action) while narrating, since this maps directly to the highest-weighted rubric line (20%)

## 10. Submission Requirements Checklist

- [ ] Team ID, team name, project name in PR
- [ ] Problem Statement, Solution, Tech Stack, How It Works filled into repo README
- [ ] No secrets committed (`.env` used throughout)
- [ ] Public Demo URL (live deployment, not localhost)
- [ ] Demo video (recorded, uploaded, linked — not committed as a binary)
- [ ] Final PR title format: `[TEAM-ID] Project Name`
- [ ] PR description includes: team info, problem statement, solution, tech stack, Demo URL, demo video link, notes for judges

## 11. Known Unknowns / Risks

- Exact deadline/duration confirmation beyond the stated 5-hour window — not independently verified
- Judges' strictness on "Kerala/India relevance" (15% criterion) — treated as strict per rubric wording; reframe in §2 is the mitigation
- Public reachability of the deployed webhook/instance must be confirmed before Phase 6, not assumed
