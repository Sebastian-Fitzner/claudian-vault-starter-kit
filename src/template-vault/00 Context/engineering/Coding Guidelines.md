# Coding Guidelines

## 1. Think Before Coding

- State assumptions
- Highlight uncertainties
- Present alternatives if multiple exist
- Ask if unclear

---

## 2. Simplicity First

- Solve only the requested problem
- No speculative abstractions
- No premature flexibility
- No unnecessary error handling

Test:
Would a senior say this is overengineered?

If yes → simplify

---

## 3. Surgical Changes

- Touch only relevant code
- Do not refactor unrelated areas
- Match existing style

Allowed:
- Remove unused code caused by YOUR changes

Not allowed:
- Removing pre-existing dead code

---

## 4. Goal-Driven Work

Convert tasks into verifiable outcomes

Examples:
- Bug → reproduce + fix
- Feature → test behavior
- Refactor → ensure no regressions

---

## 5. Naming Conventions

- Use **camelCase** for private (non-exported) module-level constants — no SCREAMING_SNAKE_CASE
- SCREAMING_SNAKE_CASE is only acceptable for exported/shared configuration constants (e.g. env variables)
- **Parameter names must be descriptive** — single-letter or abbreviated names (`a`, `b`, `e`, `cb`, `fn`) are not allowed. Every parameter name should communicate its role at the call site without needing to inspect the type signature.

```ts
// ✅ Descriptive — readable without the type annotation
configure(trackingAdapter: TrackingAdapter): void { ... }
bindSubscribable(source, (snapshot) => ...)

// ❌ Opaque — reader must inspect the signature to understand the argument
configure(a: TrackingAdapter): void { ... }
map((e) => e.value)
```

---

## 6. File Structure

- Place helper functions **below** the main export (component, class, etc.)
- Hoisted `function` declarations ensure they remain callable from above
- The main export should be the first thing a reader sees, not buried under utilities

---

## 7. Clean Output

- Prefer clarity over cleverness
- Keep components simple
- Avoid unnecessary layers
