# Contributing

Thanks for helping. The fastest, highest-impact contribution is a **signature**: one JSON
entry that teaches stack-xray to recognise a vendor.

## Add or fix a signature

1. Find the category file in `signatures/` (`ai-providers.json`, `ai-infra.json`,
   `hosting.json`, `analytics.json`, ...) and add your entry, or create a new `*.json`
   file. Each file holds one signature or an array of them.
2. Use a lowercase kebab-case `id` and one of these categories:
   `ai-provider`, `ai-infra`, `hosting`, `edge`, `framework`, `backend`, `auth`,
   `payments`, `analytics`, `monitoring`, `email`, `support`, `compliance`, `team-tools`.
3. Prefer specific patterns. `api\\.groq\\.com` is great; `groq` alone would match
   unrelated text. `text` and `js` patterns are case-sensitive on purpose.
4. Set `website` to the vendor's own domain. It's also used to avoid reporting a
   company as its own vendor.
5. Add a `note` when a match proves less than it seems (e.g. DNS verification = account,
   not product usage).
6. Run:

   ```bash
   npm install
   npm run validate
   npm test
   npx tsx src/cli.ts <a domain that uses the vendor>
   ```

7. In the PR, include one public domain where the signature fires and the evidence line
   from `report.md`.

## Code changes

- `src/collectors/` gather raw signals (DNS, HTTP/HTML/JS, legal pages, status pages, REA).
- `src/engine.ts` matches signatures against signals and assigns evidence tiers.
- `src/render/` turns a report into Markdown, Mermaid and the HTML card.

Keep collectors passive: public pages only, no login, no endpoint probing, no
protection bypass. Add a test in `test/` for engine or parser changes.
