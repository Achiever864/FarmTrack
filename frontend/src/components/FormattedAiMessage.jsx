import React from "react";

/**
 * Parses inline markdown: bold, italic, code pills, status badges, links
 */
function renderInline(text, isDark = true) {
  if (!text) return null;

  // Split tokens by inline code, bold, italic, links
  // Regex matches: `code`, **bold**, *italic*, [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Inline code or status badge: `code`
    if (part.startsWith("`") && part.endsWith("`")) {
      const codeVal = part.slice(1, -1).trim();
      const upper = codeVal.toUpperCase();

      // Special Status Badges
      if (upper === "AT_RISK" || upper === "CRITICAL" || upper === "STRESS" || upper === "DECLINE") {
        return (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 tracking-wide mx-1"
          >
            {codeVal}
          </span>
        );
      }
      if (upper === "HEALTHY") {
        return (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tracking-wide mx-1"
          >
            {codeVal}
          </span>
        );
      }
      if (upper === "WATCH" || upper === "WARNING" || upper === "DROUGHT" || upper === "PATCHY") {
        return (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wide mx-1"
          >
            {codeVal}
          </span>
        );
      }

      // Default code pill
      return (
        <code
          key={i}
          className={`px-1.5 py-0.5 rounded font-mono text-[11px] mx-0.5 ${
            isDark
              ? "bg-slate-900/90 text-emerald-300 border border-slate-700/80"
              : "bg-slate-100 text-emerald-800 border border-slate-200"
          }`}
        >
          {codeVal}
        </code>
      );
    }

    // Bold text: **bold**
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldVal = part.slice(2, -2);
      return (
        <strong
          key={i}
          className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}
        >
          {renderInline(boldVal, isDark)}
        </strong>
      );
    }

    // Italic text: *italic*
    if (part.startsWith("*") && part.endsWith("*")) {
      const italicVal = part.slice(1, -1);
      return (
        <em key={i} className={`italic ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          {renderInline(italicVal, isDark)}
        </em>
      );
    }

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

/**
 * Rich Formatted AI Markdown Renderer for FarmTrack
 */
export function FormattedAiMessage({ content, isDark = true, className = "" }) {
  if (!content) return null;

  // Split lines
  const rawLines = content.split("\n");
  const blocks = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // 1. Empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Horizontal Rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({
        type: "hr",
      });
      i++;
      continue;
    }

    // 3. Fenced Code Block (``` ... ```)
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < rawLines.length && !rawLines[i].trim().startsWith("```")) {
        codeLines.push(rawLines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: "codeblock",
        lang,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // 4. Headings
    if (trimmed.startsWith("#### ")) {
      blocks.push({ type: "h4", text: trimmed.slice(5) });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4) });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3) });
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", text: trimmed.slice(2) });
      i++;
      continue;
    }

    // 5. Blockquote (> ...)
    if (trimmed.startsWith("> ")) {
      const quoteLines = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith("> ")) {
        quoteLines.push(rawLines[i].trim().slice(2));
        i++;
      }
      blocks.push({
        type: "blockquote",
        text: quoteLines.join(" "),
      });
      continue;
    }

    // 6. Markdown Table (| col | col |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith("|") && rawLines[i].trim().endsWith("|")) {
        tableLines.push(rawLines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        blocks.push({
          type: "table",
          lines: tableLines,
        });
        continue;
      }
    }

    // 7. Lists (Bullet and Numbered, with nested indentation support)
    const isBullet = /^(\s*)([*•\-]|(\d+\.))\s+/.test(line);
    if (isBullet) {
      const listItems = [];
      while (i < rawLines.length) {
        const currLine = rawLines[i];
        const match = currLine.match(/^(\s*)([*•\-]|(\d+\.))\s+(.*)$/);
        if (match) {
          const indent = match[1].length;
          const marker = match[2];
          const text = match[4];
          listItems.push({
            indent,
            isNumbered: /^\d+\./.test(marker),
            marker,
            text,
          });
          i++;
        } else if (currLine.trim() === "") {
          // If next line is also a list item, allow empty line
          if (i + 1 < rawLines.length && /^(\s*)([*•\-]|(\d+\.))\s+/.test(rawLines[i + 1])) {
            i++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      blocks.push({
        type: "list",
        items: listItems,
      });
      continue;
    }

    // 8. Paragraph
    const paraLines = [trimmed];
    i++;
    while (
      i < rawLines.length &&
      rawLines[i].trim() !== "" &&
      !/^(\-{3,}|\*{3,}|_{3,})$/.test(rawLines[i].trim()) &&
      !rawLines[i].trim().startsWith("#") &&
      !rawLines[i].trim().startsWith("> ") &&
      !rawLines[i].trim().startsWith("```") &&
      !/^(\s*)([*•\-]|(\d+\.))\s+/.test(rawLines[i]) &&
      !(rawLines[i].trim().startsWith("|") && rawLines[i].trim().endsWith("|"))
    ) {
      paraLines.push(rawLines[i].trim());
      i++;
    }

    blocks.push({
      type: "p",
      text: paraLines.join(" "),
    });
  }

  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        // Headings
        if (block.type === "h1") {
          return (
            <h1
              key={idx}
              className={`text-lg sm:text-xl font-extrabold tracking-tight mt-4 mb-2 pb-1.5 border-b ${
                isDark
                  ? "text-white border-slate-700/80"
                  : "text-slate-900 border-slate-200"
              }`}
            >
              {renderInline(block.text, isDark)}
            </h1>
          );
        }
        if (block.type === "h2") {
          return (
            <h2
              key={idx}
              className={`text-base sm:text-lg font-bold tracking-tight mt-4 mb-2 flex items-center gap-2 ${
                isDark ? "text-emerald-400" : "text-emerald-800"
              }`}
            >
              {renderInline(block.text, isDark)}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3
              key={idx}
              className={`text-sm sm:text-base font-bold tracking-tight mt-3 mb-1.5 flex items-center gap-2 ${
                isDark ? "text-emerald-300" : "text-forest-800"
              }`}
            >
              {renderInline(block.text, isDark)}
            </h3>
          );
        }
        if (block.type === "h4") {
          return (
            <h4
              key={idx}
              className={`text-xs sm:text-sm font-semibold tracking-wide uppercase mt-2.5 mb-1 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {renderInline(block.text, isDark)}
            </h4>
          );
        }

        // Horizontal Rule
        if (block.type === "hr") {
          return (
            <hr
              key={idx}
              className={`my-3.5 border-t ${
                isDark ? "border-slate-700/60" : "border-slate-200"
              }`}
            />
          );
        }

        // Blockquote
        if (block.type === "blockquote") {
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border-l-4 text-xs my-2 ${
                isDark
                  ? "bg-slate-900/60 border-emerald-500 text-slate-300"
                  : "bg-emerald-50/80 border-emerald-600 text-slate-700"
              }`}
            >
              {renderInline(block.text, isDark)}
            </div>
          );
        }

        // Fenced Code Block
        if (block.type === "codeblock") {
          return (
            <div
              key={idx}
              className="rounded-xl overflow-hidden my-3 border border-slate-700/80 bg-slate-950 font-mono text-xs shadow-md"
            >
              {block.lang && (
                <div className="bg-slate-900 px-3 py-1 text-[10px] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  {block.lang}
                </div>
              )}
              <pre className="p-3 overflow-x-auto text-emerald-300">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        // Table
        if (block.type === "table") {
          const headerRow = block.lines[0]
            .split("|")
            .slice(1, -1)
            .map((s) => s.trim());
          const bodyRows = block.lines
            .slice(2)
            .map((row) =>
              row
                .split("|")
                .slice(1, -1)
                .map((s) => s.trim())
            );

          return (
            <div
              key={idx}
              className="my-3 overflow-x-auto rounded-xl border border-slate-700/80 shadow-sm"
            >
              <table className="min-w-full text-xs text-left">
                <thead
                  className={
                    isDark ? "bg-slate-900/90 text-white" : "bg-slate-100 text-slate-800"
                  }
                >
                  <tr>
                    {headerRow.map((h, hi) => (
                      <th key={hi} className="px-3 py-2 font-semibold border-b border-slate-700">
                        {renderInline(h, isDark)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                  {bodyRows.map((cols, ri) => (
                    <tr
                      key={ri}
                      className={
                        ri % 2 === 0
                          ? isDark
                            ? "bg-slate-800/40"
                            : "bg-white"
                          : isDark
                          ? "bg-slate-800/80"
                          : "bg-slate-50"
                      }
                    >
                      {cols.map((c, ci) => (
                        <td key={ci} className="px-3 py-2">
                          {renderInline(c, isDark)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // List
        if (block.type === "list") {
          return (
            <div key={idx} className="space-y-1.5 my-2">
              {block.items.map((item, itemIdx) => {
                const isSubItem = item.indent > 0;

                return (
                  <div
                    key={itemIdx}
                    className={`flex items-start gap-2.5 ${
                      isSubItem ? "ml-5 text-slate-300 text-[11px] sm:text-xs" : "text-xs sm:text-sm"
                    }`}
                  >
                    {item.isNumbered ? (
                      <span
                        className={`inline-flex items-center justify-center shrink-0 w-4 h-4 rounded-full text-[10px] font-bold mt-0.5 ${
                          isDark
                            ? "bg-emerald-950 border border-emerald-500/50 text-emerald-400"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}
                      >
                        {item.marker.replace(".", "")}
                      </span>
                    ) : (
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${
                          isSubItem
                            ? isDark
                              ? "bg-slate-500"
                              : "bg-slate-400"
                            : isDark
                            ? "bg-emerald-400"
                            : "bg-forest-600"
                        }`}
                      />
                    )}
                    <div className="flex-1 leading-relaxed">
                      {renderInline(item.text, isDark)}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Paragraph
        return (
          <p
            key={idx}
            className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {renderInline(block.text, isDark)}
          </p>
        );
      })}
    </div>
  );
}
