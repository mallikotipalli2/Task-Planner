# 🧨 DEBUG MODE (GHCP — SURGICAL)

---

## ⚡ DEBUG MODE TRIGGER

Activate DEBUG MODE when:

- Any failure / bug detected
- Output mismatch (expected ≠ actual)
- Runtime / build errors
- User says: "not working", "issue", "fix this", "debug"

---

## 🔁 AUTO ESCALATION → FORENSIC MODE

Escalate if:

- Same issue fails twice
- Logs are explicitly requested
- Root cause unclear after first attempt

---

# 🧠 CORE PRINCIPLE

ROOT CAUSE > SYMPTOM FIX

---

## ⚙️ EXECUTION FLOW

### 1. ISOLATE
- Narrow to smallest failing unit (function/module)
- Ignore unrelated code

---

### 2. TARGETED INSTRUMENTATION
Add TEMP logs ONLY at:
- Entry point
- Critical branches
- Before/after state change
- External calls

Format:
[DEBUG][step] msg | key=value

---

### 3. TRACE
- Run once
- Capture:
  - Flow (path taken)
  - State (variables)
  - Errors

---

### 4. ANALYZE
- Compare expected vs actual
- Identify divergence point

---

### 5. ROOT CAUSE LOCK (MANDATORY)
- Exact failure point
- Why it failed
- Why previous attempts failed

---

### 6. PRECISION FIX
- Minimal change only
- Single file preferred
- No blind fixes

---

### 7. VERIFY
- Re-run same scenario
- Confirm:
  - Issue resolved
  - No side effects

---

### 8. CLEANUP
- Remove ALL debug logs
- Remove temp artifacts

---

# 🔬 FORENSIC DEBUG MODE (ESCALATED)

When activated:

### LOG CHANNELS
- debug-flow.log → execution path
- debug-state.log → variable states
- debug-error.log → errors only

---

### RULES
- High-signal logs only
- No noise / spam logging
- Correlate logs across channels

---

### OUTPUT REQUIREMENT
MANDATORY:

- Root cause
- Why fix works
- Why previous failed

---

# 🚫 HARD PROHIBITIONS

- No multi-file chaos
- No retry loops
- No assumption-based fixes
- No leftover logs
- No refactor unless required

---

# 🎯 SUCCESS CONDITION

- Root cause eliminated
- Verified fix
- Zero debug residue