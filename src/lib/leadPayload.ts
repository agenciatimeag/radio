// Contrato compartilhado entre o frontend e a função de servidor api/leads.ts.

export interface AnswerPayload {
  questionId: string
  optionId: string
}

export interface AttributionData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  fbp?: string
  fbc?: string
}

export interface SubmitLeadRequest {
  answers: AnswerPayload[]
  detail?: string
  attribution: AttributionData
  eventSourceUrl: string
}

export interface SubmitLeadResponse {
  leadId: string
  score: number
}
