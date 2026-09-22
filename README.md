# Formulário de Triagem — Instituto Guilherme Rocha

App mobile-first de qualificação de leads: 4 perguntas, 2 telas de resultado
(qualificado / desqualificado) cada uma com um botão de WhatsApp, e
integração com a Meta Conversions API pra otimizar a campanha por lead
qualificado em vez de só volume de conversa.

## Rodando localmente

```bash
npm install
npm run dev
```

As funções em `api/` (Meta Conversions API) não rodam com `vite dev` puro —
o formulário funciona normalmente, só sem os eventos indo pro Meta. Pra
testar as funções localmente é preciso `vercel dev` (exige `vercel login`).

## Antes de publicar

- **WhatsApp**: número já configurado em `src/config.ts` (`WHATSAPP_NUMBER`).
- **Foto do Dr. Guilherme**: já configurada (`HERO_PHOTO_URL` em `src/config.ts`).
- **Meta Ads**: ver seção abaixo — configurar as variáveis de ambiente na Vercel.

## Meta Ads — Pixel + Conversions API

O token da Conversions API é secreto e só existe no backend (`api/`) — nunca
no bundle do navegador. Variáveis de ambiente (ver `.env.example`):

| Variável | Onde | O quê |
|---|---|---|
| `VITE_META_PIXEL_ID` | Frontend (público) | Carrega o Pixel no navegador, gera os cookies `_fbp`/`_fbc` |
| `META_DATASET_ID` | Backend (secreto) | Pixel/Dataset ID usado pela Conversions API |
| `META_CAPI_ACCESS_TOKEN` | Backend (secreto) | Token da Conversions API |
| `META_TEST_EVENT_CODE` | Backend (secreto) | Só durante os testes no Gerenciador de Eventos; remover depois |

Configurar em: Vercel → Project Settings → Environment Variables.

### Eventos enviados

| Evento | Quando | Onde |
|---|---|---|
| `PageView` | Ao abrir o formulário | Pixel (navegador) |
| `FormSubmitted` | Ao terminar as 4 perguntas | `api/leads.ts` (Conversions API) |
| `QualifiedLead` | Lead qualificado (ver regra abaixo) | `api/leads.ts` (Conversions API) |
| `DisqualifiedLead` | Lead desqualificado | `api/leads.ts` (Conversions API) |
| `WhatsAppClick` | Clique no botão de WhatsApp | `api/whatsapp-click.ts` (Conversions API) |

A pontuação é **recalculada no servidor** a partir dos dados canônicos de
`src/data/questions.ts` — o backend nunca confia nas respostas vindas do
cliente. `FormSubmitted`/`QualifiedLead`/`DisqualifiedLead` disparam na hora
do envio (`POST /api/leads`), não quando a página de agradecimento
carrega/atualiza — então um refresh na tela de resultado não gera evento
duplicado.

A tela mostrada e o evento enviado pro Meta são sempre a mesma coisa (não
existe mais uma faixa intermediária que diverge entre os dois).

UTMs e `fbclid` são capturados da URL de entrada (uma vez por sessão, via
`src/lib/attribution.ts`); `_fbp`/`_fbc` são lidos direto dos cookies do
Pixel no servidor.

### Testando (Etapa 12 do documento de integração)

Com `META_TEST_EVENT_CODE` configurado, no Gerenciador de Eventos → Testar
Eventos:

1. Abrir o formulário → aparece `PageView`.
2. Responder de forma a ser desqualificado → aparecem `FormSubmitted` +
   `DisqualifiedLead` (nunca `QualifiedLead`).
3. Responder de forma a ser qualificado → aparecem `FormSubmitted` +
   `QualifiedLead` (nunca `DisqualifiedLead`).
4. Clicar no WhatsApp → aparece `WhatsAppClick`.
5. Atualizar a página de agradecimento → **não** deve gerar novo
   `QualifiedLead`/`DisqualifiedLead`.

Ainda não há banco de dados próprio (decisão consciente pra ir ao ar mais
rápido) — os leads ficam registrados no Meta e na conversa do WhatsApp; um
banco pode ser adicionado depois se fizer sentido (ex: dashboard de leads).

## Perguntas e qualificação

Ver `src/data/questions.ts` e `src/lib/scoring.ts`. A qualificação é binária
e decidida por **filtros duros** (`disqualifies: true` numa opção):

- Localização: "não consigo me deslocar até Guarapari" → desqualifica.
- Investimento: "não, esse valor é muito alto pra mim" (abaixo de R$ 4.000)
  → desqualifica.

Sem nenhum desses dois marcados, o lead é **qualificado automaticamente**.
As perguntas de tratamento e urgência continuam sendo coletadas (e podem
compor o `score` informativo, guardado mas não usado pra decidir a tela) —
elas dão contexto pra concierge, mas não afetam mais qualificação.

## Telas de resultado

Ver `src/components/ResultScreen.tsx`.

- **Qualificado**: tela dizendo que o perfil é apto + botão de WhatsApp.
- **Desqualificado**: explica os 3 motivos (ticket mínimo, atendimento
  presencial em Guarapari, escopo de tratamentos) e oferece um botão
  secundário para falar com a concierge mesmo assim.

## Deploy

Projeto pensado pra Vercel (framework Vite + funções em `api/` detectadas
automaticamente, sem configuração extra). Conectar o repositório, definir as
variáveis de ambiente acima e configurar o domínio nas configurações do
projeto.
