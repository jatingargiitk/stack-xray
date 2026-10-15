# What harvey.ai runs on

Scanned https://www.harvey.ai/ at 2026-10-15T04:52:50.836Z · 210 signals · 4.8 MB of JavaScript inspected

```mermaid
flowchart LR
  user(["👤 User"])
  subgraph edge["Edge & DNS"]
    direction TB
    n_google_cloud_dns["Google Cloud DNS"]:::infra
  end
  subgraph app["harvey.ai"]
    direction TB
    n_nextjs["Next.js"]:::observed
    n_azure["Microsoft Azure"]:::infra
    n_vercel["Vercel"]:::infra
    n_aws["AWS"]:::declared
    n_gcp["Google Cloud"]:::declared
    n_react["React"]:::bundle
  end
  subgraph ai["AI providers"]
    direction TB
    n_elevenlabs["ElevenLabs<br/><small>subprocessor · 94%</small>"]:::declared
    n_anthropic["Anthropic (Claude)<br/><small>subprocessor · 90%</small>"]:::declared
    n_openai["OpenAI<br/><small>subprocessor · 90%</small>"]:::declared
    n_aws_bedrock["Amazon Bedrock<br/><small>subprocessor · 85%</small>"]:::declared
    n_mistral["Mistral AI<br/><small>subprocessor · 85%</small>"]:::declared
  end
  subgraph aiinfra["AI infra"]
    direction TB
    n_baseten["Baseten"]:::declared
  end
  subgraph data["Data & backend"]
    direction TB
    n_sanity["Sanity (CMS)"]:::observed
  end
  subgraph auth["Auth"]
    direction TB
    n_auth0["Auth0 (Okta)"]:::bundle
  end
  subgraph telemetry["Analytics & monitoring"]
    direction TB
    n_google_analytics["Google Analytics / Tag Manager"]:::observed
    n_incident_io["incident.io"]:::infra
    n_linkedin_insight["LinkedIn Insight Tag"]:::bundle
    n_sentry["Sentry"]:::bundle
    n_vercel_analytics["Vercel Analytics"]:::bundle
  end
  subgraph comms["Email & support"]
    direction TB
    n_microsoft_365["Microsoft 365"]:::infra
    n_google_workspace["Google Workspace"]:::infra
  end
  user --> edge
  edge --> app
  app -->|subprocessor| n_elevenlabs
  app -->|subprocessor| n_anthropic
  app -->|subprocessor| n_openai
  app -->|subprocessor| n_aws_bedrock
  app -->|subprocessor| n_mistral
  app --> aiinfra
  app --> data
  app --> auth
  app --> telemetry
  app --> comms
  classDef observed fill:#0f2e1d,stroke:#22c55e,stroke-width:2px,color:#e5ffe9
  classDef infra fill:#0f2233,stroke:#38bdf8,stroke-width:2px,color:#e0f2fe
  classDef declared fill:#2a1f0b,stroke:#f59e0b,stroke-width:2px,color:#fff7e6
  classDef bundle fill:#1f1633,stroke:#a78bfa,stroke-width:2px,color:#f3eeff
  classDef config fill:#1e1e24,stroke:#94a3b8,stroke-width:1px,color:#e2e8f0
  classDef mention fill:#1a1c22,stroke:#7c8597,stroke-width:1px,color:#d1d5db
  classDef account fill:#1a1a1a,stroke:#6b7280,stroke-width:1px,stroke-dasharray:4 3,color:#d1d5db
```

## AI providers

| Provider | Strongest evidence | Confidence | Models seen |
| --- | --- | --- | --- |
| ElevenLabs | named on subprocessor, trust or status page | 94% | — |
| Anthropic (Claude) | named on subprocessor, trust or status page | 90% | — |
| OpenAI | named on subprocessor, trust or status page | 90% | — |
| Amazon Bedrock | named on subprocessor, trust or status page | 85% | — |
| Mistral AI | named on subprocessor, trust or status page | 85% | — |

## Edge & DNS

- **Google Cloud DNS** — infra, 90%

## App

- **Next.js** — live, 99%
- **Microsoft Azure** — infra, 95%
- **Vercel** — infra, 90%
- **AWS** — subprocessor, 85%
- **Google Cloud** — subprocessor, 85%
- **React** — in bundle, 70%

## AI infra

- **Baseten** — subprocessor, 85%

## Data & backend

- **Sanity (CMS)** — live, 99%

## Auth

- **Auth0 (Okta)** — in bundle, 88%

## Analytics & monitoring

- **Google Analytics / Tag Manager** — live, 99%
- **incident.io** — infra, 90%
- **LinkedIn Insight Tag** — in bundle, 70%
- **Sentry** — in bundle, 70%
- **Vercel Analytics** — in bundle, 70%

## Email & support

- **Microsoft 365** — infra, 94%
- **Google Workspace** — infra, 90%

## Team tools (from DNS verification records)

Adobe · Airtable · Apple Business · Atlassian · Cursor · Figma · HackerOne · Jamf · Linear · Notion · Slack · Zoom

## Evidence

<details><summary><b>Google Analytics / Tag Manager</b> · analytics · 99%</summary>

- `observed` html @ https://www.harvey.ai/: `…href="https://www.googletagmanager.com/gtm.js?id=GTM-KMXPZXTG" as="script"/><meta name="theme-color" content="#…`
- `observed` resource @ https://www.googletagmanager.com/gtm.js?id=GTM-KMXPZXTG: `www.googletagmanager.com`
- `bundle` bundle @ javascript bundles: `…),(0,s.jsx)(u.default,{id:"_next-ga",src:'https://www.googletagmanager.com/gtag/js?id=${t}',nonce:o})]})},r.sendGAEvent=func…`

</details>

<details><summary><b>Next.js</b> · framework · 99%</summary>

- `observed` html @ https://www.harvey.ai/: `…idth, initial-scale=1"/><link rel="preload" href="/_next/static/immutable/media/HarveySansDiatypeVariable-s.p.2rrv…`
- `observed` html @ https://www.harvey.ai/: `…y732oke1o.js" id="_R_" async=""></script><script>(self.__next_f=self.__next_f||[]).push([0])</script><script>self…`
- `infra` header @ https://www.harvey.ai/: `x-nextjs-prerender: 1`
- `infra` header @ https://www.harvey.ai/: `x-nextjs-stale-time: 300`
- `infra` header @ https://www.harvey.ai/: `x-matched-path: /en-US`

</details>

<details><summary><b>Sanity (CMS)</b> · backend · 99%</summary>

- `observed` resource @ https://cdn.sanity.io/images/07s0r5r6/production/6d697d9a97bf529af75a9380d4de4b99e101c77e-2740x1542.svg: `cdn.sanity.io`
- `bundle` bundle @ javascript bundles: `…mageOfPage":{"@type":"ImageObject","url":"https://cdn.sanity.io/images/07s0r5r6/production/acf4a0772c068016f3d331…`

</details>

<details><summary><b>Microsoft Azure</b> · hosting · 95%</summary>

- `infra` dns-cname @ api.harvey.ai: `traffic-manager-profile-backend-prod.trafficmanager.net`
- `infra` dns-cname @ app.harvey.ai: `traffic-manager-profile-frontend-prod.trafficmanager.net`
- `mention` legal @ https://www.harvey.ai/security: `…processed? Harvey hosts its cloud environment in Microsoft Azure. For customers with requirements or preferences f…`

</details>

<details><summary><b>ElevenLabs</b> · ai-provider · 94%</summary>

- `declared` subprocessors @ https://www.harvey.ai/legal/subprocessors: `…zerland, Australia Anthropic, PBC AI provider US* ElevenLabs Inc. AI provider (including voice services) US, E…`
- `config` csp @ https://app.harvey.ai/: `api.elevenlabs.io`

</details>

<details><summary><b>Microsoft 365</b> · email · 94%</summary>

- `infra` dns-txt @ harvey.ai: `v=spf1 include:_spf.google.com include:_spf.salesforce.com include:spf.protection.outlook.com include:mktomail.com -all`
- `account` dns-txt @ harvey.ai: `MS=ms10652809`

</details>

<details><summary><b>Anthropic (Claude)</b> · ai-provider · 90%</summary>

> An anthropic-domain-verification TXT record proves a Claude/Anthropic Console account, not that the product calls the API.

- `declared` subprocessors @ https://www.harvey.ai/legal/subprocessors: `…services provider US, EU, Switzerland, Australia Anthropic, PBC AI provider US* ElevenLabs Inc. AI provider…`
- `account` dns-txt @ harvey.ai: `anthropic-domain-verification-1607fy=pzFHM9it5V9DM3rDptLyjuZFb`

</details>

<details><summary><b>Google Cloud DNS</b> · edge · 90%</summary>

- `infra` dns-ns @ harvey.ai: `ns-cloud-b2.googledomains.com`
- `infra` dns-ns @ harvey.ai: `ns-cloud-b4.googledomains.com`
- `infra` dns-ns @ harvey.ai: `ns-cloud-b1.googledomains.com`
- `infra` dns-ns @ harvey.ai: `ns-cloud-b3.googledomains.com`

</details>

<details><summary><b>Google Workspace</b> · email · 90%</summary>

- `infra` dns-txt @ harvey.ai: `v=spf1 include:_spf.google.com include:_spf.salesforce.com include:spf.protection.outlook.com include:mktomail.com -all`
- `infra` dns-mx @ harvey.ai: `alt3.aspmx.l.google.com`
- `infra` dns-mx @ harvey.ai: `alt2.aspmx.l.google.com`
- `infra` dns-mx @ harvey.ai: `alt4.aspmx.l.google.com`
- `infra` dns-mx @ harvey.ai: `aspmx.l.google.com`
- `infra` dns-mx @ harvey.ai: `alt1.aspmx.l.google.com`

</details>

<details><summary><b>incident.io</b> · monitoring · 90%</summary>

- `infra` dns-cname @ status.harvey.ai: `statuspage.incident.io`

</details>

<details><summary><b>OpenAI</b> · ai-provider · 90%</summary>

> An openai-domain-verification TXT record proves an OpenAI account (often ChatGPT Enterprise), not that the product calls the API.

- `declared` subprocessors @ https://www.harvey.ai/legal/subprocessors: `…services provider US, EU, Switzerland, Australia OpenAI, LLC AI provider US, EU, Switzerland, Australia G…`
- `account` dns-txt @ harvey.ai: `openai-domain-verification=dv-1QAiLsvKdiVoom3v7p2DXKcn`

</details>

<details><summary><b>SafeBase</b> · compliance · 90%</summary>

- `infra` dns-cname @ trust.harvey.ai: `harvey.portals.safebase.io`

</details>

<details><summary><b>Vercel</b> · hosting · 90%</summary>

- `infra` dns-cname @ www.harvey.ai: `cname.vercel-dns.com`
- `infra` header @ https://www.harvey.ai/: `x-vercel-id: bom1::rhhcp-1792039971614-5a4e08f07216`
- `infra` header @ https://www.harvey.ai/: `server: Vercel`
- `infra` header @ https://www.harvey.ai/: `x-vercel-cache: HIT`

</details>

<details><summary><b>Auth0 (Okta)</b> · auth · 88%</summary>

- `bundle` bundle @ javascript bundles: `…28KMeJlpdvYycIOwXbpwAO_KLUO7lHMLg","AUTH_DOMAIN":"harvey-ai.us.auth0.com","IMANAGE_APP_ID":"0a6b4bba-75e0-425c-8aa3-4ec104…`
- `config` csp @ https://app.harvey.ai/: `harvey-ai.us.auth0.com`

</details>

<details><summary><b>Amazon Bedrock</b> · ai-provider · 85%</summary>

- `declared` subprocessors @ https://www.harvey.ai/legal/subprocessors: `…e through Harvey’s model hosting platforms (e.g., AWS Bedrock, Google Vertex). Product Features Subprocessor Na…`

</details>

<details><summary><b>AWS</b> · hosting · 85%</summary>

- `declared` subprocessors @ https://www.harvey.ai/legal/subprocessors: `…atform AI provider US, EU, Switzerland, Australia Amazon Web Services AI provider and cloud services provider US, EU, S…`
- `declared` subprocessors @ https://www.harvey.ai/legal/subprocessors: `…e through Harvey’s model hosting platforms (e.g., AWS Bedrock, Google Vertex). Product Features Subproc…`

</details>

<details><summary><b>Baseten</b> · ai-infra · 85%</summary>

- `declared` subprocessors @ https://www.harvey.ai/legal/subprocessors: `…ranslation) US, EU Mistral AI SAS* AI provider EU Baseten Labs, Inc. AI provider US, EU, Australia Firework…`

</details>

<details><summary><b>Google Cloud</b> · hosting · 85%</summary>

- `declared` subprocessors @ https://www.harvey.ai/legal/subprocessors: `…I, LLC AI provider US, EU, Switzerland, Australia Google Cloud Platform AI provider US, EU, Switzerland, Australia Amazon…`

</details>

<details><summary><b>Mistral AI</b> · ai-provider · 85%</summary>

- `declared` subprocessors @ https://www.harvey.ai/legal/subprocessors: `…DeepL SE AI provider (machine translation) US, EU Mistral AI SAS* AI provider EU Baseten Labs, Inc. AI provide…`

</details>

<details><summary><b>LinkedIn Insight Tag</b> · analytics · 70%</summary>

- `bundle` bundle @ javascript bundles: `…["telemetry.us.transcend.io","transcend-cdn.com","px.ads.linkedin.com","podscribe.com","pdscrb.com","amazon-adsystem.co…`

</details>

<details><summary><b>React</b> · framework · 70%</summary>

- `bundle` bundle @ javascript bundles: `…t}}var eq=Math.random().toString(36).slice(2),eK="__reactFiber$"+eq,eY="__reactProps$"+eq,eG="__reactContainer$"+…`
- `bundle` bundle @ javascript bundles: `…),eK="__reactFiber$"+eq,eY="__reactProps$"+eq,eG="__reactContainer$"+eq,eX="__reactEvents$"+eq,eZ="__reactListeners$"…`
- `bundle` bundle @ javascript bundles: `…pKey:brand-site":!0})}catch(e){}var o=Symbol.for("react.transitional.element");function a(e,t,r){var n=null;if(void 0!==r&&(n=…`
- `bundle` bundle @ javascript bundles: `…e;e=t(e),n=t(n)}return null}var N=Object.assign,C=Symbol.for("react.element"),P=Symbol.for("react.transitional.element"),_=Symb…`

</details>

<details><summary><b>Sentry</b> · monitoring · 70%</summary>

- `bundle` bundle @ javascript bundles: `…}}({dsn:"https://4795c142d2b1e947fed4087518110940@o4504924022505472.ingest.us.sentry.io/4511237350948864",tracesSampleRate:0,sendDefaultP…`
- `bundle` bundle @ javascript bundles: `…ata||{}).sdk=e._metadata.sdk||{};n.name||(n.name='sentry.javascript.${t}',n.packages=r.map(e=>({name:'${a}:@sentry/${e…`
- `bundle` bundle @ javascript bundles: `…}function g(){return f(_),_}function f(t){let e=t.__SENTRY__=t.__SENTRY__||{};return e.version=e.version||l,e[…`

</details>

<details><summary><b>Vercel Analytics</b> · analytics · 70%</summary>

- `bundle` bundle @ javascript bundles: `…Send));let r=e.scriptSrc?e.scriptSrc:d()?"https://va.vercel-scripts.com/v1/script.debug.js":e.basePath?'${e.basePath}/ins…`

</details>

<details><summary><b>Adobe</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `adobe-idp-site-verification=c158b49da70fad0f0d4a93e87ac1160dd117fab82a26b9209351a5c2bb179d88`

</details>

<details><summary><b>Airtable</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `airtable-verification=b469c0bf5bd53cc106195f7eb75f447d`

</details>

<details><summary><b>Apple Business</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `apple-domain-verification=QoA4ivawqABge0j0`

</details>

<details><summary><b>Atlassian</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `atlassian-domain-verification=ysdL8I30DEd5QvfBZgkFYG41G32KaEYUSLgkXLCAuKQENMVNITvrLRipf9tSYedm`

</details>

<details><summary><b>Cursor</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `cursor-domain-verification-nmam0n=DVaFNOZoTKluvNfI6eYusO4U8`

</details>

<details><summary><b>Figma</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `figma-domain-verification=b1d25d32af0835a2b7451f7787b73dfdc5a4f765780bc516207ee450e3d9dbb2-1776358659`

</details>

<details><summary><b>HackerOne</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `h1-domain-verification=ycmyGNTMyBsUYu987tMGNW1AYyYiRsessrt3o839hcpdyG9f`

</details>

<details><summary><b>Jamf</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `jamf-site-verification=vRUAWOCGcjKl00xo9IGLFQ`

</details>

<details><summary><b>Linear</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `linear-domain-verification=2zfzxamm6sf2`

</details>

<details><summary><b>Mixpanel</b> · analytics · 35%</summary>

- `account` dns-txt @ harvey.ai: `mixpanel-domain-verify=6da3724a-87d2-4e0c-94d1-9ded8add9832`

</details>

<details><summary><b>Notion</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `notion-domain-verification=YEaw5ItXWv413Bj86xc5L3Ar3CpsbzZTSdRkBTEBBZd`

</details>

<details><summary><b>Slack</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `slack-domain-verification=HaYbAw7aZsmf1IDBT5lPBoe6tL5sLFWyQwtRDYCK`

</details>

<details><summary><b>Zoom</b> · team-tools · 35%</summary>

- `account` dns-txt @ harvey.ai: `ZOOM_verify_u5E6Jqor9cawu3d4sykrXi`

</details>

## Limitations

- This is an outside-in scan. Calls a backend makes to an LLM API never touch the browser, so they only show up if the company declares them (subprocessor list, trust center, status page) or ships references in client code.
- `DNS account` evidence means the company verified its domain with that vendor. That often means employees use it (e.g. ChatGPT Enterprise, Claude for Work), not that the product calls it.
- `in bundle` means shipped JavaScript references the vendor or model id. Model pickers and marketing pages can mention models that are routed through another provider.
- Run with `--rea` to add live network observation through REA (github.com/morluto/rea).
