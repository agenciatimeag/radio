# Formulário de Triagem — Instituto Guilherme Rocha

App mobile-first de qualificação de leads: 4 perguntas, pontuação de 0 a 100,
e 3 telas de resultado (qualificado / a qualificar / desqualificado), cada
uma com um botão de WhatsApp.

## Rodando localmente

```bash
npm install
npm run dev
```

## Antes de publicar

- **WhatsApp**: troque `WHATSAPP_NUMBER` em `src/config.ts` pelo número real
  (formato internacional, só dígitos).
- **Meta Ads (Pixel/CAPI)**: `src/lib/analytics.ts` já dispara um evento
  diferente por perfil de lead (`Lead_Qualificado`, `Lead_AQualificar`,
  `Lead_Desqualificado`) via `window.fbq`. Falta instalar o Pixel do Meta
  (script oficial no `index.html`) e/ou configurar o envio server-side via
  Conversions API quando tivermos o access token.

## Perguntas e pontuação

Ver `src/data/questions.ts`. Cada opção tem uma pontuação; a soma máxima
possível é 100. Duas respostas são **filtros duros** (`disqualifies: true`)
e mandam o lead direto para a tela de desqualificado, independente da soma:
orçamento até R$ 2.000, e impossibilidade de se deslocar até Guarapari.

## Faixas de resultado

Ver `src/lib/scoring.ts`.

- **> 75 pontos**: qualificado — tela dizendo que o perfil é apto + botão de WhatsApp.
- **50–75 pontos**: a qualificar — tela só com o botão de WhatsApp.
- **< 50 pontos (ou filtro duro)**: desqualificado — explica os 3 motivos
  (ticket mínimo, atendimento presencial em Guarapari, escopo de tratamentos)
  e oferece um botão secundário para falar com a concierge mesmo assim.

## Build de produção

```bash
npm run build
```

Gera um site estático em `dist/` — pode ser publicado em qualquer hospedagem
estática (Vercel, Netlify, GitHub Pages, Cloudflare Pages etc.).
