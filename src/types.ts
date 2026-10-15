export type SignalSource =
  | "dns-txt"
  | "dns-cname"
  | "dns-ns"
  | "dns-mx"
  | "header"
  | "cookie"
  | "html"
  | "resource"
  | "bundle"
  | "csp"
  | "subprocessors"
  | "legal"
  | "status"
  | "runtime";

/** How strong a piece of evidence is, from strongest to weakest. */
export type EvidenceTier = "observed" | "infra" | "declared" | "bundle" | "config" | "mention" | "account";

export interface Signal {
  source: SignalSource;
  /** The raw value: a TXT record, a "name: value" header, a hostname, page text, etc. */
  value: string;
  /** Where it was found: a URL, a DNS name, a page. */
  location: string;
}

export type Category =
  | "ai-provider"
  | "ai-infra"
  | "hosting"
  | "edge"
  | "framework"
  | "backend"
  | "auth"
  | "payments"
  | "analytics"
  | "monitoring"
  | "email"
  | "support"
  | "compliance"
  | "team-tools";

export interface SignatureMatch {
  dnsTxt?: string[];
  cname?: string[];
  ns?: string[];
  mx?: string[];
  /** Matched against "header-name: value" (header name lowercased). */
  headers?: string[];
  cookies?: string[];
  html?: string[];
  /** Matched against hostnames seen in resources, CSP, runtime traffic, and bundle text. */
  hosts?: string[];
  /** Matched against JavaScript bundle text. Case-sensitive. */
  js?: string[];
  /** Matched against subprocessor / privacy / trust / status page text. Case-sensitive, so write proper nouns as they're spelled. */
  text?: string[];
}

export interface Signature {
  id: string;
  name: string;
  category: Category;
  website?: string;
  match: SignatureMatch;
  /** Regexes that extract model ids (e.g. gpt-4o) from bundle text. */
  models?: string[];
  /** Notes shown in the report, e.g. caveats about what a match does and doesn't prove. */
  note?: string;
}

export interface Evidence {
  tier: EvidenceTier;
  source: SignalSource;
  pattern: string;
  matched: string;
  location: string;
}

export interface Finding {
  id: string;
  name: string;
  category: Category;
  website?: string;
  confidence: number;
  /** Strongest tier among the evidence. */
  tier: EvidenceTier;
  evidence: Evidence[];
  models: string[];
  note?: string;
}

export interface CollectorError {
  collector: string;
  message: string;
}

export interface Scan {
  target: string;
  domain: string;
  finalUrl?: string;
  scannedAt: string;
  signals: Signal[];
  bundleText: string;
  pages: { url: string; kind: string; status: number }[];
  errors: CollectorError[];
}

export interface Report {
  target: string;
  domain: string;
  finalUrl?: string;
  scannedAt: string;
  findings: Finding[];
  pages: Scan["pages"];
  errors: CollectorError[];
  stats: { signals: number; bundleBytes: number };
}
