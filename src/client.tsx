/**
 * dsh-plugin-cheatsheet — browser half (client plugin bundle).
 *
 * 本文件经 build.mjs 编译为「lazy-CJS module table」形态（window.__ModuleLoader__
 * .load），所以这里只导出 cordis 插件对象（inject + apply），不需要手动调用 load。
 * `require` 由模块表提供：`react` / `react/jsx-runtime` 是平台种子词。
 *
 * 功能：在设置页注册一个「开发者速查 / Dev Cheatsheet」分区，提供按主题分类、
 * 可搜索的开发者速查表。
 */
import { useMemo, useState } from 'react'
import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { CHEATSHEET } from './data'

export const inject = ['slots']

interface SlotsService {
  inject(name: string, cb: () => void): void
  register(opts: Record<string, unknown>, render: (...args: any[]) => ReactNode): void
}

interface SectionProps {
  renderSlot: (name: string, props: Record<string, unknown>) => ReactNode
}

function Section({ renderSlot }: SectionProps): ReactElement {
  return <div style={styles.section}>{renderSlot('cheatsheet.item', {})}</div>
}

const styles: Record<string, CSSProperties> = {
  section: { width: '100%' },
  wrap: { display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' },
  search: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 12px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid rgba(127,127,127,0.35)',
    background: 'transparent',
    color: 'inherit',
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    padding: '4px 12px',
    fontSize: 13,
    borderRadius: 999,
    border: '1px solid rgba(127,127,127,0.35)',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
  },
  chipActive: {
    padding: '4px 12px',
    fontSize: 13,
    borderRadius: 999,
    border: '1px solid transparent',
    background: 'rgba(77,115,230,0.85)',
    color: '#fff',
    cursor: 'pointer',
  },
  group: { display: 'flex', flexDirection: 'column', gap: 4 },
  groupTitle: { margin: '8px 0 4px', fontSize: 15, fontWeight: 600 },
  entry: {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid rgba(127,127,127,0.18)',
    background: 'rgba(127,127,127,0.05)',
  },
  entryHead: { display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  key: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  desc: { fontSize: 13, opacity: 0.85 },
  code: {
    margin: '6px 0 0',
    padding: '6px 8px',
    borderRadius: 6,
    background: 'rgba(127,127,127,0.12)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  note: { marginTop: 4, fontSize: 12, opacity: 0.6, fontStyle: 'italic' },
  empty: { padding: '24px 0', textAlign: 'center', opacity: 0.5, fontSize: 13 },
}

function Panel(): ReactElement {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('all')
  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    const cats = active === 'all' ? CHEATSHEET : CHEATSHEET.filter((c) => c.id === active)
    return cats
      .map((cat) => ({
        ...cat,
        entries: q
          ? cat.entries.filter((e) =>
              [e.key, e.desc, e.code, e.note].some((v) => v && v.toLowerCase().includes(q)),
            )
          : cat.entries,
      }))
      .filter((cat) => cat.entries.length > 0)
  }, [q, active])

  return (
    <div style={styles.wrap}>
      <input
        type="search"
        placeholder="搜索命令 / 方法 / 状态码…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.search}
      />
      <div style={styles.chips}>
        <button onClick={() => setActive('all')} style={active === 'all' ? styles.chipActive : styles.chip}>
          全部
        </button>
        {CHEATSHEET.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            style={active === c.id ? styles.chipActive : styles.chip}
            title={c.title}
          >
            {c.icon} {c.title}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={styles.empty}>没有匹配的条目</div>
      ) : (
        filtered.map((cat) => (
          <section key={cat.id} style={styles.group}>
            <h3 style={styles.groupTitle}>
              {cat.icon} {cat.title}
            </h3>
            {cat.entries.map((e) => (
              <div key={cat.id + e.key} style={styles.entry}>
                <div style={styles.entryHead}>
                  <code style={styles.key}>{e.key}</code>
                  <span style={styles.desc}>{e.desc}</span>
                </div>
                {e.code && <pre style={styles.code}>{e.code}</pre>}
                {e.note && <div style={styles.note}>{e.note}</div>}
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  )
}

export function apply(ctx: { slots: SlotsService }): void {
  const slots = ctx.slots

  // 独立的设置分区，出现在设置页左侧导航。
  slots.inject('settings.section', () => {
    slots.register(
      {
        name: 'settings.section',
        id: 'cheatsheet',
        order: 30,
        label: '开发者速查 / Dev Cheatsheet',
        children: { 'cheatsheet.item': { kind: 'list', scope: 'root' } },
      },
      Section,
    )
  })

  // 分区内容：可搜索的速查面板。
  slots.inject('cheatsheet.item', () => {
    slots.register({ name: 'cheatsheet.item', id: 'cheatsheet-panel', order: 10 }, Panel)
  })
}
