# Maintainers

This repository builds the publishable npm package for `@veams/vault-starter-kit`.

## Layout

```text
repo/
├─ package.json
├─ scripts/
│  ├─ leak-guard.mjs
│  └─ refresh-template.sh
├─ scrub.manifest.json
└─ src/
   ├─ scaffold.mjs
   ├─ kit.manifest.json
   ├─ template-vault/
   ├─ INSTALL.md
   ├─ WALKTHROUGH.md
   ├─ docs/
   └─ overlay/
```

## Refresh Vendored Assets

The package is self-contained at publish time. Refreshing `src/template-vault/` is an owner-only
maintenance step that copies portable assets from the live vault, applies the overlay, scrubs known
tokens, and runs the leak guard.

```sh
npm run refresh
```

If the repo is not in the standard vault location:

```sh
VAULT_ROOT=/path/to/vault npm run refresh
```

Review the generated diff before finalizing. Do not commit during task implementation; commits belong
to the task-finalize workflow.

## Verification

```sh
npm run leak-guard
node --check src/scaffold.mjs
npm publish --dry-run
```

For an installed-bin smoke test:

```sh
npm pack
tmpdir="$(mktemp -d)"
tarball="$(ls -t *.tgz | head -n 1)"
npm exec --yes --package "./$tarball" -- vault-starter-kit --target "$tmpdir/out" --defaults --no-git
```

## Sanitization

`scripts/leak-guard.mjs` reads `scrub.manifest.json` and fails on personal-data matches. The guard is
run by `npm run refresh`, `npm run leak-guard`, and `prepublishOnly`.
