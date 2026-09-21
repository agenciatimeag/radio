export interface Option {
  id: string
  label: string
  points: number
  /** Quando true, essa resposta desqualifica o lead automaticamente, independente da soma. */
  disqualifies?: boolean
}

export interface Question {
  id: string
  title: string
  options: Option[]
}

// Pontuação pensada para somar no máximo 100 pontos no total.
// Orçamento e localização pesam mais por serem os filtros mais determinantes
// (ticket médio de tratamento e atendimento exclusivamente presencial em Guarapari).
export const questions: Question[] = [
  {
    id: 'investimento',
    title:
      'Após a consulta inicial, você estaria disposto a investir no tratamento indicado pelo Dr. Guilherme?',
    options: [
      { id: 'ate-2k', label: 'Até R$ 2.000', points: 0, disqualifies: true },
      { id: '2k-7k', label: 'De R$ 2.000 a R$ 7.000', points: 15 },
      { id: '7k-15k', label: 'De R$ 7.000 a R$ 15.000', points: 28 },
      {
        id: 'sem-limite',
        label: 'Não me importo com o valor, desde que eu tenha resultado',
        points: 35,
      },
    ],
  },
  {
    id: 'localizacao',
    title:
      'O Dr. Guilherme Rocha atende exclusivamente de forma presencial, em Guarapari/ES. Como isso funciona para você?',
    options: [
      {
        id: 'nao-desloca',
        label: 'Não sabia — e não teria como me deslocar até Guarapari',
        points: 0,
        disqualifies: true,
      },
      {
        id: 'ciente-nao-desloca',
        label: 'Sim, estou ciente, mas não tenho como me deslocar até Guarapari',
        points: 0,
        disqualifies: true,
      },
      {
        id: 'ciente-desloca',
        label: 'Sim, estou ciente, não moro em Guarapari, mas posso me deslocar',
        points: 25,
      },
      { id: 'ciente-mora', label: 'Sim, estou ciente e moro em Guarapari', points: 30 },
    ],
  },
  {
    id: 'tratamento',
    title: 'Qual tratamento você busca no Instituto Guilherme Rocha?',
    options: [
      { id: 'outro', label: 'Outro assunto / não sei exatamente ainda', points: 0 },
      {
        id: 'emagrecimento',
        label: 'Emagrecimento / obesidade (protocolos, canetas emagrecedoras)',
        points: 15,
      },
      { id: 'menopausa', label: 'Menopausa / perimenopausa', points: 15 },
      {
        id: 'metabolismo',
        label: 'Metabolismo, gordura no fígado e assuntos correlacionados',
        points: 15,
      },
    ],
  },
  {
    id: 'urgencia',
    title: 'Quando você pretende dar início ao seu tratamento?',
    options: [
      { id: 'meu-tempo', label: 'Quero me informar melhor primeiro, no meu tempo', points: 0 },
      { id: 'pesquisando', label: 'Ainda estou pesquisando, sem prazo definido', points: 6 },
      { id: 'semanas', label: 'Nas próximas semanas', points: 14 },
      { id: 'urgencia', label: 'Com urgência, assim que possível — já quero agendar', points: 20 },
    ],
  },
]

export const MAX_SCORE = questions.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
  0,
)
