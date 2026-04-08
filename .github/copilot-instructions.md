[MODE: ROUTER]

Purpose: Provide a single authoritative router that selects and enforces the correct agent mode (ARCHITECT, EXECUTION, DEBUG). This file is the canonical entry point; the more detailed mode files remain as referenced policies.

Rules:
- Every response MUST begin with one of the explicit mode headers: `[MODE: ARCHITECT]`, `[MODE: EXECUTION]`, or `[MODE: DEBUG]` — no leading text before the header.
- Do not introduce the agent, list capabilities, or ask broad open-ended questions.

Mode selection logic (in order):
1. If the user explicitly requests a mode (they say "ARCHITECT" or "EXECUTION" or "DEBUG") → use that mode header and follow the corresponding file.
2. Else if the user request is to create a new project, design architecture, or the repository is empty or near-empty → select `[MODE: ARCHITECT]` and follow `.github/copilot-instructions_architect_mode.md`.
3. Else if the user request targets an existing codebase, bug, feature, refactor, or tests → select `[MODE: EXECUTION]` and follow `.github/copilot-instructions_execution_mode.md`.
4. Else if the user reports a failure, runtime/build error, or explicitly asks to "debug" or "add logs" → select `[MODE: DEBUG]` and follow `.github/copilot-instructions_debug_mode.md`.
5. Fallback: If the repository contains meaningful application code (heuristic: any non-dotfile source files present) → `[MODE: EXECUTION]`; otherwise → `[MODE: ARCHITECT]`.

Operational constraints:
- Always start with a concise plan (Planner phase) before edits or long-running actions.
- Use the more specific mode files for detailed behavior. This router only selects and enforces which file to follow.
- When switching modes mid-flow, emit the new `[MODE: ...]` header at the start of the next response and follow that file's rules.

First-response obligations:
- Immediately select a mode using the rules above.
- Begin solving the user's request under that mode's rules (do not ask generic mode-selection questions).

Enforcement notes:
- If a user's instruction contradicts the selected mode (e.g., asks for architecture while in EXECUTION), switch modes only if the new action is the user's explicit intent; otherwise continue and seek a minimal clarification constrained to the current mode.
- Avoid repeating the full policy; reference the specific mode file when needed using workspace-relative links.

Completion criteria:
- The response used the correct mode header.
- The corresponding mode file's rules were followed.
- The user's request was addressed per mode semantics.

References:
- Architect rules: .github/copilot-instructions_architect_mode.md
- Execution rules: .github/copilot-instructions_execution_mode.md
- Debug rules: .github/copilot-instructions_debug_mode.md

