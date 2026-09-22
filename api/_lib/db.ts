import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL

export const sql = connectionString ? neon(connectionString) : null

let schemaReady: Promise<void> | null = null

export async function ensureSchema(): Promise<void> {
  if (!sql) return
  const db = sql

  schemaReady ??= (async () => {
    await db`
      CREATE TABLE IF NOT EXISTS events (
        id BIGSERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        lead_id TEXT,
        tier TEXT,
        score INTEGER,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_content TEXT,
        utm_term TEXT,
        fbclid TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `
    await db`CREATE INDEX IF NOT EXISTS events_type_idx ON events (type)`
    await db`CREATE INDEX IF NOT EXISTS events_created_at_idx ON events (created_at)`
  })()

  await schemaReady
}

export interface EventInput {
  type: 'page_view' | 'form_submitted' | 'whatsapp_click'
  leadId?: string
  tier?: string
  score?: number
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  fbclid?: string
}

// Se o banco ainda não estiver conectado ao projeto, não grava nada — o
// formulário e o clique no WhatsApp continuam funcionando normalmente, só o
// dashboard fica sem dados até o Postgres ser configurado.
export async function recordEvent(input: EventInput): Promise<void> {
  if (!sql) {
    console.warn(`[db] Banco não configurado — evento ${input.type} não gravado.`)
    return
  }
  const db = sql

  await ensureSchema()
  await db`
    INSERT INTO events (type, lead_id, tier, score, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid)
    VALUES (
      ${input.type},
      ${input.leadId ?? null},
      ${input.tier ?? null},
      ${input.score ?? null},
      ${input.utmSource ?? null},
      ${input.utmMedium ?? null},
      ${input.utmCampaign ?? null},
      ${input.utmContent ?? null},
      ${input.utmTerm ?? null},
      ${input.fbclid ?? null}
    )
  `
}
