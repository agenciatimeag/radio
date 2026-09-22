import { useEffect, useState, type ReactNode } from 'react'

interface DashboardStats {
  from: string
  to: string
  pageViews: number
  leads: number
  qualifiedLeads: number
  disqualifiedLeads: number
  avgScore: number
  whatsappClicks: number
  whatsappClicksQualified: number
  whatsappClicksDisqualified: number
  topCampaigns: { campaign: string; leads: number }[]
}

const TRUNK_COLOR = '#EDE9A6'
const QUALIFIED_COLOR = '#25D366'
const DISQUALIFIED_COLOR = '#B3543F'

type PresetKey = 'yesterday' | '7d' | '15d' | '30d' | '90d' | 'custom'

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'yesterday', label: 'Ontem' },
  { key: '7d', label: '7 dias' },
  { key: '15d', label: '15 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: 'custom', label: 'Personalizado' },
]

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// Resolve o preset selecionado num intervalo de datas. 'custom' só resolve
// quando as duas datas já foram preenchidas — até lá, mantém o range anterior.
function resolveRange(
  preset: PresetKey,
  customFrom: string,
  customTo: string,
): { from: Date; to: Date } | null {
  switch (preset) {
    case 'yesterday': {
      const y = daysAgo(1)
      return { from: startOfDay(y), to: endOfDay(y) }
    }
    case '7d':
      return { from: startOfDay(daysAgo(6)), to: endOfDay(new Date()) }
    case '15d':
      return { from: startOfDay(daysAgo(14)), to: endOfDay(new Date()) }
    case '30d':
      return { from: startOfDay(daysAgo(29)), to: endOfDay(new Date()) }
    case '90d':
      return { from: startOfDay(daysAgo(89)), to: endOfDay(new Date()) }
    case 'custom':
      if (!customFrom || !customTo) return null
      return { from: startOfDay(new Date(`${customFrom}T00:00:00`)), to: endOfDay(new Date(`${customTo}T00:00:00`)) }
  }
}

export function Dashboard() {
  const [preset, setPreset] = useState<PresetKey>('7d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const range = resolveRange(preset, customFrom, customTo)
    if (!range) return

    setLoading(true)
    setError(false)

    const params = new URLSearchParams({ from: range.from.toISOString(), to: range.to.toISOString() })

    fetch(`/api/dashboard-stats?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('request_failed')
        return res.json() as Promise<DashboardStats>
      })
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [preset, customFrom, customTo])

  const filterRow = (
    <FilterRow
      preset={preset}
      onPresetChange={setPreset}
      customFrom={customFrom}
      customTo={customTo}
      onCustomFromChange={setCustomFrom}
      onCustomToChange={setCustomTo}
    />
  )

  if (error && !stats) {
    return (
      <Shell filterRow={filterRow}>
        <p className="text-sm text-text-muted">Não foi possível carregar os dados agora.</p>
      </Shell>
    )
  }

  if (!stats) {
    return (
      <Shell filterRow={filterRow}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </Shell>
    )
  }

  const hasData = stats.pageViews > 0 || stats.leads > 0
  const qualificationRate = stats.leads > 0 ? Math.round((stats.qualifiedLeads / stats.leads) * 100) : null

  return (
    <Shell filterRow={filterRow} period={`${formatDate(stats.from)} – ${formatDate(stats.to)}`}>
      <div className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Aberturas do formulário" value={formatNumber(stats.pageViews)} />
          <StatTile label="Leads" value={formatNumber(stats.leads)} />
          <StatTile label="Leads qualificados" value={formatNumber(stats.qualifiedLeads)} />
          <StatTile label="Taxa de qualificação" value={qualificationRate !== null ? `${qualificationRate}%` : '—'} />
          <StatTile label="Pontuação média" value={stats.leads > 0 ? String(stats.avgScore) : '—'} />
          <StatTile label="Cliques no WhatsApp" value={formatNumber(stats.whatsappClicks)} />
        </div>

        {!hasData && (
          <p className="mt-8 text-center text-sm text-text-muted">
            Nenhum dado nesse período.
          </p>
        )}

        {hasData && (
          <>
            <div className="mt-10">
              <BranchingFunnel stats={stats} />
            </div>

            <div className="mt-10">
              <h2 className="mb-4 text-sm font-semibold text-text">Top 5 campanhas no período</h2>
              {stats.topCampaigns.length === 0 ? (
                <p className="text-sm text-text-muted">
                  Nenhuma campanha com utm_campaign identificada nesse período.
                </p>
              ) : (
                <CampaignBars campaigns={stats.topCampaigns} />
              )}
            </div>
          </>
        )}
      </div>
    </Shell>
  )
}

function Shell({ children, filterRow, period }: { children: ReactNode; filterRow: ReactNode; period?: string }) {
  return (
    <div className="min-h-dvh bg-bg px-6 py-10 text-text">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-xl font-semibold">Dashboard de leads</h1>
        <p className="mt-1 text-sm text-text-muted">
          Instituto Guilherme Rocha{period ? ` · ${period}` : ''}
        </p>
        <div className="mt-6">{filterRow}</div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

function FilterRow({
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: {
  preset: PresetKey
  onPresetChange: (preset: PresetKey) => void
  customFrom: string
  customTo: string
  onCustomFromChange: (value: string) => void
  onCustomToChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onPresetChange(option.key)}
          className={
            option.key === preset
              ? 'rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent'
              : 'rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted hover:text-text'
          }
        >
          {option.label}
        </button>
      ))}

      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-text"
          />
          <span className="text-xs text-text-muted">até</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-text"
          />
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text">{value}</p>
    </div>
  )
}

// Um único funil com tronco compartilhado (abriu → completou) que se
// ramifica em qualificado/desqualificado e depois no clique do WhatsApp de
// cada lado — em vez de dois funis redundantes lado a lado.
function BranchingFunnel({ stats }: { stats: DashboardStats }) {
  const baseline = stats.pageViews || 1

  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-5">
      <h3 className="mb-4 text-sm font-semibold text-text">Funil de leads</h3>

      <div className="space-y-3">
        <FunnelBar label="Abriu o formulário" value={stats.pageViews} baseline={baseline} color={TRUNK_COLOR} />
        <FunnelBar label="Completou o formulário" value={stats.leads} baseline={baseline} color={TRUNK_COLOR} />
      </div>

      <p className="mb-3 mt-5 text-[11px] uppercase tracking-wide text-text-muted">Depois se divide em</p>

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
        <div className="space-y-3">
          <FunnelBar label="Qualificado" value={stats.qualifiedLeads} baseline={baseline} color={QUALIFIED_COLOR} />
          <FunnelBar
            label="Clicou no WhatsApp"
            value={stats.whatsappClicksQualified}
            baseline={baseline}
            color={QUALIFIED_COLOR}
          />
        </div>
        <div className="space-y-3">
          <FunnelBar
            label="Desqualificado"
            value={stats.disqualifiedLeads}
            baseline={baseline}
            color={DISQUALIFIED_COLOR}
          />
          <FunnelBar
            label="Clicou no WhatsApp"
            value={stats.whatsappClicksDisqualified}
            baseline={baseline}
            color={DISQUALIFIED_COLOR}
          />
        </div>
      </div>
    </div>
  )
}

function FunnelBar({
  label,
  value,
  baseline,
  color,
}: {
  label: string
  value: number
  baseline: number
  color: string
}) {
  const pct = Math.min(100, Math.round((value / baseline) * 100))

  return (
    <div>
      <div className="mb-1 flex items-start justify-between gap-2 text-xs text-text-muted">
        <span>{label}</span>
        <span className="shrink-0 font-semibold tabular-nums text-text">{value}</span>
      </div>
      <div className="h-6 rounded-r bg-bg">
        <div className="h-6 rounded-r" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function CampaignBars({ campaigns }: { campaigns: { campaign: string; leads: number }[] }) {
  const max = Math.max(...campaigns.map((c) => c.leads), 1)

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface px-4 py-5">
      {campaigns.map((c) => {
        const pct = Math.round((c.leads / max) * 100)
        return (
          <div key={c.campaign} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-xs text-text-muted" title={c.campaign}>
              {c.campaign}
            </span>
            <div className="h-6 flex-1 rounded-r bg-bg">
              <div className="h-6 rounded-r bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-text">
              {c.leads}
            </span>
          </div>
        )
      })}
    </div>
  )
}
