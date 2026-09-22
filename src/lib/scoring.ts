import type { Option } from '../data/questions'

export type LeadTier = 'qualified' | 'disqualified'

export interface LeadResult {
  score: number
  tier: LeadTier
}

/**
 * Duas respostas desqualificam o lead na hora, independente das outras
 * respostas — são filtros duros do negócio: impossibilidade de se deslocar
 * até Guarapari, e não estar disposto a investir a partir de R$ 4.000.
 * Sem nenhuma delas marcada, o lead é qualificado automaticamente; tratamento
 * e urgência continuam sendo coletados, mas não decidem mais a qualificação.
 */
export function computeResult(selectedOptions: Option[]): LeadResult {
  const score = selectedOptions.reduce((sum, option) => sum + option.points, 0)
  const hardDisqualified = selectedOptions.some((option) => option.disqualifies)

  return {
    score,
    tier: hardDisqualified ? 'disqualified' : 'qualified',
  }
}
