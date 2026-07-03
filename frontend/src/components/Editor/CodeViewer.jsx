/**
 * CodeViewer.jsx — Syntax-highlighted code display
 * Uses a <pre> with basic class-based highlighting for common tokens.
 * Lightweight — no heavy external parser.
 */
import { useMemo } from 'react';
import { getLanguage } from '../../utils/fileUtils';

// Very basic tokenizer for display purposes
function tokenize(code, language) {
  // Return as plain text if very large (perf guard)
  if (code.length > 100_000) return [{ type: 'plain', value: code }];

  const tokens = [];
  // Split by lines, color line numbers separately
  return code.split('\n').map((line, i) => ({ lineNum: i + 1, content: line }));
}

const KEYWORD_REGEX = /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|new|this|async|await|try|catch|throw|typeof|instanceof|null|undefined|true|false|default|switch|case|break|continue|void|delete|in|of|do|yield|static|get|set|type|interface|enum|namespace|module|declare|as|readonly)\b/g;
const STRING_REGEX = /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/g;
const COMMENT_REGEX = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
const NUMBER_REGEX = /\b(\d+\.?\d*)\b/g;
const JSX_TAG_REGEX = /(<\/?[A-Za-z][A-Za-z0-9.]*)/g;

function highlightLine(line) {
  // Simple multi-pass highlighting using spans
  // We escape HTML first then re-insert span tags
  let result = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply color classes via inline style replacements
  result = result
    .replace(COMMENT_REGEX, '<span style="color:#6a7384;font-style:italic">$1</span>')
    .replace(STRING_REGEX, '<span style="color:#a8d8a8">$1</span>')
    .replace(KEYWORD_REGEX, '<span style="color:#c792ea">$1</span>')
    .replace(NUMBER_REGEX, '<span style="color:#f78c6c">$1</span>');

  return result;
}

export default function CodeViewer({ content, filePath }) {
  const language = getLanguage(filePath || '');
  const lines = useMemo(() => (content || '').split('\n'), [content]);

  return (
    <div
      className="h-full overflow-auto scrollable"
      style={{ background: 'var(--bg-base)', fontFamily: 'var(--font-mono)' }}
    >
      <table
        style={{
          borderSpacing: 0,
          fontSize: '13px',
          lineHeight: '1.6',
          minWidth: '100%',
        }}
      >
        <tbody>
          {lines.map((line, i) => (
            <tr
              key={i}
              style={{ verticalAlign: 'top' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Line number */}
              <td
                className="select-none"
                style={{
                  color: 'var(--text-muted)',
                  textAlign: 'right',
                  paddingRight: '16px',
                  paddingLeft: '12px',
                  minWidth: '48px',
                  userSelect: 'none',
                  borderRight: '1px solid var(--border)',
                  fontSize: '12px',
                }}
              >
                {i + 1}
              </td>
              {/* Code content */}
              <td style={{ paddingLeft: '16px', paddingRight: '24px', whiteSpace: 'pre', color: 'var(--text-code)' }}>
                <span dangerouslySetInnerHTML={{ __html: highlightLine(line) }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
