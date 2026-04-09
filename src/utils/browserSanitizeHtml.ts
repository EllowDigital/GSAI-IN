type SanitizeOptions = {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
};

const DEFAULT_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'blockquote',
  'pre',
  'code',
  'span',
  'div',
];

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel', 'class'],
  img: ['src', 'alt', 'title', 'class'],
  '*': ['class'],
};

const NEVER_ALLOW_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
]);

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed) return false;

  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return false;
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return true;
  }

  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  );
}

function unwrapNode(node: Element) {
  const parent = node.parentNode;
  if (!parent) return;

  while (node.firstChild) {
    parent.insertBefore(node.firstChild, node);
  }

  parent.removeChild(node);
}

function sanitizeElementTree(
  root: Element,
  allowedTags: Set<string>,
  allowedAttributes: Record<string, string[]>
) {
  const elements = Array.from(root.querySelectorAll('*'));

  for (const el of elements) {
    const tag = el.tagName.toLowerCase();

    if (!allowedTags.has(tag)) {
      if (NEVER_ALLOW_TAGS.has(tag)) {
        el.remove();
      } else {
        unwrapNode(el);
      }
      continue;
    }

    const allowedForTag = new Set([
      ...(allowedAttributes['*'] || []),
      ...(allowedAttributes[tag] || []),
    ]);

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (!allowedForTag.has(name)) {
        el.removeAttribute(attr.name);
        continue;
      }

      if ((name === 'href' || name === 'src') && !isSafeUrl(value)) {
        el.removeAttribute(attr.name);
        continue;
      }
    }

    if (tag === 'a' && el.getAttribute('target') === '_blank') {
      const currentRel = (el.getAttribute('rel') || '').toLowerCase();
      const relParts = new Set(currentRel.split(/\s+/).filter(Boolean));
      relParts.add('noopener');
      relParts.add('noreferrer');
      el.setAttribute('rel', Array.from(relParts).join(' '));
    }
  }
}

export function sanitizeHtmlForClient(
  html: string,
  options: SanitizeOptions = {}
): string {
  if (!html || typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html || '';
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const allowedTags = new Set(
    (options.allowedTags || DEFAULT_ALLOWED_TAGS).map((tag) => tag.toLowerCase())
  );
  const allowedAttributes = options.allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES;

  sanitizeElementTree(doc.body, allowedTags, allowedAttributes);

  return doc.body.innerHTML;
}
