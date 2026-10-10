export type CitationSource = {
  url: string;
  title?: string;
  // The site's name on the chip. Without it, the chip names the site after its domain.
  name?: string;
  domain?: string;
  favicon?: string;
  image?: string;
  snippet?: string;
};

export function sourceHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function sourceDomain(source: CitationSource) {
  if (source.domain) return source.domain;
  try {
    return new URL(sourceHref(source.url)).hostname.replace(/^www\./, "");
  } catch {
    return source.url.split("/")[0] ?? source.url;
  }
}

// "developer.mozilla.org" becomes "Mozilla" and "my-site.dev" becomes "My Site".
export function sourceName(source: CitationSource) {
  if (source.name) return source.name;
  const domain = sourceDomain(source);
  const base = domain.split(".").filter(Boolean).at(-2) ?? domain;
  return base
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function sourceTitle(source: CitationSource) {
  return source.title ?? sourceDomain(source);
}
