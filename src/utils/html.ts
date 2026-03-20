export const stripHtmlTags = (html: string): string => {
  if (!html) return '';

  // Remove HTML tags
  let text = html.replace(/<[^>]*>?/gm, '');

  // Decode a few common HTML entities that we see in WordPress content
  // (numeric and named variants).
  return text
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    // WordPress often appends bracketed ellipsis markers in excerpts.
    .replace(/\[\s*(?:…|\.{3}|&hellip;|&#8230;)\s*\]/gi, '…')
    .trim();
};
