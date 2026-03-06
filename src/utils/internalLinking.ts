type LinkRule = {
  key: string;
  pattern: RegExp;
  href: string;
};

const LINK_RULES: LinkRule[] = [
  { key: 'karate', pattern: /\bkarate\b/i, href: '/programs/karate' },
  { key: 'taekwondo', pattern: /\btaekwondo\b/i, href: '/programs/taekwondo' },
  { key: 'boxing', pattern: /\bboxing\b/i, href: '/programs/boxing' },
  {
    key: 'kickboxing',
    pattern: /\bkickboxing\b/i,
    href: '/programs/kickboxing',
  },
  { key: 'grappling', pattern: /\bgrappling\b/i, href: '/programs/grappling' },
  { key: 'mma', pattern: /\bmma\b/i, href: '/programs/mma' },
  {
    key: 'kalaripayattu',
    pattern: /\bkalaripayattu\b/i,
    href: '/programs/kalaripayattu',
  },
  {
    key: 'self-defense',
    pattern: /\bself[- ]defen[sc]e\b/i,
    href: '/programs/self-defense',
  },
  { key: 'fat-loss', pattern: /\bfat\s+loss\b/i, href: '/programs/fat-loss' },
];

const SKIP_PARENTS = new Set(['a', 'script', 'style', 'code', 'pre']);

function findEarliestMatch(
  text: string,
  usedKeys: Set<string>
): { rule: LinkRule; index: number; match: string } | null {
  let earliest: { rule: LinkRule; index: number; match: string } | null = null;

  for (const rule of LINK_RULES) {
    if (usedKeys.has(rule.key)) continue;

    const result = rule.pattern.exec(text);
    if (!result || result.index < 0) continue;

    if (!earliest || result.index < earliest.index) {
      earliest = {
        rule,
        index: result.index,
        match: result[0],
      };
    }
  }

  return earliest;
}

export function injectContextualInternalLinks(
  html: string,
  maxLinks = 5
): string {
  if (!html || typeof window === 'undefined' || !window.DOMParser) {
    return html;
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(
    `<div id="root">${html}</div>`,
    'text/html'
  );
  const root = doc.getElementById('root');

  if (!root) return html;

  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  let currentNode = walker.nextNode();
  while (currentNode) {
    const textNode = currentNode as Text;
    const parentTag = textNode.parentElement?.tagName.toLowerCase();

    if (
      textNode.nodeValue?.trim() &&
      parentTag &&
      !SKIP_PARENTS.has(parentTag)
    ) {
      textNodes.push(textNode);
    }

    currentNode = walker.nextNode();
  }

  const usedKeys = new Set<string>();
  let insertedLinks = 0;

  for (const textNode of textNodes) {
    if (insertedLinks >= maxLinks) break;

    const originalText = textNode.nodeValue || '';
    let remaining = originalText;
    const fragment = doc.createDocumentFragment();
    let changed = false;

    while (remaining.length > 0 && insertedLinks < maxLinks) {
      const earliest = findEarliestMatch(remaining, usedKeys);
      if (!earliest) break;

      const { rule, index, match } = earliest;
      const before = remaining.slice(0, index);
      const afterStart = index + match.length;

      if (before) {
        fragment.appendChild(doc.createTextNode(before));
      }

      const anchor = doc.createElement('a');
      anchor.setAttribute('href', rule.href);
      anchor.setAttribute('title', `Learn more about ${match}`);
      anchor.textContent = match;
      fragment.appendChild(anchor);

      usedKeys.add(rule.key);
      insertedLinks += 1;
      changed = true;

      remaining = remaining.slice(afterStart);
    }

    if (!changed) continue;

    if (remaining) {
      fragment.appendChild(doc.createTextNode(remaining));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  return root.innerHTML;
}
