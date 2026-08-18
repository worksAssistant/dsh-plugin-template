/**
 * dsh-plugin-cheatsheet — 「工具」页：日常开发交互工具，全部本地零依赖。
 *
 *  - 正则表达式实时测试（匹配高亮 + 错误提示）
 *  - JSON 格式化 / 校验
 *  - 时间戳 ↔ 日期（双向）
 *  - Base64 / URL 编解码（UTF-8 安全）
 *  - Cron 表达式生成（预设 + 自定义 + 中文描述）
 *  - 文本行 Diff 对比
 */
import { useMemo, useState } from 'react'
import type { CSSProperties, ReactElement, ReactNode } from 'react'

const styles: Record<string, CSSProperties> = {
  toolCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(127,127,127,0.18)',
    background: 'rgba(127,127,127,0.05)',
  },
  toolTitle: { margin: 0, fontSize: 14, fontWeight: 600 },
  label: { fontSize: 12, opacity: 0.7 },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  input: {
    flex: 1,
    minWidth: 120,
    padding: '6px 10px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid rgba(127,127,127,0.35)',
    background: 'transparent',
    color: 'inherit',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 64,
    padding: '6px 10px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid rgba(127,127,127,0.35)',
    background: 'transparent',
    color: 'inherit',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    resize: 'vertical',
  },
  output: {
    margin: 0,
    padding: '8px 10px',
    borderRadius: 6,
    background: 'rgba(127,127,127,0.12)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  outputOk: {
    margin: 0,
    padding: '8px 10px',
    borderRadius: 6,
    background: 'rgba(46,160,67,0.14)',
    color: 'inherit',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  outputErr: {
    margin: 0,
    padding: '8px 10px',
    borderRadius: 6,
    background: 'rgba(248,81,73,0.16)',
    color: 'inherit',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  button: {
    padding: '4px 12px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid rgba(127,127,127,0.35)',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
  },
  buttonActive: {
    padding: '4px 12px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid transparent',
    background: 'rgba(77,115,230,0.85)',
    color: '#fff',
    cursor: 'pointer',
  },
  hit: { background: 'rgba(255,196,0,0.45)', borderRadius: 3 },
  diffSame: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12.5,
    padding: '1px 6px',
    whiteSpace: 'pre-wrap',
  },
  diffDel: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12.5,
    padding: '1px 6px',
    whiteSpace: 'pre-wrap',
    background: 'rgba(248,81,73,0.18)',
    textDecoration: 'line-through',
  },
  diffAdd: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12.5,
    padding: '1px 6px',
    whiteSpace: 'pre-wrap',
    background: 'rgba(46,160,67,0.18)',
  },
}

function ToolCard({ title, children }: { title: string; children: ReactNode }): ReactElement {
  return (
    <section style={styles.toolCard}>
      <h3 style={styles.toolTitle}>{title}</h3>
      {children}
    </section>
  )
}

/* ── 正则表达式实时测试 ─────────────────────────────── */

function RegexTool(): ReactElement {
  const [pattern, setPattern] = useState('(\\d{4})-(\\d{2})-(\\d{2})')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('会议定于 2026-08-17 与 2026-08-18 两天举行。')

  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      const nodes: { t: string; hit: boolean }[] = []
      const matches: { text: string; index: number }[] = []
      let last = 0
      let guard = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(text)) !== null && guard++ < 5000) {
        if (m[0].length === 0) {
          re.lastIndex += 1
          continue
        }
        nodes.push({ t: text.slice(last, m.index), hit: false }, { t: m[0], hit: true })
        matches.push({ text: m[0], index: m.index })
        last = m.index + m[0].length
        if (m.index === re.lastIndex) re.lastIndex += 1
      }
      nodes.push({ t: text.slice(last), hit: false })
      return { error: null as string | null, matches, nodes }
    } catch (e) {
      return { error: (e as Error).message, matches: [], nodes: [] }
    }
  }, [pattern, flags, text])

  return (
    <ToolCard title="正则表达式实时测试">
      <div style={styles.row}>
        <span style={styles.label}>模式</span>
        <input style={styles.input} value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} />
        <span style={styles.label}>标志</span>
        <input
          style={{ ...styles.input, minWidth: 60, maxWidth: 90 }}
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          spellCheck={false}
        />
      </div>
      <textarea style={styles.textarea} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      {result.error ? (
        <pre style={styles.outputErr}>{result.error}</pre>
      ) : (
        <>
          <div style={styles.output}>
            {result.nodes.map((n, i) =>
              n.hit ? (
                <mark key={i} style={styles.hit}>
                  {n.t}
                </mark>
              ) : (
                <span key={i}>{n.t}</span>
              ),
            )}
          </div>
          <div style={styles.label}>
            共 {result.matches.length} 处匹配
            {result.matches.length > 0 && `，首个「${result.matches[0].text}」@${result.matches[0].index}`}
          </div>
        </>
      )}
    </ToolCard>
  )
}

/* ── JSON 格式化 / 校验 ─────────────────────────────── */

function JsonTool(): ReactElement {
  const [src, setSrc] = useState('{"name":"dsh-plugin","version":"0.1.0"}')
  const out = useMemo(() => {
    try {
      return { ok: true as const, text: JSON.stringify(JSON.parse(src), null, 2) }
    } catch (e) {
      return { ok: false as const, text: (e as Error).message }
    }
  }, [src])
  return (
    <ToolCard title="JSON 格式化 / 校验">
      <textarea style={styles.textarea} value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} />
      <pre style={out.ok ? styles.outputOk : styles.outputErr}>{out.text}</pre>
    </ToolCard>
  )
}

/* ── 时间戳 ↔ 日期 ─────────────────────────────────── */

function TsTool(): ReactElement {
  const [ts, setTs] = useState('')
  const [date, setDate] = useState('')

  const tsDate = useMemo(() => {
    if (!ts.trim()) return ''
    const n = Number(ts)
    if (Number.isNaN(n)) return '无效数字'
    const ms = n < 1e12 ? n * 1000 : n // 10 位视为秒，13 位视为毫秒
    const d = new Date(ms)
    if (Number.isNaN(d.getTime())) return '超出有效范围'
    return d.toLocaleString('zh-CN', { hour12: false })
  }, [ts])

  const dateTs = useMemo(() => {
    if (!date.trim()) return ''
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return '无效日期'
    return `毫秒 ${d.getTime()} / 秒 ${Math.floor(d.getTime() / 1000)}`
  }, [date])

  return (
    <ToolCard title="时间戳 ↔ 日期">
      <div style={styles.row}>
        <span style={styles.label}>时间戳</span>
        <input
          style={styles.input}
          value={ts}
          onChange={(e) => setTs(e.target.value)}
          placeholder="秒（10 位）或 毫秒（13 位）"
          spellCheck={false}
        />
      </div>
      {tsDate && <div style={styles.output}>{tsDate}</div>}
      <div style={styles.row}>
        <span style={styles.label}>日期</span>
        <input
          style={styles.input}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="2026-08-17T10:30:00 或 ISO 字符串"
          spellCheck={false}
        />
      </div>
      {dateTs && <div style={styles.output}>{dateTs}</div>}
    </ToolCard>
  )
}

/* ── Base64 / URL 编解码（UTF-8 安全） ──────────────── */

function utf8ToB64(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(bin)
}

function b64ToUtf8(s: string): string {
  const bin = atob(s)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

const CODEC_MODES = [
  { id: 'b64e', label: 'Base64 编码' },
  { id: 'b64d', label: 'Base64 解码' },
  { id: 'urle', label: 'URL 编码' },
  { id: 'urld', label: 'URL 解码' },
] as const

function applyCodec(mode: string, s: string): { ok: boolean; text: string } {
  try {
    switch (mode) {
      case 'b64e':
        return { ok: true, text: utf8ToB64(s) }
      case 'b64d':
        return { ok: true, text: b64ToUtf8(s) }
      case 'urle':
        return { ok: true, text: encodeURIComponent(s) }
      case 'urld':
        return { ok: true, text: decodeURIComponent(s) }
      default:
        return { ok: false, text: '未知模式' }
    }
  } catch (e) {
    return { ok: false, text: (e as Error).message }
  }
}

function CodecTool(): ReactElement {
  const [mode, setMode] = useState('b64e')
  const [src, setSrc] = useState('')
  const [copied, setCopied] = useState(false)
  const out = useMemo(() => applyCodec(mode, src), [mode, src])

  const copy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard
      .writeText(out.text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      })
      .catch(() => {})
  }

  return (
    <ToolCard title="Base64 / URL 编解码">
      <div style={styles.row}>
        {CODEC_MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} style={mode === m.id ? styles.buttonActive : styles.button}>
            {m.label}
          </button>
        ))}
      </div>
      <textarea style={styles.textarea} value={src} onChange={(e) => setSrc(e.target.value)} placeholder="输入内容…" spellCheck={false} />
      <div style={styles.row}>
        <pre style={out.ok ? styles.outputOk : styles.outputErr}>{out.text || '（输出为空）'}</pre>
        <button onClick={copy} style={styles.button}>
          {copied ? '已复制 ✓' : '复制'}
        </button>
      </div>
    </ToolCard>
  )
}

/* ── Cron 表达式生成 ────────────────────────────────── */

const CRON_PRESETS = [
  { label: '每 5 分钟', expr: '*/5 * * * *' },
  { label: '每小时', expr: '0 * * * *' },
  { label: '每天 09:00', expr: '0 9 * * *' },
  { label: '每天 23:00', expr: '0 23 * * *' },
  { label: '每周一 09:00', expr: '0 9 * * 1' },
  { label: '每月 1 号 00:00', expr: '0 0 1 * *' },
]

const DOW_NAMES = ['日', '一', '二', '三', '四', '五', '六']

function describeCron(expr: string): string {
  const p = expr.trim().split(/\s+/)
  if (p.length !== 5) return '需要 5 段：分 时 日 月 周'
  const [min, hour, dom, mon, dow] = p
  const parts: string[] = []
  parts.push(min === '*' ? '每分钟' : min.startsWith('*/') ? `每 ${min.slice(2)} 分钟` : min === '0' ? '整点' : `第 ${min} 分`)
  parts.push(hour === '*' ? '' : hour.startsWith('*/') ? `每 ${hour.slice(2)} 小时` : `${hour.padStart(2, '0')} 点`)
  if (dom !== '*') parts.push(`每月 ${dom} 号`)
  if (mon !== '*') parts.push(`${mon} 月`)
  if (dow !== '*') {
    const n = Number(dow)
    parts.push(`周${DOW_NAMES[Number.isNaN(n) ? 0 : n % 7]}`)
  }
  return parts.filter(Boolean).join('，')
}

function CronTool(): ReactElement {
  const [expr, setExpr] = useState('*/5 * * * *')
  const desc = useMemo(() => describeCron(expr), [expr])
  return (
    <ToolCard title="Cron 表达式生成">
      <div style={styles.row}>
        {CRON_PRESETS.map((p) => (
          <button key={p.expr} onClick={() => setExpr(p.expr)} style={expr === p.expr ? styles.buttonActive : styles.button}>
            {p.label}
          </button>
        ))}
      </div>
      <div style={styles.row}>
        <span style={styles.label}>分 时 日 月 周</span>
        <input style={styles.input} value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} />
      </div>
      <div style={styles.output}>{desc}</div>
    </ToolCard>
  )
}

/* ── 文本行 Diff 对比 ───────────────────────────────── */

function diffLines(a: string, b: string): { type: 'same' | 'del' | 'add'; text: string }[] {
  const A = a.split('\n')
  const B = b.split('\n')
  const n = A.length
  const m = B.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const rows: { type: 'same' | 'del' | 'add'; text: string }[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      rows.push({ type: 'same', text: A[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: 'del', text: A[i] })
      i++
    } else {
      rows.push({ type: 'add', text: B[j] })
      j++
    }
  }
  while (i < n) rows.push({ type: 'del', text: A[i++] })
  while (j < m) rows.push({ type: 'add', text: B[j++] })
  return rows
}

function DiffTool(): ReactElement {
  const [a, setA] = useState('const x = 1;\nconst y = 2;')
  const [b, setB] = useState('const x = 1;\nconst z = 3;')
  const rows = useMemo(() => diffLines(a, b), [a, b])
  return (
    <ToolCard title="文本行 Diff 对比">
      <span style={styles.label}>原文</span>
      <textarea style={styles.textarea} value={a} onChange={(e) => setA(e.target.value)} spellCheck={false} />
      <span style={styles.label}>修改后</span>
      <textarea style={styles.textarea} value={b} onChange={(e) => setB(e.target.value)} spellCheck={false} />
      <div style={{ ...styles.output, background: 'transparent', padding: 0 }}>
        {rows.map((r, i) => (
          <div key={i} style={r.type === 'add' ? styles.diffAdd : r.type === 'del' ? styles.diffDel : styles.diffSame}>
            {r.type === 'add' ? '+ ' : r.type === 'del' ? '- ' : '  '}
            {r.text}
          </div>
        ))}
      </div>
    </ToolCard>
  )
}

/* ── 工具页汇总 ────────────────────────────────────── */

export function ToolsPanel(): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <RegexTool />
      <JsonTool />
      <TsTool />
      <CodecTool />
      <CronTool />
      <DiffTool />
    </div>
  )
}
