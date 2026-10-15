---
name: stack-xray
description: Map how a company's web product is built (edge, hosting, framework, backend, auth, payments, analytics) and which AI providers and models it really uses, with evidence tiers for every claim. Use when asked "what does X run on", "which LLM does X use", "is X built on OpenAI or Anthropic", or to compare the stacks of several startups. Pairs with REA (morluto/rea) for live browser evidence.
metadata:
  version: "1"
---

# stack-xray

Outside-in architecture and AI-provider mapping for any website, built for agents.
Every finding carries evidence and a tier; never state a claim more strongly than
its tier supports.

## Run it

```bash
npx -y stack-xray <domain> [more domains] --out ./stack-xray-out
```

Per domain this writes `report.md` (Mermaid diagram + evidence), `stack.json`
(machine-readable findings), `diagram.mmd`, and `card.html`. Add `--png` for a
1200×675 image, `--rea` for live network observation through REA, and
`--url <page>` to include a specific app page (e.g. a logged-out chat page).

Read `stack.json` rather than scraping terminal output. Each finding has
`category`, `confidence`, `tier`, `evidence[]` and `models[]`.

## Evidence tiers (strongest first)

| tier | meaning | how to phrase it |
| --- | --- | --- |
| `observed` | Browser loaded or called the host (resource tag or REA runtime capture) | "calls / loads X" |
| `infra` | DNS records or HTTP headers | "hosted on / served by X" |
| `declared` | Named on the company's subprocessor list, trust center or status page | "lists X as a subprocessor" |
| `bundle` | Shipped JavaScript references the vendor, SDK or model id | "ships code referencing X" |
| `config` | Allowed in Content-Security-Policy only | "permits connections to X" |
| `mention` | Mentioned on a generic privacy/security page | "mentions X" |
| `account` | Domain-verification TXT record only | "has a verified X account (possibly internal use)" |

An `account`-only AI provider usually means employees use ChatGPT Enterprise or
Claude for Work. Do not say the product "runs on" it.

## Going deeper with REA

When the question needs runtime proof (e.g. "does the chat UI call OpenAI from
the browser?"), and REA's MCP tools are connected:

1. Start a dedicated browser: Chrome with `--remote-debugging-port=9222 --user-data-dir=<tmp>` on the target page.
2. `list_browser_targets` → pick the target.
3. `inspect_web_page` with `allowed_origins` set to the target origin plus the
   candidate hosts from `stack.json` evidence (CSP and resource hosts). REA only
   retains explicitly allowed origins.
4. Have the user (or the page) perform the action while `observe_web_session`
   or a longer `observation_ms` window is open; navigation during
   `inspect_web_page` fails with `target_changed`.
5. `analyze_web_bundle` for endpoint and vendor fingerprints in the loaded code.

Merge what REA observed back into your answer as `observed` evidence and cite
the REA Evidence ID.

## Limits to state in your answer

- Server-side LLM calls are invisible from outside. Absence of evidence is not
  evidence of absence.
- Sites behind bot protection may block the static fetch; the report lists
  collector errors. Try `--rea` or `--url` with a different page.
- Only analyze public pages. Do not log in, bypass protections, or probe APIs.

## Improving the signature database

Signatures live in `signatures/*.json` in the stack-xray repo. If you find a
vendor stack-xray missed, propose an entry with at least one `hosts`, `dnsTxt`,
`headers`, `cname`, `js` or `text` pattern, and run `npm test`.
