# What lovable.dev runs on

Scanned https://lovable.dev/ at 2026-10-15T04:52:57.239Z · 71 signals · 0.0 MB of JavaScript inspected

```mermaid
flowchart LR
  user(["👤 User"])
  subgraph edge["Edge & DNS"]
    direction TB
    n_cloudflare["Cloudflare"]:::infra
  end
  subgraph app["lovable.dev"]
    direction TB
    n_vercel["Vercel"]:::infra
    n_aws["AWS"]:::declared
    n_gcp["Google Cloud"]:::declared
  end
  subgraph ai["AI providers"]
    direction TB
    n_anthropic["Anthropic (Claude)<br/><small>subprocessor · 90%</small>"]:::declared
    n_azure_openai["Azure OpenAI / Azure AI Foundry<br/><small>subprocessor · 85%</small>"]:::declared
    n_elevenlabs["ElevenLabs<br/><small>subprocessor · 85%</small>"]:::declared
    n_google_gemini["Google Gemini / Vertex AI<br/><small>subprocessor · 85%</small>"]:::declared
    n_openai["OpenAI<br/><small>subprocessor · 85%</small>"]:::declared
    n_openrouter["OpenRouter<br/><small>subprocessor · 85%</small>"]:::declared
  end
  subgraph aiinfra["AI infra"]
    direction TB
    n_baseten["Baseten"]:::declared
    n_browserbase["Browserbase"]:::declared
    n_firecrawl["Firecrawl"]:::declared
    n_turbopuffer["turbopuffer"]:::declared
  end
  subgraph data["Data & backend"]
    direction TB
    n_supabase["Supabase"]:::declared
  end
  subgraph pay["Payments"]
    direction TB
    n_stripe["Stripe"]:::declared
  end
  subgraph telemetry["Analytics & monitoring"]
    direction TB
    n_incident_io["incident.io"]:::infra
    n_hubspot["HubSpot"]:::declared
    n_sentry["Sentry"]:::declared
  end
  subgraph comms["Email & support"]
    direction TB
    n_google_workspace["Google Workspace"]:::infra
    n_customer_io["Customer.io"]:::declared
    n_intercom["Intercom"]:::declared
    n_mailgun["Mailgun"]:::declared
  end
  user --> edge
  edge --> app
  app -->|subprocessor| n_anthropic
  app -->|subprocessor| n_azure_openai
  app -->|subprocessor| n_elevenlabs
  app -->|subprocessor| n_google_gemini
  app -->|subprocessor| n_openai
  app -->|subprocessor| n_openrouter
  app --> aiinfra
  app --> data
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
| Anthropic (Claude) | named on subprocessor, trust or status page | 90% | — |
| Azure OpenAI / Azure AI Foundry | named on subprocessor, trust or status page | 85% | — |
| ElevenLabs | named on subprocessor, trust or status page | 85% | — |
| Google Gemini / Vertex AI | named on subprocessor, trust or status page | 85% | — |
| OpenAI | named on subprocessor, trust or status page | 85% | — |
| OpenRouter | named on subprocessor, trust or status page | 85% | — |

## Edge & DNS

- **Cloudflare** — infra, 99%

## App

- **Vercel** — infra, 90%
- **AWS** — subprocessor, 85%
- **Google Cloud** — subprocessor, 85%

## AI infra

- **Baseten** — subprocessor, 85%
- **Browserbase** — subprocessor, 85%
- **Firecrawl** — subprocessor, 85%
- **turbopuffer** — subprocessor, 85%

## Data & backend

- **Supabase** — subprocessor, 92%

## Payments

- **Stripe** — subprocessor, 95%

## Analytics & monitoring

- **incident.io** — infra, 90%
- **HubSpot** — subprocessor, 85%
- **Sentry** — subprocessor, 85%

## Email & support

- **Google Workspace** — infra, 90%
- **Customer.io** — subprocessor, 85%
- **Intercom** — subprocessor, 85%
- **Mailgun** — subprocessor, 85%

## Team tools (from DNS verification records)

Amp (Sourcegraph) · Apple Business · Cursor · HackerOne · Notion · Postman · Slack

## Evidence

<details><summary><b>Cloudflare</b> · edge · 99%</summary>

- `infra` dns-ns @ lovable.dev: `rafe.ns.cloudflare.com`
- `infra` dns-ns @ lovable.dev: `ivan.ns.cloudflare.com`
- `infra` header @ https://lovable.dev/: `server: cloudflare`
- `infra` header @ https://lovable.dev/: `cf-ray: a4ac37a3acff8e14-MAA`
- `infra` cookie @ https://lovable.dev/: `__cf_bm`
- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…y default) https://supabase.com/ Opens in new tab Cloudflare • Edge routing, DNS & Workers Global cloudflare.c…`

</details>

<details><summary><b>Stripe</b> · payments · 95%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…stack for customer apps N/A https://tanstack.com/ Stripe https://stripe.com/ Payment processing US HubSpot…`
- `mention` legal @ https://lovable.dev/privacy: `…le information, payment information (processed by Stripe; we do not store full card numbers — see stripe.c…`
- `account` dns-txt @ lovable.dev: `stripe-verification=7745a132eb718320ef9b019600b38447c1f01e64f5dd1f552677f417c6d6f26f`
- `account` dns-txt @ lovable.dev: `stripe-verification=B07012203972AF35C48B6824427B5340CEA057BF2A11E1382CD18C11EF6ACF34`

</details>

<details><summary><b>Supabase</b> · backend · 92%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…Central US https://ai.azure.com Opens in new tab Supabase • Customer databases, user authentication data EU…`
- `mention` legal @ https://lovable.dev/privacy: `…ct a third-party integration (for example GitHub, Supabase, or an MCP connector), we receive the data that i…`

</details>

<details><summary><b>Anthropic (Claude)</b> · ai-provider · 90%</summary>

> An anthropic-domain-verification TXT record proves a Claude/Anthropic Console account, not that the product calls the API.

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…com/ Custom domain connection and DNS records. US Anthropic (Claude) https://www.anthropic.com/ Customer prom…`
- `account` dns-txt @ lovable.dev: `anthropic-domain-verification-95vfce=IAyfkWTEKjd9t53RhPHjmGYsS`
- `account` dns-txt @ lovable.dev: `anthropic-domain-verification-c2572d=xa8RKIfn893ZWQCIYxj9rwArr`

</details>

<details><summary><b>Google Workspace</b> · email · 90%</summary>

- `infra` dns-mx @ lovable.dev: `aspmx.l.google.com`
- `infra` dns-mx @ lovable.dev: `alt1.aspmx.l.google.com`
- `infra` dns-mx @ lovable.dev: `alt2.aspmx.l.google.com`
- `infra` dns-mx @ lovable.dev: `aspmx2.googlemail.com`
- `infra` dns-mx @ lovable.dev: `aspmx3.googlemail.com`

</details>

<details><summary><b>incident.io</b> · monitoring · 90%</summary>

- `infra` dns-cname @ status.lovable.dev: `statuspage.incident.io`

</details>

<details><summary><b>Vanta</b> · compliance · 90%</summary>

- `infra` dns-cname @ trust.lovable.dev: `67d1ae1cb4773dbf3d764093.cname.vantatrust.com`

</details>

<details><summary><b>Vercel</b> · hosting · 90%</summary>

- `infra` dns-cname @ docs.lovable.dev: `cname.vercel-dns.com`

</details>

<details><summary><b>AWS</b> · hosting · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…-west4) https://cloud.google.com Opens in new tab Amazon Web Services • Customer applications, databases, file storage…`
- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…ayloads are retained in event history UK (London, AWS eu-west-2) https://temporal.io Opens in new tab M…`

</details>

<details><summary><b>Azure OpenAI / Azure AI Foundry</b> · ai-provider · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…tps://aws.amazon.com/ Opens in new tab Microsoft (Azure AI Foundry) • AI model inference for the AI Gateway EU: West…`

</details>

<details><summary><b>Baseten</b> · ai-infra · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…erence for the Lovable agent. Global fireworks.ai Baseten https://www.baseten.co/ AI model inference for th…`

</details>

<details><summary><b>Browserbase</b> · ai-infra · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…customer data to power search EU Turbopuffer.com Browserbase https://www.browserbase.com/ Customer projects US…`

</details>

<details><summary><b>Customer.io</b> · email · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…ubspot.com Marketing & CRM US https://hubspot.com Customer.io https://customer.io/ Customer engagement US https…`

</details>

<details><summary><b>ElevenLabs</b> · ai-provider · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…nference for the Lovable agent. Global baseten.co ElevenLabs https://elevenlabs.io Speech-to-text, text-to-spe…`

</details>

<details><summary><b>Firecrawl</b> · ai-infra · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…for customer apps and the agent. US perplexity.ai Firecrawl https://www.firecrawl.dev/ Web crawling on custom…`

</details>

<details><summary><b>Google Cloud</b> · hosting · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…pdates Ask a question Subprocessors Subprocessors Google Cloud Platform • Customer applications, databases and platform i…`
- `declared` subprocessors @ https://trust.lovable.dev/: `…rational Security controls Subprocessors View all Google Cloud Platform • Customer applications, databases and platform i…`

</details>

<details><summary><b>Google Gemini / Vertex AI</b> · ai-provider · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…://cloud.google.com/vertex-ai AI model inference (Gemini models) for customer prompts and responses. US https://c…`
- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…Kubernetes Engine, Cloud Run, Spanner, Cloud KMS, Vertex AI EU (Netherlands, europe-west4) https://cloud.goog…`

</details>

<details><summary><b>HubSpot</b> · analytics · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…Stripe https://stripe.com/ Payment processing US HubSpot https://www.hubspot.com Marketing & CRM US https:…`

</details>

<details><summary><b>Intercom</b> · support · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…nal email, email domain management US mailgun.com Intercom https://www.intercom.com/ Customer support commun…`

</details>

<details><summary><b>Mailgun</b> · email · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…r.io/ Customer engagement US https://customer.io/ Mailgun https://www.mailgun.com/ Transactional email, ema…`

</details>

<details><summary><b>OpenAI</b> · ai-provider · 85%</summary>

> An openai-domain-verification TXT record proves an OpenAI account (often ChatGPT Enterprise), not that the product calls the API.

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…responses. US https://cloud.google.com/vertex-ai OpenAI https://openai.com/ Customer prompts, generated c…`

</details>

<details><summary><b>OpenRouter</b> · ai-provider · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…ated code, AI interactions US https://openai.com/ OpenRouter https://openrouter.ai/ LLM inference routing US F…`

</details>

<details><summary><b>Sentry</b> · monitoring · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…https://grafana.com Log/trace/metrics storage US Sentry https://sentry.io/ Performance monitoring US http…`

</details>

<details><summary><b>turbopuffer</b> · ai-infra · 85%</summary>

- `declared` subprocessors @ https://trust.lovable.dev/subprocessors: `…epository US https://github.com/ Opens in new tab Turbopuffer • Indexing customer data to power search EU https…`

</details>

<details><summary><b>Okta</b> · auth · 45%</summary>

- `mention` legal @ https://lovable.dev/security: `…integrates with SAML and OIDC providers including Okta, Azure AD, and Google. SCIM supports automated pr…`

</details>

<details><summary><b>Amp (Sourcegraph)</b> · team-tools · 35%</summary>

- `account` dns-txt @ lovable.dev: `amp-domain-verification-dfy9k3=lPhxodbdvlv0OU92ZSep0nGFJ`

</details>

<details><summary><b>Apple Business</b> · team-tools · 35%</summary>

- `account` dns-txt @ lovable.dev: `apple-domain-verification=jxKj0gdPtRTEq0fU`

</details>

<details><summary><b>Cursor</b> · team-tools · 35%</summary>

- `account` dns-txt @ lovable.dev: `cursor-domain-verification-9m3nsg=8VerTaFVfyU53jD2cHwapzSgF`

</details>

<details><summary><b>HackerOne</b> · team-tools · 35%</summary>

- `account` dns-txt @ lovable.dev: `h1-domain-verification=ma4NHXb8cz4E7cRH8tnTRtipBvjAR3hYqGAUHqtnMzwiipf8`

</details>

<details><summary><b>Microsoft 365</b> · email · 35%</summary>

- `account` dns-txt @ lovable.dev: `MS=ms32653213`
- `account` dns-txt @ lovable.dev: `MS=ms86659436`

</details>

<details><summary><b>Notion</b> · team-tools · 35%</summary>

- `account` dns-txt @ lovable.dev: `notion-domain-verification=mcD3dNYGsdLZsl4EJR2BgTC3WVBhdPw2RDedNmUrEhK`

</details>

<details><summary><b>Postman</b> · team-tools · 35%</summary>

- `account` dns-txt @ lovable.dev: `postman-domain-verification=ffb79bb9c80faf1bb8223db45cd798587f260f74e167153f6f06b185be6c4542aec24eebb04945d0bbb4b8c52fa74b9c99e60b381680348a…`

</details>

<details><summary><b>Slack</b> · team-tools · 35%</summary>

- `account` dns-txt @ lovable.dev: `slack-domain-verification=btcoSYSdlb1jOQA15YSkQOTr6VMOT6OiVrIJ1bQ8`

</details>

## Limitations

- This is an outside-in scan. Calls a backend makes to an LLM API never touch the browser, so they only show up if the company declares them (subprocessor list, trust center, status page) or ships references in client code.
- `DNS account` evidence means the company verified its domain with that vendor. That often means employees use it (e.g. ChatGPT Enterprise, Claude for Work), not that the product calls it.
- `in bundle` means shipped JavaScript references the vendor or model id. Model pickers and marketing pages can mention models that are routed through another provider.
- Run with `--rea` to add live network observation through REA (github.com/morluto/rea).

<details><summary>Collector errors</summary>

- web: https://lovable.dev/: HTTP 403 (bot protection); try --rea or --url with another page

</details>
