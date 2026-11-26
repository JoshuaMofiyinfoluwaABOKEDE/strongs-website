import "server-only";
import { Marked } from "marked";

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Lesson text is written in Markdown in the admin area. Raw HTML is shown as text,
 * and only http(s) and mailto links are allowed, so a lesson can never run scripts.
 */
const md = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html({ text }) {
      return escape(text);
    },
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens);
      if (!/^(https?:|mailto:|\/)/i.test(href)) return label;
      const external = /^https?:/i.test(href);
      return `<a href="${escape(href)}"${title ? ` title="${escape(title)}"` : ""}${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
    },
    image({ href, text }) {
      if (!/^https?:/i.test(href)) return escape(text);
      return `<img src="${escape(href)}" alt="${escape(text)}" loading="lazy" />`;
    },
  },
});

export function renderMarkdown(src: string): string {
  return md.parse(src || "", { async: false }) as string;
}
