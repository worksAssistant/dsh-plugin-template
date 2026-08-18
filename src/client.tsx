/**
 * dsh-quickref — browser half (client plugin bundle).
 *
 * 本文件经 build.mjs 编译为「lazy-CJS module table」形态（window.__ModuleLoader__
 * .load），所以这里只导出 cordis 插件对象（inject + apply），不需要手动调用 load。
 * `require` 由模块表提供：`react` / `react/jsx-runtime` 是平台种子词。
 *
 * 功能：在设置页注册「开发者速查」分区，含两个页签：
 *   📖 速查 —— 按主题分类、可搜索的速查表（12 类 195 条）
 *   🛠️ 工具 —— 正则实时测试 / JSON 格式化 / 时间戳转换 / Base64/URL 编解码 /
 *              Cron 生成 / 文本 Diff（全部本地零依赖）
 */
import { useState } from 'react'
import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { CheatsheetPanel } from './cheatsheet-view'
import { ToolsPanel } from './tools-view'

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
  tabs: { display: 'flex', gap: 8, marginBottom: 4 },
  tab: {
    padding: '6px 16px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid rgba(127,127,127,0.35)',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
  },
  tabActive: {
    padding: '6px 16px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid transparent',
    background: 'rgba(77,115,230,0.85)',
    color: '#fff',
    cursor: 'pointer',
  },
}

function Panel(): ReactElement {
  const [mode, setMode] = useState<'ref' | 'tools'>('ref')
  return (
    <div>
      <div style={styles.tabs}>
        <button onClick={() => setMode('ref')} style={mode === 'ref' ? styles.tabActive : styles.tab}>
          📖 速查
        </button>
        <button onClick={() => setMode('tools')} style={mode === 'tools' ? styles.tabActive : styles.tab}>
          🛠️ 工具
        </button>
      </div>
      {mode === 'ref' ? <CheatsheetPanel /> : <ToolsPanel />}
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
        label: '开发者速查',
        children: { 'cheatsheet.item': { kind: 'list', scope: 'root' } },
      },
      Section,
    )
  })

  // 分区内容：速查 + 工具 双页签面板。
  slots.inject('cheatsheet.item', () => {
    slots.register({ name: 'cheatsheet.item', id: 'cheatsheet-panel', order: 10 }, Panel)
  })
}
