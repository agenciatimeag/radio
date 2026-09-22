import { useEffect, useState, type ReactNode } from 'react'

interface FunnelStage {
  label: string
  value: number
}

interface DashboardStats {
  pageViews: number
  leads: number
  qualifiedLeads: number
  disqualifiedLeads: number
  avgScore: number
  whatsappClicks: number
  whatsappClicksQualified: number
  whatsappClicksDisqualified: number
  funnels: {
    qualified: FunnelStage[]
    disqualified: FunnelStage[]
  }
  topCampaigns: { campaign: string; leads: number }[]
}

const QUALIFIED_COLOR = '#25D366'
const DISQUALIFIED_COLOR = '#B3543F'

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then((res) => {
        if (!res.ok) throw new Error('request_failed')
        return res.json() as Promise<DashboardStats>
      })
      .then(setStats)
      .catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <Shell>
        <p className="text-sm text-text-muted">Não foi possível carregar os dados agora.</p>
      </Shell>
    )
  }

  if (!stats) {
    return (
      <Shell>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </Shell>
    )
  }

  const hasData = stats.pageViews > 0 || stats.leads > 0
  const qualificationRate = stats.leads > 0 ? Math.round((stats.qualifiedLeads / stats.leads) * 100) : null

  return (
    <Shell>
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
          Ainda sem dados. Assim que o formulário começar a receber acessos, os números aparecem aqui.
        </p>
      )}

      {hasData && (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <FunnelCard
              title="Funil — lead qualificado"
              color={QUALIFIED_COLOR}
              stages={stats.funnels.qualified}
            />
            <FunnelCard
              title="Funil — lead desqualificado"
              color={DISQUALIFIED_COLOR}
              stages={stats.funnels.disqualified}
            />
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-sm font-semibold text-text">Top 5 campanhas do mês</h2>
            {stats.topCampaigns.length === 0 ? (
              <p className="text-sm text-text-muted">
                Nenhuma campanha com utm_campaign identificada este mês.
              </p>
            ) : (
              <CampaignBars campaigns={stats.topCampaigns} />
            )}
          </div>
        </>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg px-6 py-10 text-text">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-xl font-semibold">Dashboard de leads</h1>
        <p className="mt-1 text-sm text-text-muted">Instituto Guilherme Rocha</p>
        <div className="mt-8">{children}</div>
      </div>
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

function FunnelCard({ title, color, stages }: { title: string; color: string; stages: FunnelStage[] }) {
  const baseline = stages[0]?.value || 1

  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-5">
      <h3 className="mb-4 text-sm font-semibold text-text">{title}</h3>
      <div className="space-y-3">
        {stages.map((stage) => {
          const pct = Math.min(100, Math.round((stage.value / baseline) * 100))
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-xs text-text-muted">{stage.label}</span>
              <div className="h-6 flex-1 rounded-r bg-bg">
                <div className="h-6 rounded-r" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-text">
                {stage.value}
              </span>
            </div>
          )
        })}
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
