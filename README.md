# starter-kit/ — Claudian Vault Starter Kit (build workspace)

This folder builds a shareable, personalizable copy of this vault for other developers.
**It is for you (the vault owner), not the end user.** The end user only ever sees the zip.

## Layout

```
starter-kit/
├─ build-kit.sh          # YOU run this → assembles + scrubs + zips
├─ scrub.manifest.json   # sanitization policy (build-kit.sh enforces it)
├─ src/                  # hand-authored kit contents (the truth)
│  ├─ scaffold.mjs       # the personalizer the END USER runs (Node, zero deps)
│  ├─ kit.manifest.json  # feature → skill removal map
│  ├─ INSTALL.md  WALKTHROUGH.md
│  ├─ docs/              # plugins.md, mcp-setup.md, personalization.md
│  └─ overlay/           # files laid over copied vault assets (templatized CLAUDE.md, stubs, Demo Project, dot-configs)
└─ dist/                 # build output (git-ignored): staging/ + claudian-starter-kit.zip
```

## Build

```sh
bash starter-kit/build-kit.sh
```

Produces `dist/claudian-starter-kit.zip`. The build **fails loudly** if any personal token
(`Sebbo`, `fincompare`, absolute paths, …) survives into the staging tree.

## How it works

- Portable assets (`skills/`, `08 Templates/`, most of `00 Context/`) are copied **from the live
  vault at build time** — single-sourced, never duplicated here.
- `src/overlay/` provides the parts that must differ from your live vault: a templatized
  `CLAUDE.md.tmpl`, neutral profile stubs, the Demo Project, and clean dot-configs.
- `build-kit.sh` merges the two, scrubs, guards, and zips.

## Test the output

```sh
rm -rf /tmp/kit-test && unzip -q dist/claudian-starter-kit.zip -d /tmp/kit-test
cd /tmp/kit-test && node scaffold.mjs --target ./out --defaults
```

## Updating

- New/changed **skill, template, persona** → just rebuild; it's pulled from the live vault.
- New **personal token** to scrub → add it to the `LEAK_REGEX` and scrub pass in `build-kit.sh`
  (and mirror in `scrub.manifest.json`).
- New **placeholder / feature toggle** → edit `src/scaffold.mjs` + `src/kit.manifest.json` +
  the `<!-- feature:NAME -->` markers in `src/overlay/CLAUDE.md.tmpl`.
