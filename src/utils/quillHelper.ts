// @/utils/quillHelpers.ts
import Quill from 'quill';

const Delta = Quill.import('delta');

function isSafeHref(href: string): boolean {
  const h = (href || '').trim().toLowerCase();
  return (
    h.startsWith('http://') ||
    h.startsWith('https://') ||
    h.startsWith('/') ||
    h.startsWith('mailto:')
  );
}

/** Keep only formatting your toolbar supports */
function sanitizeAttributes(
  attrs: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!attrs) return undefined;
  const next: Record<string, unknown> = {};
  if (attrs.bold) next.bold = true;
  if (attrs.italic) next.italic = true;
  if (attrs.underline) next.underline = true;
  if (attrs.strike) next.strike = true;
  if (attrs.link && typeof attrs.link === 'string' && isSafeHref(attrs.link)) {
    next.link = attrs.link;
  }
  // lists / headers if you use them in toolbar:
  if (attrs.list) next.list = attrs.list;
  if (attrs.header) next.header = attrs.header;
  if (attrs.blockquote) next.blockquote = true;
  return Object.keys(next).length ? next : undefined;
}

function sanitizeDelta(delta: any): any {
  if (!delta?.ops?.length) return new Delta({ ops: [] });
  return new Delta({
    ops: delta.ops.map((op: any) => {
      if (typeof op.insert === 'string') {
        return { insert: op.insert, attributes: sanitizeAttributes(op.attributes) };
      }
      // Block embed inserts (images, video, etc.)
      if (op.insert && typeof op.insert === 'object') {
        return { insert: '' }; // drop embed
      }
      return op;
    }),
  });
}

export function createQuill(
  editorElement: HTMLElement,
  toolbarElement: HTMLElement,
  readOnly: boolean,
  placeholder: string,
  theme: string
) {
  const quill = new Quill(editorElement, {
    modules: {
      toolbar: toolbarElement,
      clipboard: {
        matchVisual: false, // reduces “mystery” visual matching quirks
        matchers: [
          ['img', () => new Delta()],
          ['picture', () => new Delta()],
          ['video', () => new Delta()],
          ['iframe', () => new Delta()],
          ['embed', () => new Delta()],
          ['object', () => new Delta()],
          ['figure', () => new Delta()],
          ['font', () => new Delta()],

          ['a', (node: HTMLElement, delta: any) => {
            const href = node.getAttribute('href') || '';
            if (!isSafeHref(href)) {
              // keep text, drop link
              return sanitizeDelta(delta);
            }
            return sanitizeDelta(delta);
          }],

          // Any element node: strip junk attrs, keep text + allowed marks
          [Node.ELEMENT_NODE, (_node: Node, delta: any) => sanitizeDelta(delta)],
        ],
      },
    },
    placeholder,
    theme,
    readOnly,
  });

  // Block image/file paste (clipboard matchers don't always see these)
  quill.root.addEventListener('paste', (e: ClipboardEvent) => {
  const dt = e.clipboardData;
  if (!dt) return;

  const items = dt.items; // DataTransferItemList | undefined in some lib versions
  if (!items || items.length === 0) return;

  const itemArray = Array.from(items);
  const hasImage = itemArray.some((item) => item.type.startsWith('image/'));
  const text = dt.getData('text/plain') ?? '';

  if (hasImage && !text.trim()) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if (hasImage && text.trim()) {
    e.preventDefault();
    e.stopPropagation();
    const range = quill.getSelection(true);
    const index = range?.index ?? quill.getLength();
    quill.insertText(index, text, 'user');
  }
}, true);
  // Better selective image block (allow text, deny image files)
  quill.root.addEventListener('paste', (e: ClipboardEvent) => {
    const dt = e.clipboardData;
    if (!dt) return;

    const hasImage = [...(dt.items || [])].some(
      (item) => item.type.startsWith('image/')
    );
    const text = dt.getData('text/plain');

    if (hasImage && !text) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (hasImage && text) {
      e.preventDefault();
      e.stopPropagation();
      const range = quill.getSelection(true);
      quill.insertText(range?.index ?? 0, text, Quill.sources.USER);
    }
  }, true);

  // Block drop of images
  quill.root.addEventListener('drop', (e: DragEvent) => {
    const types = e.dataTransfer?.types;
    if (types && [...types].includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  (editorElement as any).__quill = quill;
  return quill;
}

export function setHtml(editorElement: HTMLElement, html: string) {
  const quill = (editorElement as any).__quill as Quill | undefined;
  if (!quill) return;
  const cleaned = html || '';
  quill.setContents(quill.clipboard.convert({ html: cleaned }), Quill.sources.SILENT);
}

export function getQuillHTML(editorElement: HTMLElement): string {
  const quill = (editorElement as any).__quill as Quill | undefined;
  return quill ? quill.root.innerHTML : '';
}


export function destroyQuill(editorElement: HTMLElement) {
  if ((editorElement as any).__quill) {
    delete (editorElement as any).__quill;
  }
}