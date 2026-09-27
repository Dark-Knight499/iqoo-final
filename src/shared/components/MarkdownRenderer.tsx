import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  maxHeight?: string;
  searchQuery?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  maxHeight = '520px',
  searchQuery = '',
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Helper for inline markdown: bold, italic, code, links
  const renderInline = (text: string): React.ReactNode => {
    if (!text) return null;

    // Highlight search query if provided
    if (searchQuery && searchQuery.trim().length > 1) {
      const q = searchQuery.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
      if (parts.length > 1) {
        return parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark
              key={i}
              style={{
                backgroundColor: 'rgba(0, 220, 130, 0.35)',
                color: '#fff',
                padding: '0 2px',
                borderRadius: '3px',
              }}
            >
              {part}
            </mark>
          ) : (
            <React.Fragment key={i}>{renderInlineFormatting(part)}</React.Fragment>
          )
        );
      }
    }

    return renderInlineFormatting(text);
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Regex for inline code: `code`
    // Regex for bold italic: ***text*** or ___text___
    // Regex for bold: **text** or __text__
    // Regex for italic: *text* or _text_
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Pattern matches `code`, **bold**, *italic*, [text](url)
    const pattern = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(remaining.substring(lastIndex, match.index));
      }

      const matchStr = match[0];
      if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
        const code = matchStr.slice(1, -1);
        tokens.push(
          <code
            key={keyIdx++}
            style={{
              padding: '2px 6px',
              borderRadius: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--ai-accent)',
              fontSize: '11px',
              fontFamily: 'monospace',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {code}
          </code>
        );
      } else if (matchStr.startsWith('***') && matchStr.endsWith('***')) {
        tokens.push(
          <strong key={keyIdx++} style={{ color: '#fff', fontStyle: 'italic' }}>
            {matchStr.slice(3, -3)}
          </strong>
        );
      } else if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
        tokens.push(
          <strong key={keyIdx++} style={{ color: '#fff', fontWeight: 700 }}>
            {matchStr.slice(2, -2)}
          </strong>
        );
      } else if (matchStr.startsWith('*') && matchStr.endsWith('*')) {
        tokens.push(
          <em key={keyIdx++} style={{ color: 'var(--text-secondary)' }}>
            {matchStr.slice(1, -1)}
          </em>
        );
      } else if (matchStr.startsWith('[') && matchStr.includes('](') && matchStr.endsWith(')')) {
        const closeBracket = matchStr.indexOf('](');
        const label = matchStr.slice(1, closeBracket);
        const url = matchStr.slice(closeBracket + 2, -1);
        tokens.push(
          <a
            key={keyIdx++}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--ai-accent)',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            {label}
          </a>
        );
      }

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < remaining.length) {
      tokens.push(remaining.substring(lastIndex));
    }

    return tokens.length > 0 ? tokens : text;
  };

  // Parse lines into structured blocks
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let i = 0;
  let blockIdx = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code blocks (```lang ... ```)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      const fullCode = codeLines.join('\n');
      const curIdx = blockIdx++;

      elements.push(
        <div
          key={`code-${curIdx}`}
          style={{
            margin: '12px 0',
            borderRadius: '10px',
            backgroundColor: '#070a09',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid var(--border-color)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={12} color="var(--ai-accent)" />
              <span>{lang || 'code'}</span>
            </div>
            <button
              onClick={() => handleCopyCode(fullCode, curIdx)}
              style={{
                background: 'none',
                border: 'none',
                color: copiedCodeIdx === curIdx ? 'var(--ai-accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {copiedCodeIdx === curIdx ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedCodeIdx === curIdx ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '11px',
              lineHeight: 1.5,
              color: '#d4d4d4',
              overflowX: 'auto',
              whiteSpace: 'pre',
            }}
          >
            {fullCode}
          </pre>
        </div>
      );
      continue;
    }

    // 2. Horizontal divider: --- or ***
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      elements.push(
        <div
          key={`hr-${blockIdx++}`}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)',
            margin: '16px 0',
          }}
        />
      );
      i++;
      continue;
    }

    // 3. Headers
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${blockIdx++}`}
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#fff',
            margin: '18px 0 10px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '4px',
              height: '18px',
              backgroundColor: 'var(--ai-accent)',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${blockIdx++}`}
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--ai-accent)',
            margin: '16px 0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${blockIdx++}`}
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#fff',
            margin: '12px 0 6px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '4px 8px',
            borderRadius: '6px',
            borderLeft: '3px solid var(--ai-accent)',
          }}
        >
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${blockIdx++}`}
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            margin: '10px 0 4px',
          }}
        >
          {renderInline(trimmed.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // 4. Blockquotes: > quote
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${blockIdx++}`}
          style={{
            margin: '10px 0',
            padding: '10px 14px',
            backgroundColor: 'rgba(0, 220, 130, 0.05)',
            borderLeft: '3px solid var(--ai-accent)',
            borderRadius: '0 8px 8px 0',
            fontSize: '12px',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}
        >
          {quoteLines.map((ql, qIdx) => (
            <div key={qIdx}>{renderInline(ql)}</div>
          ))}
        </blockquote>
      );
      continue;
    }

    // 5. Unordered List Items: - or *
    if (/^(\s*)[-*]\s+/.test(line)) {
      const indentMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
      const indentLevel = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0;
      const textPart = indentMatch ? indentMatch[2] : trimmed.slice(2);

      // Check if line is key-value formatted: **Key**: Value
      const kvMatch = textPart.match(/^\*\*([^*]+)\*\*:\s*(.*)$/);

      elements.push(
        <div
          key={`li-${blockIdx++}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginLeft: `${indentLevel * 14}px`,
            margin: '4px 0',
            fontSize: '12px',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: 'var(--ai-accent)',
              marginTop: '7px',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            {kvMatch ? (
              <>
                <strong style={{ color: '#fff', marginRight: '6px' }}>{kvMatch[1]}:</strong>
                <span>{renderInline(kvMatch[2])}</span>
              </>
            ) : (
              renderInline(textPart)
            )}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 6. Ordered List: 1. , 2. , etc.
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      elements.push(
        <div
          key={`ol-${blockIdx++}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            margin: '5px 0',
            fontSize: '12px',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-3)',
              color: 'var(--ai-accent)',
              fontSize: '10px',
              fontWeight: 700,
              flexShrink: 0,
              marginTop: '1px',
              border: '1px solid var(--border-color)',
            }}
          >
            {orderedMatch[1]}
          </span>
          <div style={{ flex: 1 }}>{renderInline(orderedMatch[2])}</div>
        </div>
      );
      i++;
      continue;
    }

    // 7. Empty line
    if (!trimmed) {
      elements.push(<div key={`empty-${blockIdx++}`} style={{ height: '6px' }} />);
      i++;
      continue;
    }

    // 8. Regular paragraph
    elements.push(
      <p
        key={`p-${blockIdx++}`}
        style={{
          margin: '6px 0',
          fontSize: '12px',
          lineHeight: 1.55,
          color: 'var(--text-secondary)',
        }}
      >
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return (
    <div
      style={{
        maxHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '6px',
        wordBreak: 'break-word',
      }}
    >
      {elements}
    </div>
  );
};
