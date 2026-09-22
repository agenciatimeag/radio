import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql, ensureSchema } from './_lib/db.js'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  if (!sql) {
    res.status(503).json({ error: 'database_not_configured' })
    return
  }
  const db = sql

  await ensureSchema()

  const rows = await db`
    SELECT
      count(*) FILTER (WHERE type = 'page_view') AS page_views,
      count(*) FILTER (WHERE type = 'form_submitted') AS leads,
      count(*) FILTER (WHERE type = 'form_submitted' AND tier = 'qualified') AS qualified_leads,
      count(*) FILTER (WHERE type = 'form_submitted' AND tier = 'disqualified') AS disqualified_leads,
      avg(score) FILTER (WHERE type = 'form_submitted') AS avg_score,
      count(*) FILTER (WHERE type = 'whatsapp_click') AS whatsapp_clicks,
      count(*) FILTER (WHERE type = 'whatsapp_click' AND tier = 'qualified') AS whatsapp_clicks_qualified,
      count(*) FILTER (WHERE type = 'whatsapp_click' AND tier = 'disqualified') AS whatsapp_clicks_disqualified
    FROM events
  `
  const totals = rows[0] as Record<string, string | number | null>

  const campaignRows = (await db`
    SELECT utm_campaign, count(*) AS leads
    FROM events
    WHERE type = 'form_submitted'
      AND utm_campaign IS NOT NULL
      AND created_at >= date_trunc('month', now())
    GROUP BY utm_campaign
    ORDER BY count(*) DESC
    LIMIT 5
  `) as { utm_campaign: string; leads: string }[]

  const pageViews = Number(totals.page_views)
  const leads = Number(totals.leads)
  const qualifiedLeads = Number(totals.qualified_leads)
  const disqualifiedLeads = Number(totals.disqualified_leads)
  const whatsappClicksQualified = Number(totals.whatsapp_clicks_qualified)
  const whatsappClicksDisqualified = Number(totals.whatsapp_clicks_disqualified)

  const stats: DashboardStats = {
    pageViews,
    leads,
    qualifiedLeads,
    disqualifiedLeads,
    avgScore: totals.avg_score ? Math.round(Number(totals.avg_score)) : 0,
    whatsappClicks: Number(totals.whatsapp_clicks),
    whatsappClicksQualified,
    whatsappClicksDisqualified,
    funnels: {
      qualified: [
        { label: 'Abriu o formulário', value: pageViews },
        { label: 'Completou o formulário', value: leads },
        { label: 'Qualificado', value: qualifiedLeads },
        { label: 'Clicou no WhatsApp', value: whatsappClicksQualified },
      ],
      disqualified: [
        { label: 'Abriu o formulário', value: pageViews },
        { label: 'Completou o formulário', value: leads },
        { label: 'Desqualificado', value: disqualifiedLeads },
        { label: 'Clicou no WhatsApp', value: whatsappClicksDisqualified },
      ],
    },
    topCampaigns: campaignRows.map((row) => ({
      campaign: row.utm_campaign as string,
      leads: Number(row.leads),
    })),
  }

  res.status(200).json(stats)
}
