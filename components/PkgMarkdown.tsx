"use client";

// ── Lightweight Markdown → JSX renderer ──────────────────────────────────────
// Handles: headings, code blocks, inline code, bold, italic, links, lists,
// blockquotes, horizontal rules, and paragraphs.

interface Props {
  src: string;
  className?: string;
}

export default function PkgMarkdown({ src, className }: Props) {
  const html = markdownToHtml(src);
  return (
    <div
      className={className}
      style={{ color: "var(--fg-muted)" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Renderer ──────────────────────────────────────────────────────────────────

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(s: string): string {
  return s
    // inline code
    .replace(/`([^`]+)`/g, (_, c) =>
      `<code style="font-family:var(--font-mono);font-size:11.5px;background:var(--surface-3);color:var(--fg);padding:1px 5px;border-radius:3px;border:1px solid var(--border)">${escape(c)}</code>`
    )
    // bold
    .replace(/\*\*([^*]+)\*\*/g, (_, t) =>
      `<strong style="color:var(--fg);font-weight:600">${t}</strong>`
    )
    // italic
    .replace(/\*([^*]+)\*/g, (_, t) =>
      `<em style="color:var(--fg-muted)">${t}</em>`
    )
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) =>
      `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer" style="color:var(--fg);text-decoration:underline;text-underline-offset:2px">${text}</a>`
    );
}

function markdownToHtml(md: string): string {
  const lines  = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let inPara     = false;
  let inList     = false;
  let inOList    = false;
  let inCode     = false;
  let codeLang   = "";
  let codeLines: string[] = [];

  const closePara  = () => { if (inPara)  { out.push("</p>");       inPara  = false; } };
  const closeList  = () => { if (inList)  { out.push("</ul>");      inList  = false; } };
  const closeOList = () => { if (inOList) { out.push("</ol>");      inOList = false; } };
  const closeAll   = () => { closePara(); closeList(); closeOList(); };

  while (i < lines.length) {
    const line = lines[i];

    // ── code fence ──
    if (line.startsWith("```")) {
      if (!inCode) {
        closeAll();
        inCode   = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        inCode = false;
        const langLabel = codeLang
          ? `<span style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-faint);position:absolute;top:8px;right:10px">${escape(codeLang)}</span>`
          : "";
        out.push(
          `<div style="position:relative;margin:14px 0">` +
          langLabel +
          `<pre style="background:var(--surface-2);border:1px solid var(--border);border-radius:6px;padding:14px 16px;overflow-x:auto;font-family:var(--font-mono);font-size:12px;line-height:1.65;color:var(--fg-muted)">` +
          `<code>${codeLines.map(escape).join("\n")}</code>` +
          `</pre></div>`
        );
        codeLines = [];
      }
      i++; continue;
    }
    if (inCode) { codeLines.push(line); i++; continue; }

    // ── blank line ──
    if (!line.trim()) {
      closeAll();
      i++; continue;
    }

    // ── headings ──
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);
    if (h1 || h2 || h3) {
      closeAll();
      const [tag, size, weight, color] = h1
        ? ["h1", "20px", "600", "var(--fg)"]
        : h2
        ? ["h2", "16px", "600", "var(--fg)"]
        : ["h3", "13px", "600", "var(--fg)"];
      const text = (h1 ?? h2 ?? h3)![1];
      const mt   = h1 ? "28px" : h2 ? "22px" : "16px";
      out.push(
        `<${tag} style="font-size:${size};font-weight:${weight};color:${color};` +
        `letter-spacing:-0.02em;margin:${mt} 0 8px;line-height:1.2">` +
        inlineMarkdown(escape(text)) +
        `</${tag}>`
      );
      if (h2) out.push(`<div style="height:1px;background:var(--border-subtle);margin:8px 0 14px"></div>`);
      i++; continue;
    }

    // ── horizontal rule ──
    if (/^---+$/.test(line.trim())) {
      closeAll();
      out.push(`<hr style="border:none;border-top:1px solid var(--border);margin:20px 0" />`);
      i++; continue;
    }

    // ── blockquote ──
    if (line.startsWith("> ")) {
      closeAll();
      out.push(
        `<blockquote style="border-left:2px solid var(--border);padding-left:12px;margin:10px 0;color:var(--fg-faint);font-style:italic">` +
        inlineMarkdown(escape(line.slice(2))) +
        `</blockquote>`
      );
      i++; continue;
    }

    // ── unordered list ──
    if (/^[-*]\s+/.test(line)) {
      closePara(); closeOList();
      if (!inList) { out.push(`<ul style="margin:8px 0 8px 20px;display:flex;flex-direction:column;gap:3px">`); inList = true; }
      out.push(
        `<li style="font-size:13px;line-height:1.6;list-style:disc">` +
        inlineMarkdown(escape(line.replace(/^[-*]\s+/, ""))) +
        `</li>`
      );
      i++; continue;
    }

    // ── ordered list ──
    if (/^\d+\.\s+/.test(line)) {
      closePara(); closeList();
      if (!inOList) { out.push(`<ol style="margin:8px 0 8px 20px;display:flex;flex-direction:column;gap:3px">`); inOList = true; }
      out.push(
        `<li style="font-size:13px;line-height:1.6;list-style:decimal">` +
        inlineMarkdown(escape(line.replace(/^\d+\.\s+/, ""))) +
        `</li>`
      );
      i++; continue;
    }

    // ── paragraph ──
    closeList(); closeOList();
    if (!inPara) {
      out.push(`<p style="font-size:13px;line-height:1.72;margin:8px 0">`);
      inPara = true;
    } else {
      out.push(" ");
    }
    out.push(inlineMarkdown(escape(line)));
    i++;
  }

  closeAll();
  return out.join("");
}