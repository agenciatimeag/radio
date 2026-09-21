import type { Option } from '../data/questions'

export type LeadTier = 'qualified' | 'toQualify' | 'disqualified'

export interface LeadResult {
  score: number
  tier: LeadTier
}

function tierFromScore(score: number): LeadTier {
  if (score > 75) return 'qualified'
  if (score >= 50) return 'toQualify'
  return 'disqualified'
}

/**
 * Algumas respostas (orçamento muito baixo, impossibilidade de se deslocar até
 * Guarapari) desqualificam o lead na hora, independente da soma dos pontos —
 * são filtros duros do negócio, não só uma questão de pontuação.
 */
export function computeResult(selectedOptions: Option[]): LeadResult {
  const score = selectedOptions.reduce((sum, option) => sum + option.points, 0)
  const hardDisqualified = selectedOptions.some((option) => option.disqualifies)

  return {
    score,
    tier: hardDisqualified ? 'disqualified' : tierFromScore(score),
  }
}
