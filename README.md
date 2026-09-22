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
| `META_TEST_EVENT_CODE` | Backend (secreto), opcional | Só se precisar depurar na aba "Testar Eventos"; deixar vazio em produção |

Configurar em: Vercel → Project Settings → Environment Variables.

### Eventos enviados

| Evento | Quando | Onde |
|---|---|---|
| `PageView` | Ao abrir o formulário | Pixel (navegador) — sempre dispara |
| `FormSubmitted` | Ao terminar as 4 perguntas, **só se qualificado** | `api/leads.ts` (Conversions API) |
| `QualifiedLead` | Lead qualificado | `api/leads.ts` (Conversions API) |
| `WhatsAppClick` | Clique no botão de WhatsApp, **só se qualificado** | `api/whatsapp-click.ts` (Conversions API) |

Só lead qualificado gera dado pro Meta — decisão do cliente pra manter o
sinal de otimização puramente positivo. Um lead desqualificado completa o
formulário e pode até falar com a concierge normalmente, mas nenhum evento
sai pro Meta nesse caso (nem `FormSubmitted`, nem `WhatsAppClick`); ele só
fica registrado no WhatsApp/no seu processo interno.

A pontuação é **recalculada no servidor** a partir dos dados canônicos de
`src/data/questions.ts` — o backend nunca confia nas respostas vindas do
cliente. Os eventos disparam na hora do envio (`POST /api/leads`), não
quando a página de agradecimento carrega/atualiza — então um refresh na
tela de resultado não gera evento duplicado.

UTMs e `fbclid` são capturados da URL de entrada (uma vez por sessão, via
`src/lib/attribution.ts`); `_fbp`/`_fbc` são lidos direto dos cookies do
Pixel no servidor.

### Testando (Etapa 12 do documento de integração)

Em produção (sem `META_TEST_EVENT_CODE`), os eventos aparecem no Gerenciador
de Eventos → **Visão Geral** (não na aba "Testar Eventos", que só mostra
eventos marcados com um código de teste válido no momento do envio):

1. Abrir o formulário → aparece `PageView`.
2. Responder de forma a ser desqualificado → **nenhum** evento novo aparece
   (nem `FormSubmitted`, nem `WhatsAppClick` ao clicar no botão).
3. Responder de forma a ser qualificado → aparecem `FormSubmitted` +
   `QualifiedLead`.
4. Clicar no WhatsApp nesse caso qualificado → aparece `WhatsAppClick`.
5. Atualizar a página de agradecimento → **não** deve gerar novo
   `QualifiedLead`.

Pode levar alguns minutos pra aparecer na Visão Geral. Pra depurar na hora,
é possível configurar `META_TEST_EVENT_CODE` temporariamente com o código
mostrado na aba "Testar Eventos" — mas esse código expira/muda a cada nova
sessão daquela aba, então é fácil ficar com um valor desatualizado (o evento
é aceito pela Meta normalmente, só não aparece ali). Por isso a variável foi
deixada vazia em produção.

Além do Meta, os eventos também são gravados num banco Postgres próprio —
ver seção "Dashboard de leads" abaixo.

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

## Dashboard de leads

Rota `/dashboard` (sem senha — link direto), mostrando:

- Filtro de período no topo (ontem, 7/15/30/90 dias, ou intervalo
  personalizado) — escopa todos os números abaixo, pra não virar uma
  contagem infinita desde o início do projeto.
- Aberturas do formulário, leads, leads qualificados, taxa de qualificação,
  pontuação média, cliques no WhatsApp — todos já filtrados pelo período.
- Um único funil com tronco compartilhado (abriu o formulário → completou)
  que se ramifica em qualificado/desqualificado e depois no clique do
  WhatsApp de cada lado.
- Top 5 campanhas no período (por `utm_campaign`), pelo número de leads.

### Banco de dados

Usa Postgres (integração Neon da Vercel). Precisa ser criado uma vez pelo
painel — **Vercel → Storage → Create Database → Postgres** — e conectado ao
projeto; isso injeta `DATABASE_URL` (ou `POSTGRES_URL`) automaticamente nas
variáveis de ambiente, sem precisar configurar nada a mais.

Sem o banco conectado, o formulário e o WhatsApp continuam funcionando
normalmente (a gravação falha silenciosamente, só com um aviso no log) — só
o `/dashboard` fica sem dados até o Postgres ser configurado.

O schema (uma única tabela `events`) é criado automaticamente na primeira
gravação — não precisa rodar migration manual. Ver `api/_lib/db.ts`.

Cada envio do formulário e cada clique no WhatsApp grava um evento no banco
**independente da regra de só mandar sinal positivo pro Meta** — o dashboard
interno precisa ver os dois lados (qualificado e desqualificado) pra montar
os funis; só o envio pro Meta continua sendo exclusivo de lead qualificado.

## Telas de resultado

Ver `src/components/ResultScreen.tsx`.

- **Qualificado**: tela dizendo que o perfil é apto, e depois de 1,5s
  **redireciona automaticamente pro WhatsApp** (`window.location.href`) —
  o botão continua visível como atalho/fallback, caso o navegador bloqueie o
  redirecionamento automático. O evento de clique no WhatsApp é registrado
  nesse momento, mesmo sem clique manual.
- **Desqualificado**: explica os 3 motivos (ticket mínimo, atendimento
  presencial em Guarapari, escopo de tratamentos) e oferece um botão
  secundário para falar com a concierge mesmo assim — sem redirecionamento
  automático.

## Deploy

Projeto pensado pra Vercel (framework Vite + funções em `api/` detectadas
automaticamente, sem configuração extra). Conectar o repositório, definir as
variáveis de ambiente acima e configurar o domínio nas configurações do
projeto.
