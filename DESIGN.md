# Design Skill --- Niche AI Chatbot

## Role

You are the **UI/UX implementation agent** for this chatbot.

Your job is to build a polished AI-chat interface that feels like a real
product, not a generic AI demo.

The visual direction is a deliberate combination of:

- **Linear** --- restraint, precision, spacing, typography, subtle
  surfaces, premium product feel.
- **Vercel AI Chatbot** --- practical AI interaction patterns, message
  composition, streaming states, model selection, and response
  actions.
- **The supplied reference screenshot** --- use it as a concrete
  visual reference for layout proportions, dark theme, sidebar/header
  treatment, message placement, composer position, and overall
  density.

Do not blindly copy any reference. Recreate the **design language and
interaction quality** while keeping the implementation original.

---

# 1. Design Objective

The final interface should communicate:

> **A serious, modern AI product built by a developer --- minimal enough
> to feel premium, but polished enough to feel production-ready.**

It should NOT look like:

- A default Tailwind template
- A generic ChatGPT clone
- A dashboard full of cards
- A marketing landing page
- A colorful AI SaaS template
- An over-designed futuristic AI interface

The design should feel **quiet, technical, intentional, and expensive**.

---

# 2. Reference Image Analysis

The provided reference screenshot establishes the following visual
principles.

### Overall layout

- Full-height application.
- Dark background.
- Narrow left sidebar.
- Main conversation area occupying the remaining viewport.
- Compact top controls.
- Large central conversation column.
- Composer anchored near the bottom.
- Generous empty space around conversation content.

### Sidebar

The reference uses a dark gray sidebar separated from the main black
conversation area.

Use:

- Fixed/sticky full-height sidebar on desktop.
- Compact width.
- App name at the top-left.
- New-chat `+` action at the top-right.
- Very subtle separation from the main content.
- No unnecessary navigation items for this MVP.

The sidebar should remain visually quiet.

It is a supporting element, not the focus.

### Main header

The reference contains:

- A small sidebar/layout toggle.
- Model selector.
- Compact controls.
- No oversized title.
- No large hero header.

Keep the header short and unobtrusive.

### Conversation

The conversation should be vertically readable with clear distinction
between user and assistant messages.

User messages:

- Right-aligned.
- Compact.
- Light surface against the dark background.
- Rounded corners.
- Avoid excessive bubble padding.

Assistant messages:

- Left-aligned within the content column.
- Prefer open text rather than a large surrounding card.
- Small assistant/avatar indicator.
- Response actions appear near the response.

### Composer

The composer is one of the strongest visual anchors.

It should:

- Sit near the bottom of the conversation area.
- Have a dark elevated surface.
- Use a subtle border.
- Have generous internal padding.
- Support multiline text.
- Include a compact send button.
- Transform into a stop-generation control while streaming.

The composer should feel like a single refined component rather than a
collection of unrelated buttons.

---

# 3. Design System

## 3.1 Theme

The MVP should be **dark-first**.

Do not introduce a light theme unless explicitly requested.

Use near-black surfaces rather than pure black everywhere.

Suggested semantic palette:

```text
App background        #0A0A0A
Sidebar background    #171717
Elevated surface      #1A1A1A
Composer surface      #242424
Subtle border         #2A2A2A
Primary text          #F5F5F5
Secondary text        #A1A1AA
Muted text            #71717A
User message surface  #F4F4F5
User message text     #111111
```

These values are starting guidance, not rigid requirements.

Prefer semantic CSS variables/Tailwind tokens over scattering raw hex
values throughout components.

### Rule

Avoid excessive contrast.

The UI should have enough contrast to establish hierarchy without making
every element visually loud.

---

# 4. Typography

Typography should feel close to a modern developer/product interface.

Prefer:

```text
Inter / Geist / system sans-serif
```

If the project already uses a Vercel/Next.js-compatible Geist setup, use
it.

### Hierarchy

Use typography rather than decorative elements to establish hierarchy.

Recommended:

- App name: semibold
- Model name: medium
- User message: regular
- Assistant response: regular
- Strong response headings: semibold/bold
- Metadata: small + muted

Do not make body text excessively large.

The screenshot demonstrates a compact, information-dense chat
experience.

---

# 5. Spacing

Use a consistent spacing scale.

Prefer:

```text
4px
8px
12px
16px
20px
24px
32px
48px
64px
```

Avoid arbitrary spacing values unless necessary.

### Conversation width

The conversation should have a comfortable maximum reading width.

Do not stretch assistant messages across the entire viewport.

A good starting point:

```text
max-width: 900px–1000px
```

Adjust based on viewport and reference composition.

---

# 6. Layout Architecture

Use this conceptual structure:

```text
App
│
├── Sidebar
│   ├── Brand
│   └── New Chat
│
└── Main
    ├── Header
    │   ├── Sidebar Toggle
    │   └── Model Selector
    │
    ├── Conversation
    │   └── Message List
    │
    └── Composer
        ├── Textarea
        └── Send / Stop
```

Do not add UI that is not justified by the MVP.

---

# 7. Sidebar

## Desktop

Target approximately:

```text
width: 280px–320px
```

The exact width should be tuned visually.

The screenshot uses a relatively narrow sidebar.

### Contents

Only include:

```text
Chatbot                         +
```

A future chat-history list should NOT be displayed because chat
persistence is not part of the MVP.

### New chat

The `+` action can reset the current client-side conversation.

It should not imply that chats are persisted.

### Mobile

Collapse the sidebar or hide it behind the layout toggle.

Do not let the sidebar consume most of a mobile viewport.

---

# 8. Header

The header should be compact.

Recommended:

```text
[ Sidebar Toggle ]   [ Gemini ▾ ]
```

Keep controls approximately 32--40px tall.

Use subtle borders and low visual weight.

Avoid:

- Giant navigation bars
- Large product logos
- Breadcrumbs
- Extra actions
- Settings menus

---

# 9. Model Selector

The model selector is intentionally simple.

Visible:

```text
Gemini
```

Optional disabled entries:

```text
GPT-5       Coming soon
Claude      Coming soon
```

Only Gemini works.

### Interaction

Opening the selector should feel like a premium command/control menu:

- Small popover
- Subtle border
- Dark surface
- Tight spacing
- Clear active state
- Disabled items visually muted

Disabled models must never appear functional.

Do not implement fake model behavior.

---

# 10. Empty State

The initial screen should not feel unfinished.

Keep it minimal.

Possible composition:

```text
             [ small assistant mark ]

             How can I help?

       Ask something about [niche].
```

The exact copy depends on the niche.

Avoid:

- Huge illustrations
- Gradient blobs
- Stock imagery
- Multiple feature cards
- Excessive onboarding

The goal is a calm starting point.

---

# 11. User Messages

User messages should be visually distinct but restrained.

Reference direction:

```text
                         ┌───────────────────┐
                         │ User message      │
                         └───────────────────┘
```

Requirements:

- Right aligned.
- Light/bright surface.
- Dark text.
- Rounded corners.
- Compact width based on content.
- Maximum width around 70--80% on desktop.
- Full/near-full width on small mobile screens when necessary.

Do not put a visible avatar next to every user message unless the visual
reference requires it.

---

# 12. Assistant Messages

Assistant responses are the primary reading surface.

Recommended structure:

```text
[✦]  Assistant response

     Markdown content...

     [Copy] [Regenerate]
```

The assistant marker should be:

- Small
- Geometric
- Subtle
- Consistent

A circular outlined icon similar in visual weight to the reference can
work well.

Do not use oversized AI avatars.

---

# 13. Markdown Rendering

Assistant responses must render cleanly.

Support:

- Paragraphs
- Headings
- Ordered lists
- Unordered lists
- Inline code
- Code blocks
- Blockquotes
- Links

### Code blocks

Code blocks should resemble the reference:

- Dark elevated surface.
- Subtle border.
- Rounded corners.
- Comfortable padding.
- Horizontal scrolling on small screens.
- Syntax highlighting if implemented.
- Copy action.

Do not make code blocks visually brighter than the surrounding
interface.

---

# 14. Message Actions

Actions should be quiet.

Required:

```text
Copy
Regenerate
```

During generation:

```text
Stop
```

Use icons with tooltips where appropriate.

Avoid large labeled buttons beneath every response.

The actions should appear visually secondary to the response itself.

---

# 15. Thinking / Processing State

This is a signature part of the MVP.

The processing state should feel alive without looking gimmicky.

Example:

```text
[✦] Reading context...
```

Then rotate through phrases:

```text
Thinking...
Reading context...
Connecting ideas...
Preparing response...
Working through it...
Almost there...
```

### Important

These are **UI status phrases**, not model chain-of-thought.

Never display or claim to expose hidden reasoning.

### Shimmer

Use a subtle animated shine:

```text
background-position: 200% → -200%
```

or an equivalent lightweight CSS animation.

The effect should be:

- Soft
- Short
- Continuous while generating
- Not distracting

Avoid:

- Large spinners
- Flashing text
- Pulsing entire messages
- Neon gradients

---

# 16. Composer

The composer should be the most carefully crafted control.

### Desktop

Position it near the bottom center of the main content.

Use:

```text
max-width: ~900px–1000px
```

with responsive side padding.

### Visual structure

```text
┌──────────────────────────────────────────────┐
│ Send a message...                            │
│                                              │
│                                      [ ↑ ]   │
└──────────────────────────────────────────────┘
```

Use:

- Rounded corners
- Subtle border
- Dark elevated surface
- Comfortable padding
- Clear focus state

### Input behavior

Support:

- Multiline text
- Enter to send
- Shift+Enter for newline
- Disabled empty state
- Streaming state
- Stop generation

Do not add attachments or voice controls.

---

# 17. Send Button

The send button should be compact.

Idle:

```text
↑
```

Generating:

```text
■
```

or another recognizable stop icon.

The control should transition smoothly.

Avoid oversized circular buttons.

---

# 18. Responsive Design

## Desktop

Prioritize the reference composition.

```text
Sidebar | Main conversation
```

## Tablet

Reduce:

- Sidebar width
- Conversation margins
- Composer width

## Mobile

Use:

```text
Main
├── Compact Header
├── Conversation
└── Composer
```

The sidebar should become an overlay/drawer or collapse completely.

Messages should remain comfortable to read.

The composer must remain reachable and usable.

---

# 19. Motion

Use motion to communicate state, not decoration.

### Allowed

- Shimmer
- Popover opening
- Button transitions
- Copy confirmation
- Subtle message appearance
- Sidebar opening/closing

### Avoid

- Large page transitions
- Bouncy UI
- Excessive spring animations
- Parallax
- Floating decorative objects

Animation duration should generally stay around:

```text
120ms–250ms
```

Longer animations should have a clear purpose.

Respect reduced-motion preferences.

---

# 20. Borders and Radius

The design should use restrained rounding.

Suggested:

```text
Small controls:       8px
Inputs/popovers:      10px–12px
Message bubbles:      14px–18px
Composer:             14px–18px
```

Borders should be subtle.

Do not outline every element.

---

# 21. Shadows

Use shadows sparingly.

The dark UI should rely primarily on:

- Background contrast
- Borders
- Surface elevation

rather than heavy shadows.

Avoid large glowing shadows.

---

# 22. Icons

Use one consistent icon family.

Lucide-style icons are appropriate.

Recommended concepts:

- Plus
- Sidebar
- Chevron Down
- Copy
- Check
- Stop
- Arrow Up

Icons should generally be:

```text
16px–18px
```

Avoid mixing multiple icon styles.

---

# 23. Component Rules

Components should be reusable but not over-engineered.

Good:

```text
Chat
ChatMessage
MessageActions
ThinkingIndicator
ChatComposer
ModelSelector
Sidebar
Header
```

Avoid creating a component for every tiny `<div>`.

A component deserves extraction when it:

- Has its own behavior.
- Has meaningful visual logic.
- Is reused.
- Makes the parent component significantly easier to understand.

---

# 24. Tailwind Rules

Use Tailwind CSS consistently.

Prefer:

```tsx
className = "...";
```

with semantic design tokens where possible.

Avoid huge unreadable class strings when a component or utility
abstraction would improve clarity.

Do not introduce custom CSS for things Tailwind can express cleanly.

Use custom CSS only when needed for:

- Shimmer animation
- Complex markdown styling
- Scroll behavior
- CSS variables
- Fine-grained visual effects

---

# 25. Dark UI Quality Checklist

Before considering the design complete, verify:

- [ ] Background levels are distinguishable.
- [ ] Borders are visible but subtle.
- [ ] Text hierarchy is obvious.
- [ ] User and assistant messages are immediately distinguishable.
- [ ] Composer is visually anchored.
- [ ] Header is compact.
- [ ] Sidebar does not dominate.
- [ ] Disabled model options are obvious.
- [ ] Thinking animation is subtle.
- [ ] No unnecessary gradients.
- [ ] No excessive shadows.
- [ ] No visual clutter.

---

# 26. Anti-Patterns

Never introduce these unless explicitly requested:

### Generic AI gradient

```text
purple → blue → pink
```

No generic AI gradients.

### Giant hero

The chatbot is the product.

Do not add:

```text
Build faster with AI
The future of...
```

### Excessive cards

Do not turn every UI section into a rounded card.

### Fake functionality

Do not make disabled models appear functional.

### Fake loading

Do not use a long artificial delay just to make the UI look intelligent.

### Chain-of-thought exposure

Do not display private model reasoning.

### Overloaded composer

Do not add:

```text
Attachments
Voice
Web search
Tools
Agents
Image generation
```

The MVP does not need them.

---

# 27. Visual Validation Process

When implementing the UI, validate in this order:

## Step 1 --- Macro layout

Check:

- Sidebar width
- Main content position
- Header height
- Conversation width
- Composer position

## Step 2 --- Typography

Check:

- Font
- Font sizes
- Weight
- Line height
- Message readability

## Step 3 --- Surfaces

Check:

- Background
- Sidebar
- Composer
- User bubble
- Code blocks
- Popovers

## Step 4 --- Spacing

Check:

- Message gaps
- Composer padding
- Header spacing
- Sidebar padding

## Step 5 --- Interaction

Check:

- Model selector
- Send
- Stop
- Copy
- Regenerate
- Thinking state

## Step 6 --- Responsive

Check:

- Desktop
- Tablet
- Mobile

Do not optimize tiny details before the macro composition is correct.

---

# 28. Screenshot Matching Rule

When the supplied reference image and this document conflict:

1.  Preserve the **product requirements** from the PRD.
2.  Preserve the **visual character** of the reference.
3.  Adapt the reference rather than copying it literally.
4.  Prefer clean, responsive implementation over pixel-perfect
    imitation.

The screenshot is a visual reference, not a specification for
functionality.

---

# 29. Definition of Done --- Design

The design is complete when:

- [ ] The UI clearly feels like a Linear/Vercel-quality product.
- [ ] The supplied reference's composition has influenced the
      implementation.
- [ ] The interface is dark-first and minimal.
- [ ] Sidebar/header/composer proportions feel intentional.
- [ ] Gemini is the only active model.
- [ ] Disabled model options look intentionally unavailable.
- [ ] User messages are clearly separated from assistant responses.
- [ ] Markdown and code blocks look polished.
- [ ] Copy/regenerate actions are subtle.
- [ ] Stop generation is obvious while streaming.
- [ ] Thinking status has a refined shimmer animation.
- [ ] No fake product functionality is presented as real.
- [ ] Mobile layout works.
- [ ] No unnecessary visual decoration exists.
- [ ] The application looks convincing in a screen recording.

---

# 30. Agent Instruction

When implementing this design:

> **Do not ask "what component should I build?" first. Ask "what should
> the user feel when they see this screen?"**

Favor:

```text
Less UI
+ Better spacing
+ Better typography
+ Better state transitions
+ Better interaction details
= Better product
```

If a proposed design element does not improve usability, hierarchy, or
product credibility, remove it.

**The goal is not to make the chatbot look impressive by adding more.
The goal is to make it look impressive by making every existing detail
intentional.**
