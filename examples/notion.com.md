# What notion.com runs on

Scanned https://www.notion.com/ at 2026-10-15T04:53:59.187Z · 631 signals · 1.8 MB of JavaScript inspected

```mermaid
flowchart LR
  user(["👤 User"])
  subgraph edge["Edge & DNS"]
    direction TB
    n_cloudflare["Cloudflare"]:::infra
    n_cloudfront["Amazon CloudFront"]:::infra
  end
  subgraph app["notion.com"]
    direction TB
    n_aws["AWS"]:::infra
    n_nextjs["Next.js"]:::observed
    n_vercel["Vercel"]:::infra
    n_gcp["Google Cloud"]:::declared
    n_react["React"]:::bundle
  end
  subgraph ai["AI providers"]
    direction TB
    n_anthropic["Anthropic (Claude)<br/><small>subprocessor · 85%</small>"]:::declared
    n_cerebras["Cerebras<br/><small>subprocessor · 85%</small>"]:::declared
    n_openai["OpenAI<br/><small>subprocessor · 85%</small>"]:::declared
    n_xai["xAI (Grok)<br/><small>subprocessor · 85%</small>"]:::declared
  end
  subgraph aiinfra["AI infra"]
    direction TB
    n_baseten["Baseten"]:::declared
    n_turbopuffer["turbopuffer"]:::declared
  end
  subgraph data["Data & backend"]
    direction TB
    n_contentful["Contentful (CMS)"]:::observed
  end
  subgraph auth["Auth"]
    direction TB
    n_okta["Okta"]:::declared
    n_google_identity["Sign in with Google"]:::bundle
  end
  subgraph pay["Payments"]
    direction TB
    n_stripe["Stripe"]:::config
  end
  subgraph telemetry["Analytics & monitoring"]
    direction TB
    n_amplitude["Amplitude"]:::declared
    n_google_analytics["Google Analytics / Tag Manager"]:::bundle
    n_vercel_analytics["Vercel Analytics"]:::bundle
    n_incident_io["incident.io"]:::declared
    n_hotjar["Hotjar"]:::config
    n_linkedin_insight["LinkedIn Insight Tag"]:::config
    n_meta_pixel["Meta Pixel"]:::config
    n_sentry["Sentry"]:::config
  end
  subgraph comms["Email & support"]
    direction TB
    n_google_workspace["Google Workspace"]:::declared
    n_mailgun["Mailgun"]:::declared
    n_resend["Resend"]:::declared
    n_customer_io["Customer.io"]:::config
    n_zendesk["Zendesk"]:::config
  end
  user --> edge
  edge --> app
  app -->|subprocessor| n_anthropic
  app -->|subprocessor| n_cerebras
  app -->|subprocessor| n_openai
  app -->|subprocessor| n_xai
  app --> aiinfra
  app --> data
  app --> auth
  app --> pay
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
| Anthropic (Claude) | named on subprocessor, trust or status page | 85% | — |
| Cerebras | named on subprocessor, trust or status page | 85% | — |
| OpenAI | named on subprocessor, trust or status page | 85% | — |
| xAI (Grok) | named on subprocessor, trust or status page | 85% | — |

## Edge & DNS

- **Cloudflare** — infra, 99%
- **Amazon CloudFront** — infra, 90%

## App

- **AWS** — infra, 99%
- **Next.js** — live, 99%
- **Vercel** — infra, 99%
- **Google Cloud** — subprocessor, 85%
- **React** — in bundle, 70%

## AI infra

- **Baseten** — subprocessor, 85%
- **turbopuffer** — subprocessor, 85%

## Data & backend

- **Contentful (CMS)** — live, 99%

## Auth

- **Okta** — subprocessor, 85%
- **Sign in with Google** — in bundle, 70%

## Payments

- **Stripe** — CSP, 60%

## Analytics & monitoring

- **Amplitude** — subprocessor, 94%
- **Google Analytics / Tag Manager** — in bundle, 88%
- **Vercel Analytics** — in bundle, 88%
- **incident.io** — subprocessor, 85%
- **Hotjar** — CSP, 60%
- **LinkedIn Insight Tag** — CSP, 60%
- **Meta Pixel** — CSP, 60%
- **Sentry** — CSP, 60%

## Email & support

- **Google Workspace** — subprocessor, 85%
- **Mailgun** — subprocessor, 85%
- **Resend** — subprocessor, 85%
- **Customer.io** — CSP, 60%
- **Zendesk** — CSP, 60%

## Team tools (from DNS verification records)

Postman · Zoom

## Evidence

<details><summary><b>AWS</b> · hosting · 99%</summary>

- `infra` header @ https://app.notion.com/: `x-amz-id-2: kVHUXx5NHyqzhGlzuJWC5+sONnwoW02HlVA4Sn68fbgn5wClnW1nnlidizO8taAAxGAP6m3iXTo=`
- `infra` header @ https://app.notion.com/: `x-amz-request-id: Y0JESB21K8SPM4PB`
- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…est access Subprocessors See all 26 subprocessors AWS · USA, European Union, Korea, Japan Hosting and s…`

</details>

<details><summary><b>Cloudflare</b> · edge · 99%</summary>

- `infra` dns-ns @ notion.com: `woz.ns.cloudflare.com`
- `infra` dns-ns @ notion.com: `dana.ns.cloudflare.com`
- `infra` header @ https://www.notion.com/: `server: cloudflare`
- `infra` header @ https://www.notion.com/: `cf-ray: a4ac39272a0c7f8e-MAA`
- `infra` header @ https://app.notion.com/: `cf-ray: a4ac39280a147f73-MAA`
- `infra` cookie @ https://www.notion.com/: `__cf_bm`
- `infra` cookie @ https://app.notion.com/: `_cfuvid`
- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…ubprocessors in this trust center, including AWS, Cloudflare, and Google Cloud. See the subprocessors section…`

</details>

<details><summary><b>Contentful (CMS)</b> · backend · 99%</summary>

- `observed` resource @ https://images.ctfassets.net/: `images.ctfassets.net`
- `bundle` bundle @ javascript bundles: `…:false,"liveAssets":{"heroPoster":{"src":"https://images.ctfassets.net/spoqsaf9291f/3kVtQWll6jUqQepQ0kaYlz/382b34f23ecb3…`
- `config` csp @ https://www.notion.com/: `images.ctfassets.net`

</details>

<details><summary><b>Next.js</b> · framework · 99%</summary>

- `observed` html @ https://www.notion.com/: `…rossorigin="anonymous"/><link rel="preload" href="/_next/static/chunks/3nr739qv1y-ex.css" as="style"/><link rel="p…`
- `observed` html @ https://www.notion.com/: `…/div></div></footer></div></div></div><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"…`
- `infra` header @ https://www.notion.com/: `x-powered-by: Next.js`
- `infra` header @ https://www.notion.com/: `x-matched-path: /en-us/product`

</details>

<details><summary><b>Vercel</b> · hosting · 99%</summary>

- `infra` header @ https://www.notion.com/: `x-vercel-id: bom1::pdx1::zfgd2-1792040039591-41ac65c08214`
- `infra` header @ https://www.notion.com/: `x-vercel-cache: HIT`
- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…s Regulations Trusted by OpenAI Figma Ramp Cursor Vercel NVIDIA Volvo L'Oréal Discord Lovable 1Password To…`

</details>

<details><summary><b>Amplitude</b> · analytics · 94%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…cluding analytics, messaging, and data pipelines. Amplitude · USA Event logging for analytics. USA Customer ·…`
- `config` csp @ https://www.notion.com/: `cdn.amplitude.com`
- `config` csp @ https://www.notion.com/: `api.amplitude.com`

</details>

<details><summary><b>Amazon CloudFront</b> · edge · 90%</summary>

- `infra` dns-cname @ trust.notion.com: `dg7yax2nb93oh.cloudfront.net`

</details>

<details><summary><b>Google Analytics / Tag Manager</b> · analytics · 88%</summary>

- `bundle` bundle @ javascript bundles: `…r-script-init",strategy:"lazyOnload",src:"https://www.googletagmanager.com/gtm.js?id=GTM-MTWKTL4"}),(0,t.jsx)("noscript",{ch…`
- `config` csp @ https://www.notion.com/: `www.googletagmanager.com`
- `config` csp @ https://www.notion.com/: `www.google-analytics.com`
- `config` csp @ https://www.notion.com/: `region1.google-analytics.com`

</details>

<details><summary><b>Vercel Analytics</b> · analytics · 88%</summary>

- `bundle` bundle @ javascript bundles: `…,{src:(r=o).scriptSrc?O(r.scriptSrc):x()?"https://va.vercel-scripts.com/v1/speed-insights/script.debug.js":r.dsn?"https:/…`
- `config` csp @ https://www.notion.com/: `va.vercel-scripts.com`

</details>

<details><summary><b>Anthropic (Claude)</b> · ai-provider · 85%</summary>

> An anthropic-domain-verification TXT record proves a Claude/Anthropic Console account, not that the product calls the API.

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…stems provider. USA, European Union, Korea, Japan Anthropic · Global Service provider for AI agents, hosting…`

</details>

<details><summary><b>Baseten</b> · ai-infra · 85%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…Runlayer · USA Security for MCP connections. USA Baseten Labs, Inc. · Global Service provider for hosting…`

</details>

<details><summary><b>Cerebras</b> · ai-provider · 85%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…ting large language models and embeddings. Global Cerebras Systems Inc. · USA Service provider for hosting l…`

</details>

<details><summary><b>Google Cloud</b> · hosting · 85%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…this trust center, including AWS, Cloudflare, and Google Cloud. See the subprocessors section for details. How d…`

</details>

<details><summary><b>Google Workspace</b> · email · 85%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…ity providers including Okta, Microsoft Entra ID, Google Workspace, and OneLogin. Workspace administrators can enfor…`

</details>

<details><summary><b>incident.io</b> · monitoring · 85%</summary>

- `declared` status @ https://www.notion-status.com/: `…\n14:E{\"digest\":\"NEXT_REDIRECT;replace;https://incident.io/status-pages?utm_source=status-page;307;\"}\na:[[…`

</details>

<details><summary><b>Mailgun</b> · email · 85%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…to our data warehouse. USA, Germany, Korea, Japan Mailgun · USA Transactional, broadcast, and marketing mes…`

</details>

<details><summary><b>Okta</b> · auth · 85%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…based SSO with major identity providers including Okta, Microsoft Entra ID, Google Workspace, and OneLog…`

</details>

<details><summary><b>OpenAI</b> · ai-provider · 85%</summary>

> An openai-domain-verification TXT record proves an OpenAI account (often ChatGPT Enterprise), not that the product calls the API.

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…g. Read more Audit Reports Regulations Trusted by OpenAI Figma Ramp Cursor Vercel NVIDIA Volvo L'Oréal Dis…`

</details>

<details><summary><b>Resend</b> · email · 85%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…here's no need to submit it again.","resendLink":"Resend link","useDifferentEmail":"Use a different email"…`
- `declared` status @ https://www.notion-status.com/: `…\",\"verify_button\":\"Verify\",\"resend_code\":\"Resend code\",\"resend_code_sent\":\"Code sent!\",\"inva…`

</details>

<details><summary><b>turbopuffer</b> · ai-infra · 85%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…in-product analytics. USA, Germany, Korea, Japan Turbopuffer · USA, Germany, Korea, Japan Vector database for…`

</details>

<details><summary><b>xAI (Grok)</b> · ai-provider · 85%</summary>

- `declared` subprocessors @ https://trust.notion.com/subprocessors: `…t enable code execution and AI agent actions. USA X.AI LLC · USA, UK Service provider for hosting large lang…`

</details>

<details><summary><b>React</b> · framework · 70%</summary>

- `bundle` bundle @ javascript bundles: `…n}}var eO=Math.random().toString(36).slice(2),ez="__reactFiber$"+eO,eM="__reactProps$"+eO,eD="__reactContainer$"+…`
- `bundle` bundle @ javascript bundles: `…),ez="__reactFiber$"+eO,eM="__reactProps$"+eO,eD="__reactContainer$"+eO,eI="__reactEvents$"+eO,eF="__reactListeners$"…`
- `bundle` bundle @ javascript bundles: `…},216982,(e,t,r)=>{"use strict";var n=Symbol.for("react.transitional.element");function o(e,t,r){var o=null;if(void 0!==r&&(o=…`
- `bundle` bundle @ javascript bundles: `…";var n="function"==typeof Symbol&&Symbol.for,i=n?Symbol.for("react.element"):60103,o=n?Symbol.for("react.portal"):60106,s=n?Sy…`

</details>

<details><summary><b>Sign in with Google</b> · auth · 70%</summary>

- `bundle` bundle @ javascript bundles: `…ment,{children:[(0,t.jsx)(l.default,{src:"https://accounts.google.com/gsi/client",strategy:"lazyOnload",onLoad:()=>{s()}}),…`

</details>

<details><summary><b>Customer.io</b> · email · 60%</summary>

- `config` csp @ https://www.notion.com/: `assets.customer.io`
- `config` csp @ https://www.notion.com/: `track.customer.io`

</details>

<details><summary><b>Hotjar</b> · analytics · 60%</summary>

- `config` csp @ https://www.notion.com/: `static.hotjar.com`
- `config` csp @ https://www.notion.com/: `script.hotjar.com`

</details>

<details><summary><b>LinkedIn Insight Tag</b> · analytics · 60%</summary>

- `config` csp @ https://www.notion.com/: `snap.licdn.com`
- `config` csp @ https://www.notion.com/: `px.ads.linkedin.com`

</details>

<details><summary><b>Meta Pixel</b> · analytics · 60%</summary>

- `config` csp @ https://www.notion.com/: `connect.facebook.net`

</details>

<details><summary><b>Sentry</b> · monitoring · 60%</summary>

- `config` csp @ https://www.notion.com/: `js.sentry-cdn.com`

</details>

<details><summary><b>Statsig</b> · analytics · 60%</summary>

- `config` csp @ https://www.notion.com/: `api.statsig.com`

</details>

<details><summary><b>Stripe</b> · payments · 60%</summary>

- `config` csp @ https://www.notion.com/: `js.stripe.com`
- `config` csp @ https://www.notion.com/: `checkout.stripe.com`

</details>

<details><summary><b>X (Twitter) Pixel</b> · analytics · 60%</summary>

- `config` csp @ https://www.notion.com/: `static.ads-twitter.com`

</details>

<details><summary><b>Zendesk</b> · support · 60%</summary>

- `config` csp @ https://www.notion.com/: `static.zdassets.com`
- `config` csp @ https://www.notion.com/: `ekr.zendesk.com`
- `config` csp @ https://www.notion.com/: `makenotion.zendesk.com`

</details>

<details><summary><b>Microsoft 365</b> · email · 35%</summary>

- `account` dns-txt @ notion.com: `MS=ms30471993`

</details>

<details><summary><b>Postman</b> · team-tools · 35%</summary>

- `account` dns-txt @ notion.com: `postman-domain-verification=a713ed7f186c1901e299d55957b0e1bdfaf8f7d5aff31fbc6d49765defe5e190ab5c217a736b4ad45c553409b5b9d519977eb68ba3db7338…`

</details>

<details><summary><b>Zoom</b> · team-tools · 35%</summary>

- `account` dns-txt @ notion.com: `zoom-domain-verification=ZOOM_verify_7d721e1c5c134ba6aa478d5d4315ca01`

</details>

## Limitations

- This is an outside-in scan. Calls a backend makes to an LLM API never touch the browser, so they only show up if the company declares them (subprocessor list, trust center, status page) or ships references in client code.
- `DNS account` evidence means the company verified its domain with that vendor. That often means employees use it (e.g. ChatGPT Enterprise, Claude for Work), not that the product calls it.
- `in bundle` means shipped JavaScript references the vendor or model id. Model pickers and marketing pages can mention models that are routed through another provider.
- Run with `--rea` to add live network observation through REA (github.com/morluto/rea).
