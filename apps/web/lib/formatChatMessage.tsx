'use client';

import React from 'react';
import Link from 'next/link';

interface Props {
  text: string;
  isUser?: boolean;
}

/**
 * Formats inline bold (**text**), italics (*text*), and links ([title](url))
 */
function renderInline(content: string, isUser = false): React.ReactNode {
  // Regex to match markdown links [label](url) or bold **text** or italics *text*
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      // Link [label](url)
      const label = match[2];
      const url = match[3];
      const isInternal = url.startsWith('/');
      parts.push(
        isInternal ? (
          <Link
            key={match.index}
            href={url}
            className={isUser ? 'underline font-bold text-white' : 'underline font-bold text-[#008767] hover:text-[#006e53]'}
          >
            {label}
          </Link>
        ) : (
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={isUser ? 'underline font-bold text-white' : 'underline font-bold text-[#008767] hover:text-[#006e53]'}
          >
            {label}
          </a>
        )
      );
    } else if (match[4]) {
      // Bold **text**
      parts.push(
        <strong key={match.index} className={isUser ? 'font-bold text-white' : 'font-bold text-[#0B192C]'}>
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      // Italics *text*
      parts.push(
        <em key={match.index} className="italic">
          {match[5]}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts;
}

/**
 * Parses markdown tables (| col | col |) into mobile cards
 */
function parseTableRows(lines: string[]): { headers: string[]; rows: string[][] } {
  const cleanLines = lines.filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
  if (cleanLines.length === 0) return { headers: [], rows: [] };

  const splitRow = (row: string) =>
    row
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());

  const headers = splitRow(cleanLines[0]);
  const rows: string[][] = [];

  for (let i = 1; i < cleanLines.length; i++) {
    const raw = cleanLines[i];
    // Skip separator line |---|---|
    if (/^[|\s\-:]+$/.test(raw)) continue;
    rows.push(splitRow(raw));
  }

  return { headers, rows };
}

export function ChatMessageFormatted({ text, isUser = false }: Props) {
  if (isUser) {
    return <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">{text}</div>;
  }

  const rawLines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      const { headers, rows } = parseTableRows(tableBuffer);
      if (rows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="my-2 space-y-2">
            {rows.map((row, rIdx) => (
              <div
                key={rIdx}
                className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm text-xs space-y-1 hover:border-[#008767]/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-[#0B192C]">
                    {renderInline(row[0] || 'Item')}
                  </span>
                  {row[2] && (
                    <span className="font-extrabold text-[#008767] bg-[#E6F4F1] px-2 py-0.5 rounded-md border border-[#B2E3D8] text-[11px] shrink-0">
                      {row[2]}
                    </span>
                  )}
                </div>
                {row[1] && (
                  <p className="text-[11px] text-slate-700 leading-normal">
                    <span className="text-slate-400 font-semibold">{headers[1] || 'Details'}: </span>
                    {renderInline(row[1])}
                  </p>
                )}
                {row[3] && (
                  <p className="text-[10px] text-slate-500 leading-normal">
                    <span className="text-slate-400 font-semibold">{headers[3] || 'Locations'}: </span>
                    {renderInline(row[3])}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      }
      tableBuffer = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Check if line is part of a markdown table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableBuffer.push(line);
      continue;
    } else {
      flushTable();
    }

    // Empty line spacer
    if (!trimmed) {
      elements.push(<div key={`spacer-${i}`} className="h-1.5" />);
      continue;
    }

    // Headers (### or ##)
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4 key={`header-${i}`} className="font-extrabold text-[#0B192C] text-xs sm:text-[13px] pt-1.5 pb-0.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008767]" />
          <span>{renderInline(headerText)}</span>
        </h4>
      );
      continue;
    }

    // Numbered step (e.g. "1. ", "10. ")
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const stepContent = numMatch[2];
      elements.push(
        <div key={`step-${i}`} className="flex items-start gap-2 text-xs sm:text-[12.5px] leading-relaxed text-slate-700 my-1">
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#008767] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            {num}
          </span>
          <div className="flex-1">{renderInline(stepContent)}</div>
        </div>
      );
      continue;
    }

    // Bullet items (• or - or *)
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletContent = trimmed.replace(/^([•\-*])\s+/, '');
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 text-xs sm:text-[12.5px] leading-relaxed text-slate-700 my-0.5 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008767] shrink-0 mt-1.5" />
          <div className="flex-1">{renderInline(bulletContent)}</div>
        </div>
      );
      continue;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-[12.5px] leading-relaxed text-slate-800 my-0.5">
        {renderInline(line)}
      </p>
    );
  }

  flushTable();

  return <div className="space-y-0.5">{elements}</div>;
}
