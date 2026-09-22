export interface Option {
  id: string
  label: string
  points: number
  /** Quando true, essa resposta desqualifica o lead automaticamente, independente da soma. */
  disqualifies?: boolean
  /** Quando true, ao selecionar essa opção o lead precisa digitar um texto livre antes de avançar. */
  requiresText?: boolean
}

export interface Question {
  id: string
  title: string
  options: Option[]
}

// Pontuação pensada para somar no máximo 100 pontos no total.
// Orçamento e localização pesam mais por serem os filtros mais determinantes
// (ticket médio de tratamento e atendimento exclusivamente presencial em Guarapari).
// A pergunta de investimento fica por último de propósito — perguntar sobre
// dinheiro logo de cara assusta o lead.
export const questions: Question[] = [
  {
    id: 'localizacao',
    title:
      'O Dr. Guilherme Rocha atende exclusivamente de forma presencial, em Guarapari. Como isso funciona para você?',
    options: [
      { id: 'ciente-mora', label: 'Sim, estou ciente e moro em Guarapari', points: 30 },
      {
        id: 'ciente-desloca',
        label: 'Sim, não moro em Guarapari, mas posso me deslocar',
        points: 25,
      },
      {
        id: 'nao-desloca',
        label: 'Não sabia, e não consigo me deslocar até Guarapari',
        points: 0,
        disqualifies: true,
      },
    ],
  },
  {
    id: 'tratamento',
    title: 'Qual tratamento você busca no Instituto Guilherme Rocha?',
    options: [
      {
        id: 'emagrecimento',
        label: 'Emagrecimento e obesidade (protocolos, canetas emagrecedoras)',
        points: 15,
      },
      { id: 'menopausa', label: 'Menopausa e perimenopausa', points: 15 },
      {
        id: 'metabolismo',
        label: 'Metabolismo, gordura no fígado e assuntos correlacionados',
        points: 15,
      },
      { id: 'outros', label: 'Outros assuntos', points: 0, requiresText: true },
    ],
  },
  {
    id: 'urgencia',
    title: 'Quando você pretende dar início ao tratamento?',
    options: [
      { id: 'urgencia', label: 'Com urgência, assim que possível — já quero agendar', points: 20 },
      { id: 'semanas', label: 'Nas próximas semanas', points: 14 },
      {
        id: 'pesquisando',
        label: 'Ainda estou pesquisando, mas não tenho prazo definido',
        points: 6,
      },
    ],
  },
  {
    id: 'investimento',
    title:
      'Após a consulta inicial, caso o Dr. Guilherme identifique um protocolo de tratamento individual pra você, estaria disposto a investir a partir de R$ 5.000 para alcançar os resultados que busca?',
    options: [
      { id: 'sim', label: 'Sim, estou disposto(a)', points: 35 },
      { id: 'nao', label: 'Não, esse valor é muito alto para mim', points: 0, disqualifies: true },
    ],
  },
]

export const MAX_SCORE = questions.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
  0,
)
